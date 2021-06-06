import 'reflect-metadata';

import { CommandBase } from '@/discord/util/CommandBase';
import { InteractionCallbackType } from '@/discord/util/discord-api-enums';

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
