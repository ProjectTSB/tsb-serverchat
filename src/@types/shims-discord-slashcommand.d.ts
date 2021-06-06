/**
 * An application command is the base "command" model that belongs to an application.
 * This is what you are creating when you `POST` a new command.
 *
 * A command, or each individual subcommand, can have a maximum of 25 `options`
 *
 * https://discord.com/developers/docs/interactions/slash-commands#applicationcommand
 */
type ApplicationCommand = {
    /**
     * unique id of the command
     * @type snowflake
     */
    id: Snowflake;
    /**
     * unique id of the parent application
     * @type snowflake
     */
    application_id: Snowflake;
    /**
     * 1-32 lowercase character name matching `^[\w-]{1,32}$`
     * @type string
     */
    name: string;
    /**
     * 1-100 character description
     * @type string
     */
    description: string;
    /**
     * the parameters for the command
     * @type array of ApplicationCommandOption
     */
    options?: ApplicationCommandOption[];
    /**
     * whether the command is enabled by default when the app is added to a guild
     * @type boolean (default `true`)
     */
    default_permission?: boolean;
};

/**
 * You can specify a maximum of 25 `choices` per option
 *
 * https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoption
 */
type ApplicationCommandOption = {
    /**
     * value of [ApplicationCommandOptionType](https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype)
     * @type int
     */
    type: import('@/discord/util/discord-api-enums').ApplicationCommandOptionType;
    /**
     * 1-32 lowercase character name matching `^[\w-]{1,32}$`
     * @type string
     */
    name: string;
    /**
     * 1-100 character description
     * @type string
     */
    description: string;
    /**
     * if the parameter is required or optional--default `false`
     * @type boolean
     */
    required?: boolean;
    /**
     * choices for `string` and `int` types for the user to pick from
     * @type array of ApplicationCommandOptionChoice
     */
    choices?: ApplicationCommandOptionChoice[];
    /**
     * if the option is a subcommand or subcommand group type, this nested options will be the parameters
     * @type array of ApplicationCommandOption
     */
    options?: ApplicationCommandOption[];
};

/**
 * If you specify `choices` for an option, they are the only valid values for a user to pick
 *
 * https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptionchoice
 */
type ApplicationCommandOptionChoice = {
    /**
     * 1-100 character choice name
     * @type string
     */
    name: string;
    /**
     * value of the choice, up to 100 characters if string
     * @type string or int
     */
    value: string | Integer;
};

/**
 * Returned when fetching the permissions for a command in a guild.
 *
 * https://discord.com/developers/docs/interactions/slash-commands#guildapplicationcommandpermissions
 */
type GuildApplicationCommandPermissions = {
    /**
     * the id of the command
     * @type snowflake
     */
    id: Snowflake;
    /**
     * 	the id of the application the command belongs to
     * @type snowflake
     */
    application_id: Snowflake;
    /**
     * the id of the guild
     * @type snowflake
     */
    guild_id: Snowflake;
    /**
     * the permissions for the command in the guild
     * @type array of ApplicationCommandPermissions
     */
    permissions: ApplicationCommandPermissions[];
};

/**
 * Application command permissions allow you to enable or disable commands for specific users or roles within a guild.
 *
 * https://discord.com/developers/docs/interactions/slash-commands#applicationcommandpermissions
 */
type ApplicationCommandPermissions = {
    /**
     * the id of the role or user
     * @type snowflake
     */
    id: Snowflake;
    /**
     * role or user
     * @type ApplicationCommandPermissionType
     */
    type: import('@/discord/util/discord-api-enums').ApplicationCommandPermissionType;
    /**
     * `true` to allow, `false`, to disallow
     * @type boolean
     */
    permission: boolean;
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
     * @type snowflake
     */
    id: Snowflake;
    /**
     * id of the application this interaction is for
     * @type snowflake
     */
    application_id: Snowflake;
    /**
     * the type of interaction
     * @type InteractionType
     */
    type: Integer;
    /**
     * the command data payload
     *
     * This is always present on `ApplicationCommand` interaction types.
     * It is optional for future-proofing against new interaction types
     * @type ApplicationCommandInteractionData
     */
    data?: ApplicationCommandInteractionData;
    /**
     * the guild it was sent from
     * @type snowflake
     */
    guild_id?: Snowflake;
    /**
     * the channel it was sent from
     * @type snowflake
     */
    channel_id?: Snowflake;
    /**
     * guild member data for the invoking user, including permissions
     *
     * `member` is sent when the command is invoked in a guild, and `user` is sent when invoked in a DM
     * @type guild member object
     */
    member?: GuildMember;
    /**
     * user object for the invoking user, if invoked in a DM
     * @type user object
     */
    user?: User;
    /**
     * a continuation token for responding to the interaction
     * @type string
     */
    token: string;
    /**
     * read-only property, always `1`
     * @type int
     */
    version: Integer;
    /**
     * for components, the message they were attached to
     * @type message object
     */
    message?: Message;
};

