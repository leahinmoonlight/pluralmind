# Adding Pluralmind to your Streamlabs Chat Box

Here's how you can add support for Pluralmind to your Streamlabs Chat Box! Once you do, your chat box will properly display proxied messages from plural folks.

1. Go to your [Streamlabs Chat Box customization page](https://streamlabs.com/dashboard#/widgets/chat-box).
2. Scroll down to the **Custom HTML/CSS** section and enable it (if it isn't already).
3. Add this line to the top of the **HTML** section:
    ```html
    <script src="https://cdn.jsdelivr.net/npm/pluralmind@1"></script>
    ```

4. Add the following snippet to the bottom of the **JS** section:
    ```js
    // Pluralmind support
    // These selectors are based on the default Streamlabs template
    // You may need to adjust them if you're using a custom theme
    const colorSelector = '.meta'
    const nameSelector = '.name'
    const bodySelector = '.message'

    // Set this to false if you don't want to show pronouns
    const showPronouns = true

    // Set this to true if you'd like to display original usernames next to each
    // headmate's name
    const showOriginalUsername = false

    document.addEventListener('onEventReceived', async (event) => {
        // Check this is a message event
        if (!event.detail.messageId) return

        // Bring up the message that was added to the DOM
        const { from, messageId } = event.detail
        const messageEl = document.querySelector(`[data-id="${messageId}"]`)
        if (!messageEl) return

        // Find the first text node in the body
        const bodyEl = messageEl.querySelector(bodySelector)
        if (!bodyEl) return

        const firstBodyNode = bodyEl.firstChild
        if (!firstBodyNode || firstBodyNode.nodeType !== Node.TEXT_NODE) return

        // Check if this is a proxied message
        const system = await pluralmind.getSystem(from)
        const pm = pluralmind.getProxiedMessage(system, firstBodyNode.textContent)
        if (!pm) return

        // Update the name
        const nameEl = messageEl.querySelector(nameSelector)
        if (nameEl) {
            nameEl.textContent = pm.member.name

            if (showOriginalUsername) {
                nameEl.textContent += ` (${from})`
            }

            if (showPronouns && pm.pronouns) {
                nameEl.textContent += ` (${pm.pronouns})`
            }
        }

        // Update the color
        const colorEl = messageEl.querySelector(colorSelector)
        if (colorEl && pm.color) {
            colorEl.style.color = pm.color
        }

        // Remove the proxy from the message
        firstBodyNode.textContent = pm.body
    })
    ```

5. Hit **Save Settings** at the bottom of the page.

That's it! Your Streamlabs Chat Box should now be plural-friendly! 🩷

If it isn't working, you may have a very custom theme that uses different class names. The selectors at the top of the JS section can be tweaked to match those.

Feel free to reach out on our [Discord](https://discord.gg/3TseAS2fne) if you have any questions!
