import Discord, { Client } from 'discord.js';

import { DiscordBotClient } from '@/discord/DiscordBotClient';
import { Config } from '@/Config';

jest.mock('discord.js');
jest.mock('@/Config');

const { ClientUser } = jest.requireActual<typeof Discord>('discord.js');

Object.defineProperty(Config, 'Discord', {
    get: jest.fn<ConfigData['discord'], any[]>(() => ({
        token: 'DISCORD_TOKEN',
        chatChannel: 'DISCORD_CHAT_CHANNEL'
    }))
});

describe('DiscordBotClient', () => {
    let discordBotClient: DiscordBotClient;
    let mockSetPresence: jest.SpyInstance;
    let mockLogin: jest.SpyInstance;

    beforeEach(() => {
        discordBotClient = new DiscordBotClient();
        // @ts-ignore
        discordBotClient['client'].user = new ClientUser(discordBotClient['client'], {});

        mockSetPresence = jest.spyOn(ClientUser.prototype, 'setPresence').mockImplementation(() => {
            return Promise.resolve(expect.anything());
        });
    });

    afterEach(() => {
        mockSetPresence.mockClear();
        mockLogin.mockClear();
    });

    test('Launch()', async () => {
        mockLogin = jest.spyOn(Client.prototype, 'login');

        await expect(discordBotClient.Launch()).resolves.toBeUndefined();

        expect(mockLogin).toBeCalledTimes(1);
        expect(mockLogin.mock.calls[0][0]).toBe('DISCORD_TOKEN');
    });

    test('Launch() Failed launch', async () => {
        mockLogin = jest.spyOn(Client.prototype, 'login').mockRejectedValue(new Error());
        // @ts-ignore
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
        const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(discordBotClient.Launch()).resolves.toBeUndefined();

        expect(mockLogin).toBeCalledTimes(1);
        expect(mockLogin.mock.calls[0][0]).toBe('DISCORD_TOKEN');

        expect(mockConsoleError).toBeCalledTimes(1);

        expect(mockExit).toBeCalledTimes(1);
        expect(mockExit.mock.calls[0][0]).toBe(1);
    });

    test('Descroy()', () => {
        const mockClientDestroy = jest.spyOn(Client.prototype, 'destroy');

        expect(discordBotClient.Destroy()).toBeUndefined();

        expect(mockClientDestroy.mock.calls.length).toBe(1);
    });

    test('SetBotStatus(status)', async () => {
        await expect(discordBotClient.SetBotStatus('online')).resolves.toBeUndefined();

        expect(mockSetPresence).toBeCalledTimes(1);
        expect(mockSetPresence.mock.calls[0][0]).toEqual<Discord.PresenceData>({
            status: 'online'
        });
    });

    test('SetBotStatus(status, text)', async () => {
        await expect(discordBotClient.SetBotStatus('online', 'HOGE')).resolves.toBeUndefined();

        expect(mockSetPresence).toBeCalledTimes(1);
        expect(mockSetPresence.mock.calls[0][0]).toEqual<Discord.PresenceData>({
            status: 'online',
            activity: {
                type: expect.anything(),
                name: 'HOGE'
            }
        });
    });

    test('SetBotStatus(status) Not executed', async () => {
        discordBotClient['client'].user = null;

        await expect(discordBotClient.SetBotStatus('online')).resolves.toBeUndefined();

        expect(mockSetPresence).toBeCalledTimes(0);
    });

    test('client_onReady()', async () => {
        await expect(discordBotClient['client_onReady']()).resolves.toBeUndefined();

        expect(mockSetPresence).toBeCalledTimes(1);
        expect(mockSetPresence.mock.calls[0][0]).toEqual<Discord.PresenceData>({
            status: expect.anything(),
            activity: {
                type: expect.anything(),
                name: expect.anything()
            }
        });
    });
});
