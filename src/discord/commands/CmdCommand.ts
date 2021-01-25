import { CommandBase } from '@/discord/util/CommandBase';

type CmdInteraction = Interaction & {
    data: ApplicationCommandInteractionData & {
        options: ApplicationCommandInteractionDataOption[] & [
            {
                name: 'command';
                value: string;
            }
        ];
    };
};

export class CmdCommand extends CommandBase {
    protected get command(): ApplicationCommandWithoutId {
        return {
            name: 'cmd',
            description: '開発サーバーにコマンドを送信します',
            options: [
                {
                    name: 'command',
                    description: 'Minecraftのコマンド',
                    type: 3,
                    required: true
                }
            ]
        };
    }

    protected async callback(interaction: CmdInteraction): Promise<InteractionResponse> {
        const mcCommand = interaction.data.options[0].value;

        // TODO: cmdコマンド処理の実装

        return {
            type: 4,
            data: {
                content: [
                    '[WIP] /cmd',
                    `command: ${mcCommand}`
                ].join('\n')
            }
        };
    }
}
