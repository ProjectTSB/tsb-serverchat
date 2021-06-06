import { container } from 'tsyringe';

import { DiscordBotClient } from '@/discord/DiscordBotClient';
import { requireContext } from '@/discord/util/requireContext';
import { InteractionCallbackType } from '@/discord/util/discord-api-enums';

type CommandClass = {
    new (): CommandBase;
};

type Module = {
    [key: string]: CommandClass;
};

export abstract class CommandBase<T extends Interaction = Interaction> {
    /**
     * コマンド定義
     * @abstract
     */
    protected abstract get command(): ApplicationCommandWithoutId;

    /**
     * コマンドのパーミッション
     * @abstract
     */
    protected abstract get permissions(): ApplicationCommandPermissions[];

    /**
     * コマンドに対する応答
     * @abstract
     */
    protected abstract callback(interaction: Required<T>): Promise<InteractionResponse>;

    /**
     * コマンド定義のリスト
     */
    protected static commandDifinitions: ApplicationCommandWithoutId[] = [];

    /**
     * 全コマンドを登録する
     * @static
     */
    public static async RegisterAllCommands(): Promise<void> {
        const discordBotClient = container.resolve(DiscordBotClient);

        await Promise.all(requireContext.keys.map(modulePath => {
            const module: Module = requireContext.context(modulePath);
            const className = Object.keys(module)[0];
            const command = container.resolve(module[className]);

            console.log(`[Discord]: ${command.command.name} コマンドを設定しました`);
            this.commandDifinitions.push(command.command);

            return discordBotClient.RegisterCommand(command.command, command.permissions, command.callback.bind(command));
        }));
    }

    /**
     * 指定したチャンネル意外でコマンドが実行された時の応答
     * @returns
     */
    protected invalidChannel(channelId: string): InteractionResponse {
        return {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
                content: '',
                flags: 64,
                embeds: [
                    {
                        title: 'このコマンドは以下のチャンネルでのみ実行できます',
                        description: `<#${channelId}>`,
                        color: 0xff0000
                    }
                ]
            }
        };
    }
}
