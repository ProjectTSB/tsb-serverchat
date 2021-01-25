/*
 * jestでrequire.contextが使えないので分離
 */

const context = () => {
    const context = require.context('@/discord/commands', false, /\.ts$/);

    return {
        keys: context.keys(),
        context
    };
};

export const requireContext = context();
