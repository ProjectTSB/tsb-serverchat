import { emitKeypressEvents, Key } from 'readline';

import { DiscordBotClient } from '@/discord/DiscordBotClient';

const discordBotClient = new DiscordBotClient();

discordBotClient.Launch();

// `Ctrl+C` に割り込む
emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', async (_key: string, keyData: Key) => {
    if (keyData.ctrl && keyData.name === 'c') {
        // コマンドを消してからBotを停止する
        await discordBotClient.DeleteAllCommands();
        discordBotClient.Destroy();

        process.exit();
    }
});
