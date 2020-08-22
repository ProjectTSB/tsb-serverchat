import { Config } from '../types/Config';

import { Rcon } from 'rcon-client';

export const LaunchRcon = async (conf: Config['rcon']): Promise<Rcon> => {
    const rcon = new Rcon({
        host: conf.host,
        port: conf.port,
        password: conf.password
    });
    rcon.on('connect', () => {
        console.log('Rconが起動しました');
    });
    rcon.on('end', async () => {
        console.log('Rconが停止しました');
    });

    await rcon.connect();

    return rcon;
};
