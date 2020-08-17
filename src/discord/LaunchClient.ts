import Discord from 'discord.js';

import { Config } from '../types/Config';

export const LaunchClient = (conf: Config['discord']): Promise<Discord.Client> => {
    return new Promise(resolve => {
        const client = new Discord.Client();

        client.on('ready', () => {
            console.log('Discord Botが起動しました');
            resolve(client);
        });

        client.login(conf.token);
    });
};
