import { defineConfig } from 'tsdown'

export default defineConfig([
    {
        entry: ['src/index.ts'],
        target: 'es2020',
        format: ['esm', 'cjs'],
        dts: true,
        sourcemap: true,
        clean: true,
    },
    {
        entry: ['src/index.ts'],
        target: 'es2020',
        format: ['iife'],
        globalName: 'pluralmind',
        minify: true,
        sourcemap: true,
    },
])
