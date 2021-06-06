/**
 * https://discord.com/developers/docs/reference#snowflakes
 */
type Snowflake = string;

/**
 * int
 */
type Integer = number;

/**
 * https://discord.com/developers/docs/resources/guild#guild-member-object
 */
type GuildMember = {
    /**
     * the user this guild member represents
     * @type user object
     */
    user?: User;
    /**
     * this users guild nickname
     * @type ?string
     */
    nick?: string | null;
    /**
     * array of [role](https://discord.com/developers/docs/topics/permissions#role-object) object ids
     * @type array of snowflakes
     */
    roles: Snowflake[];
    /**
     * when the user joined the guild
     * @type ISO8601 timestamp
     */
    joined_at: string;
    /**
     * when the user started [boosting](https://support.discord.com/hc/en-us/articles/360028038352-Server-Boosting-) the guild
     * @type ?ISO8601 timestamp
     */
    premium_since?: string | null;
    /**
     * whether the user is deafened in voice channels
     * @type boolean
     */
    deaf: boolean;
    /**
     * whether the user is muted in voice channels
     * @type boolean
     */
    mute: boolean;
    /**
     * whether the user has not yet passed the guild's [Membership Screening](https://discord.com/developers/docs/resources/guild#membership-screening-object) requirements
     * @type boolean
     */
    pending?: boolean;
    /**
     * total permissions of the member in the channel, including overwrites, returned when in the interaction object
     * @type string
     */
    permissions?: string;
};

/**
 * https://discord.com/developers/docs/resources/user#user-object
 */
type User = {
    /**
     * the user's id
     * @type snowflake
     */
    id: Snowflake;
    /**
     * the user's username, not unique across the platform
     * @type string
     */
    username: string;
    /**
     * the user's 4-digit discord-tag
     * @type string
     */
    discriminator: string;
    /**
     * the user's [avatar hash](https://discord.com/developers/docs/reference#image-formatting)
     * @type ?string
     */
    avatar?: string | null;
    /**
     * whether the user belongs to an OAuth2 application
     * @type boolean
     */
    bot?: boolean;
    /**
     * whether the user is an Official Discord System user (part of the urgent message system)
     * @type boolean
     */
    system?: boolean;
    /**
     * whether the user has two factor enabled on their account
     * @type boolean
     */
    mfa_enabled?: boolean;
    /**
     * the user's chosen language option
     * @type string
     */
    locale?: string;
    /**
     * whether the email on this account has been verified
     * @type boolean
     */
    verified?: boolean;
    /**
     * the user's email
     * @type ?string
     */
    email?: string | null;
    /**
     * the [flags](https://discord.com/developers/docs/resources/user#user-object-user-flags) on a user's account
     * @type integer
     */
    flags?: Integer;
    /**
     * the [type of Nitro subscription](https://discord.com/developers/docs/resources/user#user-object-premium-types) on a user's account
     * @type integer
     */
    premium_type?: Integer;
    /**
     * the public [flags](https://discord.com/developers/docs/resources/user#user-object-user-flags) on a user's account
     * @type integer
     */
    public_flags?: Integer;
};

/**
 * https://discord.com/developers/docs/resources/channel#message-object
 */
