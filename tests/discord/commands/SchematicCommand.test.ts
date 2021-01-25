import 'reflect-metadata';

import { SchematicCommand } from '@/discord/commands/SchematicCommand';

jest.mock('@/discord/util/requireContext', () => ({
    requireContext: jest.fn()
}));

describe('SchematicCommand', () => {
    test('command', () => {
        const command = new SchematicCommand();

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

    test('callback(interaction) list', async () => {
        const command = new SchematicCommand();

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

    test('callback(interaction) delete', async () => {
        const command = new SchematicCommand();

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
