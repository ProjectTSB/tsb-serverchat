import { Client, PresenceStatusData } from 'discord.js';

import { Config } from '@/Config';

export class DiscordBotClient {
    private client: Client;

    public constructor() {
        this.client = new Client();
    }

    /**
     * Botを起動する
     */
    public async Launch(): Promise<void> {
        this.client.on('ready', this.client_onReady.bind(this));
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
     * Bot準備完了時
     */
    private async client_onReady() {
        await this.SetBotStatus('dnd', '開発');
        console.log('READY!!');
    }
}
