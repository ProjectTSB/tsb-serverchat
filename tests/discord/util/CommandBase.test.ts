import 'reflect-metadata';

import { CommandBase } from '@/discord/util/CommandBase';

jest.mock('discord.js');
jest.mock('@/discord/DiscordBotClient');
jest.mock('@/discord/util/requireContext', () => ({
    requireContext: {
        keys: ['DummyCommand'],
        context: jest.fn().mockReturnValue({
            DummyCommand: class {
                command: ApplicationCommandWithoutId = {
                    name: 'NAME',
                    description: 'DESCRIPTION'
                }
                callback(): InteractionResponse {
                    return {
                        type: 2
                    };
                }
            }
        })
    }
}));

describe('CommandBase', () => {
    test('RegisterAllCommands()', async () => {
        await expect(CommandBase.RegisterAllCommands()).resolves.toBeUndefined();
    });
});
