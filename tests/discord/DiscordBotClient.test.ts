import Discord, { Client, ChannelManager, TextChannel, Guild } from 'discord.js';

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
        discordBotClient = new DiscordBotClient();
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
        client.user = null;

        await expect(discordBotClient.SetBotStatus('online')).resolves.toBeUndefined();

        expect(mockSetPresence).toBeCalledTimes(0);
    });

    test('RegisterCommand(opt, callback)', async () => {
        const dummyOpt: ApplicationCommandWithoutId = {
            name: 'NAME',
            description: 'DESCRIPTION'
        };

        const dummyCallback = jest.fn();

        await expect(discordBotClient.RegisterCommand(dummyOpt, dummyCallback)).resolves.toBeUndefined();
    });

    test('DeleteAllCommands()', async () => {
        await expect(discordBotClient.DeleteAllCommands()).resolves.toBeUndefined();
    });

    test('getCommands()', async () => {
        await expect(discordBotClient['getCommands']()).resolves.toEqual<ApplicationCommand[]>([
            {
                id: 'ID',
                application_id: 'APPLICATION_ID',
                name: 'NAME',
                description: 'DESCRIPTION'
            }
        ]);
    });

    test('registerCommand(opt)', async () => {
        await expect(discordBotClient['registerCommand']({
            name: 'NAME',
            description: 'DESCRIPTION'
        })).resolves.toEqual<ApplicationCommand>({
            id: 'ID',
            application_id: 'APPLICATION_ID',
            name: 'NAME',
            description: 'DESCRIPTION'
        });
    });

    test('deleteCommand(commandId)', async () => {
        await expect(discordBotClient['deleteCommand']('COMMAND_ID')).resolves.toBeUndefined();
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
