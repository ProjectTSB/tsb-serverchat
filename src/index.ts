import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { Rcon } from 'rcon-client';
import { TextChannel, Client } from 'discord.js';

import { LogWatcher } from './minecraft/LogWatcher';
import { Config } from './types/Config';
import { LaunchClient } from './discord/LaunchClient';
import { LogParser } from './minecraft/LogParser';
import { LaunchRcon } from './minecraft/LaunchRcon';
import { Command } from './discord/Command';

const conf: Config = yaml.load(readFileSync('config.yaml', 'utf-8'));

const setBotStatus = async (client: Client, rcon: Rcon) => {
    if (!client.user) return;

    const regex = /^There\sare\s([^\s]*)\sof\sa\smax\sof\s([^\s]*)\splayers\sonline:\s(.*)$/.exec(await rcon.send('list'));
    if (!regex) return;
    const count = regex[1];
    const max = regex[2];

    client.user.setActivity(`[${count}/${max}] TSB Dev`);
};

const main = async () => {
    const client = await LaunchClient(conf.discord);
    const rcon = await LaunchRcon(conf.rcon);

    process.on('SIGINT', async () => {
        client.destroy();
        await rcon.end();

        process.exit();
    });

    client.on('message', async msg => {
        if (msg.author.bot) return;
        if (msg.channel.id !== conf.discord.chatChannel) return;
        if (msg.content.startsWith(conf.discord.commandPrefix)) {
            await Command(msg, client, rcon);
            return;
        }

        await rcon.send(`tellraw @a {"text": "<${msg.author.username}> ${msg.content}"}`);
        console.log(`<${msg.author.username}> ${msg.content}`);
    });

    setBotStatus(client, rcon);

    LogWatcher(conf.logPath, async ({ message }) => {
        const channel = client.channels.cache.get(conf.discord.chatChannel) as TextChannel;
        if (!channel) return;

        const parserResult = LogParser(message);
        if (!parserResult) return;

        channel.send(parserResult.message);

        if (parserResult.type === 'system') {
            setBotStatus(client, rcon);
        }
    });
};
main();