type Message = {
    /**
     * id of the message
     * @type snowflake
     */
    id: Snowflake;
    /**
     * id of the channel the message was sent in
     * @type snowflake
     */
    channel_id: Snowflake;
    /**
     * id of the guild the message was sent in
     * @type snowflake
     */
    guild_id?: Snowflake;
    /**
     * the author of this message (not guaranteed to be a valid user, see below)
     * @type user object
     */
    author: User;
    /**
     * member properties for this message's author
     * @type partial guild member object
     */
    member?: Partial<GuildMember>;
    /**
     * contents of the message
     * @type string
     */
    content: string;
    /**
     * when this message was sent
     * @type ISO8601 timestamp
     */
    timestamp: string;
    /**
     * when this message was edited (or null if never)
     * @type ?ISO8601 timestamp
     */
    edited_timestamp: string | null;
    /**
     * whether this was a TTS message
     * @type boolean
     */
    tts: boolean;
    /**
     * whether this message mentions everyone
     * @type boolean
     */
    mention_everyone: boolean;
    /**
     * users specifically mentioned in the message
     * @type array of user objects, with an additional partial member field
     */
    mentions: (User | Partial<GuildMember>)[];
    /**
     * roles specifically mentioned in this message
     * @type array of role object ids
     */
    mention_roles: Snowflake[];
    /**
     * channels specifically mentioned in this message
     * @type array of channel mention objects
     */
    mention_channels?: ChannelMention[];
    /**
     * any attached files
     * @type array of attachment objects
     */
    attachments: Attachment[];
    /**
     * any embedded content
     * @type array of embed objects
     */
    embeds: Embed[];
    /**
     * reactions to the message
     * @type array of reaction objects
     */
    reactions?: Reaction[];
    /**
     * used for validating a message was sent
     * @type integer or string
     */
    nonce?: Integer | string;
    /**
     * whether this message is pinned
     * @type boolean
     */
    pinned: boolean;
    /**
     * if the message is generated by a webhook, this is the webhook's id
     * @type snowflake
     */
    webhook_id?: Snowflake;
    /**
     * [type of message](https://discord.com/developers/docs/resources/channel#message-object-message-types)
     * @type integer
     */
    type: Integer;
    /**
     * sent with Rich Presence-related chat embeds
     * @type message activity object
     */
    activity?: MessageActivity;
    /**
     * sent with Rich Presence-related chat embeds
     * @type partial application object
     */
    application?: Partial<Application>;
    /**
     * if the message is a response to an [Interaction](https://discord.com/developers/docs/interactions/slash-commands), this is the id of the interaction's application
     * @type snowflake
     */
    application_id?: Snowflake;
    /**
     * data showing the source of a crosspost, channel follow add, pin, or reply message
     * @type message reference object
     */
    message_reference?: MessageReference;
    /**
     * [message flags](https://discord.com/developers/docs/resources/channel#message-object-message-flags) combined as a [bitfield](https://en.wikipedia.org/wiki/Bit_field)
     * @type integer
     */
    flags?: Integer;
    /**
     * the stickers sent with the message (bots currently can only receive messages with stickers, not send)
     * @type array of sticker objects
     */
    stickers?: MessageSticker[];
    /**
     * the message associated with the message_reference
     * @type ?message object
     */
    references_message?: Message | null;
    /**
     * sent if the message is a response to an [Interaction](https://discord.com/developers/docs/interactions/slash-commands)
     * @type message interaction object
     */
    interaction?: MessageInteraction;
    /**
     * the thread that was started from this message, includes [thread member](https://discord.com/developers/docs/resources/channel#thread-member-object) object
     * @type channel object
     */
    thread?: Channel;
    /**
     * sent if the message contains components like buttons, action rows, or other interactive components
     * @type component object
     */
    components?: Component;
};

/**
 * https://discord.com/developers/docs/topics/permissions#role-object-role-structure
 */
type Role = {
    /**
     * role id
     * @type snowflake
     */
    id: Snowflake;
    /**
     * role name
     * @type string
     */
    name: string;
    /**
     * integer representation of hexadecimal color code
     * @type integer
     */
    color: Integer;
    /**
     * if this role is pinned in the user listing
     * @type boolean
     */
    hoist: boolean;
    /**
     * position of this role
     * @type integer
     */
    position: Integer;
    /**
     * permission bit set
     * @type string
     */
    permissions: string;
    /**
     * whether this role is managed by an integration
     * @type boolean
     */
    managed: boolean;
    /**
     * whether this role is mentionable
     * @type boolean
     */
    mentionable: boolean;
    /**
     * the tags this role has
     * @type role tags object
     */
    tags?: RoleTags;
};

/**
 * https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure
 */
type RoleTags = {
    /**
     * the id of the bot this role belongs to
     * @type snowflake
     */
    bot_id?: Snowflake;
    /**
     * the id of the integration this role belongs to
     * @type snowflake
     */
    integration_id?: Snowflake;
    /**
     * whether this is the guild's premium subscriber role
     * @type null
     */
    premium_subscriber?: null;
};

/**
 * https://discord.com/developers/docs/resources/channel#channel-mention-object
 */
type ChannelMention = {
    /**
     * id of the channel
     */
    id: Snowflake;
    /**
     * id of the guild containing the channel
     */
    guild_id: Snowflake;
    /**
     * the [type of channel](https://discord.com/developers/docs/resources/channel#channel-object-channel-types)
     */
    type: Integer;
    /**
     * the name of the channel
     */
    name: string;
};

