import { injectable, inject } from 'tsyringe';
import { EmbedFieldData, MessageEmbedOptions } from 'discord.js';
import { readFileSync, writeFileSync } from 'fs';

import { Config } from '@/Config';
import { CommandBase } from '@/discord/util/CommandBase';
import { RconClient } from '@/rcon/RconClient';

type TeleportPointType = {
    dimension: Dimension;
    name: string;
    coordinate: [
        x: number,
        y: number,
        z: number
    ];
};

type TeleportPointsData = {
    [dimension in Dimension]: {
        [point: string]: TeleportPointType
    };
};

type TellrawJson = string | {
    text: string;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    underlined?: boolean;
    strikethrough?: boolean;
    obfuscated?: boolean;
    clickEvent?: {
        action: 'run_command';
        value: string;
    };
    hoverEvent?: {
        action: 'show_text';
        contents: string;
    };
};

type SubCommand =
    | 'list'
    | 'add'
    | 'remove';

type Dimension =
    | 'minecraft:overworld'
    | 'minecraft:the_nether'
    | 'minecraft:the_end';

type TeleportPointInteraction<T extends SubCommand> = Interaction & {
    data: ApplicationCommandInteractionData & {
        options: ApplicationCommandInteractionDataOption[] & [
            T extends 'list' ? {
                name: 'list';
            }
            : T extends 'add' ? {
                name: 'add';
                options: [
                    {
                        name: 'dimension';
                        value: Dimension;
                    },
                    {
                        name: 'name';
                        value: string;
                    },
                    {
                        name: 'x';
                        value: number;
                    },
                    {
                        name: 'y';
                        value: number;
                    },
                    {
                        name: 'z';
                        value: number;
                    }
                ];
            }
            : T extends 'remove' ? {
                name: 'remove';
                options: [
                    {
                        name: 'dimension';
                        value: Dimension;
                    },
                    {
                        name: 'name';
                        value: string;
                    }
                ];
            }
            : never
        ];
    };
};

@injectable<CommandBase>()
export class TeleportPointCommand extends CommandBase {
    protected get command(): ApplicationCommandWithoutId {
        return {
            name: 'teleportpoint',
            description: '開発者用のテレポートポイントを設定します',
            options: [
                {
                    name: 'list',
                    description: 'テレポートポイントのリストを表示します',
                    type: 1
                },
                {
                    name: 'add',
                    description: 'テレポートポイントを追加します',
                    type: 1,
                    options: [
                        {
                            name: 'dimension',
                            description: '追加するテレポートポイントのディメンション',
                            type: 3,
                            required: true,
                            choices: [
                                {
                                    name: 'overworld',
                                    value: 'minecraft:overworld'
                                },
                                {
                                    name: 'the_nether',
                                    value: 'minecraft:the_nether'
                                },
                                {
                                    name: 'the_end',
                                    value: 'minecraft:the_end'
                                }
                            ]
                        },
                        {
                            name: 'name',
                            description: 'テレポートポイント名',
                            type: 3,
                            required: true
                        },
                        {
                            name: 'x',
                            description: 'X座標',
                            type: 4,
                            required: true
                        },
                        {
                            name: 'y',
                            description: 'Y座標',
                            type: 4,
                            required: true
                        },
                        {
                            name: 'z',
                            description: 'Z座標',
                            type: 4,
                            required: true
                        }
                    ]
                },
                {
                    name: 'remove',
                    description: 'テレポートポイントを削除します',
                    type: 1,
                    options: [
                        {
                            name: 'dimension',
                            description: '追加するテレポートポイントのディメンション',
                            type: 3,
                            required: true,
                            choices: [
                                {
                                    name: 'overworld',
                                    value: 'minecraft:overworld'
                                },
                                {
                                    name: 'the_nether',
                                    value: 'minecraft:the_nether'
                                },
                                {
                                    name: 'the_end',
                                    value: 'minecraft:the_end'
                                }
                            ]
                        },
                        {
                            name: 'name',
                            description: 'テレポートポイント名',
                            type: 3,
                            required: true
                        }
                    ]
                }
            ]
        };
    }

