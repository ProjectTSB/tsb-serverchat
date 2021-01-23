import 'reflect-metadata';

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
    });

    test('Discord', () => {
        const config = new Config();

        expect(config.Discord).toEqual<ConfigData['discord']>({
            token: 'DISCORD_TOKEN',
            chatChannel: 'DISCORD_CHAT_CHANNEL'
        });
    });

    test('Rcon', () => {
        const config = new Config();

        expect(config.Rcon).toEqual<ConfigData['rcon']>({
            host: 'RCON_HOST',
            port: 25575,
            password: 'RCON_PASSWORD'
        });
    });

    test('Minecraft', () => {
        const config = new Config();

        expect(config.Minecraft).toEqual<ConfigData['minecraft']>({
            serverPath: 'MINECRAFT_SERVER_PATH'
        });
    });

    test('confCache', () => {
        const config = new Config();
        config['confCache'] = {
            discord: expect.anything(),
            rcon: expect.anything(),
            minecraft: expect.anything()
        };

        expect(config.Discord).toEqual(expect.anything());
    });
});

describe('Config Error', () => {
    test('Error', () => {
        mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockReturnValueOnce('{');
        const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(mockConsoleError).not.toBeCalled();

        const config = new Config();

        expect(() => config.Discord).toThrow();

        mockReadFileSync.mockClear();
        mockConsoleError.mockClear();
    });
});
