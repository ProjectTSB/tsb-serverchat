import { CommandBase } from '@/discord/util/CommandBase';

export class TestCommand extends CommandBase {
    protected get command(): ApplicationCommandWithoutId {
        return {
            name: 'test',
            description: 'テスト用コマンド'
        };
    }

    protected async callback(interaction: Required<Interaction>): Promise<InteractionResponse> {
        return {
            type: 2,
            data: {
                content: JSON.stringify(interaction.data, undefined, 4)
            }
        };
    }
}
