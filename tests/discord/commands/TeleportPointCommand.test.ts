import 'reflect-metadata';

import { container } from 'tsyringe';
import fs from 'fs';

import { Config } from '@/Config';
import { TeleportPointCommand } from '@/discord/commands/TeleportPointCommand';
import { ApplicationCommandOptionType, ApplicationCommandPermissionType, InteractionCallbackType, InteractionType } from '@/discord/util/discord-api-enums';

jest.mock('@/rcon/RconClient');
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

const teleportpointsFileData = `
    {
        "minecraft:overworld": {},
        "minecraft:the_nether": {
            "THE_NETHER1": {
                "dimension": "minecraft:the_nether",
                "name": "THE_NETHER1",
                "coordinate": [1, 1, 1]
            }
        },
        "minecraft:the_end": {
            "THE_END1": {
                "dimension": "minecraft:the_end",
                "name": "THE_END1",
                "coordinate": [1, 1, 1]
            },
            "THE_END2": {
                "dimension": "minecraft:the_end",
                "name": "THE_END2",
                "coordinate": [2, 2, 2]
            }
        }
    }
`;

let mockReadFileSync: jest.SpyInstance;
let mockWriteFileSync: jest.SpyInstance;

describe('TeleportPointCommand', () => {
    beforeEach(() => {
        mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockReturnValue(teleportpointsFileData);
        mockWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockReturnValue();
    });

    afterEach(() => {
        mockReadFileSync.mockClear();
        mockWriteFileSync.mockClear();
    });

    test('command', () => {
        const command = container.resolve(TeleportPointCommand);

        expect(command['command']).toEqual<ApplicationCommandWithoutId>({
            name: 'teleportpoint',
            description: expect.anything(),
            default_permission: false,
            options: [
                {
                    name: 'list',
                    description: expect.anything(),
                    type: ApplicationCommandOptionType.SUB_COMMAND
                },
                {
                    name: 'add',
                    description: expect.anything(),
                    type: ApplicationCommandOptionType.SUB_COMMAND,
                    options: [
                        {
                            name: 'dimension',
                            description: expect.anything(),
                            type: ApplicationCommandOptionType.STRING,
                            required: true,
                            choices: [
                                {
                                    name: 'overworld',
                                    value: 'minecraft:overworld'
                                },
                                {
                                    name: 'the_nether',
                                    value: 'minecraft:the_nether'
                                },
                                {
                                    name: 'the_end',
                                    value: 'minecraft:the_end'
                                }
                            ]
                        },
                        {
                            name: 'name',
                            description: expect.anything(),
                            type: ApplicationCommandOptionType.STRING,
                            required: true
                        },
                        {
                            name: 'x',
                            description: expect.anything(),
                            type: ApplicationCommandOptionType.INTEGER,
                            required: true
                        },
                        {
                            name: 'y',
                            description: expect.anything(),
                            type: ApplicationCommandOptionType.INTEGER,
                            required: true
                        },
                        {
                            name: 'z',
                            description: expect.anything(),
                            type: ApplicationCommandOptionType.INTEGER,
                            required: true
                        }
                    ]
                },
                {
                    name: 'remove',
                    description: expect.anything(),
                    type: ApplicationCommandOptionType.SUB_COMMAND,
                    options: [
                        {
                            name: 'dimension',
                            description: expect.anything(),
                            type: ApplicationCommandOptionType.STRING,
                            required: true,
                            choices: [
                                {
                                    name: 'overworld',
                                    value: 'minecraft:overworld'
                                },
                                {
                                    name: 'the_nether',
                                    value: 'minecraft:the_nether'
                                },
                                {
                                    name: 'the_end',
                                    value: 'minecraft:the_end'
                                }
                            ]
                        },
                        {
                            name: 'name',
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
        const command = container.resolve(TeleportPointCommand);

        expect(command['permissions']).toEqual<ApplicationCommandPermissions[]>([
            {
                id: expect.anything(),
                type: ApplicationCommandPermissionType.ROLE,
                permission: true
            }
        ]);
    });

    test('callback(interaction) list, wrong chatChannel', async () => {
        const command = container.resolve(TeleportPointCommand);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
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

    test('callback(interaction) list', async () => {
        const command = container.resolve(TeleportPointCommand);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
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
    });

    test('callback(interaction) list, error', async () => {
        mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
            throw Error();
        });
        mockWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
            throw Error();
        });

        const command = container.resolve(TeleportPointCommand);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
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
    });

    test('callback(interaction) add, wrong chatChannel', async () => {
        const command = container.resolve(TeleportPointCommand);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'add',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'dimension',
                                value: 'minecraft:overworld'
                            },
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'name',
                                value: 'NAME'
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'x',
                                value: 0
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'y',
                                value: 0
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'z',
                                value: 0
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

    test('callback(interaction) add, teleportPoints is null', async () => {
        const command = container.resolve(TeleportPointCommand);

        command['teleportPoints'] = null;

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'add',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'dimension',
                                value: 'minecraft:overworld'
                            },
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'name',
                                value: 'NAME'
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'x',
                                value: 0
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'y',
                                value: 0
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'z',
                                value: 0
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
    });

    test('callback(interaction) add', async () => {
        const command = container.resolve(TeleportPointCommand);

        command['teleportPoints'] = JSON.parse(teleportpointsFileData);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'add',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'dimension',
                                value: 'minecraft:overworld'
                            },
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'name',
                                value: 'NAME'
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'x',
                                value: 0
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'y',
                                value: 0
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'z',
                                value: 0
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
    });

    test('callback(interaction) add, modify', async () => {
        const command = container.resolve(TeleportPointCommand);

        command['teleportPoints'] = JSON.parse(teleportpointsFileData);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'add',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'dimension',
                                value: 'minecraft:the_nether'
                            },
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'name',
                                value: 'THE_NETHER1'
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'x',
                                value: 0
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'y',
                                value: 0
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'z',
                                value: 0
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
    });

    test('callback(interaction) add, error', async () => {
        mockWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
            throw Error();
        });

        const command = container.resolve(TeleportPointCommand);

        command['teleportPoints'] = JSON.parse(teleportpointsFileData);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'add',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'dimension',
                                value: 'minecraft:overworld'
                            },
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'name',
                                value: 'NAME'
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'x',
                                value: 0
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'y',
                                value: 0
                            },
                            {
                                type: ApplicationCommandOptionType.INTEGER,
                                name: 'z',
                                value: 0
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
    });

    test('callback(interaction) remove, wrong chatChannel', async () => {
        const command = container.resolve(TeleportPointCommand);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'remove',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'dimension',
                                value: 'minecraft:overworld'
                            },
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'name',
                                value: 'NAME'
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

    test('callback(interaction) remove, teleportPoints is null', async () => {
        const command = container.resolve(TeleportPointCommand);

        command['teleportPoints'] = null;

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'remove',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'dimension',
                                value: 'minecraft:overworld'
                            },
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'name',
                                value: 'NAME'
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
    });

    test('callback(interaction) remove', async () => {
        const command = container.resolve(TeleportPointCommand);

        command['teleportPoints'] = JSON.parse(teleportpointsFileData);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'remove',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'dimension',
                                value: 'minecraft:the_nether'
                            },
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'name',
                                value: 'THE_NETHER1'
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
    });

    test('callback(interaction) remove, error', async () => {
        mockWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
            throw Error();
        });

        const command = container.resolve(TeleportPointCommand);

        command['teleportPoints'] = JSON.parse(teleportpointsFileData);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        type: ApplicationCommandOptionType.SUB_COMMAND,
                        name: 'remove',
                        options: [
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'dimension',
                                value: 'minecraft:the_nether'
                            },
                            {
                                type: ApplicationCommandOptionType.STRING,
                                name: 'name',
                                value: 'THE_NETHER1'
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
    });

    test('updateMcfunction(tellraw)', async () => {
        const command = container.resolve(TeleportPointCommand);

        await expect(command['updateMcfunction']('')).resolves.toBeUndefined();
    });

    test('updateMcfunction(tellraw) error', async () => {
        mockWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
            throw Error();
        });

        const command = container.resolve(TeleportPointCommand);

        await expect(command['updateMcfunction']('')).resolves.toBeUndefined();
    });

    test('convDimName(dimName)', () => {
        const command = container.resolve(TeleportPointCommand);

        expect(command['convDimName']('minecraft:overworld')).toBe('Overworld');
    });

    test('convDimName(dimName) wrong dimName', () => {
        const command = container.resolve(TeleportPointCommand);

        expect(() => {
            command['convDimName']('HOGE');
        }).toThrow();
    });

    test('readJsonFile()', () => {
        const command = container.resolve(TeleportPointCommand);

        expect(command['readJsonFile']()).toEqual({
            'minecraft:overworld': {},
            'minecraft:the_nether': {
                THE_NETHER1: {
                    dimension: 'minecraft:the_nether',
                    name: 'THE_NETHER1',
                    coordinate: [1, 1, 1]
                }
            },
            'minecraft:the_end': {
                THE_END1: {
                    dimension: 'minecraft:the_end',
                    name: 'THE_END1',
                    coordinate: [1, 1, 1]
                },
                THE_END2: {
                    dimension: 'minecraft:the_end',
                    name: 'THE_END2',
                    coordinate: [2, 2, 2]
                }
            }
        });
    });

    test('readJsonFile() error', () => {
        mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
            throw Error();
        });

        const command = container.resolve(TeleportPointCommand);

        expect(command['readJsonFile']()).toEqual({
            'minecraft:overworld': {},
            'minecraft:the_nether': {},
            'minecraft:the_end': {}
        });
    });
});
