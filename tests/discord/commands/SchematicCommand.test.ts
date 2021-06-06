import 'reflect-metadata';

import { TextChannel } from 'discord.js';
import { container } from 'tsyringe';
import https from 'https';
import { IncomingMessage } from 'http';
import fs from 'fs';

import { Config } from '@/Config';
import { SchematicCommand } from '@/discord/commands/SchematicCommand';
import { ApplicationCommandOptionType, ApplicationCommandPermissionType, InteractionCallbackType, InteractionType } from '@/discord/util/discord-api-enums';

jest.mock('https');
jest.mock('discord.js');

jest.mock('@/discord/util/requireContext', () => ({
    requireContext: jest.fn()
}));

Object.defineProperty(Config.prototype, 'Discord', {
    get: jest.fn<ConfigData['discord'], any[]>(() => ({
        token: 'DISCORD_TOKEN',
        chatChannel: 'DISCORD_CHAT_CHANNEL',
        allowCommandRole: 'ALLOW_COMMAND_ROLE'
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
            default_permission: false,
            options: [
                {
                    name: 'list',
                    description: expect.anything(),
                    type: ApplicationCommandOptionType.SUB_COMMAND
                },
                {
                    name: 'delete',
                    description: expect.anything(),
                    type: ApplicationCommandOptionType.SUB_COMMAND,
                    options: [
                        {
                            name: 'file_name',
                            description: expect.anything(),
                            type: ApplicationCommandOptionType.STRING,
                            required: true
                        }
                    ]
                }
            ]
        });
    });

    test('permissions', () => {
        const command = container.resolve(SchematicCommand);

        expect(command['permissions']).toEqual<ApplicationCommandPermissions[]>([
            {
                id: expect.anything(),
                type: ApplicationCommandPermissionType.ROLE,
                permission: true
            }
        ]);
    });

    test('callback(interaction) list, wrong chatChannel', async () => {
        const command = container.resolve(SchematicCommand);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'list'
                    }
                ],
                custom_id: 'CUSTOM_ID',
                component_type: 1
            },
            guild_id: 'GUILD_ID',
            channel_id: 'WRONG_CHANNEL_ID',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
                content: '',
                flags: 64,
                embeds: [
                    {
                        title: expect.anything(),
                        description: expect.anything(),
                        color: 0xff0000
                    }
                ]
            }
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
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'list'
                    }
                ],
                custom_id: 'CUSTOM_ID',
                component_type: 1
            },
            guild_id: 'GUILD_ID',
            channel_id: 'DISCORD_CHAT_CHANNEL',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: InteractionCallbackType.ChannelMessageWithSource,
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
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'list'
                    }
                ],
                custom_id: 'CUSTOM_ID',
                component_type: 1
            },
            guild_id: 'GUILD_ID',
            channel_id: 'DISCORD_CHAT_CHANNEL',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: InteractionCallbackType.ChannelMessageWithSource,
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
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'list'
                    }
                ],
                custom_id: 'CUSTOM_ID',
                component_type: 1
            },
            guild_id: 'GUILD_ID',
            channel_id: 'DISCORD_CHAT_CHANNEL',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: expect.anything()
        });

        expect(mockFsReaddirSync).toBeCalledTimes(1);

        mockFsReaddirSync.mockClear();
    });

    test('callback(interaction) delete, wrong chatChannel', async () => {
        const command = container.resolve(SchematicCommand);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'delete',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'file_name',
                                value: 'VALUE'
                            }
                        ]
                    }
                ],
                custom_id: 'CUSTOM_ID',
                component_type: 1
            },
            guild_id: 'GUILD_ID',
            channel_id: 'WRONG_CHANNEL_ID',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
                content: '',
                flags: 64,
                embeds: [
                    {
                        title: expect.anything(),
                        description: expect.anything(),
                        color: 0xff0000
                    }
                ]
            }
        });
    });

    test('callback(interaction) delete', async () => {
        const mockFsUnlinkSync = jest.spyOn(fs, 'unlinkSync').mockReturnValue();

        const command = container.resolve(SchematicCommand);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'delete',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'file_name',
                                value: 'VALUE'
                            }
                        ]
                    }
                ],
                custom_id: 'CUSTOM_ID',
                component_type: 1
            },
            guild_id: 'GUILD_ID',
            channel_id: 'DISCORD_CHAT_CHANNEL',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: InteractionCallbackType.ChannelMessageWithSource,
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
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'schematic',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'delete',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'file_name',
                                value: 'VALUE'
                            }
                        ]
                    }
                ],
                custom_id: 'CUSTOM_ID',
                component_type: 1
            },
            guild_id: 'GUILD_ID',
            channel_id: 'DISCORD_CHAT_CHANNEL',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: InteractionCallbackType.ChannelMessageWithSource,
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
