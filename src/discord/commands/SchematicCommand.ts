import { injectable, inject } from 'tsyringe';
import { createWriteStream, readdirSync, unlinkSync } from 'fs';
import { TextChannel } from 'discord.js';
import https from 'https';
import path from 'path';

import { Config } from '@/Config';
import { CommandBase } from '@/discord/util/CommandBase';
import { DiscordBotClient } from '@/discord/DiscordBotClient';

type SubCommand =
    | 'list'
    | 'delete';

type SchematicInteraction<T extends SubCommand> = Interaction & {
    data: ApplicationCommandInteractionData & {
        options: ApplicationCommandInteractionDataOption[] & [
            T extends 'list' ? {
                name: 'list';
            }
            : T extends 'delete' ? {
                name: 'delete';
                options: [
                    {
                        name: 'file_name',
                        value: string;
                    }
                ];
            }
            : never
        ];
    };
};

@injectable<CommandBase>()
export class SchematicCommand extends CommandBase {
    protected get command(): ApplicationCommandWithoutId {
        return {
            name: 'schematic',
            description: '開発サーバーのSchematicを管理します',
            options: [
                {
                    name: 'list',
                    description: 'Schematicのリスト',
                    type: 1
                },
                {
                    name: 'delete',
                    description: 'Schematicファイルを削除します',
                    type: 1,
                    options: [
                        {
                            name: 'file_name',
                            description: '削除するSchematicファイル名',
                            type: 3,
                            required: true
                        }
                    ]
                }
            ]
        };
    }

    public constructor(
        @inject(Config) private config: Config,
        @inject(DiscordBotClient) private discordBotClient: DiscordBotClient
    ) {
        super();

        this.discordBotClient.on('schematic', this.discordBotClient_onSchematic.bind(this));
    }

    protected async callback(interaction: SchematicInteraction<SubCommand>): Promise<InteractionResponse> {
        // 指定のチャンネル以外では実行しない
        if (interaction.channel_id !== this.config.Discord.chatChannel) {
            return {
                type: 2
            };
        }

        const subCommand = interaction.data.options[0].name;

        switch (subCommand) {
            case 'list': return this.subCommand_list();
            case 'delete': return this.subCommand_delete(interaction as SchematicInteraction<'delete'>);
        }
    }

    /**
     * /schematic list
     */
    private async subCommand_list(): Promise<InteractionResponse> {
        try {
            const schemPath = path.join(this.config.Minecraft.serverPath, 'schematics');
            const files = readdirSync(schemPath, { withFileTypes: true })
                .filter(x => x.isFile())
                .map(x => x.name)
                .filter(x => /^.*\.(?:schematic|schem)$/.test(x));

            return {
                type: 4,
                data: {
                    content: '',
                    embeds: [
                        {
                            title: 'Schematicファイル一覧',
                            description: files.join('\n') || '-'
                        }
                    ]
                }
            };
        }
        catch (err) {
            console.log('[SchematicCommand]:', err.message);

            return {
                type: 4,
                data: {
                    content: '',
                    embeds: [
                        {
                            title: 'コマンド実行中にエラーが発生しました'
                        }
                    ]
                }
            };
        }
    }

    /**
     * /schematic delete
     * @param interaction
     */
    private async subCommand_delete(interaction: SchematicInteraction<'delete'>): Promise<InteractionResponse> {
        const filename = interaction.data.options[0].options[0].value;

        try {
            const filePath = path.join(this.config.Minecraft.serverPath, 'schematics', filename);
            unlinkSync(filePath);

            return {
                type: 4,
                data: {
                    content: '',
                    embeds: [
                        {
                            title: 'ファイルを削除しました',
                            description: filename
                        }
                    ]
                }
            };
        }
        catch (err) {
            console.log('[SchematicCommand]:', err.message);

            return {
                type: 4,
                data: {
                    content: '',
                    embeds: [
                        {
                            title: 'コマンド実行中にエラーが発生しました'
                        }
                    ]
                }
            };
        }
    }

    /**
     * Schematicファイル送信時
     * @param channel ファイルが貼られたチャンネル
     * @param fileName ファイル名
     * @param url ファイルのリンク
     */
    private async discordBotClient_onSchematic(channel: TextChannel, fileName: string, url: string) {
        https.get(url, res => {
            const schemPath = path.join(this.config.Minecraft.serverPath, 'schematics', fileName);
            const stream = createWriteStream(schemPath);

            stream.on('finish', () => {
                channel.send({
                    embed: {
                        title: `${fileName} をアップロードしました`,
                        description: `//schematic load ${fileName}`
                    }
                });
            });

            res.pipe(stream);
        });
    }
}
