import { getSystem, getProxiedMessage } from '../../service'
import { buildFragments, type StreamlabsMessage } from './util'

console.log(`Pluralmind v${__VERSION__} for Streamlabs is starting~ 🩷`)

interface PluralmindConfig {
    /**
     * Set this to true if you'd like to display original usernames next to
     * each headmate's name
     */
    showOriginalUsername: boolean,

    /** Set this to false if you don't want to show pronouns */
    showPronouns: boolean,

    /** Set this to true to enable extra logging */
    debug: boolean,

    // These selectors are based on the default Streamlabs template
    // You may need to adjust them if you're using a custom theme
    /** The selector that custom colors should be applied to */
    colorSelector: string,

    /** The selector that displays the sender's name */
    nameSelector: string,

    /** The selector that has {{ message }} inside of it */
    messageSelector: string,
}

// Load any configuration options that were provided
const providedConfig: Partial<PluralmindConfig> = (window as any).pluralmindConfig ?? {}
const config: PluralmindConfig = {
    showOriginalUsername: false,
    showPronouns: true,
    debug: false,

    colorSelector: '.meta',
    nameSelector: '.name',
    messageSelector: '.message',

    ...providedConfig,
}

document.addEventListener('onEventReceived', async (event: any) => {
    // Check this is a message event
    if (!event.detail.messageId) return

    const message = event.detail as StreamlabsMessage
    if (config.debug) console.log(`Message ${message.messageId} received from ${message.from}: ${message.body}`)

    // Bring up the message that was added to the DOM
    const rootEl = document.querySelector(`[data-id="${message.messageId}"]`)
    if (!rootEl) {
        console.warn(`Could not find the root element (by data-id) for message ${message.messageId}`)
        return
    }

    // Find the fragments container
    const fragmentsContainer = rootEl.querySelector<HTMLElement>(config.messageSelector)
    if (!fragmentsContainer) {
        console.warn(`Could not find the fragments container (${config.messageSelector}) for message ${message.messageId}`)
        return
    }

    // Build the message fragments
    const fragments = buildFragments(message, fragmentsContainer)
    if (config.debug) console.log('Fragments:', fragments)

    // Check if this is a proxied message
    const system = await getSystem(message.payload.tags['user-id'] || message.from)
    const pm = getProxiedMessage(system, fragments)
    if (config.debug) console.log('System', system, 'ProxiedMessage', pm)
    if (!pm) return

    // Update the name
    const nameEl = rootEl.querySelector(config.nameSelector)
    if (nameEl) {
        nameEl.textContent = pm.member.name

        if (config.showOriginalUsername) {
            nameEl.textContent += ` (${message.from})`
        }

        if (config.showPronouns && pm.pronouns) {
            nameEl.textContent += ` (${pm.pronouns})`
        }
    }

    // Update the color
    const colorEl = rootEl.querySelector<HTMLElement>(config.colorSelector)
    if (colorEl && pm.color) {
        colorEl.style.color = pm.color
    }

    // Remove the proxy from the message
    Object.entries(pm.changedFragments).forEach(([idx, fragment]) => {
        if (fragment === null) {
            const node = fragments[Number(idx)]!.node
            if (node.parentNode) node.parentNode.removeChild(node)
        } else {
            fragment.node.textContent = fragment.text!
        }
    })
})
