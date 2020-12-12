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

const listRegex = /^There\sare\s([^\s]*)\sof\sa\smax\sof\s([^\s]*)\splayers\sonline:\s(.*)$/;

const setBotStatus = async (client: Client, rcon: Rcon) => {
    if (!client.user) return;
    if (!rcon.socket) return;

    const regex = listRegex.exec(await rcon.send('list'));
    if (!regex) return;
    const count = regex[1];
    const max = regex[2];

    await client.user.setPresence({
        status: 'online',
        activity: {
            type: 'PLAYING',
            name: `[${count}/${max}] TSB Dev`
        }
    });
};

const main = async () => {
    const client = await LaunchClient(conf.discord);
    let rcon = await LaunchRcon(conf.rcon);
    const channel = client.channels.cache.get(conf.discord.chatChannel) as TextChannel;
    if (!channel) return;

    client.on('message', async msg => {
        if (msg.author.bot) return;
        if (msg.channel.id !== conf.discord.chatChannel) return;
        if (msg.content.startsWith(conf.discord.commandPrefix)) {
            await Command(msg, client, rcon);
            return;
        }
        if (!rcon.socket) return;

        await rcon.send(`tellraw @a {"text": "<${msg.author.username}> ${msg.content.replace(/\n/g, '\\n')}"}`);
        console.log(`<${msg.author.username}> ${msg.content}`);
    });

    setBotStatus(client, rcon);

    setInterval(async () => {
        if (!rcon.socket) {
            await channel.setTopic('[5分毎更新] サーバー停止中');
            return;
        }

        const regex = listRegex.exec(await rcon.send('list'));
        if (!regex) return;

        const users = regex[3];
        await channel.setTopic(`[5分毎更新] ログイン中: ${users}`).catch(err => console.log(err));
    }, 5 * 60 * 1000);

    const logWatcher = LogWatcher(conf.logPath, async ({ message }) => {
        const parserResult = LogParser(message);
        if (!parserResult) return;

        if (parserResult.type === 'login' || parserResult.type === 'logout') {
            const regex = listRegex.exec(await rcon.send('list'));
            if (!regex) return;

            const count = regex[1];
            const max = regex[2];
            const users = regex[3].split(', ').filter(x => x !== '').map(x => `\`${x}\``);
            parserResult.message += `\n> [${count}/${max}] ${users.join(', ')}`;
        }

        await channel.send(parserResult.message);

        if (parserResult.type === 'chat') return;

        if (parserResult.type === 'stop') {
            if (!client.user) return;

            await client.user.setPresence({
                status: 'dnd',
                activity: {
                    type: 'PLAYING',
                    name: '[サーバー停止] TSB Dev'
                }
            });
        }
        else if (parserResult.type === 'start') {
            rcon = await LaunchRcon(conf.rcon);
            await setBotStatus(client, rcon);
        }
        else {
            await setBotStatus(client, rcon);
        }
    });

    process.on('SIGINT', async () => {
        client.destroy();
        await rcon.end();
        await logWatcher.close();

        process.exit();
    });
};
main();
