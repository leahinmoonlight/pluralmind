export { config, updateConfig } from './config'
export type * from './types'
export { MessageFragmentType, ProxyType } from './types'
export {
    detectProxyInMessage,
    getCachedSystem,
    getProxiedMessage,
    getSystem,
    loadSystem,
} from './service'
