import { Client, PresenceStatusData, TextChannel, Message } from 'discord.js';
import { singleton, inject } from 'tsyringe';
import { EventEmitter } from 'events';

import { Config } from '@/Config';
import { CommandBase } from '@/discord/util/CommandBase';

type CommandResponces = {
    [key: string]: (interaction: Required<Interaction>) => Promise<InteractionResponse>;
};

type EventArgs = {
    'ready': [];
    'chat': [
        message: Message
    ];
    'schematic': [
        channel: TextChannel,
        fileName: string,
        url: string
    ];
};

@singleton<DiscordBotClient>()
export class DiscordBotClient extends EventEmitter {
    private userId = '';
    private guildId = '';

    private commandResponces: CommandResponces = {};

    public constructor(
        @inject(Config) private config: Config,
        @inject(Client) private client: Client
    ) {
        super();

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
    public async Destroy(): Promise<void> {
        await this.deleteAllCommands();
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
     * テキストチャンネルを取得する
     * @param channelId テキストチャンネルID
     */
    public async GetTextChannel(channelId: string): Promise<TextChannel> {
        return (await this.client.channels.fetch(channelId)) as TextChannel;
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
     * コマンドを全て削除する
     */
    private async deleteAllCommands(): Promise<void> {
        const commands = await this.getCommands();
        await Promise.all(commands.map(command => this.deleteCommand(command.id)));
    }

    /**
     * Bot準備完了時
     */
    private async client_onReady() {
        await this.SetBotStatus('idle', '準備');

        if (this.client.user) {
            this.userId = this.client.user.id;
        }

        const textChannel = await this.GetTextChannel(this.config.Discord.chatChannel);
        this.guildId = textChannel.guild.id;

        // コマンドを一旦全削除してから登録
        console.log('[Discord]: コマンドを初期化しています');
        await this.deleteAllCommands();
        await CommandBase.RegisterAllCommands();

        this.client.ws.on('INTERACTION_CREATE', this.clientWs_onInteractionCreate.bind(this));

        console.log('[Discord]: Botが起動しました');

        this.emit('ready');
    }

    /**
     * Discordメッセージ送信時
     * @param message
     */
    private async client_onMessage(message: Message) {
        if (!(message.channel instanceof TextChannel)) return;
        if (message.author.bot) return;
        if (message.system) return;
        if (message.channel.id !== this.config.Discord.chatChannel) return;

        if (message.attachments.size > 0) {
            for (const attachment of message.attachments.array()) {
                const { name, url } = attachment;

                if (!name) continue;

                if (/^.*\.(?:schematic|schem)$/.test(name)) {
                    this.emit('schematic', message.channel, name, url);
                }
            }
        }

        if (message.content !== '') {
            this.emit('chat', message);
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
}
