import { Client, PresenceStatusData, TextChannel } from 'discord.js';
import { singleton, inject } from 'tsyringe';

import { Config } from '@/Config';
import { CommandBase } from '@/discord/util/CommandBase';

type CommandResponces = {
    [key: string]: (interaction: Required<Interaction>) => Promise<InteractionResponse>;
};

@singleton<DiscordBotClient>()
export class DiscordBotClient {
    private userId = '';
    private guildId = '';

    private commandResponces: CommandResponces = {};

    public constructor(
        @inject(Config) private config: Config,
        @inject(Client) private client: Client
    ) {
        this.client.on('ready', this.client_onReady.bind(this));
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
        this.client.destroy();
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
     * Bot準備完了時
     */
    private async client_onReady() {
        if (this.client.user) {
            this.userId = this.client.user.id;
        }

        const channel: TextChannel = (await this.client.channels.fetch(this.config.Discord.chatChannel)) as TextChannel;
        this.guildId = channel.guild.id;

        console.log('[Discord]: コマンドを初期化しています');
        await this.DeleteAllCommands();
        await CommandBase.RegisterAllCommands();

        this.client.ws.on('INTERACTION_CREATE', this.clientWs_onInteractionCreate.bind(this));

        await this.SetBotStatus('dnd', '開発');
        console.log('[Discord]: Botが起動しました');
    }

    /**
     * コマンド入力時
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
