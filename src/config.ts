import type { PluralmindConfig } from './types'

export const config: PluralmindConfig = {
    cacheDuration: 15 * 60 * 1000 // 15 minutes
}

export const updateConfig = (updates: Partial<PluralmindConfig>) => {
    Object.assign(config, updates)
}
