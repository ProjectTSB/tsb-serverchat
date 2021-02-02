import 'reflect-metadata';

import { container } from 'tsyringe';
import fs from 'fs';

import { MCLogWatcher } from '@/minecraft/MCLogWatcher';
import { Config } from '@/Config';
import { streamToString } from '@/util/streamToString';

jest.mock('@/util/streamToString');

const mockStreamToString = streamToString as jest.Mock;

Object.defineProperty(Config.prototype, 'Minecraft', {
    get: jest.fn<ConfigData['minecraft'], any[]>(() => ({
        serverPath: 'MINECRAFT_SERVER_PATH'
    }))
});

describe('MCLogWatcher', () => {
    test('Start()', () => {
        jest.useFakeTimers();
        const mockFsStatSync = jest.spyOn(fs, 'statSync').mockReturnValue({
            size: 100,
            mtimeMs: new Date().getTime()
        } as fs.Stats);
        let mockPromisesStat = jest.spyOn(fs.promises, 'stat').mockResolvedValue({
            size: 10,
            mtimeMs: new Date().getTime()
        } as fs.Stats);

        const mcLogWatcher = container.resolve(MCLogWatcher);

        expect(mcLogWatcher.Start()).toBeUndefined();

        jest.advanceTimersToNextTimer();

        mockPromisesStat = jest.spyOn(fs.promises, 'stat').mockResolvedValue({
            size: 20,
            mtimeMs: new Date().getTime()
        } as fs.Stats);
        mockStreamToString.mockResolvedValue([
            '',
            'INVALID LOG',
            '[00:00:00] [Server thread/INFO]: <USERNAME> MESSAGE',
            '[00:00:00] [Server thread/INFO]: USERNAME joined the game',
            '[00:00:00] [Server thread/INFO]: USERNAME left the game',
            '[00:00:00] [Server thread/INFO]: Done (0.000ms)! For help, type "help"',
            '[00:00:00] [Server thread/INFO]: Closing Server',
            '[00:00:00] [Server thread/INFO]: OTHER LOG'
        ].join('\n'));

        jest.advanceTimersToNextTimer();

        expect(mockFsStatSync).toBeCalledTimes(1);
        expect(mockPromisesStat).toBeCalledTimes(2);

        mockFsStatSync.mockClear();
        mockPromisesStat.mockClear();
        mockStreamToString.mockClear();
    });

    test('Stop() watchInterval is null', () => {
        const mcLogWatcher = container.resolve(MCLogWatcher);
        mcLogWatcher['watchInterval'] = null;

        expect(mcLogWatcher.Stop()).toBeUndefined();
    });

    test('Stop()', () => {
        const mcLogWatcher = container.resolve(MCLogWatcher);
        // @ts-ignore
        mcLogWatcher['watchInterval'] = jest.fn();

        expect(mcLogWatcher.Stop()).toBeUndefined();
    });

    test('on(event, listener)', () => {
        const mcLogWatcher = container.resolve(MCLogWatcher);

        expect(mcLogWatcher['on']('player-chat', jest.fn())).toEqual(mcLogWatcher);
    });
});