/**
 * https://discord.com/developers/docs/resources/channel#attachment-object
 */
type Attachment = {
    /**
     * attachment id
     * @type snowflake
     */
    id: Snowflake;
    /**
     * name of file attached
     * @type string
     */
    filename: string;
    /**
     * the attachment's [media type](https://en.wikipedia.org/wiki/Media_type)
     * @type string
     */
    content_type?: string;
    /**
     * size of file in bytes
     * @type integer
     */
    size: Integer;
    /**
     * source url of file
     * @type string
     */
    url: string;
    /**
     * a proxied url of file
     * @type string
     */
    proxy_url: string;
    /**
     * height of file (if image)
     * @type ?integer
     */
    height?: Integer | null;
    /**
     * width of file (if image)
     * @type ?integer
     */
    width?: Integer | null;
};

/**
 * https://discord.com/developers/docs/resources/channel#embed-object
 */
type Embed = {
    /**
     * title of embed
     * @type string
     */
    title?: string;
    /**
     * [type of embed](https://discord.com/developers/docs/resources/channel#embed-object-embed-types) (always "rich" for webhook embeds)
     * @type string
     */
    type?: string;
    /**
     * description of embed
     * @type string
     */
    description?: string;
    /**
     * url of embed
     * @type string
     */
    url?: string;
    /**
     * timestamp of embed content
     * @type ISO8601 timestamp
     */
    timestamp?: string;
    /**
     * color code of the embed
     * @type integer
     */
    color?: Integer;
    /**
     * footer information
     * @type embed footer object
     */
    footer?: EmbedFooter;
    /**
     * image information
     * @type embed image object
     */
    image?: EmbedImage;
    /**
     * thumbnail information
     * @type embed thumbnail object
     */
    thumbnail?: EmbedThumbnail;
    /**
     * video information
     * @type embed video object
     */
    video?: EmbedVideo;
    /**
     * provider information
     * @type embed provider object
     */
    provider?: EmbedProvider;
    /**
     * author information
     * @type embed author object
     */
    author?: EmbedAuthor;
    /**
     * fields information
     * @type array of embed field objects
     */
    fields?: EmbedField[];
};

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-footer-structure
 */
type EmbedFooter = {
    /**
     * footer text
     * @type string
     */
    text: string;
    /**
     * url of footer icon (only supports http(s) and attachments)
     * @type string
     */
    icon_url?: string;
    /**
     * a proxied url of footer icon
     * @type string
     */
    proxy_icon_url?: string;
};

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-image-structure
 */
type EmbedImage = {
    /**
     * source url of image (only supports http(s) and attachments)
     * @type string
     */
    url?: string;
    /**
     * a proxied url of the image
     * @type string
     */
    proxy_url?: string;
    /**
     * height of image
     * @type integer
     */
    height?: Integer;
    /**
     * width of image
     * @type integer
     */
    width?: Integer;
};

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-thumbnail-structure
 */
type EmbedThumbnail = {
    /**
     * source url of thumbnail (only supports http(s) and attachments)
     * @type string
     */
    url?: string;
    /**
     * a proxied url of the thumbnail
     * @type string
     */
    proxy_url?: string;
    /**
     * height of thumbnail
     * @type integer
     */
    height?: Integer;
    /**
     * width of thumbnail
     * @type integer
     */
    width?: Integer;
};

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-video-structure
 */
type EmbedVideo = {
    /**
     * source url of video
     * @type string
     */
    url?: string;
    /**
     * a proxied url of the video
     * @type string
     */
    proxy_url?: string;
    /**
     * height of video
     * @type integer
     */
    height?: Integer;
    /**
     * width of video
     * @type integer
     */
    width?: Integer;
};

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-provider-structure
 */
type EmbedProvider = {
    /**
     * name of provider
     * @type string
     */
    name?: string;
    /**
     * url of provider
     * @type string
     */
    url?: string;
};

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-author-structure
 */
type EmbedAuthor = {
    /**
     * name of author
     * @type string
     */
    name?: string;
    /**
     * url of author
     * @type string
     */
    url?: string;
    /**
     * url of author icon (only supports http(s) and attachments)
     * @type string
     */
    icon_url?: string;
    /**
     * a proxied url of author icon
     * @type string
     */
    proxy_icon_url?: string;
};

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-field-structure
 */
