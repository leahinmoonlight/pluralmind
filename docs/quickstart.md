---
outline: deep
---

# Quickstart Guide

## Installation

With npm (or your favorite package manager):

::: code-group

```bash [npm]
npm install pluralmind
```

```bash [pnpm]
pnpm add pluralmind
```

```bash [yarn]
yarn add pluralmind
```

:::

Or, want to use Pluralmind directly in an HTML page without a bundler? Don't worry, you can also embed it from a CDN:

:::code-group

```html [jsdelivr]
<script src="https://cdn.jsdelivr.net/npm/pluralmind@1"></script>
```

```html [unpkg]
<script src="https://unpkg.com/pluralmind@1"></script>
```

Note: You can also pin to specific version (like 1.1.0), if you'd like!

:::

## A Simple Example

Once installed, it's super easy to get proxy information for a message.

::: code-group

```ts [npm]
import { getSystem, getProxiedMessage } from 'pluralmind'

// Let's imagine a new message just came in from someone!
// We'll start by pulling up their system's information.
// You can pass in their numeric Twitch user ID, or their username/handle.
const system = await getSystem('leahinmoonlight')

// Great! Now let's see if this is a proxied messsage.
const pm = getProxiedMessage(system, 'L: hihi chat~')
if (pm) {
    console.log(pm.member.name)  // "Leah"
    console.log(pm.color)        // "#eb98ca"
    console.log(pm.pronouns)     // "she/her"
    console.log(pm.body)         // "hihi chat~" (the proxy prefix was removed)
}
```

```js [CDN]
// Let's imagine a new message just came in from someone!
// We'll start by pulling up their system's information.
// You can pass in their numeric Twitch user ID, or their username/handle.
const system = await pluralmind.getSystem('leahinmoonlight')

// Great! Now let's see if this is a proxied messsage.
const pm = pluralmind.getProxiedMessage(system, 'L: hihi chat~')
if (pm) {
    console.log(pm.member.name)  // "Leah"
    console.log(pm.color)        // "#eb98ca"
    console.log(pm.pronouns)     // "she/her"
    console.log(pm.body)         // "hihi chat~" (the proxy prefix was removed)
}
```

:::

That's it! You can use those attributes to change how you render that member's message. For a full list of available data and what everything means, check out the [ProxiedMessage interface](/api/interfaces/ProxiedMessage.html).

## Want a full example?

Our Pluralmind browser extension is open source, and uses this library. You can check out its full implementation [over here](https://github.com/leahinmoonlight/pluralmind-browser).
