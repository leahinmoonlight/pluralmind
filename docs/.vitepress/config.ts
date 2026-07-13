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
            { text: 'Integrations', link: '/integrations' },
            { text: 'Developer Guide', link: '/quickstart' },
            { text: 'API Reference', link: '/api' },
            { text: 'REST API', link: '/rest-api' },
        ],

        sidebar: [
            {
                text: 'Integrations',
                items: [
                    { text: 'OBS Chat Dock', link: '/integrations/obs-chat-dock' },
                    { text: 'Slime2 Chat Widget', link: '/integrations/slime2-chat-widget' },
                    { text: 'Streamlabs Chat Widget', link: '/integrations/streamlabs-chat-widget' },
                ]
            },
            {
                text: 'Developer Guide',
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
                link: '/rest-api',
            },
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/leahinmoonlight/pluralmind' },
            { icon: 'discord', link: 'https://discord.gg/3TseAS2fne' },
            { icon: 'bluesky', link: 'https://bsky.app/profile/leahinmoonlight.com' },
        ]
    },
    markdown: {
        theme: {
            light: 'catppuccin-latte',
            dark: 'catppuccin-mocha',
        },
    },
    sitemap: {
        hostname: 'https://docs.pluralmind.chat',
    },
})