type EmbedField = {
    /**
     * name of the field
     * @type string
     */
    name: string;
    /**
     * value of the field
     * @type string
     */
    value: string;
    /**
     * whether or not this field should display inline
     * @type boolean
     */
    inline?: boolean;
};

/**
 * https://discord.com/developers/docs/resources/channel#reaction-object
 */
type Reaction = {
    /**
     * times this emoji has been used to react
     * @type integer
     */
    count: Integer;
    /**
     * whether the current user reacted using this emoji
     * @type boolean
     */
    me: boolean;
    /**
     * emoji information
     * @type partial emoji object
     */
    emoji: Partial<Emoji>;
};

/**
 * https://discord.com/developers/docs/resources/emoji#emoji-object
 */
type Emoji = {
    /**
     * [emoji id](https://discord.com/developers/docs/reference#image-formatting)
     * @type ?snowflake
     */
    id: Snowflake | null;
    /**
     * emoji name
     * @type ?string (can be null only in reaction emoji objects)
     */
    name: string | null;
    /**
     * roles allowed to use this emoji
     * @type array of role object ids
     */
    roles?: Snowflake[];
    /**
     * user that created this emoji
     * @type user object
     */
    user?: User;
    /**
     * whether this emoji must be wrapped in colons
     * @type boolean
     */
    require_colons?: boolean;
    /**
     * whether this emoji is managed
     * @type boolean
     */
    managed?: boolean;
    /**
     * whether this emoji is animated
     * @type boolean
     */
    animated?: boolean;
    /**
     * whether this emoji can be used, may be false due to loss of Server Boosts
     * @type boolean
     */
    available?: boolean;
};

/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-activity-structure
 */
type MessageActivity = {
    /**
     * [type of message activity](https://discord.com/developers/docs/resources/channel#message-object-message-activity-types)
     * @type integer
     */
    type: Integer;
    /**
     * party_id from a [Rich Presence event](https://discord.com/developers/docs/rich-presence/how-to#updating-presence-update-presence-payload-fields)
     * @type string
     */
    party_id?: string;
};

/**
 * https://discord.com/developers/docs/resources/application#application-object
 */
type Application = {
    /**
     * the id of the app
     * @type snowflake
     */
    id: Snowflake;
    /**
     * the name of the app
     * @type string
     */
    name: string;
    /**
     * the [icon hash](https://discord.com/developers/docs/reference#image-formatting) of the app
     * @type ?string
     */
    icon: string | null;
    /**
     * the description of the app
     * @type string
     */
    description: string;
    /**
     * an array of rpc origin urls, if rpc is enabled
     * @type array of strings
     */
    rpc_origins?: string[];
    /**
     * when false only app owner can join the app's bot to guilds
     * @type boolean
     */
    bot_public: boolean;
    /**
     * when true the app's bot will only join upon completion of the full oauth2 code grant flow
     * @type boolean
     */
    bot_require_code_grant: boolean;
    /**
     * the url of the app's terms of service
     * @type string
     */
    terms_of_service_url?: string;
    /**
     * the url of the app's privacy policy
     * @type string
     */
    privacy_policy_url?: string;
    /**
     * partial user object containing info on the owner of the application
     * @type partial user object
     */
    owner: Partial<User>;
    /**
     * if this application is a game sold on Discord, this field will be the summary field for the store page of its primary sku
     * @type string
     */
    summary: string;
    /**
     * the hex encoded key for verification in interactions and the GameSDK's [GetTicket](https://discord.com/developers/docs/game-sdk/applications#getticket)
     * @type string
     */
    verify_key: string;
    /**
     * if the application belongs to a team, this will be a list of the members of that team
     * @type ?team object
     */
    team: Team | null;
    /**
     * if this application is a game sold on Discord, this field will be the guild to which it has been linked
     * @type snowflake
     */
    guild_id?: Snowflake;
    /**
     * if this application is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists
     * @type snowflake
     */
    primary_sku_id?: Snowflake;
    /**
     * if this application is a game sold on Discord, this field will be the URL slug that links to the store page
     * @type string
     */
    slug?: string;
    /**
     * the application's default rich presence invite [cover image hash](https://discord.com/developers/docs/reference#image-formatting)
     * @type string
     */
    cover_image?: string;
    /**
     * the application's public [flags](https://discord.com/developers/docs/resources/application#application-application-flags)
     * @type integer
     */
    flags: Integer;
};

/**
 * https://discord.com/developers/docs/topics/teams#data-models-team-object
 */
