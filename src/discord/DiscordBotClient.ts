import { Client, PresenceStatusData, TextChannel } from 'discord.js';

import { Config } from '@/Config';

type CommandResponce = {
    id: string;
    func: (interaction: Required<Interaction>) => Promise<InteractionResponse>;
}

export class DiscordBotClient {
    private client: Client;

    private userId = '';
    private guildId = '';

    private commandResponces: CommandResponce[] = [];

    public constructor() {
        this.client = new Client();
        this.client.on('ready', this.client_onReady.bind(this));
    }

    /**
     * Botを起動する
     */
    public async Launch(): Promise<void> {
        try {
            await this.client.login(Config.Discord.token);
        }
        catch {
            console.error('Botの起動に失敗しました');
            process.exit(1);
        }
    }

    /**
     * Botを終了する
     */
    public Destroy(): void {
        this.client.destroy();
    }

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

        const channel: TextChannel = (await this.client.channels.fetch(Config.Discord.chatChannel)) as TextChannel;
        this.guildId = channel.guild.id;

        console.log('[Discord]: コマンドを初期化しています');
        const commands = await this.getCommands();
        await Promise.all(commands.map(command => this.deleteCommand(command.id)));

        // TODO: 確認用 後で消す
        // const testCommand = await this.registerCommand({
        //     name: 'test',
        //     description: 'テストコマンド'
        // });
        // this.commandResponces.push({
        //     id: testCommand.id,
        //     func: async () => ({
        //         type: 2,
        //         data: {
        //             content: 'テスト'
        //         }
        //     })
        // });

        this.client.ws.on('INTERACTION_CREATE', this.clientWs_onInteractionCreate.bind(this));

        await this.SetBotStatus('dnd', '開発');
        console.log('[Discord]: Botが起動しました');
    }

    /**
     * コマンド入力時
     * @param interaction
     */
    private async clientWs_onInteractionCreate(interaction: Required<Interaction>) {
        for (const res of this.commandResponces) {
            if (res.id === interaction.data.id) {
                this.client.api
                    .interactions(interaction.id, interaction.token)
                    .callback.post({
                        data: await res.func(interaction)
                    });
            }
        }
    }
}
