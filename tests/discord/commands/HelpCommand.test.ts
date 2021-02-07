import 'reflect-metadata';

import { container } from 'tsyringe';

import { Config } from '@/Config';
import { CommandBase } from '@/discord/util/CommandBase';
import { HelpCommand } from '@/discord/commands/HelpCommand';

jest.mock('@/discord/util/requireContext', () => ({
    requireContext: jest.fn()
}));

Object.defineProperty(Config.prototype, 'Discord', {
    get: jest.fn<ConfigData['discord'], any[]>(() => ({
        token: 'DISCORD_TOKEN',
        chatChannel: 'DISCORD_CHAT_CHANNEL'
    }))
});

describe('CmdCommand', () => {
    test('command', () => {
        const command = container.resolve(HelpCommand);

        expect(command['command']).toEqual<ApplicationCommandWithoutId>({
            name: 'help',
            description: expect.anything()
        });
    });

    test('callback(interaction) wrong chatChannel', async () => {
        const command = container.resolve(HelpCommand);

        const interaction: Required<Interaction> = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'help'
            },
            guild_id: 'GUILD_ID',
            channel_id: 'INVALID_CHANNEL_ID',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        await expect(command['callback'](interaction)).resolves.toEqual<InteractionResponse>({
            type: 2
        });
    });

    test('callback(interaction)', async () => {
        const command = container.resolve(HelpCommand);

        const interaction: Required<Interaction> = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'help'
            },
            guild_id: 'GUILD_ID',
            channel_id: 'DISCORD_CHAT_CHANNEL',
            member: jest.fn() as any,
            token: 'TOKEN',
            version: 0
        };

        CommandBase['commandDifinitions'].push({
            name: 'NAME',
            description: 'DESCRIPTION'
        });

        await expect(command['callback'](interaction)).resolves.toEqual<InteractionResponse>({
            type: 4,
            data: expect.anything()
        });
    });
});
