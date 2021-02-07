import { ReadStream } from 'fs';

import { streamToString } from '@/util/streamToString';

describe('streamToString', () => {
    test('streamToString(stream)', async () => {
        const buf = Buffer.from('HOGE');
        const stream = ReadStream.from(buf) as ReadStream;

        await expect(streamToString(stream)).resolves.toBe('HOGE');
    });

    test('streamToString(stream) invalid data', async () => {
        const buf = Buffer.from([]);
        const stream = ReadStream.from(buf) as ReadStream;

        await expect(streamToString(stream)).rejects.toThrow();
    });
});
