import { config } from './config'
import { ProxyType } from './types'
import type {
    CacheHit,
    DetectionResult,
    MessageFragment,
    ProxiedMessage,
    System,
    TwitchId,
} from './types'
import { consumeFragmentsToMatchProxy, type ConsumeFragmentsResult } from './util'

interface CachedSystem {
    system: System | null
    timestamp: number
}

const pendingFetches: Record<TwitchId, Promise<System | null>> = {}
const systemCache: Record<TwitchId, CachedSystem> = {}

/**
 * Retrieves the previously cached system data, along with whether the data
 * should be considered expired. Returns undefined if no cached data exists for
 * the given id.
 *
 * @group Advanced Functions
 */
export const getCachedSystem = (id: TwitchId): CacheHit | undefined => {
    const cached = systemCache[id]
    if (!cached) return
    return {
        system: cached.system,
        expired: Date.now() - cached.timestamp >= config.cacheDuration,
    }
}

/**
 * Loads information about a system from the Pluralmind API.
 * When called with an ID that is already being loaded, that initial call's
 * promise will be reused rather than starting another load.
 * Note: You generally should not need to call this directly. It is recommended
 * to use {@link getSystem} instead since that handles caching.
 *
 * @group Advanced Functions
 */
export const loadSystem = (id: TwitchId): Promise<System | null> => {
    // Check if there's already a pending fetch for this system
    if (pendingFetches[id]) return pendingFetches[id]

    pendingFetches[id] = (async () => {
        try {
            const response = await fetch(
                `https://pluralmind.chat/api/v2/system/${id}`,
                { credentials: 'omit' },
            )
            if (response.ok) return await response.json()
            if (response.status === 404) return null
            throw new Error(`Pluralmind API returned ${response.status} for system ${id}`)
        } finally {
            delete pendingFetches[id]
        }
    })()

    return pendingFetches[id]
}

/**
 * Returns information about a system for a given Twitch ID or username, or
 * null if no system is associated with the given ID.
 * This attempts to use cached data first, but will load fresh data if no
 * cached data exists, or the cached data is expired.
 * Note: This function will never throw an exception. If an API request fails,
 * it will fall back to cached data, or return null if no cached data exists.
 */
export const getSystem = async (id: TwitchId): Promise<System | null> => {
    // Check if we already have a fresh enough copy of this system
    const cacheHit = getCachedSystem(id)
    if (cacheHit && !cacheHit.expired) return cacheHit.system

    // Load the system's info fresh
    try {
        const system = await loadSystem(id)
        systemCache[id] = { system, timestamp: Date.now() }
        return system
    } catch {
        // The request failed, return whatever cached data we had
        return cacheHit?.system ?? null
    }
}

/**
 * Identifies if a configured proxy was used for this message.
 * You generally shouldn't need to call this directly, and should use
 * {@link getProxiedMessage} instead since it takes autoproxies into
 * consideration.
 *
 * @group Advanced Functions
 */
export const detectProxyInMessage = <TFragment extends MessageFragment>(
    system: System,
    fragments: readonly TFragment[]
): DetectionResult<TFragment> | undefined => {
    // Build the list of proxies to check against, with longest and
    // case-sensitive proxies prioritized first
    const proxies = system.members
        .flatMap((member) => member.proxies.map((proxy) => ({ proxy, member })))
        .sort((a, b) => {
            if (b.proxy.text.length !== a.proxy.text.length) return b.proxy.text.length - a.proxy.text.length
            if (a.member.case_sensitive && !b.member.case_sensitive) return -1
            if (!a.member.case_sensitive && b.member.case_sensitive) return 1
            return 0
        })

    // Search for a match
    for (const { proxy, member } of proxies) {
        let match: ConsumeFragmentsResult<TFragment> | undefined = undefined

        if ([ProxyType.Prefix, ProxyType.EitherSide].includes(proxy.type)) {
            match = consumeFragmentsToMatchProxy(fragments, proxy, 'prefix', member)
        }

        if (!match && [ProxyType.Suffix, ProxyType.EitherSide].includes(proxy.type)) {
            match = consumeFragmentsToMatchProxy(fragments, proxy, 'suffix', member)
        }

        if (match) return {
            ...match,
            proxyUsed: proxy,
            member,
        }
    }

    return
}

/**
 * Checks if a proxy applies to this message, and if so, returns information
 * about the member and their preferences. Also includes clean versions of
 * the message with the proxy removed, ready for display.
 */
export const getProxiedMessage = <TFragment extends MessageFragment = MessageFragment>(
    system: System | null,
    message: string | readonly TFragment[]
): ProxiedMessage<TFragment> | undefined => {
    if (!system) return

    // Start with the system's autoproxy, if one is set
    let member = null
    if (system.autoproxy_member_id) member = system.members.find(m => m.id === system.autoproxy_member_id)

    // Let's see if the user used a proxy
    const fragments: TFragment[] = typeof message === 'string' ? [{ type: 'text', text: message }] as TFragment[] : [...message]
    const detection = detectProxyInMessage(system, fragments)
    if (detection) member = detection.member

    // Check if we ended up with a member
    if (!member) return

    // Compile the clean message body
    const targetFragments = detection?.cleanFragments ?? fragments
    const body = targetFragments.map(f => f.text ?? '').join('')

    return {
        member,
        system,
        color: member.color ?? system.color,
        pronouns: member.pronouns ?? system.pronouns,
        proxyUsed: detection?.proxyUsed,
        cleanFragments: targetFragments,
        changedFragments: detection?.changedFragments ?? {},
        body,
    }
}
