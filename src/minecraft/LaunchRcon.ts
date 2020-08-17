import { Config } from '../types/Config';

import { Rcon } from 'rcon-client';

export const LaunchRcon = async (conf: Config['rcon']): Promise<Rcon> => {
    const rcon = await Rcon.connect({
        host: conf.host,
        port: conf.port,
        password: conf.password
    });
    console.log('Rconが起動しました');

    return rcon;
};
