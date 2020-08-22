import chokidar from 'chokidar';
import { statSync, createReadStream } from 'fs';

import { StreamToString } from './StreamToString';

type MinecraftLog = {
    time: string;
    message: string;
};

export const LogWatcher = (logPath: string, detectMessage: (log: MinecraftLog) => void): chokidar.FSWatcher => {
    console.log('ログ監視を開始');
    const watcher = chokidar.watch(logPath, { persistent: false });

    let pos = statSync(logPath).size;

    watcher.on('ready', () => {
        watcher.on('change', async (_path, stats) => {
            if (!stats) return;
            if (stats.size < 2) return;

            if (stats.size < pos) pos = 0;

            const stream = createReadStream(logPath, {
                start: pos,
                end: stats.size - 2
            });

            const lines = await StreamToString(stream);
            for (const line of lines.split('\n')) {
                const regex = /\[([^\]]*)\]\s\[[^\]]*\]:\s(.*)\n?/.exec(line);
                if (regex) {
                    detectMessage({
                        time: regex[1],
                        message: regex[2]
                    });
                }
            }
            pos = stats.size;
        });
    });

    return watcher;
};
