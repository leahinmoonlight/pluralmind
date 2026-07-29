/**
 * The user's numerical Twitch ID, or their login username.
 * Note: It is always preferable to use the user's numerical ID since that
 * identifier never changes. If you provide their username, we may not be able
 * to match them if they have changed their username recently.
 */
export type TwitchId = string | number

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
     * If set, messages sent without a proxy will be automatically proxied
     * as the target member.
     */
    autoproxy_member_id: number | null

    /** The list of members in this system. */
    members: Member[]
}

export interface Member {
    /**
     * The unique ID of the member, which may be referenced by
     * {@link System.autoproxy_member_id}.
     */
    id: number

    /** The display name of the member. */
    name: string

    /**
     * The list of proxies to check messages against.
     */
    proxies: Proxy[]

    /**
     * Whether case-sensitivity should be respected when checking for the
     * proxies in the message.
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

export interface ProxiedMessage<TFragment extends MessageFragment = MessageFragment> {
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
     * The proxy that was detected in the message, if any. This will be
     * undefined if an autoproxy was used.
     */
    proxyUsed?: Proxy

    /**
     * The message's fragments with the proxy removed. If no proxy was used,
     * a copy of the original fragments will be returned.
     */
    cleanFragments: TFragment[]

    /**
     * The fragments to change or remove in order to remove the proxy from the
     * message. Fragments are keyed by their original index in the message.
     * If a value is null, that fragment should be removed, otherwise it should
     * be updated. This will be an empty object if no proxy was used.
     *
     * Note: Depending on your use case, cleanFragments may be simpler. Check
     * out both options to see which works best for you. You'll only need to
     * use one or the other.
     */
    changedFragments: Record<number, TFragment | null>

    /**
     * The content of the message with the proxy removed. If autoproxy was
     * used, this will be the original message body.
     */
    body: string
}

export const MessageFragmentType = {
    /**
     * Basic text from a message. This can include emojis as well as emotes
     * from other services (like FFZ, BTTV, etc.), as long as they are still
     * in their text form.
     */
    Text: 'text',

    /**
     * A Twitch emote. The emote's name should be provided as
     * {@link MessageFragment.text}. It's expected that there won't be colons
     * around the name, since Twitch doesn't actually include those in their
     * messages.
     */
    Emote: 'emote',

    /**
     * A \@mention of another user. Don't worry about providing this type unless
     * you already have the data separated and available. The library will
     * still attempt to detect and ignore leading mentions in text fragments.
     */
    Mention: 'mention',
} as const

/**
 * ### If you're reading this, you probably want to read {@link MessageFragmentType} instead, which describes each value.
 *
 * @group Hidden
 */
export type MessageFragmentType = (typeof MessageFragmentType)[keyof typeof MessageFragmentType]

/**
 * Identical to string. This is just for TypeScript to offer type hinting when
 * combined with known string values, such as {@link MessageFragmentType}.
 *
 * @group Hidden
 */
export type AnyString = (string & {})

/**
 * Twitch messages are generally made up of multiple parts, called fragments.
 * For example, a message with a Twitch emote in the middle will actually have
 * three fragments: a text fragment, the twitch emote, and another text
 * fragment.
 *
 * If your data is coming directly from Twitch's EventSub, each message's
 * `fragments` property is already compatible with this type.
 *
 * Alternatively, if your data is coming from their IRC feed, you can just pass
 * the entire body string into {@link getProxiedMessage} without worrying about
 * fragments at all.
 *
 * In the unlikely event you're working with raw HTML, the message's children
 * can be mapped back into these fragments.
 */
export interface MessageFragment {
    /**
     * What this fragment represents (text, an emote, etc.). Pluralmind will
     * gracefully ignore any fragments that aren't relevant to it.
     * For a list of relevant fragment types, check out
     * {@link MessageFragmentType}.
     */
    type: MessageFragmentType | AnyString

    /**
     * The text value of this fragment. For emote fragments, this is the
     * emote's name, and for mention fragments, this is the mention text. It
     * can be safely omitted for any fragments that it doesn't apply to.
     */
    text?: string
}

export interface PluralmindConfig {
    /**
     * The amount of time to cache a system's data for, in milliseconds.
     * After this time, the data will be considered expired and subsequent
     * requests for it will result in a reload.
     *
     * Defaults to `900000` (15 minutes).
     */
    cacheDuration: number
}

/**
 * @group Advanced Interfaces
 */
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

export enum ProxyType {
    /**
     * The proxy can be used as either a prefix or a suffix on the message.
     */
    EitherSide = 0,

    /**
     * The proxy must be used at the start of the message.
     */
    Prefix = 1,

    /**
     * The proxy must be used at the end of the message.
     */
    Suffix = 2,
}

export interface Proxy {
    /**
     * The text to look for in the message.
     */
    text: string

    /**
     * Where the proxy text should be detected in the message.
     */
    type: ProxyType
}

/**
 * A raw detection result. See {@link ProxiedMessage} for more information on
 * these fields.
 *
 * @group Advanced Interfaces
 */
export interface DetectionResult<TFragment extends MessageFragment = MessageFragment> {
    member: Member
    proxyUsed: Proxy
    cleanFragments: TFragment[]
    changedFragments: Record<number, TFragment | null>
}
