import { injectable, inject } from 'tsyringe';

import { Config } from '@/Config';
import { CommandBase } from '@/discord/util/CommandBase';
import { RconClient } from '@/rcon/RconClient';
import { ApplicationCommandOptionType, ApplicationCommandPermissionType, InteractionCallbackType } from '@/discord/util/discord-api-enums';

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

@injectable<CommandBase<CmdInteraction>>()
export class CmdCommand extends CommandBase<CmdInteraction> {
    protected get command(): ApplicationCommandWithoutId {
        return {
            name: 'cmd',
            description: '開発サーバーにコマンドを送信します',
            default_permission: false,
            options: [
                {
                    name: 'command',
                    description: 'Minecraftのコマンド',
                    type: ApplicationCommandOptionType.STRING,
                    required: true
                }
            ]
        };
    }

    protected get permissions(): ApplicationCommandPermissions[] {
        return [
            {
                id: this.config.Discord.allowCommandRole,
                type: ApplicationCommandPermissionType.ROLE,
                permission: true
            }
        ];
    }

    public constructor(
        @inject(Config) private config: Config,
        @inject(RconClient) private rconClient: RconClient
    ) {
        super();
    }

    protected async callback(interaction: CmdInteraction): Promise<InteractionResponse> {
        // 指定のチャンネル以外ではエラーを返す
        if (interaction.channel_id !== this.config.Discord.chatChannel) {
            return this.invalidChannel(this.config.Discord.chatChannel);
        }

        const mcCommand = interaction.data.options[0].value;

        try {
            const result = await this.rconClient.Send(mcCommand);

            return {
                type: InteractionCallbackType.ChannelMessageWithSource,
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
                type: InteractionCallbackType.ChannelMessageWithSource,
                data: {
                    content: '',
                    flags: 64,
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
