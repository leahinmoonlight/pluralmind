import { config } from './config'
import type { CacheHit, Member, ProxiedMessage, System, TwitchId } from './types'

interface CachedSystem {
    system: System | null
    timestamp: number
}

const pendingFetches: Record<TwitchId, Promise<System | null>> = {}
const systemCache: Record<TwitchId, CachedSystem> = {}

/**
 * Retrieves the previously cached system data, along with whether the data
 * should be considered expired. Returns null if no cached data exists for the
 * given id.
 *
 * @group Advanced
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
 * @group Advanced
 */
export const loadSystem = (id: TwitchId): Promise<System | null> => {
    // Check if there's already a pending fetch for this system
    if (pendingFetches[id]) return pendingFetches[id]

    pendingFetches[id] = new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(
                `https://pluralmind.chat/api/system/${id}`,
                { credentials: 'omit' },
            )
            resolve(response.ok ? (await response.json()) : null)
        } catch (e) {
            reject(e)
        } finally {
            delete pendingFetches[id]
        }
    })

    return pendingFetches[id]
}

/**
 * Returns information about a system for a given Twitch ID or username, or
 * null if no system is associated with the given ID.
 * This attempts to use cached data first, but will load fresh data if no
 * cached data exists, or the cached data is expired.
 */
export const getSystem = async (id: TwitchId): Promise<System | null> => {
    // Check if we already have a fresh enough copy of this system
    const cacheHit = getCachedSystem(id)
    if (cacheHit && !cacheHit.expired) return cacheHit.system

    // Load the system's info fresh
    const system = await loadSystem(id)
    systemCache[id] = { system, timestamp: Date.now() }
    return system
}

/**
 * Identifies if a configured proxy prefix was used for this message.
 * You generally shouldn't need to call this directly, and should use
 * {@link getProxiedMessage} instead since it takes autoproxies into
 * consideration.
 *
 * @group Advanced
 */
export const detectProxyInMessage = (system: System, body: string): { member: Member, cleanBody: string } | undefined => {
    // Sanity check that this message looks like it has a proxy prefix
    const splitByColon = body.split(': ')
    if (splitByColon.length < 2) return

    // Ensure the prefix isn't empty
    let proxyPrefix = splitByColon[0]
    if (config.ignoreLeadingMention) proxyPrefix = proxyPrefix?.replace(/^@\w{4,25} /, '')
    if (config.ignoreLeadingWhitespace) proxyPrefix = proxyPrefix?.trimStart()
    if (!proxyPrefix?.length) return

    // Check if the prefix matches any members in this system
    const proxiedMember = system.members.find(m => {
        if (m.case_sensitive) return m.proxies.includes(proxyPrefix)
        return m.proxies.some(p => p.toLowerCase() === proxyPrefix.toLowerCase())
    })
    if (!proxiedMember) return

    return {
        member: proxiedMember,
        cleanBody: body.replace(`${proxyPrefix}: `, ''),
    }
}

/**
 * Checks if a proxy applies to this message, and if so, returns information
 * about the member and their preferences. Also includes a clean version of
 * the message body with the proxy prefix removed, ready for display.
 */
export const getProxiedMessage = (system: System | null, body: string): ProxiedMessage | undefined => {
    if (!system) return

    // Start with the system's autoproxy, if one is set
    let member = null
    if (system.autoproxy_member_id) member = system.members.find(m => m.id === system.autoproxy_member_id)

    // Let's see if the user used a proxy
    const usedProxy = detectProxyInMessage(system, body)
    if (usedProxy) {
        member = usedProxy.member
        body = usedProxy.cleanBody
    }

    // Check if we ended up with a member
    if (!member) return

    return {
        member,
        system,
        body,
        color: member.color ?? system.color,
        pronouns: member.pronouns ?? system.pronouns,
    }
}
