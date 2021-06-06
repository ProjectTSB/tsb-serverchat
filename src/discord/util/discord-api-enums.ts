/**
 * https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
 */
export const ApplicationCommandOptionType = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9
} as const;
export type ApplicationCommandOptionType = typeof ApplicationCommandOptionType[keyof typeof ApplicationCommandOptionType];

/**
 * https://discord.com/developers/docs/interactions/slash-commands#applicationcommandpermissiontype
 */
export const ApplicationCommandPermissionType = {
    ROLE: 1,
    USER: 2
} as const;
export type ApplicationCommandPermissionType = typeof ApplicationCommandPermissionType[keyof typeof ApplicationCommandPermissionType];

/**
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-interactiontype
 */
export const InteractionType = {
    Ping: 1,
    ApplicationCommand: 2,
    MessageComponent: 3
} as const;
export type InteractionType = typeof InteractionType[keyof typeof InteractionType];

/**
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-response-interactioncallbacktype
 */
export const InteractionCallbackType = {
    /**
     * ACK a `Ping`
     */
    Pong: 1,
    /**
     * respond to an interaction with a message
     */
    ChannelMessageWithSource: 4,
    /**
     * ACK an interaction and edit a response later, the user sees a loading state
     */
    DeferredChannelMessageWithSource: 5,
    /**
     * for components, ACK an interaction and edit the original message later; the user does not see a loading state
     *
     * Only valid for [component-based](https://discord.com/developers/docs/interactions/message-components) interactions
     */
    DeferredUpdateMessage: 6,
    /**
     * for components, edit the message the component was attached to
     *
     * Only valid for [component-based](https://discord.com/developers/docs/interactions/message-components) interactions
     */
    UpdateMessage: 7
} as const;
export type InteractionCallbackType = typeof InteractionCallbackType[keyof typeof InteractionCallbackType];
