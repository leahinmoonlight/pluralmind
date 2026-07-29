import { ProxyType } from '../src/types'
import type { Member, System } from '../src/types'

type RequireKeys<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

export const makeSystem = (data: RequireKeys<System, 'members'>): System => ({
    id: Math.floor(Math.random() * 1000000),
    color: null,
    pronouns: null,
    autoproxy_member_id: null,
    ...data,
})

export const makeMember = (data: RequireKeys<Member, 'proxies'>): Member => {
    const id = Math.floor(Math.random() * 1000000)

    return {
        id,
        name: `Member ${id}`,
        case_sensitive: false,
        require_space: true,
        color: null,
        pronouns: null,
        ...data,
    }
}

export const makeSampleSystems = () => ({
    moonlight: makeSystem({
        members: [
            makeMember({
                name: 'leah',
                case_sensitive: false,
                proxies: [
                    { text: 'L:', type: ProxyType.Prefix },
                    { text: '-L', type: ProxyType.Suffix },
                    { text: '🌙', type: ProxyType.EitherSide },
                    { text: '🌙leahinmDance!', type: ProxyType.EitherSide },
                    { text: 'leahinmWave L:', type: ProxyType.Prefix },
                ],
            }),
            makeMember({
                name: 'samara',
                case_sensitive: true,
                proxies: [
                    { text: 'S:', type: ProxyType.Prefix },
                    { text: '-S', type: ProxyType.Suffix },
                    { text: '💜', type: ProxyType.EitherSide },
                    { text: 'Samara:', type: ProxyType.Prefix },
                ],
            }),
            makeMember({
                name: 'priority',
                case_sensitive: true,
                proxies: [
                    { text: 'S:S:', type: ProxyType.Prefix },
                    { text: '-l', type: ProxyType.Suffix },
                ],
            }),
        ],
    }),

    retrograde: makeSystem({
        members: [
            makeMember({
                id: 9001,
                name: 'enni',
                proxies: [
                    { text: 'e:', type: ProxyType.Prefix },
                    { text: '💜', type: ProxyType.Prefix },
                    { text: '🪐', type: ProxyType.Prefix },
                    { text: '-e', type: ProxyType.Suffix },
                ],
            }),
            makeMember({
                name: 'dani',
                require_space: false,
                proxies: [
                    { text: 'd:', type: ProxyType.Prefix },
                    { text: '💚', type: ProxyType.Prefix },
                    { text: '-d', type: ProxyType.Suffix },
                ],
            }),
        ],
        autoproxy_member_id: 9001,
    })
})
