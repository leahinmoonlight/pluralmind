# Pluralmind

Pluralmind allows plural folks to share which of their system members is sending a message on Twitch. You can learn more about Pluralmind over at [pluralmind.chat](https://pluralmind.chat).

This library is designed to make it fast and simple to add plurality support to your own projects (chat widgets, custom Twitch tools, apps, etc.)

[![npm version](https://img.shields.io/npm/v/pluralmind?color=ff69b4)](https://www.npmjs.com/package/pluralmind) [![license](https://img.shields.io/npm/l/pluralmind?color=ff69b4)](./LICENSE)

## Guides and References

Check out the [Pluralmind Docs](https://docs.pluralmind.chat/) for guides, as well as a full [API Reference](https://docs.pluralmind.chat/api/).

Everything below is covered in more detail in our [Quickstart Guide](https://docs.pluralmind.chat/quickstart.html).

## Installation

With npm (or your favorite package manager):

```bash
npm install pluralmind
```

Or, want to use Pluralmind directly in an HTML page without a bundler? Don't worry, you can also embed it from a CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/pluralmind@1"></script>
```

## Integrating Pluralmind

```ts
import { getSystem, getProxiedMessage } from 'pluralmind'
// or, if you're embedding from a CDN, use:
// const { getSystem, getProxiedMessage } = window.pluralmind

// Let's imagine a new message just came in from someone!
// We'll start by pulling up their system's information. You can pass in their numeric Twitch user ID, or their username/handle.
const system = await getSystem('leahinmoonlight')

// Great! Now let's see if this is a proxied messsage.
const pm = getProxiedMessage(system, 'L: hihi chat~')
if (pm) {
    console.log(pm.member.name)  // "Leah"
    console.log(pm.color)        // "#eb98ca"
    console.log(pm.pronouns)     // "she/her"
    console.log(pm.body)         // "hihi chat~" (the proxy prefix was removed)
    // That's it! You can use this data to change how you render this member's message.
}
```

### TypeScript

We're also fully TypeScript compatible! You can import any types you need from the main package:

```ts
import type { Member, System } from 'pluralmind'
```

### Want a full example?

Our Pluralmind browser extension is open source, and uses this library. Feel free to check out its [full implementation](https://github.com/leahinmoonlight/pluralmind-browser).
