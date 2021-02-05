import { injectable, inject } from 'tsyringe';

import { Config } from '@/Config';
import { CommandBase } from '@/discord/util/CommandBase';

type SubCommand =
    | 'list'
    | 'add'
    | 'remove';

type Dimension =
    | 'overworld'
    | 'the_nether'
    | 'the_end';

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
                                    value: 'overworld'
                                },
                                {
                                    name: 'the_nether',
                                    value: 'the_nether'
                                },
                                {
                                    name: 'the_end',
                                    value: 'the_end'
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
                                    value: 'overworld'
                                },
                                {
                                    name: 'the_nether',
                                    value: 'the_nether'
                                },
                                {
                                    name: 'the_end',
                                    value: 'the_end'
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

    public constructor(
        @inject(Config) private config: Config
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
        // TODO: teleportlist listコマンド処理の実装

        return {
            type: 4,
            data: {
                content: '[WIP] /teleportpoint list'
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

        // TODO: teleportpoint addコマンド処理の実装

        return {
            type: 4,
            data: {
                content: [
                    '[WIP] /teleportpoint add',
                    `dimension: ${dimension}`,
                    `name: ${name}`,
                    `x: ${x}`,
                    `y: ${y}`,
                    `z: ${z}`
                ].join('\n')
            }
        };
    }

    /**
     * / teleportpoint remove
     * @param interaction
     */
    private async subCommand_remove(interaction: TeleportPointInteraction<'remove'>): Promise<InteractionResponse> {
        const dimension = interaction.data.options[0].options[0].value;
        const name = interaction.data.options[0].options[1].value;

        // TODO: teleportpoint removeコマンド処理の実装

        return {
            type: 4,
            data: {
                content: [
                    '[WIP] /teleportpoint remove',
                    `dimension: ${dimension}`,
                    `name: ${name}`
                ].join('\n')
            }
        };
    }
}
