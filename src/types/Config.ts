export type Config = {
    logPath: string;
    discord: {
        token: string;
        chatChannel: string;
        commandPrefix: string;
    }
    rcon: {
        host: string;
        port: number;
        password: string;
    };
};
