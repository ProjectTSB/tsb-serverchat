import { ReadStream } from 'fs';

export const StreamToString = (stream: ReadStream): Promise<string> => {
    const chunks: Buffer[] = [];

    return new Promise(resolve => {
        stream.on('data', chunk => chunks.push(chunk as Buffer));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
};
