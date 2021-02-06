import 'reflect-metadata';

import { TextChannel } from 'discord.js';
import { container } from 'tsyringe';
import https from 'https';
import { IncomingMessage } from 'http';
import fs from 'fs';

import { Config } from '@/Config';
import { SchematicCommand } from '@/discord/commands/SchematicCommand';

jest.mock('https');
jest.mock('discord.js');

jest.mock('@/discord/util/requireContext', () => ({
    requireContext: jest.fn()
}));

Object.defineProperty(Config.prototype, 'Discord', {
    get: jest.fn<ConfigData['discord'], any[]>(() => ({
        token: 'DISCORD_TOKEN',
        chatChannel: 'DISCORD_CHAT_CHANNEL'
    }))
});

Object.defineProperty(Config.prototype, 'Minecraft', {
    get: jest.fn<ConfigData['minecraft'], any[]>(() => ({
        serverPath: 'MINECRAFT_SERVER_PATH',
        teleportpointsMcfunction: 'MINECRAFT_TELEPORTPOINTS_MCFUNCTION'
    }))
});

describe('SchematicCommand', () => {
    test('command', () => {
        const command = container.resolve(SchematicCommand);

        expect(command['command']).toEqual<ApplicationCommandWithoutId>({
            name: 'schematic',
            description: expect.anything(),
            options: [
                {
                    name: 'list',
                    description: expect.anything(),
                    type: 1
                },
                {
                    name: 'delete',
                    description: expect.anything(),
                    type: 1,
                    options: [
                        {
                            name: 'file_name',
                            description: expect.anything(),
                            type: 3,
                            required: true
                        }
                    ]
                }
            ]
        });
    });

    test('callback(interaction) list, wrong chatChannel', async () => {
        const command = container.resolve(SchematicCommand);

        const interaction: Interaction = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        name: 'list'
                    }
                ]
            },
            guild_id: 'GUILD_ID',
            channel_id: 'WRONG_CHANNEL_ID',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: 2
        });
    });

    test('callback(interaction) list, zero schematic files', async () => {
        const mockFsReaddirSync = jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
            const dummyDir = new fs.Dirent();
            dummyDir.isFile = jest.fn().mockReturnValue(false);
            dummyDir.name = 'DIRECTORY';

            const dummyNoSchemFile = new fs.Dirent();
            dummyNoSchemFile.isFile = jest.fn().mockReturnValue(true);
            dummyNoSchemFile.name = 'NO_SCHEM.txt';

            return [
                dummyDir,
                dummyNoSchemFile
            ];
        });

        const command = container.resolve(SchematicCommand);

        const interaction: Interaction = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        name: 'list'
                    }
                ]
            },
            guild_id: 'GUILD_ID',
            channel_id: 'DISCORD_CHAT_CHANNEL',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: 4,
            data: expect.anything()
        });

        expect(mockFsReaddirSync).toBeCalledTimes(1);

        mockFsReaddirSync.mockClear();
    });

    test('callback(interaction) list', async () => {
        const mockFsReaddirSync = jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
            const dummySchemFile = new fs.Dirent();
            dummySchemFile.isFile = jest.fn().mockReturnValue(true);
            dummySchemFile.name = 'SCHEM.schematic';

            return [
                dummySchemFile
            ];
        });

        const command = container.resolve(SchematicCommand);

        const interaction: Interaction = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        name: 'list'
                    }
                ]
            },
            guild_id: 'GUILD_ID',
            channel_id: 'DISCORD_CHAT_CHANNEL',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: 4,
            data: expect.anything()
        });

        expect(mockFsReaddirSync).toBeCalledTimes(1);

        mockFsReaddirSync.mockClear();
    });

    test('callback(interaction) list, error', async () => {
        const mockFsReaddirSync = jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
            throw Error();
        });

        const command = container.resolve(SchematicCommand);

        const interaction: Interaction = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        name: 'list'
                    }
                ]
            },
            guild_id: 'GUILD_ID',
            channel_id: 'DISCORD_CHAT_CHANNEL',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: 4,
            data: expect.anything()
        });

        expect(mockFsReaddirSync).toBeCalledTimes(1);

        mockFsReaddirSync.mockClear();
    });

    test('callback(interaction) delete, wrong chatChannel', async () => {
        const command = container.resolve(SchematicCommand);

        const interaction: Interaction = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        name: 'delete',
                        options: [
                            {
                                name: 'file_name',
                                value: 'VALUE'
                            }
                        ]
                    }
                ]
            },
            guild_id: 'GUILD_ID',
            channel_id: 'WRONG_CHANNEL_ID',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: 2
        });
    });

    test('callback(interaction) delete', async () => {
        const mockFsUnlinkSync = jest.spyOn(fs, 'unlinkSync').mockReturnValue();

        const command = container.resolve(SchematicCommand);

        const interaction: Interaction = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        name: 'delete',
                        options: [
                            {
                                name: 'file_name',
                                value: 'VALUE'
                            }
                        ]
                    }
                ]
            },
            guild_id: 'GUILD_ID',
            channel_id: 'DISCORD_CHAT_CHANNEL',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: 4,
            data: expect.anything()
        });

        expect(mockFsUnlinkSync).toBeCalledTimes(1);

        mockFsUnlinkSync.mockClear();
    });

    test('callback(interaction) delete, error', async () => {
        const mockFsUnlinkSync = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {
            throw Error();
        });

        const command = container.resolve(SchematicCommand);

        const interaction: Interaction = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        name: 'delete',
                        options: [
                            {
                                name: 'file_name',
                                value: 'VALUE'
                            }
                        ]
                    }
                ]
            },
            guild_id: 'GUILD_ID',
            channel_id: 'DISCORD_CHAT_CHANNEL',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: 4,
            data: expect.anything()
        });

        expect(mockFsUnlinkSync).toBeCalledTimes(1);

        mockFsUnlinkSync.mockClear();
    });

    test('discordBotClient_onSchematic(channel, fileName, url)', async () => {
        const channel = new TextChannel(expect.anything());
        const writeStream = fs.WriteStream.prototype;
        // @ts-ignore
        const mockHttpsGet = jest.spyOn(https, 'get').mockImplementation((url: string, callback: (res: IncomingMessage) => void) => {
            const res = new IncomingMessage(expect.anything());
            callback(res);

            return {} as any;
        });
        const mockFsCreateWriteStream = jest.spyOn(fs, 'createWriteStream').mockReturnValue(writeStream);
        const mockFsWriteStreamOn = jest.spyOn(fs.WriteStream.prototype, 'on')
            .mockImplementation((event: string | symbol, listener: () => void) => {
                listener();
                return writeStream;
            });

        const command = container.resolve(SchematicCommand);

        await expect(command['discordBotClient_onSchematic'](channel, 'FILE_NAME', 'URL')).resolves.toBeUndefined();

        expect(mockHttpsGet).toBeCalledTimes(1);
        expect(mockFsCreateWriteStream).toBeCalledTimes(1);

        mockHttpsGet.mockClear();
        mockFsCreateWriteStream.mockClear();
        mockFsWriteStreamOn.mockClear();
    });
});
