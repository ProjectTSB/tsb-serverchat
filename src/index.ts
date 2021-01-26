import 'reflect-metadata';

import { emitKeypressEvents, Key } from 'readline';
import { Client } from 'discord.js';
import { Rcon } from 'rcon-client';
import { container } from 'tsyringe';

import { DiscordBotClient } from '@/discord/DiscordBotClient';
import { RconClient } from '@/rcon/RconClient';
import { Config } from '@/Config';

const config = container.resolve(Config);

container.register(Client, { useClass: Client });
container.register(Rcon, {
    useValue: new Rcon({
        host: config.Rcon.host,
        port: config.Rcon.port,
        password: config.Rcon.password
    })
});

const discordBotClient = container.resolve(DiscordBotClient);
const rconClient = container.resolve(RconClient);

discordBotClient.Launch();
rconClient.Launch();

// `Ctrl+C` に割り込む
emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', async (_key: string, keyData: Key) => {
    if (keyData.ctrl && keyData.name === 'c') {
        try {
            // コマンドを消してからBotを停止する
            await discordBotClient.DeleteAllCommands();
            discordBotClient.Destroy();
            await rconClient.Stop();
        }
        finally {
            process.exit();
        }
    }
});
