import 'reflect-metadata';

import { TextChannel, Message } from 'discord.js';
import { container } from 'tsyringe';

import { TSBDevServerBot } from '@/discord/TSBDevServerBot';
import { Config } from '@/Config';
import { RconClient } from '@/rcon/RconClient';

jest.mock('discord.js');
jest.mock('@/Config');
jest.mock('@/discord/DiscordBotClient');
jest.mock('@/rcon/RconClient');
jest.mock('@/minecraft/MCLogWatcher');
jest.mock('@/discord/util/requireContext', () => ({
    requireContext: jest.fn()
}));

Object.defineProperty(Config.prototype, 'Discord', {
    get: jest.fn<ConfigData['discord'], any[]>(() => ({
        token: 'DISCORD_TOKEN',
        chatChannel: 'DISCORD_CHAT_CHANNEL'
    }))
});

describe('TSBDevServerBot', () => {
    let tsbDevServerBot: TSBDevServerBot;

    beforeEach(() => {
        tsbDevServerBot = container.resolve(TSBDevServerBot);
    });

    test('Launch()', async () => {
        await expect(tsbDevServerBot.Launch()).resolves.toBeUndefined();
    });

    test('Destroy()', async () => {
        await expect(tsbDevServerBot.Destroy()).resolves.toBeUndefined();
    });

    test('getLoginUsers()', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send')
            .mockResolvedValue('There are 1 of a max of 20 players online: HOGE');

        await expect(tsbDevServerBot['getLoginUsers']()).resolves.toEqual({
            count: '1',
            max: '20',
            users: [
                'HOGE'
            ]
        });

        expect(mockRconClientSend).toBeCalledTimes(1);
        expect(mockRconClientSend.mock.calls[0][0]).toBe('list');
        mockRconClientSend.mockClear();
    });

    test('getLoginUsers() null', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send').mockResolvedValue('');

        await expect(tsbDevServerBot['getLoginUsers']()).resolves.toBeNull();

        expect(mockRconClientSend).toBeCalledTimes(1);
        expect(mockRconClientSend.mock.calls[0][0]).toBe('list');
        mockRconClientSend.mockClear();
    });

    test('discordBotClient_onReady()', async () => {
        await expect(tsbDevServerBot['discordBotClient_onReady']()).resolves.toBeUndefined();
    });

    test('discordBotClient_onChat(channelId, username, message)', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send').mockResolvedValue('');
        const message = new Message(expect.anything(), {}, expect.anything());
        // @ts-ignore
        message.author = {
            username: 'USERNAME'
        };
        message.content = 'CONTENT';

        await expect(tsbDevServerBot['discordBotClient_onChat'](message)).resolves.toBeUndefined();

        expect(mockRconClientSend).toBeCalledTimes(1);
        expect(mockRconClientSend.mock.calls[0][0]).toEqual(expect.anything());
        mockRconClientSend.mockClear();
    });

    test('discordBotClient_onChat(channelId, username, message) reject', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send').mockRejectedValue(Error());
        const message = new Message(expect.anything(), {}, expect.anything());
        // @ts-ignore
        message.author = {
            username: 'USERNAME'
        };
        message.content = 'CONTENT';

        await expect(tsbDevServerBot['discordBotClient_onChat'](message)).resolves.toBeUndefined();

        expect(mockRconClientSend).toBeCalledTimes(1);
        expect(mockRconClientSend.mock.calls[0][0]).toEqual(expect.anything());
        mockRconClientSend.mockClear();
    });

    test('mcLogWatcher_onPlayerChat(name, message) textChannel is null', () => {
        tsbDevServerBot['textChannel'] = null;

        expect(tsbDevServerBot['mcLogWatcher_onPlayerChat']('NAME', 'MESSAGE')).toBeUndefined();
    });

    test('mcLogWatcher_onPlayerChat(name, message)', () => {
        tsbDevServerBot['textChannel'] = new TextChannel(expect.anything());

        expect(tsbDevServerBot['mcLogWatcher_onPlayerChat']('NAME', 'MESSAGE')).toBeUndefined();
    });

    test('mcLogWatcher_onPlayerAction(name, type) textChannel is null', async () => {
        tsbDevServerBot['textChannel'] = null;

        await expect(tsbDevServerBot['mcLogWatcher_onPlayerAction']('NAME', 'login')).resolves.toBeUndefined();
    });

    test('mcLogWatcher_onPlayerAction(name, type) login, users is null', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send').mockResolvedValue('');
        tsbDevServerBot['textChannel'] = new TextChannel(expect.anything());

        await expect(tsbDevServerBot['mcLogWatcher_onPlayerAction']('NAME', 'login')).resolves.toBeUndefined();

        expect(mockRconClientSend).toBeCalledTimes(1);
        mockRconClientSend.mockClear();
    });

    test('mcLogWatcher_onPlayerAction(name, type) login, zero users', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send')
            .mockResolvedValue('There are 0 of a max of 20 players online:');
        tsbDevServerBot['textChannel'] = new TextChannel(expect.anything());

        await expect(tsbDevServerBot['mcLogWatcher_onPlayerAction']('NAME', 'login')).resolves.toBeUndefined();

        mockRconClientSend.mockClear();
    });

    test('mcLogWatcher_onPlayerAction(name, type) login', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send')
            .mockResolvedValue('There are 1 of a max of 20 players online: HOGE');
        tsbDevServerBot['textChannel'] = new TextChannel(expect.anything());

        await expect(tsbDevServerBot['mcLogWatcher_onPlayerAction']('NAME', 'login')).resolves.toBeUndefined();

        mockRconClientSend.mockClear();
    });

    test('mcLogWatcher_onPlayerAction(name, type) logout, users is null', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send').mockResolvedValue('');
        tsbDevServerBot['textChannel'] = new TextChannel(expect.anything());

        await expect(tsbDevServerBot['mcLogWatcher_onPlayerAction']('NAME', 'logout')).resolves.toBeUndefined();

        expect(mockRconClientSend).toBeCalledTimes(1);
        mockRconClientSend.mockClear();
    });

    test('mcLogWatcher_onPlayerAction(name, type) logout, zero users', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send')
            .mockResolvedValue('There are 0 of a max of 20 players online:');
        tsbDevServerBot['textChannel'] = new TextChannel(expect.anything());

        await expect(tsbDevServerBot['mcLogWatcher_onPlayerAction']('NAME', 'logout')).resolves.toBeUndefined();

        mockRconClientSend.mockClear();
    });

    test('mcLogWatcher_onPlayerAction(name, type) logout', async () => {
        const mockRconClientSend = jest.spyOn(RconClient.prototype, 'Send')
            .mockResolvedValue('There are 1 of a max of 20 players online: HOGE');
        tsbDevServerBot['textChannel'] = new TextChannel(expect.anything());

        await expect(tsbDevServerBot['mcLogWatcher_onPlayerAction']('NAME', 'logout')).resolves.toBeUndefined();

        mockRconClientSend.mockClear();
    });

    test('mcLogWatcher_onServerLog(type) textChannel is null', async () => {
        tsbDevServerBot['textChannel'] = null;

        expect(tsbDevServerBot['mcLogWatcher_onServerLog']('start')).toBeUndefined();
    });

    test('mcLogWatcher_onServerLog(type) start', async () => {
        tsbDevServerBot['textChannel'] = new TextChannel(expect.anything());

        expect(tsbDevServerBot['mcLogWatcher_onServerLog']('start')).toBeUndefined();
    });

    test('mcLogWatcher_onServerLog(type) stop', async () => {
        tsbDevServerBot['textChannel'] = new TextChannel(expect.anything());

        expect(tsbDevServerBot['mcLogWatcher_onServerLog']('stop')).toBeUndefined();
    });
});