/**
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-applicationcommandinteractiondata
 */
type ApplicationCommandInteractionData = {
    /**
     * the ID of the invoked command
     * @type snowflake
     */
    id: Snowflake;
    /**
     * the name of the invoked command
     * @type string
     */
    name: string;
    /**
     * converted users + roles + channels
     * @type ApplicationCommandInteractionDataResolved
     */
    resolved?: ApplicationCommandInteractionDataResolved;
    /**
     * the params + values from the user
     * @type array of ApplicationCommandInteractionDataOption
     */
    options?: ApplicationCommandInteractionDataOption[];
    /**
     * for components, the [custom_id](https://discord.com/developers/docs/interactions/message-components#custom-id) of the component
     * @type string
     */
    custom_id: string;
    /**
     * for components, the [type](https://discord.com/developers) of the component
     * @type int
     */
    component_type: Integer;
};

/**
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-applicationcommandinteractiondataresolved
 */
type ApplicationCommandInteractionDataResolved = {
    /**
     * the IDs and User objects
     * @type Map of Snowflakes to User Objects
     */
    users?: {
        [key in Snowflake]: User;
    };
    /**
     * the IDs and partial Member objects
     *
     * Partial `Member` objects are missing `user`, `deaf` and `mute` fields
     * @type Map of Snowflakes to Partial Member Objects
     */
    members?: {
        [key in Snowflake]: Partial<GuildMember>;
    };
    /**
     * the IDs and Role objects
     * @type Map of Snowflakes to Role Objects
     */
    roles?: {
        [key in Snowflake]: Role;
    };
    /**
     * the IDs and partial Channel objects
     *
     * Partial `Channel` objects only have `id`, `name`, `type` and `permissions` fields
     * @type Map of Snowflakes to Partial Channel Objects
     */
    channels?: {
        [key in Snowflake]: Partial<Channel>;
    };
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
     * @type string
     */
    name: string;
    /**
     * value of [ApplicationCommandOptionType](https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype)
     * @type int
     */
    type: number;
    /**
     * the value of the pair
     * @type OptionType
     */
    value?: string | number | boolean;
    /**
     * present if this option is a group or subcommand
     * @type array of ApplicationCommandInteractionDataOption
     */
    options?: ApplicationCommandInteractionDataOption[];
};

/**
 * After receiving an interaction, you must respond to acknowledge it.
 * You can choose to respond with a message immediately using type `4`, or you can choose to send a deferred response with type `5`.
 * If choosing a deferred response, the user will see a loading state for the interaction,
 * and you'll have up to 15 minutes to edit the original deferred response using [Edit Original Interaction Response](https://discord.com/developers/docs/interactions/slash-commands#edit-original-interaction-response).
 *
 * Interaction responses can also be public—everyone can see it—or "ephemeral"—only the invoking user can see it.
 * That is determined by setting flags to 64 on the [InteractionApplicationCommandCallbackData](https://discord.com/developers/docs/interactions/slash-commands#interaction-response-interactionapplicationcommandcallbackdata).
 *
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-response
 */
type InteractionResponse = {
    /**
     * the type of response
     * @type InteractionCallbackType
     */
    type: import('@/discord/util/discord-api-enums').InteractionCallbackType;
    /**
     * an optional response message
     * @type InteractionApplicationCommandCallbackData
     */
    data?: InteractionApplicationCommandCallbackData;
};

/**
 * Not all message fields are currently supported.
 *
 * https://discord.com/developers/docs/interactions/slash-commands#interaction-response-interactionapplicationcommandcallbackdata
 */
type InteractionApplicationCommandCallbackData = {
    /**
     * is the response TTS
     * @type boolean
     */
    tts?: boolean;
    /**
     * message content
     * @type string
     */
    content?: string;
    /**
     * supports up to 10 embeds
     * @type array of embeds
     */
    embeds?: Embed[];
    /**
     * [allowed mentions](https://discord.com/developers/docs/resources/channel#allowed-mentions-object) object
     * @type allowed mentions
     */
    allowed_mentions?: AllowedMentions;
    /**
     * set to `64` to make your response ephemeral
     * @type int
     */
    flags?: number;
    /**
     * message components
     * @type array of components
     */
    components?: Component[];
};

/**
 * This is sent on the [message object](https://discord.com/developers/docs/resources/channel#message-object) when the message is a response to an Interaction.
 *
 * https://discord.com/developers/docs/interactions/slash-commands#messageinteraction
 */
type MessageInteraction = {
    /**
     * id of the interaction
     * @type snowflake
     */
    id: Snowflake;
    /**
     * the type of interaction
     * @type InteractionType
     */
    type: import('@/discord/util/discord-api-enums').InteractionType;
    /**
     * the name of the [ApplicationCommand](https://discord.com/developers/docs/interactions/slash-commands#applicationcommand)
     * @type string
     */
    name: string;
    /**
     * the user who invoked the interaction
     * @type user object
     */
    user: User;
};
