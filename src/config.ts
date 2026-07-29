import type { PluralmindConfig } from './types'

/** @internal */
export const config: PluralmindConfig = {
    cacheDuration: 15 * 60 * 1000, // 15 minutes
}

/**
 * Updates the Pluralmind config.
 * Check out {@link PluralmindConfig} for available options.
 *
 * @group Advanced Functions
 */
export const updateConfig = (updates: Partial<PluralmindConfig>) => {
    Object.assign(config, updates)
}
