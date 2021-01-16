/**
 * https://discord.js.org/#/docs/main/master/typedef/Snowflake
 */
type Snowflake = import('discord.js').Snowflake;

/**
 * An application command is the base "command" model that belongs to an application.
 * This is what you are creating when you `POST` a new command.
 *
 * A command, or each individual subcommand, can have a maximum of 10 `options`
 *
 * https://discord.com/developers/docs/interactions/slash-commands#applicationcommand
 */
type ApplicationCommand = {
    /**
     * unique id of the command
     */
    id: Snowflake;
    /**
     * unique id of the parent application
     */
    application_id: Snowflake;
    /**
     * 3-32 character name matching `^[\w-]{3,32}$`
     */
    name: string;
    /**
     * 1-100 character description
     */
    description: string;
    /**
     * the parameters for the command
     */
    options?: ApplicationCommandOption[]
};

/**
 * You can specify a maximum of 10 `choices` per option
 *
 * https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoption
 */
type ApplicationCommandOption = {
    /**
     * value of [ApplicationCommandOptionType](https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype)
     */
    type: ApplicationCommandOptionType;
    /**
     * 1-32 character name matching `^[\w-]{1,32}$`
     */
    name: string;
    /**
     * 1-100 character description
     */
    description: string;
    /**
     * the first `required` option for the user to complete--only one option can be `default`
     */
    default?: boolean;
    /**
     * if the parameter is required or optional--default `false`
     */
    required?: boolean;
    /**
     * choices for `string` and `int` types for the user to pick from
     */
    choices?: ApplicationCommandOptionChoice[];
    /**
     * if the option is a subcommand or subcommand group type,
     * this nested options will be the parameters
     */
    options?: ApplicationCommandOption[];
};

/**
 * https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype
 */
type ApplicationCommandOptionType =
    // SUB_COMMAND
    | 1
    // SUB_COMMAND_GROUP
    | 2
    // STRING
    | 3
    // INTEGER
    | 4
    // BOOLEAN
    | 5
    // USER
    | 6
    // CHANNEL
    | 7
    // ROLE
    | 8;

/**
 * If you specify `choices` for an option, they are the only valid values for a user to pick
 *
 * https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptionchoice
 */
type ApplicationCommandOptionChoice = {
    /**
     * 1-100 character choice name
     */
    name: string;
    /**
     * value of the choice
     */
    value: string | number;
};

/**
 * An interaction is the base "thing" that is sent when a user invokes a command,
 * and is the same for Slash Commands and other future interaction types
 *
 * https://discord.com/developers/docs/interactions/slash-commands#interaction
 */
type Interaction = {
    /**
     * id of the interaction
     */
    id: Snowflake;
    /**
     * the type of interaction
     */
    type: InteractionType;
    /**
     * the command data payload
     *
     * This is always present on `ApplicationCommand` interaction types.
     * It is optional for future-proofing against new interaction types
     */
    data?: ApplicationCommandInteractionData;
    /**
     * the guild it was sent from
     */
    guild_id: Snowflake;
    /**
     * the channel it was sent from
     */
    channel_id: Snowflake;
    /**
     * guild member data for the invoking user
     */
    member: import('discord.js').GuildMember;
    /**
     * a continuation token for responding to the interaction
     */
    token: string;
    /**
     * read-only property, always `1`
     */
    version: number;
};

/**
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-interactiontype
 */
type InteractionType =
    // Ping
    | 1
    // ApplicationCommand
    | 2;

/**
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-applicationcommandinteractiondata
 */
type ApplicationCommandInteractionData = {
    /**
     * the ID of the invoked command
     */
    id: Snowflake;
    /**
     * the name of the invoked command
     */
    name: string;
    /**
     * the params + values from the user
     */
    options?: ApplicationCommandInteractionDataOption[];
};

/**
 * All options have names, and an option can either be a parameter and input value--in which case `value` will be set--or
 * it can denote a subcommand or group--in which case it will contain a top-level key and another array of `options`.
 *
 * `value` and `options` are mututally exclusive.
 *
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-applicationcommandinteractiondataoption
 */
type ApplicationCommandInteractionDataOption = {
    /**
     * the name of the parameter
     */
    name: string;
    /**
     * the value of the pair
     */
    value?: string | number | boolean;
    /**
     * present if this option is a group or subcommand
     */
    options?: ApplicationCommandInteractionDataOption[]
};

/**
 * After receiving an interaction, you must respond to acknowledge it. This may be a `pong` for a `ping`,
 * a message, or simply an acknowledgement that you have received it and will handle the command async.
 *
 * Interaction responses may choose to "eat" the user's command input if you do not wish to have their slash command show up as message in chat.
 * This may be helpful for slash commands, or commands whose responses are asynchronous or ephemeral messages.
 *
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-response
 */
type InteractionResponse = {
    /**
     * the type of response
     */
    type: InteractionResponseType;
    /**
     * an optional response message
     */
    data?: InteractionApplicationCommandCallbackData;
};

/**
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-response-interactionresponsetype
 */
type InteractionResponseType =
    // Pong
    | 1
    // Acknowledge
    | 2
    // ChannelMessage
    | 3
    // ChannelMessageWithSource
    | 4
    // AcknowledgeWithSource
    | 5;

/**
 * Not all message fields are currently supported.
 *
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-response-interactionapplicationcommandcallbackdata
 */
type InteractionApplicationCommandCallbackData = {
    /**
     * is the response TTS
     */
    tts?: boolean;
    /**
     * message content
     */
    content: string;
    /**
     * supports up to 10 embeds
     */
    embeds?: import('discord.js').MessageEmbedOptions[];
    /**
     * [allowed mentions](https://discord.com/developers/docs/resources/channel#allowed-mentions-object) object
     */
    allowed_mentions?: import('discord.js').MessageMentionOptions;
};
