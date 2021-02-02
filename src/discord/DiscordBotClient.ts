import { Client, PresenceStatusData, TextChannel, Message } from 'discord.js';
import { singleton, inject } from 'tsyringe';

import { Config } from '@/Config';
import { CommandBase } from '@/discord/util/CommandBase';
import { RconClient } from '@/rcon/RconClient';
import { MCLogWatcher, PlayerActionType, ServerLogType } from '@/minecraft/MCLogWatcher';

type CommandResponces = {
    [key: string]: (interaction: Required<Interaction>) => Promise<InteractionResponse>;
};

type LoginUsers = {
    count: string;
    max: string;
    users: string[];
};

const REGEX_LIST_COMMAND = /^There are ([^ ]*) of a max of ([^ ]*) players online: ?(.*)$/;

@singleton<DiscordBotClient>()
export class DiscordBotClient {
    private userId = '';
    private guildId = '';

    private textChannel: TextChannel | null = null;

    private commandResponces: CommandResponces = {};

    public constructor(
        @inject(Config) private config: Config,
        @inject(Client) private client: Client,
        @inject(RconClient) private rconClient: RconClient,
        @inject(MCLogWatcher) private mcLogWatcher: MCLogWatcher
    ) {
        client.on('ready', this.client_onReady.bind(this));
        client.on('message', this.client_onMessage.bind(this));
    }

    /**
     * Botを起動する
     */
    public async Launch(): Promise<void> {
        try {
            await this.client.login(this.config.Discord.token);
        }
        catch (err) {
            console.error('Botの起動に失敗しました', err.message);
            process.exit(1);
        }
    }

    /**
     * Botを終了する
     */
    public Destroy(): void {
        this.mcLogWatcher.Stop();
        this.client.destroy();

        console.log('[Discord]: Botが停止しました');
    }

    /**
     * Botのステータスを設定する
     * @param status Botのステータス
     * @param text 表示するテキスト
     */
    public async SetBotStatus(status: PresenceStatusData, text?: string): Promise<void> {
        if (!this.client.user) return;

        await this.client.user.setPresence({
            status,
            activity: text ? {
                type: 'PLAYING',
                name: text
            } : undefined
        });
    }

    /**
     * コマンドを登録する
     * @param opt コマンド定義
     * @param callback コマンドに対する応答
     */
    public async RegisterCommand(opt: ApplicationCommandWithoutId, callback: CommandResponces[number]): Promise<void> {
        const command = await this.registerCommand(opt);

        this.commandResponces[command.id] = callback;
    }

    /**
     * コマンドを全て削除する
     */
    public async DeleteAllCommands(): Promise<void> {
        const commands = await this.getCommands();
        await Promise.all(commands.map(command => this.deleteCommand(command.id)));
    }

    /**
     * コマンド一覧を取得する
     */
    private async getCommands() {
        return this.client.api
            .applications(this.userId)
            .guilds(this.guildId)
            .commands.get();
    }

    /**
     * コマンドを登録する
     * @param opt コマンド定義
     */
    private async registerCommand(opt: ApplicationCommandWithoutId) {
        return await this.client.api
            .applications(this.userId)
            .guilds(this.guildId)
            .commands.post({
                data: opt as ApplicationCommand
            });
    }

    /**
     * コマンドを削除する
     * @param commandId 削除するコマンドのID
     */
    private async deleteCommand(commandId: string) {
        await this.client.api
            .applications(this.userId)
            .guilds(this.guildId)
            .commands(commandId)
            .delete();
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
    private async client_onReady() {
        if (this.client.user) {
            this.userId = this.client.user.id;
        }

        this.textChannel = (await this.client.channels.fetch(this.config.Discord.chatChannel)) as TextChannel;
        this.guildId = this.textChannel.guild.id;

        // コマンドを一旦全削除してから登録
        console.log('[Discord]: コマンドを初期化しています');
        await this.DeleteAllCommands();
        await CommandBase.RegisterAllCommands();

        this.client.ws.on('INTERACTION_CREATE', this.clientWs_onInteractionCreate.bind(this));

        await this.SetBotStatus('dnd', '開発');
        console.log('[Discord]: Botが起動しました');

        // 開発サーバーのログ監視を開始
        this.mcLogWatcher.on('player-chat', this.mcLogWatcher_onPlayerChat.bind(this));
        this.mcLogWatcher.on('player-action', this.mcLogWatcher_onPlayerAction.bind(this));
        this.mcLogWatcher.on('server-log', this.mcLogWatcher_onServerLog.bind(this));
        this.mcLogWatcher.Start();
    }

    /**
     * Discordメッセージ送信時
     * @param message
     */
    private async client_onMessage(message: Message) {
        if (message.author.bot) return;
        if (message.system) return;
        if (message.channel.id !== this.config.Discord.chatChannel) return;

        const username = message.author.username;
        const text = message.content.replace(/\n/g, '\\n');

        try {
            console.log(`<${username}> ${text}`);
            await this.rconClient.Send(`tellraw @a {"text": "<${username}> ${text}"}`);
        }
        catch {
            console.log('[Discord]: メッセージの送信に失敗しました');
        }
    }

    /**
     * コマンド送信時
     * @param interaction
     */
    private async clientWs_onInteractionCreate(interaction: Required<Interaction>) {
        Object.keys(this.commandResponces).forEach(async id => {
            if (id === interaction.data.id) {
                this.client.api
                    .interactions(interaction.id, interaction.token)
                    .callback.post({
                        data: await this.commandResponces[id](interaction)
                    });
            }
        });
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

        this.textChannel.send('', {
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

        this.textChannel.send('', {
            embed: {
                title,
                color
            }
        });
    }
}
