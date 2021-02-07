import { ReadStream } from 'fs';
import { detect, convert } from 'encoding-japanese';

/**
 * ReadStreamを読み込んで文字列を返す
 * @param stream
 */
export const streamToString = (stream: ReadStream): Promise<string> => {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk as Buffer));
        stream.on('end', () => {
            const data = Buffer.concat(chunks);
            const encording = detect(data);

            if (encording) {
                resolve(convert(data, {
                    to: 'UNICODE',
                    from: encording,
                    type: 'string'
                }));
            }
            else {
                reject(Error('ログテキストを読み込めませんでした'));
            }
        });
    });
};
