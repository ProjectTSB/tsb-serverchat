import 'reflect-metadata';

import { container } from 'tsyringe';

import { Config } from '@/Config';
import { SchematicCommand } from '@/discord/commands/SchematicCommand';

jest.mock('@/discord/util/requireContext', () => ({
    requireContext: jest.fn()
}));

Object.defineProperty(Config.prototype, 'Discord', {
    get: jest.fn<ConfigData['discord'], any[]>(() => ({
        token: 'DISCORD_TOKEN',
        chatChannel: 'DISCORD_CHAT_CHANNEL'
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

    test('callback(interaction) list', async () => {
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
    });
});