    private readonly filePath = 'teleportpoints.json';

    private readonly defaultData: TeleportPointsData = {
        'minecraft:overworld': {},
        'minecraft:the_nether': {},
        'minecraft:the_end': {}
    };

    private teleportPoints: TeleportPointsData | null = null;

    public constructor(
        @inject(Config) private config: Config,
        @inject(RconClient) private rconClient: RconClient
    ) {
        super();
    }

    protected async callback(interaction: TeleportPointInteraction<SubCommand>): Promise<InteractionResponse> {
        // 指定のチャンネル以外では実行しない
        if (interaction.channel_id !== this.config.Discord.chatChannel) {
            return {
                type: 2
            };
        }

        const subCommand = interaction.data.options[0].name;

        switch (subCommand) {
            case 'list': return this.subCommand_list();
            case 'add': return this.subCommand_add(interaction as TeleportPointInteraction<'add'>);
            case 'remove': return this.subCommand_remove(interaction as TeleportPointInteraction<'remove'>);
        }
    }

    /**
     * /teleportpoint list
     */
    private async subCommand_list(): Promise<InteractionResponse> {
        let embed: MessageEmbedOptions;

        try {
            const tpPoints = this.readJsonFile();

            // 連想配列にしたのでちょっと処理が面倒なことになってる
            const fields: EmbedFieldData[] = [];
            for (const [dimName, dimPoints] of Object.entries(tpPoints)) {
                const points: string[] = [];
                for (const [pointName, { coordinate }] of Object.entries(dimPoints)) {
                    points.push(`${pointName}: \`${coordinate.join(' ')}\``);
                }

                fields.push({
                    name: this.convDimName(dimName),
                    value: points.join('\n') || '-'
                });
            }

            embed = {
                title: 'テレポートポイント一覧',
                fields
            };
        }
        catch (err) {
            console.log('[TeleportPointCommand]:', err.message);

            embed = {
                title: 'コマンド実行中にエラーが発生しました'
            };
        }

        return {
            type: 4,
            data: {
                content: '',
                embeds: [
                    embed
                ]
            }
        };
    }

    /**
     * /teleportpoint add
     * @param interaction
     */
    private async subCommand_add(interaction: TeleportPointInteraction<'add'>): Promise<InteractionResponse> {
        const dimension = interaction.data.options[0].options[0].value;
        const name = interaction.data.options[0].options[1].value;
        const x = interaction.data.options[0].options[2].value;
        const y = interaction.data.options[0].options[3].value;
        const z = interaction.data.options[0].options[4].value;

        let embed: MessageEmbedOptions;

        try {
            if (!this.teleportPoints) {
                this.teleportPoints = this.readJsonFile();
            }

            // 既にあるかどうかでメッセージを変える
            let titleMessage = '';
            if (this.teleportPoints[dimension][name]) {
                titleMessage = 'テレポートポイントを更新しました';
            }
            else {
                titleMessage = 'テレポートポイントを追加しました';
            }

            this.teleportPoints[dimension][name] = {
                dimension,
                name,
                coordinate: [x, y, z]
            };

            this.writeJsonFile(this.teleportPoints);

            const tellraw = this.generageTellraw(this.teleportPoints);
            await this.updateMcfunction(tellraw);

            embed = {
                title: titleMessage,
                fields: [
                    {
                        name: this.convDimName(dimension),
                        value: `${name}: \`${x} ${y} ${z}\``
                    }
                ]
            };
        }
        catch (err) {
            console.log('[TeleportPointCommand]:', err.message);

            embed = {
                title: 'コマンド実行中にエラーが発生しました'
            };
        }

        return {
            type: 4,
            data: {
                content: '',
                embeds: [
                    embed
                ]
            }
        };
    }

