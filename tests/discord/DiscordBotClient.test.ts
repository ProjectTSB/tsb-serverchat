import 'reflect-metadata';

import Discord, { Client, ChannelManager, TextChannel, Guild, Message } from 'discord.js';
import { container } from 'tsyringe';

import { DiscordBotClient } from '@/discord/DiscordBotClient';
import { Config } from '@/Config';

jest.mock('discord.js');
jest.mock('@/Config');
jest.mock('@/discord/util/CommandBase');
jest.mock('@/discord/util/requireContext', () => ({
    requireContext: jest.fn()
}));

const { ClientUser } = jest.requireActual<typeof Discord>('discord.js');

Object.defineProperty(Config.prototype, 'Discord', {
    get: jest.fn<ConfigData['discord'], any[]>(() => ({
        token: 'DISCORD_TOKEN',
        chatChannel: 'DISCORD_CHAT_CHANNEL'
    }))
});

Object.defineProperty(Client.prototype, 'api', {
    get: jest.fn<Api, any[]>(() => ({
        applications: () => ({
            guilds: () => ({
                commands: Object.assign(
                    () => ({
                        delete: () => Promise.resolve(Buffer.from([]))
                    }),
                    {
                        get: () => Promise.resolve<ApplicationCommand[]>([
                            {
                                id: 'ID',
                                application_id: 'APPLICATION_ID',
                                name: 'NAME',
                                description: 'DESCRIPTION'
                            }
                        ]),
                        post: (opt: ApplicationCommandPost) => Promise.resolve<ApplicationCommand>({
                            id: 'ID',
                            application_id: 'APPLICATION_ID',
                            name: opt.data.name,
                            description: opt.data.description,
                            options: opt.data.options
                        })
                    }
                )
            })
        }),
        interactions: () => ({
            callback: {
                post: () => Promise.resolve(Buffer.from([]))
            }
        })
    }))
});

