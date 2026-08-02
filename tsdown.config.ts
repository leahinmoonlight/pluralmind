import { defineConfig, type UserConfig } from 'tsdown'

import pkg from './package.json' with { type: 'json' }

const baseConfig = {
    target: 'es2020',
    define: {
        __VERSION__: JSON.stringify(pkg.version),
    },
} satisfies UserConfig

const iifeConfig = {
    ...baseConfig,
    format: ['iife'],
    minify: true,
    sourcemap: true,
} satisfies UserConfig

export default defineConfig([
    {
        ...baseConfig,
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        dts: true,
        sourcemap: true,
        clean: true,
    },
    {
        ...iifeConfig,
        entry: ['src/index.ts'],
        globalName: 'pluralmind',
    },
    {
        ...iifeConfig,
        entry: ['src/integrations/streamlabs/entry.ts'],
        outputOptions: {
            entryFileNames: 'integrations/streamlabs.js',
        },
    },
])
