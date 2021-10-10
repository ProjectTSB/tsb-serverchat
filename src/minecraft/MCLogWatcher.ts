import { singleton, inject } from 'tsyringe';
import { EventEmitter } from 'events';
import { statSync, promises, createReadStream } from 'fs';
import path from 'path';

import { Config } from '@/Config';
import { streamToString } from '@/util/streamToString';

export type PlayerActionType =
    | 'login'
    | 'logout';

export type ServerLogType =
    | 'start'
    | 'stop';

type EventArgs = {
    'player-chat': [
        name: string,
        message: string
    ];
    'player-action': [
        name: string,
        type: PlayerActionType
    ];
    'server-log': [
        type: ServerLogType
    ];
};

/**
 * ログ1行の正規表現
 */
const REGEX_LINE = /^\[\d{2}:\d{2}:\d{2}\] \[[^\]]*\]: (.*)\r?/;

/**
 * プレイヤーチャットの正規表現
 */
const REGEX_PLAYER_CHAT = /^<([^>]*)> (.*)$/;

/**
 * プレイヤーログインの正規表現
 */
const REGEX_PLAYER_LOGIN = /^(.*) joined the game$/;

/**
 * プレイヤーログアウトの正規表現
 */
const REGEX_PLAYER_LOGOUT = /^(.*) left the game$/;

/**
 * サーバー起動の正規表現
 */
const REGEX_SERVER_START = /^Done \([^)]*\)! For help, type "help"$/;

/**
 * サーバー停止の正規表現
 */
const REGEX_SERVER_STOP = /^Stopping the server$/;

@singleton<MCLogWatcher>()
export class MCLogWatcher extends EventEmitter {
    /**
     * latest.log のパス
     */
    private logPath;

    /**
     * ログファイルのサイズ
     */
    private beforeFileSize = 0;

    /**
     * ログファイルの更新日時(ms)
     */
    private baforeModifyTimeMs = 0;

    private watchInterval: NodeJS.Timeout | null = null;

    public constructor(
        @inject(Config) config: Config
    ) {
        super();

        this.logPath = path.join(config.Minecraft.serverPath, 'logs', 'latest.log');
    }

    /**
     * 監視を開始
     */
    public Start(): void {
        const { size, mtimeMs } = statSync(this.logPath);
        this.beforeFileSize = size;
        this.baforeModifyTimeMs = mtimeMs;

        console.log('[LogWatcher]: ログ監視を開始します');

        this.watchInterval = setInterval(this.watchIntervalCallback.bind(this), 250);
    }

    /**
     * 監視を終了
     */
    public Stop(): void {
        if (!this.watchInterval) return;

        console.log('[LogWatcher]: ログ監視を終了します');

        clearInterval(this.watchInterval);
    }

    public on<T extends keyof EventArgs>(event: T, listener: (...args: EventArgs[T]) => void): this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    public emit<T extends keyof EventArgs>(event: T, ...args: EventArgs[T]): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public emit(event: string, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }

    /**
     * ログ1行をパースする
     * @param logText ログ1行
     */
    private parseLog(logText: string) {
        if (logText.length <= 0) return;

        const regexLine = REGEX_LINE.exec(logText);
        if (!regexLine) return;

        const [, body] = regexLine;

        // プレイヤーチャット
        const regexPlayerChat = REGEX_PLAYER_CHAT.exec(body);
        if (regexPlayerChat) {
            const [, name, message] = regexPlayerChat;

            this.emit('player-chat', name, message);

            return;
        }

        // プレイヤーログイン
        const regexPlayerLogin = REGEX_PLAYER_LOGIN.exec(body);
        if (regexPlayerLogin) {
            const [, name] = regexPlayerLogin;

            this.emit('player-action', name, 'login');

            return;
        }

        // プレイヤーログアウト
        const regexPlayerLogout = REGEX_PLAYER_LOGOUT.exec(body);
        if (regexPlayerLogout) {
            const [, name] = regexPlayerLogout;

            this.emit('player-action', name, 'logout');

            return;
        }

        // サーバー起動
        if (REGEX_SERVER_START.test(body)) {
            this.emit('server-log', 'start');

            return;
        }

        // サーバー停止
        if (REGEX_SERVER_STOP.test(body)) {
            this.emit('server-log', 'stop');

            return;
        }
    }

    /**
     * Intervalのコールバック関数
     */
    private watchIntervalCallback() {
        promises.stat(this.logPath).then(stats => {
            // 前回よりファイルサイズが減っていればリセット
            if (stats.size < this.beforeFileSize) {
                this.beforeFileSize = 0;
            }

            // 更新日時が変わっていて且つファイルサイズが増えていたら
            if (stats.mtimeMs > this.baforeModifyTimeMs && stats.size > this.beforeFileSize) {
                this.baforeModifyTimeMs = stats.mtimeMs;

                // 前回のファイルサイズとの差分を取得し、1行ずつパース
                const stream = createReadStream(this.logPath, {
                    start: this.beforeFileSize,
                    end: stats.size
                });
                streamToString(stream).then(lines => {
                    for (const line of lines.split('\n')) {
                        this.parseLog(line);
                    }
                });

                this.beforeFileSize = stats.size;
            }
        });
    }
}
