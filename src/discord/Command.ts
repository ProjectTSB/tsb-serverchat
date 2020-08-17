import { Client, Message } from 'discord.js';
import { Rcon } from 'rcon-client/lib';

export const Command = async (msg: Message, client: Client, rcon: Rcon): Promise<void> => {
    if (msg.content.startsWith('!stop')) {
        await msg.channel.send('Stopping...');
        client.destroy();
    }
    else if (msg.content.startsWith('!cmd')) {
        const regex = /^!cmd\s(.*)$/.exec(msg.content);
        if (!regex) {
            await msg.channel.send('使用法: !cmd <Minecraftコマンド>');
            return;
        }

        const result = await rcon.send(regex[1]);
        if (result !== '') await msg.channel.send(result);
    }
};
