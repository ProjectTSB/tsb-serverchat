import { TextChannel, Message } from 'discord.js';
import { singleton, inject } from 'tsyringe';

import { Config } from '@/Config';
import { DiscordBotClient } from '@/discord/DiscordBotClient';
import { RconClient } from '@/rcon/RconClient';
import { MCLogWatcher, PlayerActionType, ServerLogType } from '@/minecraft/MCLogWatcher';

type LoginUsers = {
    count: string;
    max: string;
    users: string[];
};

const REGEX_LIST_COMMAND = /^There are ([^ ]*) of a max of ([^ ]*) players online: ?(.*)$/;

@singleton<TSBDevServerBot>()
export class TSBDevServerBot {
    private textChannel: TextChannel | null = null;

    public constructor(
        @inject(Config) private config: Config,
        @inject(DiscordBotClient) private discordBotClient: DiscordBotClient,
        @inject(RconClient) private rconClient: RconClient,
        @inject(MCLogWatcher) private mcLogWatcher: MCLogWatcher
    ) {}

    /**
     * Botを起動する
     */
    public async Launch(): Promise<void> {
        this.discordBotClient.on('ready', this.discordBotClient_onReady.bind(this));
        this.discordBotClient.on('chat', this.discordBotClient_onChat.bind(this));

        await this.discordBotClient.Launch();
    }

    /**
     * Botを終了する
     */
    public async Destroy(): Promise<void> {
        this.mcLogWatcher.Stop();
        await this.discordBotClient.Destroy();
    }

    /**
     * ログイン中のユーザーのリストを返す
     */
    private async getLoginUsers(): Promise<LoginUsers | null> {
        const listCommandResponce = await this.rconClient.Send('list');
        const regexListCommand = REGEX_LIST_COMMAND.exec(listCommandResponce);
        if (!regexListCommand) return null;

        const [, count, max, users] = regexListCommand;

        return {
            count,
            max,
            users: users.split(', ').filter(x => x !== '')
        };
    }

    /**
     * Bot準備完了時
     */
    private async discordBotClient_onReady() {
        this.textChannel = await this.discordBotClient.GetTextChannel(this.config.Discord.chatChannel);

        // 開発サーバーのログ監視を開始
        this.mcLogWatcher.on('player-chat', this.mcLogWatcher_onPlayerChat.bind(this));
        this.mcLogWatcher.on('player-action', this.mcLogWatcher_onPlayerAction.bind(this));
        this.mcLogWatcher.on('server-log', this.mcLogWatcher_onServerLog.bind(this));
        this.mcLogWatcher.Start();
    }

    /**
     * チャット送信時
     * @param channelId チャンネルID
     * @param username ユーザー名
     * @param message メッセージ
     */
    private async discordBotClient_onChat(message: Message) {
        const username = message.author.username;
        const text = message.content.replace(/\n/g, '\\n');

        try {
            console.log(`<${username}> ${text}`);
            await this.rconClient.Send(`tellraw @a {"text": "<${username}> ${text}"}`);
        }
        catch {
            // \u26A0 = ⚠
            message.react('\u26A0');
        }
    }

    /**
     * プレイヤーチャットログ検出時
     * @param name プレイヤー名
     * @param message チャットメッセージ
     */
    private mcLogWatcher_onPlayerChat(name: string, message: string) {
        if (!this.textChannel) return;

        this.textChannel.send(`<${name}> ${message}`);
    }

    /**
     * プレイヤーアクションログ検出時
     * @param name プレイヤー名
     * @param type アクションタイプ
     */
    private async mcLogWatcher_onPlayerAction(name: string, type: PlayerActionType) {
        if (!this.textChannel) return;

        let title: string | undefined;
        let color: string | undefined;

        if (type === 'login') {
            title = `\`${name}\` がログインしました`;
            color = '#79b59a';
        }
        else {
            title = `\`${name}\` がログアウトしました`;
            color = '#f09090';
        }

        const loginUsers = await this.getLoginUsers();
        if (!loginUsers) return;

        const { count, max, users } = loginUsers;

        this.textChannel.send({
            embed: {
                description: title,
                color,
                fields: [
                    {
                        name: 'ログイン中',
                        value: users.map(x => `\`${x}\``).join(', ') || '-',
                        inline: true
                    },
                    {
                        name: '人数',
                        value: `${count}/${max}`,
                        inline: true
                    }
                ]
            }
        });
    }

    /**
     * サーバーログ検出時
     * @param type サーバーログタイプ
     */
    private mcLogWatcher_onServerLog(type: ServerLogType) {
        if (!this.textChannel) return;

        let title: string | undefined;
        let color: string | undefined;

        if (type === 'start') {
            title = 'サーバーが起動しました';
            color = '#43b581';
        }
        else {
            title = 'サーバーが停止しました';
            color = '#f04747';
        }

        this.textChannel.send({
            embed: {
                title,
                color
            }
        });
    }
}
