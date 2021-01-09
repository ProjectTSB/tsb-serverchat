import fs from 'fs';

import { Config } from '@/Config';

const confFileData = `
    {
        "discord": {
            "token": "DISCORD_TOKEN",
            "chatChannel": "DISCORD_CHAT_CHANNEL"
        },
        "rcon": {
            "host": "RCON_HOST",
            "port": 25575,
            "password": "RCON_PASSWORD"
        },
        "minecraft": {
            "serverPath": "MINECRAFT_SERVER_PATH"
        }
    }
`;

let mockReadFileSync: jest.SpyInstance;

describe('Config', () => {
    beforeAll(() => {
        mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockReturnValue(confFileData);
    });

    afterAll(() => {
        mockReadFileSync.mockClear();

        // @ts-ignore
        Config.confCache = null;
    });

    test('Discord', () => {
        expect(Config.Discord).toEqual<ConfigData['discord']>({
            token: 'DISCORD_TOKEN',
            chatChannel: 'DISCORD_CHAT_CHANNEL'
        });
    });

    test('Rcon', () => {
        expect(Config.Rcon).toEqual<ConfigData['rcon']>({
            host: 'RCON_HOST',
            port: 25575,
            password: 'RCON_PASSWORD'
        });
    });

    test('Minecraft', () => {
        expect(Config.Minecraft).toEqual<ConfigData['minecraft']>({
            serverPath: 'MINECRAFT_SERVER_PATH'
        });
    });
});

describe('Config Error', () => {
    test('Error', () => {
        mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockReturnValueOnce('{');
        const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(mockConsoleError).not.toBeCalled();

        expect(() => Config.Discord).toThrow();

        mockReadFileSync.mockClear();
        mockConsoleError.mockClear();
    });
});
