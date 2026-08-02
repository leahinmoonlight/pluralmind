import { describe, it, expect } from 'vitest'

import { buildFragments } from '../../../src/integrations/streamlabs/util'
import messageData from './streamlabs-event-details.json'
import messageHtml from './streamlabs-message.html?raw'

describe('streamlabs integration', () => {
    it('parses message fragments correctly', () => {
        const sampleContainer = document.createElement('div') as HTMLElement
        sampleContainer.innerHTML = messageHtml
        const fragments = buildFragments(messageData, sampleContainer.querySelector('.message') as HTMLElement)
        const fragmentsWithoutNodes = fragments.map((fragment) => {
            const { node, ...rest } = fragment
            return rest
        })
        expect(fragmentsWithoutNodes).toEqual([
            { type: 'emote', text: 'leahinmDance' },
            { type: 'text', text: " here's a little message 🩷 " },
            { type: 'emote', text: 'leahinmNya' },
            { type: 'text', text: ' for testing the Streamlabs integration ' },
            { type: 'emote', text: 'MikuHeart' },
            { type: 'text', text: ' ' },
            { type: 'emote', text: 'leahinmWow' },
            { type: 'text', text: ' ' },
            { type: 'emote', text: 'leahinmWave' },
        ])
    })
})
