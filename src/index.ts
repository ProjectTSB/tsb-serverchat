import 'reflect-metadata';

import { emitKeypressEvents, Key } from 'readline';
import { Client } from 'discord.js';
import { container } from 'tsyringe';

import { DiscordBotClient } from '@/discord/DiscordBotClient';

container.register(Client, { useClass: Client });

const discordBotClient = container.resolve(DiscordBotClient);

discordBotClient.Launch();

// `Ctrl+C` に割り込む
emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', async (_key: string, keyData: Key) => {
    if (keyData.ctrl && keyData.name === 'c') {
        // コマンドを消してからBotを停止する
        await discordBotClient.DeleteAllCommands();
        discordBotClient.Destroy();

        process.exit();
    }
});
