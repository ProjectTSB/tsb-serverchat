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
    };
};
