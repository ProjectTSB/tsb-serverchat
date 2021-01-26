import { Rcon } from 'rcon-client';
import { injectable, inject } from 'tsyringe';

@injectable<RconClient>()
export class RconClient {
    public constructor(
        @inject(Rcon) private rcon: Rcon
    ) {
        rcon.on('error', this.rcon_onError.bind(this));
    }

    /**
     * Rconを起動
     */
    public async Launch(): Promise<void> {
        try {
            await this.rcon.connect();

            console.log('[Rcon]: Rconが起動しました');
        }
        catch {
            this.rcon_onError();
        }
    }

    /**
     * Rconを停止
     */
    public async Stop(): Promise<void> {
        await this.rcon.end();

        console.log('[Rcon]: Rconが停止しました');
    }

    /**
     * 開発サーバーにコマンドを送信します
     * @param command Minecraftコマンド
     */
    public async Send(command: string): Promise<string> {
        return this.rcon.send(command);
    }

    /**
     * Rconエラー時
     */
    private rcon_onError() {
        setTimeout(() => {
            this.Launch();
        }, 2000);
    }
}
