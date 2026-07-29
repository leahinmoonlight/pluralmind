import { beforeAll, describe, it, expect } from 'vitest'

import { config as defaultConfig, updateConfig } from '../src/config'
import { detectProxyInMessage, getProxiedMessage } from '../src/service'
import type { DetectionResult, MessageFragment, PluralmindConfig, System } from '../src/types'
import { makeSampleSystems } from './fixtures'

type FlexibleFragment = MessageFragment & Record<string, unknown>

interface TestDetectionResult<TFragment extends MessageFragment = MessageFragment>
    extends Omit<DetectionResult<TFragment>, 'member' | 'proxyUsed'> {
    member: string
    proxyUsed: string
}

interface ProxyTestCase<TFragment extends MessageFragment = MessageFragment> {
    label: string
    fragments: TFragment[]
    expected: TestDetectionResult<TFragment> | undefined
}

interface TestScenario {
    system: System
    config?: Partial<PluralmindConfig>
    cases: ProxyTestCase<FlexibleFragment>[]
}

describe('proxy detection', () => {
    const baseConfig = { ...defaultConfig }
    const systems = makeSampleSystems()

    const scenarios: TestScenario[] = [
        {
            system: systems.moonlight,
            cases: [
                {
                    label: 'simple proxy prefix',
                    fragments: [{ type: 'text', text: 'L: hihi~' }],
                    expected: {
                        member: 'leah',
                        proxyUsed: 'L:',
                        cleanFragments: [{ type: 'text', text: 'hihi~' }],
                        changedFragments: {
                            0: { type: 'text', text: 'hihi~' },
                        },
                    },
                },

                {
                    label: 'proxy prefix used as a suffix',
                    fragments: [{ type: 'text', text: 'hihi~ L:' }],
                    expected: undefined,
                },

                {
                    label: 'proxy prefix with surrounding whitespace',
                    fragments: [{ type: 'text', text: ' L: hihi~ ' }],
                    expected: {
                        member: 'leah',
                        proxyUsed: 'L:',
                        cleanFragments: [{ type: 'text', text: ' hihi~ ' }],
                        changedFragments: {
                            0: { type: 'text', text: ' hihi~ ' },
                        },
                    },
                },

                {
                    label: 'proxy suffix with surrounding whitespace',
                    fragments: [{ type: 'text', text: 'hihi~ -L ' }],
                    expected: {
                        member: 'leah',
                        proxyUsed: '-L',
                        cleanFragments: [{ type: 'text', text: 'hihi~ ' }],
                        changedFragments: {
                            0: { type: 'text', text: 'hihi~ ' },
                        },
                    },
                },

                {
                    label: 'proxy spread across 3 fragments with a Twitch emote in the middle (as a prefix)',
                    fragments: [
                        { type: 'text', text: ' 🌙' },
                        { type: 'emote', text: 'leahinmDance' },
                        { type: 'text', text: '! hihi~' },
                        { type: 'emote', text: 'leahinmLove' },
                        { type: 'text', text: ' ' },
                    ],
                    expected: {
                        member: 'leah',
                        proxyUsed: '🌙leahinmDance!',
                        cleanFragments: [
                            { type: 'text', text: ' ' },
                            { type: 'text', text: 'hihi~' },
                            { type: 'emote', text: 'leahinmLove' },
                            { type: 'text', text: ' ' },
                        ],
                        changedFragments: {
                            0: { type: 'text', text: ' ' },
                            1: null,
                            2: { type: 'text', text: 'hihi~' },
                        },
                    },
                },

                {
                    label: 'proxy spread across 3 fragments with a Twitch emote in the middle (as a suffix)',
                    fragments: [
                        { type: 'text', text: 'hihi~ ' },
                        { type: 'emote', text: 'leahinmLove' },
                        { type: 'text', text: ' 🌙' },
                        { type: 'emote', text: 'leahinmDance' },
                        { type: 'text', text: '! ' },
                    ],
                    expected: {
                        member: 'leah',
                        proxyUsed: '🌙leahinmDance!',
                        cleanFragments: [
                            { type: 'text', text: 'hihi~ ' },
                            { type: 'emote', text: 'leahinmLove' },
                            { type: 'text', text: '' },
                            { type: 'text', text: ' ' },
                        ],
                        changedFragments: {
                            2: { type: 'text', text: '' },
                            3: null,
                            4: { type: 'text', text: ' ' },
                        },
                    },
                },

                {
                    label: 'either side proxy, empty space in leading fragments',
                    fragments: [
                        { type: 'text', text: '' },
                        { type: 'text', text: ' ' },
                        { type: 'text', text: ' 💜 ' },
                        { type: 'emote', text: 'leahinmDance' },
                        { type: 'text', text: ' hihi~' },
                    ],
                    expected: {
                        member: 'samara',
                        proxyUsed: '💜',
                        cleanFragments: [
                            { type: 'text', text: '' },
                            { type: 'text', text: ' ' },
                            { type: 'text', text: ' ' },
                            { type: 'emote', text: 'leahinmDance' },
                            { type: 'text', text: ' hihi~' },
                        ],
                        changedFragments: {
                            2: { type: 'text', text: ' ' },
                        },
                    },
                },
                {
                    label: 'either side proxy, empty space in trailing fragments',
                    fragments: [
                        { type: 'emote', text: 'leahinmDance' },
                        { type: 'text', text: ' hihi~ 💜 ' },
                        { type: 'text', text: ' ' },
                        { type: 'text', text: '' },
                    ],
                    expected: {
                        member: 'samara',
                        proxyUsed: '💜',
                        cleanFragments: [
                            { type: 'emote', text: 'leahinmDance' },
                            { type: 'text', text: ' hihi~ ' },
                            { type: 'text', text: ' ' },
                            { type: 'text', text: '' },
                        ],
                        changedFragments: {
                            1: { type: 'text', text: ' hihi~ ' },
                        },
                    },
                },

                {
                    label: 'case-insensitive upper proxy matching lower message',
                    fragments: [{ type: 'text', text: 'l: hihi~' }],
                    expected: {
                        member: 'leah',
                        proxyUsed: 'L:',
                        cleanFragments: [{ type: 'text', text: 'hihi~' }],
                        changedFragments: {
                            0: { type: 'text', text: 'hihi~' },
                        },
                    },
                },

                {
                    label: 'case-sensitive upper proxy with lower message',
                    fragments: [{ type: 'text', text: 's: hihi~' }],
                    expected: undefined,
                },

                {
                    label: 'case-sensitive proxy takes priority over case-insensitive proxy',
                    fragments: [{ type: 'text', text: 'hihi~ -l' }],
                    expected: {
                        member: 'priority',
                        proxyUsed: '-l',
                        cleanFragments: [{ type: 'text', text: 'hihi~' }],
                        changedFragments: {
                            0: { type: 'text', text: 'hihi~' },
                        },
                    },
                },

                {
                    label: 'longer proxy takes priority over shorter proxy',
                    fragments: [{ type: 'text', text: 'S:S: hihi~' }],
                    expected: {
                        member: 'priority',
                        proxyUsed: 'S:S:',
                        cleanFragments: [{ type: 'text', text: 'hihi~' }],
                        changedFragments: {
                            0: { type: 'text', text: 'hihi~' },
                        },
                    },
                },

                {
                    label: 'leading mentions are ignored even when in a text fragment',
                    fragments: [{ type: 'text', text: ' @someone L: hihi~' }],
                    expected: {
                        member: 'leah',
                        proxyUsed: 'L:',
                        cleanFragments: [{ type: 'text', text: ' @someone hihi~' }],
                        changedFragments: {
                            0: { type: 'text', text: ' @someone hihi~' },
                        },
                    },
                },

                {
                    label: 'leading mentions are ignored when in their own fragment',
                    fragments: [
                        { type: 'mention', text: '@someone' },
                        { type: 'text', text: ' L: hihi~' },
                    ],
                    expected: {
                        member: 'leah',
                        proxyUsed: 'L:',
                        cleanFragments: [
                            { type: 'mention', text: '@someone' },
                            { type: 'text', text: ' hihi~' },
                        ],
                        changedFragments: {
                            1: { type: 'text', text: ' hihi~' },
                        },
                    },
                },

                {
                    label: 'misc fragment data is preserved',
                    fragments: [
                        { type: 'mention', text: '@someone', something: 'else' },
                        { type: 'text', text: ' L: hihi~ ', hihi: 'hihi' },
                        { type: 'emote', text: 'leahinmNya', image: 'nya.webp' },
                        { type: 'text', text: ' ', position: 'end' },
                    ],
                    expected: {
                        member: 'leah',
                        proxyUsed: 'L:',
                        cleanFragments: [
                            { type: 'mention', text: '@someone', something: 'else' },
                            { type: 'text', text: ' hihi~ ', hihi: 'hihi' },
                            { type: 'emote', text: 'leahinmNya', image: 'nya.webp' },
                            { type: 'text', text: ' ', position: 'end' },
                        ],
                        changedFragments: {
                            1: { type: 'text', text: ' hihi~ ', hihi: 'hihi' },
                        },
                    },
                },

                {
                    label: 'proxy prefix without a space does not proxy',
                    fragments: [{ type: 'text', text: 'L:hihi~' }],
                    expected: undefined,
                },

                {
                    label: 'proxy prefix without any content after',
                    fragments: [{ type: 'text', text: 'L:' }],
                    expected: undefined,
                },

                {
                    label: 'proxy surrounded by actual content',
                    fragments: [{ type: 'text', text: 'hihi~ L: hihi~' }],
                    expected: undefined,
                },

                {
                    label: 'proxy prefix with unknown fragment type before it does not proxy',
                    fragments: [
                        { type: 'cheermote', text: 'PrideCheer100' },
                        { type: 'text', text: 'L: hihi~' },
                    ],
                    expected: undefined,
                },

                {
                    label: 'either-side proxy on both sides of the message is used as a prefix',
                    fragments: [{ type: 'text', text: '🌙 hihi~ 🌙' }],
                    expected: {
                        member: 'leah',
                        proxyUsed: '🌙',
                        cleanFragments: [{ type: 'text', text: 'hihi~ 🌙' }],
                        changedFragments: {
                            0: { type: 'text', text: 'hihi~ 🌙' },
                        },
                    },
                },

                {
                    label: 'verify emoji survive being double reversed',
                    fragments: [{ type: 'text', text: 'hihi~ 🌙 💁‍♀️ 🩷 -L' }],
                    expected: {
                        member: 'leah',
                        proxyUsed: '-L',
                        cleanFragments: [{ type: 'text', text: 'hihi~ 🌙 💁‍♀️ 🩷' }],
                        changedFragments: {
                            0: { type: 'text', text: 'hihi~ 🌙 💁‍♀️ 🩷' },
                        },
                    },
                },

                {
                    label: 'Samara: verify before interruption checks',
                    fragments: [{ type: 'text', text: 'Samara: hihi~' }],
                    expected: {
                        member: 'samara',
                        proxyUsed: 'Samara:',
                        cleanFragments: [{ type: 'text', text: 'hihi~' }],
                        changedFragments: {
                            0: { type: 'text', text: 'hihi~' },
                        },
                    },
                },

                {
                    label: 'interrupted proxy',
                    fragments: [{ type: 'text', text: 'Sama ra: hihi~' }],
                    expected: undefined,
                },

                {
                    label: 'interrupted proxy across multiple fragments',
                    fragments: [
                        { type: 'text', text: 'Sama' },
                        { type: 'text', text: ' ' },
                        { type: 'text', text: 'ra: hihi~' },
                    ],
                    expected: undefined,
                },

                {
                    label: 'proxy with emote, space and text',
                    fragments: [
                        { type: 'emote', text: 'leahinmWave' },
                        { type: 'text', text: ' L: hihi~' },
                    ],
                    expected: {
                        member: 'leah',
                        proxyUsed: 'leahinmWave L:',
                        cleanFragments: [
                            { type: 'text', text: 'hihi~' },
                        ],
                        changedFragments: {
                            0: null,
                            1: { type: 'text', text: 'hihi~' },
                        },
                    },
                },
            ],
        },
    ]

    scenarios.forEach(({ cases, config, system }, systemIdx) => {
        describe(`scenario #${systemIdx + 1}`, () => {
            beforeAll(() => updateConfig({ ...baseConfig, ...config }))
            cases.forEach(({ label, fragments, expected }, caseIdx) => {
                it(`detects case #${caseIdx + 1} correctly\n${label}\n${JSON.stringify(fragments)} -> ${expected?.member} (via ${expected?.proxyUsed})`, () => {
                    const rawResult = detectProxyInMessage(system, fragments)
                    const testResult = rawResult ? {
                        ...rawResult,
                        member: rawResult.member.name,
                        proxyUsed: rawResult.proxyUsed.text,
                    } : undefined

                    expect(testResult).toEqual(expected)
                })
            })
        })
    })
})

describe('getProxiedMessage', () => {
    const systems = makeSampleSystems()

    it('accepts a message string in place of fragments', () => {
        const pm = getProxiedMessage(systems.moonlight, 'L: hihi~ <3')
        expect(pm?.member?.name).toBe('leah')
        expect(pm?.body).toBe('hihi~ <3')
    })

    it('handles autoproxy', () => {
        const pm1 = getProxiedMessage(systems.retrograde, 'hihi!')
        expect(pm1?.member?.name).toBe('enni')
        expect(pm1?.body).toBe('hihi!')

        // Verify that autoproxy can still be overridden
        const pm2 = getProxiedMessage(systems.retrograde, 'd: hihi!')
        expect(pm2?.member?.name).toBe('dani')
        expect(pm2?.body).toBe('hihi!')
    })

    it('still compiles a single body string even when passed fragments', () => {
        const pm = getProxiedMessage(systems.retrograde, [
            { type: 'text', text: 'e: hihi! ' },
            { type: 'emote', text: 'leahinmWave' },
            { type: 'text', text: ' how has your stream been going?'}
        ])
        expect(pm?.member?.name).toBe('enni')
        expect(pm?.body).toBe('hihi! leahinmWave how has your stream been going?')
    })
})