    /**
     * /teleportpoint remove
     * @param interaction
     */
    private async subCommand_remove(interaction: TeleportPointInteraction<'remove'>): Promise<InteractionResponse> {
        const dimension = interaction.data.options[0].options[0].value;
        const name = interaction.data.options[0].options[1].value;

        let embed: MessageEmbedOptions;

        try {
            if (!this.teleportPoints) {
                this.teleportPoints = this.readJsonFile();
            }

            if (this.teleportPoints[dimension][name]) {
                const [x, y, z] = this.teleportPoints[dimension][name].coordinate;

                delete this.teleportPoints[dimension][name];
                this.writeJsonFile(this.teleportPoints);

                const tellraw = this.generageTellraw(this.teleportPoints);
                await this.updateMcfunction(tellraw);

                embed = {
                    title: 'テレポートポイントを削除しました',
                    fields: [
                        {
                            name: this.convDimName(dimension),
                            value: `${name}: \`${x} ${y} ${z}\``
                        }
                    ]
                };
            }
            else {
                embed = {
                    title: '指定されたテレポートポイントは存在しません'
                };
            }
        }
        catch (err) {
            console.log('[TeleportPointCommand]:', err.message);

            embed = {
                title: 'コマンド実行中にエラーが発生しました'
            };
        }

        return {
            type: 4,
            data: {
                content: '',
                embeds: [
                    embed
                ]
            }
        };
    }

    /**
     * tellrawコマンドを作成する
     * @param teleportPoints テレポートポイントデータ
     */
    private generageTellraw(teleportPoints: TeleportPointsData) {
        const tellrawData: TellrawJson[] = [
            '',
            {
                text: '=== テレポートポイント一覧 ===',
                color: 'aqua',
                bold: true
            }
        ];

        for (const [dimName, dimPoints] of Object.entries(teleportPoints)) {
            tellrawData.push(
                '\n ',
                {
                    text: this.convDimName(dimName),
                    color: 'green'
                },
                '\n '
            );

            const points = Object.entries(dimPoints);
            if (points.length > 0) {
                for (const [pointName, { coordinate }] of points) {
                    const [x, y, z] = coordinate;

                    tellrawData.push(
                        ' ',
                        {
                            text: pointName,
                            color: 'dark_aqua',
                            underlined: true,
                            clickEvent: {
                                action: 'run_command',
                                value: `/execute as @s in ${dimName} run tp @s ${x} ${y} ${z}`
                            },
                            hoverEvent: {
                                action: 'show_text',
                                contents: `x: ${x}, y: ${y}, z: ${z}`
                            }
                        }
                    );
                }
            }
            else {
                tellrawData.push(
                    ' -'
                );
            }

            tellrawData.push('\n');
        }

        return `tellraw @s ${JSON.stringify(tellrawData)}`;
    }

    /**
     * mcfunctionファイルを更新する
     * @param tellraw tellrawコマンド
     */
    private async updateMcfunction(tellraw: string) {
        try {
            writeFileSync(this.config.Minecraft.teleportpointsMcfunction, tellraw, 'utf-8');
            await this.rconClient.Send('minecraft:reload');
            await this.rconClient.Send('tellraw @a {"text": "テレポートポイントが更新されました"}');
        }
        catch (err) {
            console.log('[TeleportPointCommand]:', err.message);
        }
    }

    /**
     * 表示用のディメンション名に変換する
     * @param dimName ディメンション名
     */
    private convDimName(dimName: string) {
        const [, dimNameWithoutNamespace] = /^[^:]*:(.*)$/.exec(dimName) || [];

        const camel = dimNameWithoutNamespace.replace(/[_](.)/, (_, g1: string) => {
            return g1.toUpperCase();
        });

        return `${camel.charAt(0).toUpperCase()}${camel.slice(1)}`;
    }

    /**
     * ファイルを読み込む
     */
    private readJsonFile(): TeleportPointsData {
        try {
            return JSON.parse(readFileSync(this.filePath, 'utf-8'));
        }
        catch {
            this.writeJsonFile(this.defaultData);

            return this.defaultData;
        }
    }

    /**
     * ファイルに書き込む
     * @param data テレポートポイントデータ
     */
    private writeJsonFile(data: TeleportPointsData) {
        writeFileSync(this.filePath, JSON.stringify(data, undefined, 4));
    }
}
