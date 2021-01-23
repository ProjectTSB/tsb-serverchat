import { readFileSync } from 'fs';
import { singleton } from 'tsyringe';
import * as JSONC from 'jsonc-parser';

@singleton<Config>()
export class Config {
    /**
     * Discordに関するコンフィグ
     */
    public get Discord(): ConfigData['discord'] {
        return this.getData().discord;
    }

    /**
     * Rconに関するコンフィグ
     */
    public get Rcon(): ConfigData['rcon'] {
        return this.getData().rcon;
    }

    /**
     * Minecraftに関するコンフィグ
     */
    public get Minecraft(): ConfigData['minecraft'] {
        return this.getData().minecraft;
    }

    /**
     * コンフィグファイルのパス
     */
    private readonly confPath = 'config.json';

    /**
     * コンフィグのキャッシュデータ
     */
    private confCache: ConfigData | null = null;

    /**
     * コンフィグデータを取得\
     * まだデータを読み込んでいない場合は読み込んで返す
     */
    private getData(): ConfigData {
        if (!this.confCache) {
            this.confCache = this.readConf();
        }

        return this.confCache;
    }

    /**
     * コンフィグファイルからデータを読み込む
     */
    private readConf(): ConfigData {
        try {
            const file = readFileSync(this.confPath, 'utf-8');

            const errors: JSONC.ParseError[] = [];
            const obj: ConfigData = JSONC.parse(file, errors);

            // パースに失敗してもエラー吐いてくれないらしいので
            if (errors.length > 0) throw Error();

            return obj;
        }
        catch (err) {
            console.error('コンフィグファイルの読み込みに失敗しました');

            throw err;
        }
    }
}
