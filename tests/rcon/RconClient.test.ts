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

        const rconClient = container.resolve(RconClient);

        await expect(rconClient.Launch()).resolves.toBeUndefined();

        expect(mockRconConnect).toBeCalledTimes(1);
        mockRconConnect.mockClear();
    });

    test('Stop()', async () => {
        const mockRconEnd = jest.spyOn(Rcon.prototype, 'end').mockResolvedValue();

        const rconClient = container.resolve(RconClient);

        await expect(rconClient.Stop()).resolves.toBeUndefined();

        expect(mockRconEnd).toBeCalledTimes(1);
        mockRconEnd.mockClear();
    });

    test('Stop() Error', async () => {
        const mockRconEnd = jest.spyOn(Rcon.prototype, 'end').mockRejectedValue(Error());

        const rconClient = container.resolve(RconClient);

        await expect(rconClient.Stop()).resolves.toBeUndefined();

        expect(mockRconEnd).toBeCalledTimes(1);
        mockRconEnd.mockClear();
    });

    test('Send(command)', async () => {
        const mockRconSend = jest.spyOn(Rcon.prototype, 'send').mockImplementation(async command => command);

        const rconClient = container.resolve(RconClient);
        rconClient['isConnecting'] = true;

        await expect(rconClient.Send('COMMAND')).resolves.toBe('COMMAND');

        expect(mockRconSend).toBeCalledTimes(1);
        expect(mockRconSend.mock.calls[0][0]).toBe('COMMAND');
        mockRconSend.mockClear();
    });

    test('Send(command) Error', async () => {
        const rconClient = container.resolve(RconClient);
        rconClient['isConnecting'] = false;

        await expect(rconClient.Send('COMMAND')).rejects.toBeUndefined();
    });

    test('rcon_onError(err)', () => {
        const rconClient = container.resolve(RconClient);

        expect(rconClient['rcon_onError'](expect.anything())).toBeUndefined();
    });
});
