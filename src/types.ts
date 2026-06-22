export type TwitchId = string | number

export interface Member {
    /**
     * The unique ID of the member, which may be referenced by
     * {@link System.autoproxy_member_id}.
     */
    id: number

    /** The display name of the member. */
    name: string

    /**
     * The list of proxy prefixes to check messages against.
     * Note that these strings do not include the colon.
     */
    proxies: string[]

    /**
     * Whether case-sensitivity should be respected when checking for the proxy
     * prefixes in the message.
     */
    case_sensitive: boolean

    /** The color this member would like their name displayed as in chat. */
    color: string | null

    /**
     * Pronouns for this member.
     * When set, this is free text (i.e. "they/them", or "she/they").
     */
    pronouns: string | null
}

export interface System {
    /** The numeric ID of the system's Twitch account. */
    id: number

    /**
     * The fallback color that will be used when a member has not specified
     * their own color.
     */
    color: string | null

    /**
     * The fallback pronouns that will be used when a member has not specified
     * their own pronouns.
     */
    pronouns: string | null

    /**
     * If set, messages sent without a proxy prefix will be automatically
     * proxied as the target member.
     */
    autoproxy_member_id: number | null

    /** The list of members in this system. */
    members: Member[]
}

export interface CacheHit {
    /**
     * The system, if one exists. This will be null if there is no system
     * associated with the Twitch user.
     */
    system: System | null

    /**
     * Whether the cached data was loaded too long ago to be considered fresh.
     * This is configurable via {@link PluralmindConfig.cacheDuration}.
     */
    expired: boolean
}

export interface ProxiedMessage {
    /** The member that was identified to be sending the message. */
    member: Member

    /** The system that the member belongs to. */
    system: System

    /**
     * The color to display this member's name as in chat. Uses the member's
     * color when set, and falls back to the system's color if not.
     */
    color: string | null

    /**
     * The pronouns to display for this member.
     * This is free text (i.e. "they/them", or "she/they").
     * Uses the member's pronouns when set, and falls back to the system's if
     * not.
     * Note: When set, these should take precedent over other pronoun sources
     * such as alejo, PronounDB, etc.
     */
    pronouns: string | null

    /**
     * The content of the message with the proxy prefix removed. If autoproxy
     * was used, this will be the original message body.
     */
    body: string
}

export interface PluralmindConfig {
    /**
     * The amount of time to cache a system's data for, in milliseconds.
     * After this time, the data will be considered expired and subsequent
     * requests for it will result in a reload.
     */
    cacheDuration: number
}
