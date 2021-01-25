import { container } from 'tsyringe';

import { DiscordBotClient } from '@/discord/DiscordBotClient';
import { requireContext } from '@/discord/util/requireContext';

type CommandClass = {
    new (): CommandBase;
};

type Module = {
    [key: string]: CommandClass;
};

export abstract class CommandBase {
    /**
     * コマンド定義
     * @abstract
     */
    protected abstract get command(): ApplicationCommandWithoutId;

    /**
     * コマンドに対する応答
     * @abstract
     */
    protected abstract callback(interaction: Required<Interaction>): Promise<InteractionResponse>;

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

            return discordBotClient.RegisterCommand(command.command, command.callback.bind(command));
        }));
    }
}
