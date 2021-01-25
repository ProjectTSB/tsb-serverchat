import { CommandBase } from '@/discord/util/CommandBase';

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

    protected async callback(interaction: SchematicInteraction<SubCommand>): Promise<InteractionResponse> {
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
        // TODO: schematic listコマンド処理の実装

        return {
            type: 4,
            data: {
                content: '[WIP] /schematic list'
            }
        };
    }

    /**
     * /schematic delete
     * @param interaction
     */
    private async subCommand_delete(interaction: SchematicInteraction<'delete'>): Promise<InteractionResponse> {
        const filename = interaction.data.options[0].options[0].value;

        // TODO: schematic deleteコマンド処理の実装

        return {
            type: 4,
            data: {
                content: [
                    '[WIP] schematic delete',
                    `file_name: ${filename}`
                ].join('\n')
            }
        };
    }
}