describe('DiscordBotClient', () => {
    let discordBotClient: DiscordBotClient;
    let client: Client;

    let mockSetPresence: jest.SpyInstance;
    let mockLogin: jest.SpyInstance;

    beforeEach(() => {
        discordBotClient = container.resolve(DiscordBotClient);
        client = discordBotClient['client'];
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

    test('Destroy()', async () => {
        const mockClientDestroy = jest.spyOn(Client.prototype, 'destroy');

        await expect(discordBotClient.Destroy()).resolves.toBeUndefined();

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
        client.user = null;

        await expect(discordBotClient.SetBotStatus('online')).resolves.toBeUndefined();

        expect(mockSetPresence).toBeCalledTimes(0);
    });

    test('GetTextChannel(channelId)', async () => {
        const textChannel = new TextChannel(expect.anything());
        const mockChannelManagerFetch = jest.spyOn(ChannelManager.prototype, 'fetch').mockResolvedValue(textChannel);
        client.channels = new ChannelManager(client, []);

        await expect(discordBotClient.GetTextChannel('CHANNEL_ID')).resolves.toEqual(textChannel);

        mockChannelManagerFetch.mockClear();
    });

    test('RegisterCommand(opt, callback)', async () => {
        const dummyOpt: ApplicationCommandWithoutId = {
            name: 'NAME',
            description: 'DESCRIPTION'
        };

        const dummyCallback = jest.fn();

        await expect(discordBotClient.RegisterCommand(dummyOpt, dummyCallback)).resolves.toBeUndefined();
    });

    test('on(event, listener)', () => {
        expect(discordBotClient.on('ready', jest.fn())).toEqual(discordBotClient);
    });

    describe('client_onReady()', () => {
        let mockChannelManagerFetch: jest.SpyInstance;

        beforeEach(() => {
            const textChannel = new TextChannel(expect.anything());
            textChannel.guild = new Guild(client, {});
            textChannel.guild.id = 'AAA';

            mockChannelManagerFetch = jest.spyOn(ChannelManager.prototype, 'fetch').mockResolvedValue(textChannel);

            client.channels = new ChannelManager(client, []);
            // @ts-ignore
            client.ws = {
                on: jest.fn()
            };
        });

        afterEach(() => {
            mockChannelManagerFetch.mockClear();
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

        test('client_onReady() No user', async () => {
            client.user = null;

            await expect(discordBotClient['client_onReady']()).resolves.toBeUndefined();

            expect(mockSetPresence).not.toBeCalled();
        });
    });

    test('client_onMessage(message) wrong channel type', async () => {
        const channel = jest.fn();
        // @ts-ignore
        const message = new Message(client, {}, channel);
        // @ts-ignore
        message.author = {
            bot: true
        };

        await expect(discordBotClient['client_onMessage'](message)).resolves.toBeUndefined();
    });

    test('client_onMessage(message) is Bot', async () => {
        const channel = new TextChannel(expect.anything());
        const message = new Message(client, {}, channel);
        message.channel = channel;
        // @ts-ignore
        message.author = {
            bot: true
        };

        await expect(discordBotClient['client_onMessage'](message)).resolves.toBeUndefined();
    });

    test('client_onMessage(message) is System', async () => {
        const channel = new TextChannel(expect.anything());
        const message = new Message(client, {}, channel);
        message.channel = channel;
        // @ts-ignore
        message.author = {
            bot: false
        };
        message.system = true;

        await expect(discordBotClient['client_onMessage'](message)).resolves.toBeUndefined();
    });

    test('client_onMessage(message) wrong chatChannel', async () => {
        const channel = new TextChannel(expect.anything());
        const message = new Message(client, {}, channel);
        message.channel = channel;
        // @ts-ignore
        message.author = {
            bot: false
        };
        message.system = false;
        message.channel.id = 'WRONG_CHAT_CHANNEL';

        await expect(discordBotClient['client_onMessage'](message)).resolves.toBeUndefined();
    });

    test('client_onMessage(message) zero attachments and empty content', async () => {
        const channel = new TextChannel(expect.anything());
        const message = new Message(client, {}, channel);
        message.channel = channel;
        // @ts-ignore
        message.author = {
            bot: false,
            username: 'USERNAME'
        };
        message.system = false;
        message.channel.id = 'DISCORD_CHAT_CHANNEL';
        message.content = '';
        // @ts-ignore
        message.attachments = {
            size: 0
        };

        await expect(discordBotClient['client_onMessage'](message)).resolves.toBeUndefined();
    });

    test('client_onMessage(message) zero attachments', async () => {
        const channel = new TextChannel(expect.anything());
        const message = new Message(client, {}, channel);
        message.channel = channel;
        // @ts-ignore
        message.author = {
            bot: false,
            username: 'USERNAME'
        };
        message.system = false;
        message.channel.id = 'DISCORD_CHAT_CHANNEL';
        message.content = 'CONTENT';
        // @ts-ignore
        message.attachments = {
            size: 0
        };

        await expect(discordBotClient['client_onMessage'](message)).resolves.toBeUndefined();
    });

    test('client_onMessage(message)', async () => {
        const channel = new TextChannel(expect.anything());
        const message = new Message(client, {}, channel);
        message.channel = channel;
        // @ts-ignore
        message.author = {
            bot: false,
            username: 'USERNAME'
        };
        message.system = false;
        message.channel.id = 'DISCORD_CHAT_CHANNEL';
        message.content = 'CONTENT';
        // @ts-ignore
        message.attachments = {
            size: 1,
            array: jest.fn().mockReturnValue([
                {
                    name: null,
                    url: 'https://example.com'
                },
                {
                    name: 'hoge.txt',
                    url: 'https://example.com'
                },
                {
                    name: 'hoge.schematic',
                    url: 'https://example.com'
                }
            ])
        };

        await expect(discordBotClient['client_onMessage'](message)).resolves.toBeUndefined();
    });

    test('clientWs_onInteractionCreate(interaction)', async () => {
        discordBotClient['commandResponces']['ID'] = jest.fn();
        discordBotClient['commandResponces']['ID2'] = jest.fn();

        const dummyInteraction: Required<Interaction> = {
            id: 'ID',
            type: 1,
            data: {
                id: 'ID',
                name: 'NAME'
            },
            guild_id: 'GUILD_ID',
            channel_id: 'CHANNEL_ID',
            member: jest.fn() as unknown as Discord.GuildMember,
            token: 'TOKEN',
            version: 0
        };

        await expect(discordBotClient['clientWs_onInteractionCreate'](dummyInteraction)).resolves.toBeUndefined();
    });
});