type Team = {
    /**
     * a hash of the image of the team's icon
     * @type ?string
     */
    icon: string | null;
    /**
     * the unique id of the team
     * @type snowflake
     */
    id: Snowflake;
    /**
     * the members of the team
     * @type array of team member objects
     */
    members: TeamMembers[];
    /**
     * the name of the team
     * @type string
     */
    name: string;
    /**
     * the user id of the current team owner
     * @type snowflake
     */
    owner_user_id: Snowflake;
};

/**
 * https://discord.com/developers/docs/topics/teams#data-models-team-members-object
 */
type TeamMembers = {
    /**
     * the user's [membership state](https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum) on the team
     * @type integer
     */
    membership_state: Integer;
    /**
     * will always be `["*"]`
     * @type array of strings
     */
    premissions: string[];
    /**
     * the id of the parent team of which they are a member
     * @type snowflake
     */
    team_id: Snowflake;
    /**
     * the avatar, discriminator, id, and username of the user
     * @type partial user object
     */
    user: Partial<User>;
};

/**
 * https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure
 */
type MessageReference = {
    /**
     * id of the originating message
     * @type snowflake
     */
    message_id?: Snowflake;
    /**
     * id of the originating message's channel
     *
     * `channel_id` is optional when creating a reply, but will always be present when receiving an event/response that includes this data model.
     * @type snowflake
     */
    channel_id?: Snowflake;
    /**
     * id of the originating message's guild
     * @type snowflake
     */
    guild_id?: Snowflake;
    /**
     * when sending, whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message, default true
     * @type boolean
     */
    fail_if_not_exists?: boolean;
};

/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-sticker-structure
 */
type MessageSticker = {
    /**
     * id of the sticker
     * @type snowflake
     */
    id: Snowflake;
    /**
     * id of the pack the sticker is from
     * @type snowflake
     */
    pack_id: Snowflake;
    /**
     * name of the sticker
     * @type string
     */
    name: string;
    /**
     * description of the sticker
     * @type string
     */
    description: string;
    /**
     * a comma-separated list of tags for the sticker
     * @type string
     */
    tags?: string;
    /**
     * sticker asset hash
     * @type string
     */
    asset: string;
    /**
     * [type of sticker format](https://discord.com/developers/docs/resources/channel#message-object-message-sticker-format-types)
     * @type integer
     */
    format_type: Integer;
};

/**
 * https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
 */
type Channel = {
    /**
     * the id of this channel
     * @type snowflake
     */
    id: Snowflake;
    /**
     * the [type of channel](https://discord.com/developers/docs/resources/channel#channel-object-channel-types)
     * @type integer
     */
    type: Integer;
    /**
     * the id of the guild (may be missing for some channel objects received over gateway guild dispatches)
     * @type snowflake
     */
    guild_id?: Snowflake;
    /**
     * sorting position of the channel
     * @type integer
     */
    position?: Integer;
    /**
     * explicit permission overwrites for members and roles
     * @type array of overwrite objects
     */
    permission_overwrites?: Overwrite[];
    /**
     * the name of the channel (2-100 characters)
     * @type string
     */
    name?: string;
    /**
     * the channel topic (0-1024 characters)
     * @type ?string
     */
    topic?: string | null;
    /**
     * whether the channel is nsfw
     * @type boolean
     */
    nsfw?: boolean;
    /**
     * the id of the last message sent in this channel (may not point to an existing or valid message)
     * @type ?snowflake
     */
    last_message_id?: Snowflake | null;
    /**
     * the bitrate (in bits) of the voice channel
     * @type integer
     */
    bitrate?: Integer;
    /**
     * the user limit of the voice channel
     * @type integer
     */
    user_limit?: Integer;
    /**
     * amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected
     * @type integer
     */
    rate_limit_per_user?: Integer;
    /**
     * the recipients of the DM
     * @type array of user objects
     */
    recipients?: User[];
    /**
     * icon hash
     * @type ?string
     */
    icon?: string | null;
    /**
     * id of the creator of the group DM or thread
     * @type snowflake
     */
    owner_id?: Snowflake;
    /**
     * application id of the group DM creator if it is bot-created
     * @type snowflake
     */
    application_id?: Snowflake;
    /**
     * for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created
     * @type ?snowflake
     */
    parent_id?: Snowflake | null;
    /**
     * when the last pinned message was pinned. This may be `null` in events such as `GUILD_CREATE` when a message is not pinned.
     * @type ?ISO8601 timestamp
     */
    last_pin_timestamp?: string | null;
    /**
     * [voice region](https://discord.com/developers/docs/resources/voice#voice-region-object) id for the voice channel, automatic when set to null
     * @type ?string
     */
    rtc_region?: string | null;
    /**
     * the camera [video quality mode](https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes) of the voice channel, 1 when not present
     * @type integer
     */
    video_quality_mode?: Integer;
    /**
     * an approximate count of messages in a thread, stops counting at 50
     * @type integer
     */
    message_count?: Integer;
    /**
     * an approximate count of users in a thread, stops counting at 50
     * @type integer
     */
    member_count?: Integer;
    /**
     * thread-specific fields not needed by other channels
     * @type a thread metadata object
     */
    thread_metadata?: ThreadMetadata;
    /**
     * thread member object for the current user, if they have joined the thread, only included on certain API endpoints
     * @type a thread member object
     */
    member?: ThreadMember;
};

