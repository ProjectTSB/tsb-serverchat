import { Rcon } from 'rcon-client';
import { singleton, inject } from 'tsyringe';

type RconError = {
    errno: number;
    code: string;
    syscall: string;
    address?: string;
    port?: number;
};

@singleton<RconClient>()
export class RconClient {
    /**
     * 接続フラグ
     */
    private isConnecting = false;

    public constructor(
        @inject(Rcon) private rcon: Rcon
    ) {
        rcon.on('error', this.rcon_onError.bind(this));
    }

    /**
     * Rconを起動
     */
    public async Launch(): Promise<void> {
        try {
            await this.rcon.connect();

            this.isConnecting = true;

            console.log('[Rcon]: 起動しました');
        }
        catch {
            console.log('[Rcon]: 起動に失敗しました');
        }
    }

    /**
     * Rconを停止
     */
    public async Stop(): Promise<void> {
        this.isConnecting = false;

        try {
            await this.rcon.end();

            console.log('[Rcon]: 停止しました');
        }
        catch {
            console.log('[Rcon]: 既に停止しています');
        }
    }

    /**
     * 開発サーバーにコマンドを送信します
     * @param command Minecraftコマンド
     */
    public async Send(command: string): Promise<string> {
        if (this.isConnecting) {
            return this.rcon.send(command);
        }
        else {
            return Promise.reject();
        }
    }

    /**
     * Rconエラー時
     */
    private rcon_onError(err: RconError) {
        console.log('[Rcon]: エラーが発生しました', err);
    }
}
