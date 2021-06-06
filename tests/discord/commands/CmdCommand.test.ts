import 'reflect-metadata';

import { container } from 'tsyringe';

import { Config } from '@/Config';
import { CmdCommand } from '@/discord/commands/CmdCommand';
import { RconClient } from '@/rcon/RconClient';
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

describe('CmdCommand', () => {
    test('command', () => {
        const command = container.resolve(CmdCommand);

        expect(command['command']).toEqual<ApplicationCommandWithoutId>({
            name: 'cmd',
            description: expect.anything(),
            default_permission: false,
            options: [
                {
                    name: 'command',
                    description: expect.anything(),
                    type: ApplicationCommandOptionType.STRING,
                    required: true
                }
            ]
        });
    });

    test('permissions', () => {
        const command = container.resolve(CmdCommand);

        expect(command['permissions']).toEqual<ApplicationCommandPermissions[]>([
            {
                id: expect.anything(),
                type: ApplicationCommandPermissionType.ROLE,
                permission: true
            }
        ]);
    });

    test('callback(interaction) wrong chatChannel', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send');

        const command = container.resolve(CmdCommand);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'cmd',
                options: [
                    {
                        type: ApplicationCommandOptionType.STRING,
                        name: 'command',
                        value: 'VALUE'
                    }
                ],
                custom_id: 'CUSTOM_ID',
                component_type: 1
            },
            guild_id: 'GUILD_ID',
            channel_id: 'WRONG_CHANNEL_ID',
            member: undefined,
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

        expect(mockRconClientSend).not.toBeCalled();
        mockRconClientSend.mockClear();
    });

    test('callback(interaction)', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send');

        const command = container.resolve(CmdCommand);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'cmd',
                options: [
                    {
                        type: ApplicationCommandOptionType.STRING,
                        name: 'command',
                        value: 'VALUE'
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

        expect(mockRconClientSend).toBeCalledTimes(1);
        expect(mockRconClientSend.mock.calls[0][0]).toBe('VALUE');
        mockRconClientSend.mockClear();
    });

    test('callback(interaction) -', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send').mockResolvedValue('');

        const command = container.resolve(CmdCommand);

        const interaction: Interaction = {
            id: 'ID',
            application_id: 'APPLICATION_ID',
            type: InteractionType.Ping,
            data: {
                id: 'ID',
                name: 'cmd',
                options: [
                    {
                        type: ApplicationCommandOptionType.STRING,
                        name: 'command',
                        value: 'VALUE'
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

        expect(mockRconClientSend).toBeCalledTimes(1);
        expect(mockRconClientSend.mock.calls[0][0]).toBe('VALUE');
        mockRconClientSend.mockClear();
    });
});
