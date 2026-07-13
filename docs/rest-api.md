---
outline: deep
---

# REST API

While our [JavaScript library](/quickstart) is usually the easiest path, you can leverage our REST API if you'd like to add Pluralmind to a non-JavaScript project!

## Getting a system's information

To load a system's information, send a `GET` request to this endpoint:

```
https://pluralmind.chat/api/system/<twitch_id_or_username>
```

So for example:
```
# Get by Twitch ID
https://pluralmind.chat/api/system/21711703

# Get by Twitch username
https://pluralmind.chat/api/system/leahinmoonlight
```

::: tip
Always use the numeric ID if you have it! While usernames work, they may occasionally fall out of sync after a username change.
:::

## Example data

If a system was found, you'll get back some data that looks like this:
```json
{
    "id": 133333337,
    "color": "#f397c9",
    "pronouns": "she/her",
    "autoproxy_member_id": null,
    "members": [
        {
            "id": 42,
            "name": "Eve",
            "proxies": [
                "e",
                "eve"
            ],
            "case_sensitive": false,
            "color": "#f397c9",
            "pronouns": "she/her"
        }
    ]
}
```

Check out the [System](/api/interfaces/System.html) and [Member](/api/interfaces/Member.html) interfaces for a full breakdown on what everything is.

We'll send back a 404 if no system was found for that ID or username.

As always, feel free to reach out on our [Discord](https://discord.gg/3TseAS2fne) if you have any questions.
