import { MessageFragmentType } from './types'
import type { MessageFragment, Proxy, Member } from './types'

const knownFragmentTypes = new Set(Object.values(MessageFragmentType)) as Set<string>

export type ConsumeFragmentsResult<TFragment extends MessageFragment = MessageFragment> = {
    cleanFragments: TFragment[]
    changedFragments: Record<number, TFragment | null>
}

export const consumeFragmentsToMatchProxy = <TFragment extends MessageFragment>(
    fragments: readonly TFragment[],
    proxy: Proxy,
    type: 'prefix' | 'suffix',
    member: Member,
): ConsumeFragmentsResult<TFragment> | undefined => {
    // Keep a reference to the original fragments so we can use them later
    let sourceFragments = fragments

    // Start with the full proxy text so we can keep track of what we're still
    // looking for as we match parts of it
    // Note: We add a space because proxies must be separated from the rest of
    // the message content
    let remainingProxy = type === 'prefix' ? `${proxy.text} ` : ` ${proxy.text}`

    // Flip everything around if we're trying to detect a suffix
    if (type === 'suffix') {
        remainingProxy = reverse(remainingProxy)
        fragments = reverseFragments(fragments)
    }

    // Prepare configurable case-insensitive text matching
    const startsWith = (text: string, prefix: string) => {
        if (member.case_sensitive) return text.startsWith(prefix)
        return text.toLowerCase().startsWith(prefix.toLowerCase())
    }

    // Search through the fragments checking that our proxy text matches
    let changedFragments: Record<number, TFragment | null> = {}
    let foundFirstText = false
    let matched = false
    for (const [idx, fragment] of fragments.entries()) {
        // Bail out as soon as we hit a fragment type that we don't recognize
        if (!knownFragmentTypes.has(fragment.type)) return

        // All known fragment types that we're working with are expected to
        // have a text property, so let TypeScript know it's safe to access it
        if (typeof fragment.text !== 'string') return

        // Ignore mention fragments at the start of the message (Twitch adds
        // these when replying to someone)
        if (type === 'prefix' && idx === 0 && fragment.type === MessageFragmentType.Mention) continue

        // Ignore any completely empty fragments
        if (!fragment.text.length) continue

        // Determine which part of this fragment should be looked at
        // (If we haven't found any text yet, we jump over leading whitespace
        // to get to the first non-whitespace character)
        let firstCharacterIdx = 0
        if (!foundFirstText) {
            firstCharacterIdx = fragment.text.search(/\S/)

            // This fragment is only whitespace, ignore it
            if (firstCharacterIdx === -1) continue
        }

        // Get the text from the fragment (ignoring any leading whitespace if
        // this is the first non-whitespace fragment we've run into)
        let trueText = fragment.text.slice(firstCharacterIdx)
        foundFirstText = true

        // If this is the first fragment, skip over a leading mention (since
        // mentions are sometimes found in text fragments depending on the
        // implementation)
        if (type === 'prefix' && idx === 0 && fragment.type === MessageFragmentType.Text) {
            const mentionMatch = trueText.match(/^@\w{4,25} /)
            if (mentionMatch) {
                firstCharacterIdx += mentionMatch[0].length
                trueText = trueText.slice(mentionMatch[0].length)
            }
        }

        // Check if this fragment has enough text to finish our proxy
        if (trueText.length >= remainingProxy.length) {
            // Stop if the fragment doesn't match what we were expecting to find
            if (!startsWith(trueText, remainingProxy)) return

            // We theoretically have a match! Let's make sure this wouldn't
            // result in breaking up an emote
            if (trueText.length > remainingProxy.length && fragment.type === MessageFragmentType.Emote) return

            // We have a match! Update the fragment to remove the proxy text
            changedFragments[idx] = fragment.type === MessageFragmentType.Emote ? null : {
                ...fragment,
                text: fragment.text.slice(0, firstCharacterIdx) + trueText.slice(remainingProxy.length),
            }
            matched = true
            break
        } else {
            // Our remaining proxy is longer than this fragment, let's see if
            // what we do have matches
            if (!startsWith(remainingProxy, trueText)) return

            // It matches so far, let's consume this fragment and keep going
            remainingProxy = remainingProxy.slice(trueText.length)
            changedFragments[idx] = fragment.type === MessageFragmentType.Emote ? null : {
                ...fragment,
                text: fragment.text.slice(0, firstCharacterIdx),
            }
        }
    }

    if (!matched) return

    // Flip the changed data back around if we found a suffix match
    if (type === 'suffix') {
        changedFragments = Object.fromEntries(Object.entries(changedFragments)
            .map(([idx, fragment]) => {
                return [
                    fragments.length - 1 - Number(idx),
                    fragment?.text ? { ...fragment, text: reverse(fragment.text) } : fragment
                ]
            }))
    }

    return {
        changedFragments,
        cleanFragments: sourceFragments
            .map((fragment, idx) => {
                if (changedFragments[idx] === undefined) return fragment
                return changedFragments[idx]
            })
            .filter((f) => f !== null),
    }
}

const reverse = (text: string) => text.split('').reverse().join('')

export const reverseFragments = <TFragment extends MessageFragment>(fragments: readonly TFragment[]): TFragment[] => {
    return fragments
        .map((fragment) => {
            if (fragment.text) return { ...fragment, text: reverse(fragment.text) }
            return fragment
        })
        .reverse()
}
