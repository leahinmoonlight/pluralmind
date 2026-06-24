import type { PluralmindConfig } from './types'

/** @internal */
export const config: PluralmindConfig = {
    cacheDuration: 15 * 60 * 1000, // 15 minutes
    ignoreLeadingWhitespace: true,
}

export const updateConfig = (updates: Partial<PluralmindConfig>) => {
    Object.assign(config, updates)
}
