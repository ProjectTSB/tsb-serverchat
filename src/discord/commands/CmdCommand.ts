import { injectable, inject } from 'tsyringe';

import { CommandBase } from '@/discord/util/CommandBase';
import { RconClient } from '@/rcon/RconClient';

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

@injectable<CommandBase>()
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

    public constructor(
        @inject(RconClient) private rconClient: RconClient
    ) {
        super();
    }

    protected async callback(interaction: CmdInteraction): Promise<InteractionResponse> {
        const mcCommand = interaction.data.options[0].value;

        try {
            const result = await this.rconClient.Send(mcCommand);

            return {
                type: 4,
                data: {
                    content: '',
                    embeds: [
                        {
                            title: 'コマンドを送信しました',
                            description: result.replace(/§./g, '') || ''
                        }
                    ]
                }
            };
        }
        catch {
            return {
                type: 4,
                data: {
                    content: '',
                    embeds: [
                        {
                            title: 'コマンドの送信に失敗しました',
                            description: 'サーバーが起動していない可能性があります',
                            color: 0xff0000
                        }
                    ]
                }
            };
        }
    }
}