/**
 * https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure
 */
type Overwrite = {
    /**
     * role or user id
     * @type snowflake
     */
    id: Snowflake;
    /**
     * either 0 (role) or 1 (member)
     * @type int
     */
    type: Integer;
    /**
     * permission bit set
     * @type string
     */
    allow: string;
    /**
     * permission bit set
     * @type string
     */
    deny: string;
};

/**
 * https://discord.com/developers/docs/resources/channel#thread-metadata-object-thread-metadata-structure
 */
type ThreadMetadata = {
    /**
     * whether the thread is archived
     * @type boolean
     */
    archived: boolean;
    /**
     * id of the user that last archived or unarchived the thread
     * @type snowflake
     */
    archiver_id?: Snowflake;
    /**
     * duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080
     * @type integer
     */
    auto_archive_duration: Integer;
    /**
     * timestamp when the thread's archive status was last changed, used for calculating recent activity
     * @type ISO8601 timestamp
     */
    archive_timestamp: string;
    /**
     * when a thread is locked, only users with MANAGE_THREADS can unarchive it
     * @type boolean
     */
    locked?: boolean;
};

/**
 * https://discord.com/developers/docs/resources/channel#thread-member-object-thread-member-structure
 */
type ThreadMember = {
    /**
     * the id of the thread
     * @type snowflake
     */
    id: Snowflake;
    /**
     * the id of the user
     * @type snowflake
     */
    user_id: Snowflake;
    /**
     * the time the current user last joined the thread
     * @type ISO8601 timestamp
     */
    join_timestamp: string;
    /**
     * any user-thread settings, currently only used for notifications
     * @type integer
     */
    flags: Integer;
};

/**
 * https://discord.com/developers/docs/interactions/message-components#component-object
 */
type Component = {
    /**
     * [component type](https://discord.com/developers/docs/interactions/message-components#component-types)
     * @type int
     */
    type: Integer;
    /**
     * one of [button styles](https://discord.com/developers/docs/interactions/message-components#buttons-button-styles)
     * @type int
     */
    style?: Integer;
    /**
     * text that appears on the button, max 80 characters
     * @type string
     */
    label?: string;
    /**
     * `name`, `id`, and `animated`
     * @type partial emoji
     */
    emoji?: Partial<Emoji>;
    /**
     * a developer-defined identifier for the button, max 100 characters
     * @type string
     */
    custom_id?: string;
    /**
     * a url for link-style buttons
     * @type string
     */
    url?: string;
    /**
     * whether the button is disabled, default `false`
     * @type bool
     */
    disabled?: boolean;
    /**
     * a list of child components
     * @type Array of message components
     */
    components?: Component[];
};

/**
 * https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mentions-structure
 */
type AllowedMentions = {
    /**
     * An array of [allowed mention types](https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mention-types) to parse from the content.
     * @type array of allowed mention types
     */
    parse: 'roles' | 'users' | 'everyone';
    /**
     * Array of role_ids to mention (Max size of 100)
     * @type list of snowflakes
     */
    roles: Snowflake[];
    /**
     * Array of user_ids to mention (Max size of 100)
     * @type list of snowflakes
     */
    users: Snowflake[];
    /**
     * For replies, whether to mention the author of the message being replied to (default false)
     * @type boolean
     */
    replied_user: boolean;
};
