import { defineConfig } from 'vitepress'

import typedocSidebar from '../api/typedoc-sidebar.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Pluralmind",
    description: "Pluralmind allows plural folks to share which of their system members is sending a message on Twitch.",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Pluralmind', link: 'https://pluralmind.chat' },
            { text: 'Guide', link: '/quickstart' },
            { text: 'API Reference', link: '/api' },
            { text: 'REST API', link: 'https://pluralmind.chat/redoc#operation/get_system_api_system__id__get' },
        ],

        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Quickstart', link: '/quickstart' },
                ]
            },
            {
                text: 'API Reference',
                items: typedocSidebar
            },
            {
                text: 'REST API',
                link: 'https://pluralmind.chat/redoc#operation/get_system_api_system__id__get',
            },
        ],

        socialLinks: [
            { icon: 'git', link: 'https://git.gay/leahinmoonlight/pluralmind' },
            { icon: 'discord', link: 'https://discord.gg/3TseAS2fne' },
            { icon: 'bluesky', link: 'https://bsky.app/profile/leahinmoonlight.com' },
        ]
    },
    markdown: {
        theme: {
            light: 'catppuccin-latte',
            dark: 'catppuccin-mocha',
        },
    }
})
