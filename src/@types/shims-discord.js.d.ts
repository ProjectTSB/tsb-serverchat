type ApplicationCommandPost = {
    data: ApplicationCommand;
};

type InteractionResponsePost = {
    data: InteractionResponse;
};

type Api = {
    applications(id: string): {
        guilds(id: string): {
            commands: {
                (commandId: string): {
                    delete: () => Promise<Buffer>;
                };
                get(): Promise<ApplicationCommand[]>;
                post(opt: ApplicationCommandPost): Promise<ApplicationCommand>;
            };
        };
    };
    interactions(interactionId: string, interactionToken: string): {
        callback: {
            post(data: InteractionResponsePost): Promise<Buffer>;
        };
    };
};

declare module 'discord.js' {
    interface Client {
        public readonly api: Api;
    }
    interface WebSocketManager {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public on(event: WSEventType | 'INTERACTION_CREATE', listener: (data: any, shardID: number) => void): this;
    }
}
