import 'reflect-metadata';

import { container } from 'tsyringe';
import { Rcon } from 'rcon-client';

import { RconClient } from '@/rcon/RconClient';

jest.mock('rcon-client');

Rcon.prototype.on = jest.fn();

describe('RconClient', () => {
    test('Launch()', async () => {
        const mockRconConnect = jest.spyOn(Rcon.prototype, 'connect');

        const rconClient = container.resolve(RconClient);

        await expect(rconClient.Launch()).resolves.toBeUndefined();

        expect(mockRconConnect).toBeCalledTimes(1);
        mockRconConnect.mockClear();
    });

    test('Launch() Error', async () => {
        const mockRconConnect = jest.spyOn(Rcon.prototype, 'connect').mockRejectedValue(Error());
        jest.useFakeTimers();

        const rconClient = container.resolve(RconClient);

        await expect(rconClient.Launch()).resolves.toBeUndefined();
        jest.runAllTimers();

        expect(mockRconConnect).toBeCalledTimes(2);
        mockRconConnect.mockClear();
    });

    test('Stop()', async () => {
        const rconClient = container.resolve(RconClient);

        await expect(rconClient.Stop()).resolves.toBeUndefined();
    });

    test('Send(command)', async () => {
        const mockRconSend = jest.spyOn(Rcon.prototype, 'send').mockImplementation(async command => command);

        const rconClient = container.resolve(RconClient);

        await expect(rconClient.Send('COMMAND')).resolves.toBe('COMMAND');

        expect(mockRconSend).toBeCalledTimes(1);
        expect(mockRconSend.mock.calls[0][0]).toBe('COMMAND');
        mockRconSend.mockClear();
    });
});
