import { injectable, inject } from 'tsyringe';

import { name, version, repository } from '../../../package.json';

import { Config } from '@/Config';
import { CommandBase } from '@/discord/util/CommandBase';

@injectable<CommandBase>()
export class HelpCommand extends CommandBase {
    protected get command(): ApplicationCommandWithoutId {
        return {
            name: 'help',
            description: 'Botのヘルプを出力します'
        };
    }

    public constructor(
        @inject(Config) private config: Config
    ) {
        super();
    }

    protected async callback(interaction: Required<Interaction>): Promise<InteractionResponse> {
        // 指定のチャンネル以外では実行しない
        if (interaction.channel_id !== this.config.Discord.chatChannel) {
            return {
                type: 2
            };
        }

        const futures = [
            'Discord <-> 開発サーバーのチャットを連携します',
            '開発サーバーの起動、停止、プレイヤーのログイン、ログアウトをDiscordに通知します',
            '開発サーバーの起動状態、ログイン人数などのデータをDiscordに表示します',
            'Schematicファイルを貼り付けると開発サーバーにアップロードします'
        ];

        const commands = CommandBase.commandDifinitions.map(x => {
            return `/${x.name}: ${x.description}`;
        });

        return {
            type: 4,
            data: {
                content: '',
                embeds: [
                    {
                        author: {
                            name: `${name} v${version}`,
                            url: repository
                        },
                        title: 'ℹ️ ヘルプ',
                        description: 'TSB開発サーバーとTSB Discordのチャットを連携するBotです',
                        fields: [
                            {
                                name: '✨ 機能',
                                value: futures.map(x => `🔹 ${x}`).join('\n')
                            },
                            {
                                name: '🔧 コマンド',
                                // QMLって言語のハイライトで色を付けてみた
                                value: `\`\`\`qml\n${commands.join('\n')}\n\`\`\``
                            }
                        ]
                    }
                ]
            }
        };
    }
}
