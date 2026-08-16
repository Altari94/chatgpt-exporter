<h1 align="center">ChatGPT Exporter – Chrome Extension</h1>

<div align="center">

## Export raw ChatGPT conversations with one click

[![license][license-image]][license-url]
[![release][release-image]][release-url]

[license-image]: https://img.shields.io/github/license/pionxzh/chatgpt-exporter?color=red
[license-url]: https://github.com/pionxzh/chatgpt-exporter/blob/master/LICENSE
[release-image]: https://img.shields.io/github/v/release/pionxzh/chatgpt-exporter?color=blue
[release-url]: https://github.com/pionxzh/chatgpt-exporter/releases/latest

Documentation: [Deutsch](./README.de.md) · [English](./README.md) · [Español](./README.es.md)

Project context: [Project intent](./docs/PROJECT_INTENT.md) · [Developer guide](./docs/DEVELOPER_GUIDE.md) · [Fork maintenance](./docs/FORK_MAINTENANCE.md) · [Upstream comparison](./docs/UPSTREAM_VS_FORK.md) · [Branding](./docs/BRANDING.md)

Pre-release roadmap: [v0.10 Medienvollständiger Capture](./docs/MILESTONE_V0.10.md)

![image](https://github.com/pionxzh/chatgpt-exporter/assets/9910706/1c864670-7912-4484-b4be-bdf5dde51557)

## Install the Chrome Extension (recommended)

The Chrome Extension is the official user-facing product of this fork. It does not require Tampermonkey or another userscript manager.

### From a release artifact

1. Download the `extension` artifact from the project release.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the extracted `extension` directory.
5. Open a ChatGPT conversation and pin **ChatGPT Exporter** to the toolbar.

### From a local checkout

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build:extension
```

Then load `dist-extension/` through **Load unpacked**.

### First export

1. Open a normal ChatGPT conversation at `chatgpt.com/c/...`.
2. Open the ChatGPT Exporter popup.
3. Click **Raw JSON herunterladen**.
4. The downloaded JSON preserves the original response text and parsed raw value.

To export multiple chats, choose **Export All**, load the chat list, select individual chats or all chats, and start the download. The operation can be cancelled between conversations.

### Optional HTTP destination

Enter an `http://` or `https://` endpoint in the popup and save it. Chrome asks for access to that concrete endpoint origin only when the HTTP feature is used. Sending is always explicit; no chat is transmitted automatically. See [HTTP Destination](./docs/releases/V0.6_HTTP_DESTINATION.md) and [optional permissions](./docs/releases/V0.6.1_OPTIONAL_HOST_PERMISSIONS.md).

## Legacy userscript

The original userscript remains in `dist/chatgpt.user.js` for compatibility with the upstream project and existing installations. It is not the recommended installation path for new users and requires a userscript manager such as Tampermonkey.

The fork's development and documentation target the Chrome Extension first.

#

[📚 Supported Formats](#-supported-formats) &nbsp;&nbsp;|&nbsp;&nbsp; [💡 Example](#-example) &nbsp;&nbsp;|&nbsp;&nbsp; [📤 Export Multiple Conversations](#-export-multiple-conversations) &nbsp;&nbsp;|&nbsp;&nbsp; [🤝 Contribution](#-contribution) &nbsp;&nbsp;|&nbsp;&nbsp; [⭐ Star History](#-star-history)

</div>

#

## 📚 Supported Formats

- [Text](#text)
- [HTML](#html)
- [Markdown](#markdown)
- [JSON](#json)

## 💡 Example

### Text

```
You:
I'm creating a ChatGPT Exporter. What do you think?

ChatGPT:
It sounds like you're planning on creating a tool that uses the ChatGPT model
to export text. ChatGPT is a large language model trained by OpenAI that is
designed to generate human-like text responses based on a given input. It can
be used for a variety of applications, such as chatbots, automated responses
to customer inquiries, and more.

However, please keep in mind that as a large language model, ChatGPT has not
been specifically trained for any specific task, so the quality of the
generated text will depend on how it is used and the context in which it is
applied. It's important to use ChatGPT responsibly and consider the potential
consequences of using it in any given situation.
```

### HTML

<div align="center">

<img width="643" alt="image" src="https://github.com/pionxzh/chatgpt-exporter/assets/9910706/47481c7a-4a6a-433b-b08e-fdf3bbabcb64">

</div>

### Markdown

```
---
title: ChatGPT Exporter Creation
source: https://chat.openai.com/c/cf3f8850-1d69-43c8-b99b-affd0de4e76f
author: ChatGPT
---

# ChatGPT Exporter Creation

#### You:
I'm creating a ChatGPT Exporter. What do you think?

#### ChatGPT:
It sounds like you're planning on creating a tool that uses the ChatGPT model to export text. ChatGPT is a large language model trained by OpenAI that is designed to generate human-like text responses based on a given input. It can be used for a variety of applications, such as chatbots, automated responses to customer inquiries, and more.
```

### Screenshot

<div align="center">
<img width="480" src="https://user-images.githubusercontent.com/9910706/205663680-6ac97fac-39b0-495c-bee4-8ef37713a9ae.png" />

</div>

### JSON

the raw content from API `https://chat.openai.com/backend-api/conversation/[id]`

<details>
<summary>Click to see</summary>

```json
{
    "id": "35a1fa05-e928-4c39-8ffa-ca74f75b509f",
    "title": "AI Turing Test.",
    "create_time": 1678015311.655875,
    "mapping": {
        "5c48fa3e-e4ee-4d00-aa66-8fbcb671a358": {
            "id": "5c48fa3e-e4ee-4d00-aa66-8fbcb671a358",
            "message": {
                "id": "5c48fa3e-e4ee-4d00-aa66-8fbcb671a358",
                "author": {
                    "role": "system",
                    "metadata": {}
                },
                "create_time": 1678015311.655875,
                "content": {
                    "content_type": "text",
                    "parts": [
                        ""
                    ]
                },
                "end_turn": true,
                "weight": 1,
                "metadata": {},
                "recipient": "all"
            },
            "parent": "9310b90f-d8f0-4be6-bac2-daacddac784f",
            "children": [
                "4afb9720-3a88-49b1-9309-e2b53d607f34"
            ]
        },
        "9310b90f-d8f0-4be6-bac2-daacddac784f": {
            "id": "9310b90f-d8f0-4be6-bac2-daacddac784f",
            "children": [
                "5c48fa3e-e4ee-4d00-aa66-8fbcb671a358"
            ]
        },
        "4afb9720-3a88-49b1-9309-e2b53d607f34": {
            "id": "4afb9720-3a88-49b1-9309-e2b53d607f34",
            "message": {
                "id": "4afb9720-3a88-49b1-9309-e2b53d607f34",
                "author": {
                    "role": "user",
                    "metadata": {}
                },
                "create_time": 1678015311.656259,
                "content": {
                    "content_type": "text",
                    "parts": [
                        "write an poem about the Turing test"
                    ]
                },
                "weight": 1,
                "metadata": {
                    "timestamp_": "absolute"
                },
                "recipient": "all"
            },
            "parent": "5c48fa3e-e4ee-4d00-aa66-8fbcb671a358",
            "children": [
                "7027f1a5-8bd5-4463-9869-8a1d1db2f9a1"
            ]
        },
        "7027f1a5-8bd5-4463-9869-8a1d1db2f9a1": {
            "id": "7027f1a5-8bd5-4463-9869-8a1d1db2f9a1",
            "message": {
                "id": "7027f1a5-8bd5-4463-9869-8a1d1db2f9a1",
                "author": {
                    "role": "assistant",
                    "metadata": {}
                },
                "create_time": 1678185638.890551,
                "content": {
                    "content_type": "text",
                    "parts": [
                        "In the realm of machines and code,\nThere lies a test, with rules bestowed,\nA challenge to determine true mind,\nAnd if a machine's intelligence can find.\n\nThe Turing test, named for its creator,\nSeeks to find if a machine's behavior\nCan mimic that of a human so well,\nThat it's indistinguishable, can you tell?\n\nThrough conversations, the test is done,\nWith a judge and a machine, the game is run,\nIf the judge can't tell who is who,\nThen the machine's intelligence shines through.\n\nBut can a machine truly think?\nOr is it just a clever bit of link,\nBetween algorithms and programming code,\nCan it truly understand and decode?\n\nThe Turing test, a thought experiment,\nBrings up questions, doubts, and sentiment,\nFor as we strive to create machines smart,\nWe wonder, will they ever truly have heart?\n\nSo let us ponder and explore,\nAs we create machines more and more,\nThe Turing test a reminder to be,\nMindful of what our machines can truly see."
                    ]
                },
                "end_turn": false,
                "weight": 1,
                "metadata": {
                    "model_slug": "text-davinci-002-render-sha",
                    "finish_details": {
                        "type": "stop"
                    },
                    "timestamp_": "absolute"
                },
                "recipient": "all"
            },
            "parent": "4afb9720-3a88-49b1-9309-e2b53d607f34",
            "children": []
        }
    },
    "moderation_results": [],
    "current_node": "7027f1a5-8bd5-4463-9869-8a1d1db2f9a1"
}
```
</details>

## 📤 Export Multiple Conversations

When you click the "Export All" button, the **Export Conversations** dialog pops up. Here are the functions you can access.

**Export from official export file (conversations.json)**

Click the upload icon button to upload a JSON file of conversations, such as one downloaded from OpenAI.

**Export from API**

In the list of all your conversations, select which conversations you want to export. Check the "Select All" checkbox to export all your conversations.

Select your export format from the dropdown on the bottom left. You can choose from the following formats.

- **Markdown**
- **HTML**
- **JSON**
- **JSON (ZIP)**

Click the button to perform the action you want.

- **Archive** -  Archived chat sessions will disappear from the sidebar and can be managed in ChatGPT settings. See [#199](https://github.com/pionxzh/chatgpt-exporter/issues/199) for more details.
- **Delete** - Deletes the selected conversations.
- **Export** - Exports the selected conversations in the format chosen using the format selector.

## 💬 Using DeepSeek too?

Check out [**DeepSeek Exporter**](https://github.com/pionxzh/deepseek-exporter) — the sister project that brings the same one-click export to [DeepSeek](https://chat.deepseek.com/), including DeepThink reasoning and web-search sources.

## 🤝 Contribution

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## ⭐ Star History

<div align="center">

<img src="https://star-history.dera.page/svg?repos=pionxzh/chatgpt-exporter&type=Date" width="600" height="400" alt="Star History Chart" valign="middle">

</div>
