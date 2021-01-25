import 'reflect-metadata';

import { TeleportPointCommand } from '@/discord/commands/TeleportPointCommand';

jest.mock('@/discord/util/requireContext', () => ({
    requireContext: jest.fn()
}));

describe('TeleportPointCommand', () => {
    test('command', () => {
        const command = new TeleportPointCommand();

        expect(command['command']).toEqual<ApplicationCommandWithoutId>({
            name: 'teleportpoint',
            description: expect.anything(),
            options: [
                {
                    name: 'list',
                    description: expect.anything(),
                    type: 1
                },
                {
                    name: 'add',
                    description: expect.anything(),
                    type: 1,
                    options: [
                        {
                            name: 'dimension',
                            description: expect.anything(),
                            type: 3,
                            required: true,
                            choices: [
                                {
                                    name: 'overworld',
                                    value: 'overworld'
                                },
                                {
                                    name: 'the_nether',
                                    value: 'the_nether'
                                },
                                {
                                    name: 'the_end',
                                    value: 'the_end'
                                }
                            ]
                        },
                        {
                            name: 'name',
                            description: expect.anything(),
                            type: 3,
                            required: true
                        },
                        {
                            name: 'x',
                            description: expect.anything(),
                            type: 4,
                            required: true
                        },
                        {
                            name: 'y',
                            description: expect.anything(),
                            type: 4,
                            required: true
                        },
                        {
                            name: 'z',
                            description: expect.anything(),
                            type: 4,
                            required: true
                        }
                    ]
                },
                {
                    name: 'remove',
                    description: expect.anything(),
                    type: 1,
                    options: [
                        {
                            name: 'dimension',
                            description: expect.anything(),
                            type: 3,
                            required: true,
                            choices: [
                                {
                                    name: 'overworld',
                                    value: 'overworld'
                                },
                                {
                                    name: 'the_nether',
                                    value: 'the_nether'
                                },
                                {
                                    name: 'the_end',
                                    value: 'the_end'
                                }
                            ]
                        },
                        {
                            name: 'name',
                            description: expect.anything(),
                            type: 3,
                            required: true
                        }
                    ]
                }
            ]
        });
    });

    test('callback(interaction) list', async () => {
        const command = new TeleportPointCommand();

        const interaction: Interaction = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        name: 'list'
                    }
                ]
            },
            guild_id: 'GUILD_ID',
            channel_id: 'CHANNEL_ID',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: 4,
            data: expect.anything()
        });
    });

    test('callback(interaction) add', async () => {
        const command = new TeleportPointCommand();

        const interaction: Interaction = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        name: 'add',
                        options: [
                            {
                                name: 'dimension',
                                value: 'overworld'
                            },
                            {
                                name: 'name',
                                value: 'NAME'
                            },
                            {
                                name: 'x',
                                value: 0
                            },
                            {
                                name: 'y',
                                value: 0
                            },
                            {
                                name: 'z',
                                value: 0
                            }
                        ]
                    }
                ]
            },
            guild_id: 'GUILD_ID',
            channel_id: 'CHANNEL_ID',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction as any)).resolves.toEqual<InteractionResponse>({
            type: 4,
            data: expect.anything()
        });
    });

    test('callback(interaction) remove', async () => {
        const command = new TeleportPointCommand();

        const interaction: Interaction = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'teleportpoint',
                options: [
                    {
                        name: 'remove',
                        options: [
                            {
                                name: 'dimension',
                                value: 'overworld'
                            },
                            {
                                name: 'name',
                                value: 'NAME'
                            }
                        ]
                    }
                ]
            },
            guild_id: 'GUILD_ID',
            channel_id: 'CHANNEL_ID',
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