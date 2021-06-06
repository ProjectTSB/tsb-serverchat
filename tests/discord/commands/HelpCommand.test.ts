import 'reflect-metadata';

import { container } from 'tsyringe';

import { Config } from '@/Config';
import { CommandBase } from '@/discord/util/CommandBase';
import { HelpCommand } from '@/discord/commands/HelpCommand';
import { ApplicationCommandPermissionType, InteractionCallbackType } from '@/discord/util/discord-api-enums';

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
        const command = container.resolve(HelpCommand);

        expect(command['command']).toEqual<ApplicationCommandWithoutId>({
            name: 'help',
            description: expect.anything(),
            default_permission: false
        });
    });

    test('permissions', () => {
        const command = container.resolve(HelpCommand);

        expect(command['permissions']).toEqual<ApplicationCommandPermissions[]>([
            {
                id: expect.anything(),
                type: ApplicationCommandPermissionType.ROLE,
                permission: true
            }
        ]);
    });

    test('callback(interaction)', async () => {
        const command = container.resolve(HelpCommand);

        CommandBase['commandDifinitions'].push({
            name: 'NAME',
            description: 'DESCRIPTION'
        });

        await expect(command['callback']()).resolves.toEqual<InteractionResponse>({
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: expect.anything()
        });
    });
});
