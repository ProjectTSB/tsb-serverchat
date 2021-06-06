type ConfigData = {
    discord: {
        /**
         * Botのトークン
         */
        token: string;
        /**
         * チャットに使用するチャンネルのID
         */
        chatChannel: string;
        /**
         * コマンドの使用を許可するロールのID
         */
        allowCommandRole: string;
    };
    rcon: {
        /**
         * TSB開発サーバーのホストネーム
         */
        host: string;
        /**
         * TSB開発サーバーのRconポート
         */
        port: number;
        /**
         * TSB開発サーバーのRconパスワード
         */
        password: string;
    };
    minecraft: {
        /**
         * TSB開発サーバーディレクトリのパス
         */
        serverPath: string;
        /**
         * teleportpointコマンドの出力先(mcfunction)
         */
        teleportpointsMcfunction: string;
    };
};

type PartialOptional<T, K extends keyof T> = {
    [P in K]?: T[P];
} & {
    [P in keyof Omit<T, K>]: T[P];
};

type ApplicationCommandWithoutId =
    PartialOptional<ApplicationCommand, 'id' | 'application_id'>;
