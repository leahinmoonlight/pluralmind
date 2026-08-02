import type { MessageFragment } from '../../types'

export interface StreamlabsMessage {
    /** The username of the user that sent the message. */
    from: string

    /** The text-only version of the message. */
    body: string

    /** The unique ID of the message. */
    messageId: string

    payload: {
        tags: {
            /** The Twitch ID of the user that sent the message. */
            'user-id': string
        }
    }
}

export interface StreamlabsMessageFragment extends MessageFragment {
    node: Node
}

export const buildFragments = (message: StreamlabsMessage, fragmentsContainer: HTMLElement): StreamlabsMessageFragment[] => {
    let workingBody = message.body
    const fragments: StreamlabsMessageFragment[] = []
    fragmentsContainer.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const nodeText = node.textContent ?? ''
            fragments.push({
                type: 'text',
                text: nodeText,
                node,
            })
            workingBody = workingBody.slice(nodeText.length)
        } else {
            // This is (most likely) an emote. Either way, we can consume the
            // next block of text from the message body.
            // Start by jumping to the first non-whitespace character in the
            // working body
            const firstCharacterIndex = workingBody.search(/\S/)
            if (firstCharacterIndex === -1) return

            workingBody = workingBody.slice(firstCharacterIndex)

            // Now find the next whitespace character
            const nextWhitespaceIndex = workingBody.search(/\s/)
            const fragmentText = nextWhitespaceIndex === -1 ? workingBody : workingBody.slice(0, nextWhitespaceIndex)

            // Check if this is an emote
            const isEmote = node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains('emote')

            fragments.push({
                type: isEmote ? 'emote' : 'unknown',
                text: fragmentText,
                node,
            })
            workingBody = workingBody.slice(fragmentText.length)
        }
    })

    return fragments
}
