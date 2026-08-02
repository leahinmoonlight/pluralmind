# Adding Pluralmind to your Streamlabs Chat Box

Here's how you can add support for Pluralmind to your Streamlabs Chat Box! Once you do, your chat box will properly display proxied messages from plural folks.

1. Go to your [Streamlabs Chat Box customization page](https://streamlabs.com/dashboard#/widgets/chat-box).
2. Scroll down to the **Custom HTML/CSS** section and enable it (if it isn't already).
3. Add this line to the top of the **HTML** section:
    ```html
    <script src="https://cdn.jsdelivr.net/npm/pluralmind@2/dist/integrations/streamlabs.js"></script>
    ```

4. Hit **Save Settings** at the bottom of the page.

That's it! Your Streamlabs Chat Box should now be plural-friendly! 🩷

Feel free to reach out on our [Discord](https://discord.gg/3TseAS2fne) if you have any questions!


## Customizing Pluralmind

This step is totally optional, but you can do it if you'd like to customize the way Pluralmind displays messages.

In the same area where you added the HTML script, add this to your **JS** section:

```js
pluralmindConfig = {
  // Set this to true if you'd like to display original usernames next to each headmate's name
  showOriginalUsername: false,

  // Set this to false if you don't want to show pronouns
  showPronouns: true,
}
```

## Support for custom themes

Pluralmind should work with most Streamlabs chat widgets out of the box. If you find it isn't working, you may have a very custom theme that uses different class names. Not to worry though! You can override the selectors that Pluralmind looks for.

Follow the instructions above for **Customizing Pluralmind**, but instead, customize these selectors to match your widget's theme:

```js
pluralmindConfig = {
  colorSelector: '.meta',
  nameSelector: '.name',
  messageSelector: '.message',
}
```

If you're not sure what to set these values to, feel free to ask in our [Discord](https://discord.gg/3TseAS2fne).
