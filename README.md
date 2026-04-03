# Dataiku Chat Mockup

Mock AI chat interfaces injected into Dataiku DSS for demos. Purely visual — no AI backend. Vanilla JavaScript, zero dependencies, no build step.

## Setup

### Prerequisites

- Access to the [staging Dataiku instance](https://staging-design.qa.managedinstances.dkucloud-dev.com)
- Node.js installed locally
- Chrome browser

### Step 1: Start the Chat UI

The chat panel requires a local dev server running:

```bash
cd chat-ui
node serve.js
```

This serves the chat UI at `http://localhost:3333`.

### Step 2: Flow Demo

1. Open the **PATIENTCOHORT** project flow in Chrome:
   `https://staging-design.qa.managedinstances.dkucloud-dev.com/projects/PATIENTCOHORT/flow/`
2. Make sure you're in the **default flow zone**
3. Open DevTools Console (`Cmd+Option+I` / `F12`)
4. Paste the contents of `src/inject-chat-panel.js`

This creates a 50/50 split — Dataiku flow on the left, chat UI on the right — with a postMessage bridge for navigation actions and progressive flow reveal.

### Step 3: Home Page / Task Hub Demo

In a **separate browser tab**:

1. Navigate to the AI Search page:
   `https://staging-design.qa.managedinstances.dkucloud-dev.com/home/data-catalog/ai-search`
2. Open DevTools Console
3. Paste the scripts **in this order**:
   1. `src/home-page-config.js` — conversation configuration
   2. `src/home-page-fake-chat.js` — interactive fake chat
   3. `src/task-hub-modifications.js` — reskins the page to the 2026 brand aesthetic

## Hotkeys

All interactive scripts share the same hotkeys:

| Hotkey | Action |
|---|---|
| `Ctrl+Shift+N` | Advance to next scripted message |
| `Ctrl+Shift+T` | Toggle fake/real mode |
| `Ctrl+Shift+R` | Reset conversation |

## Customizing Conversations

Edit `src/home-page-config.js` or `src/flow-assistant-config.js`:

```javascript
window.fakeChatConfig = {
  conversation: [
    { role: 'user', text: 'Your question here' },
    {
      role: 'assistant',
      content: {
        intro: 'Response text with <em>emphasis</em>',
        tasks: [
          {
            title: 'Task Name',
            inputs: ['input_dataset'],
            outputs: ['output_dataset'],
            description: 'What this task does'
          }
        ],
        footer: 'Optional footer text'
      }
    }
  ],
  typingSpeed: 30,
  aiResponseDelay: 800
};
```

## Other Injection Scripts

| Script | What it does | Where to use it |
|---|---|---|
| `src/flow-assistant-fake-chat.js` | Fake chat in the Flow Assistant panel | Flow page with Flow Assistant open |
| `src/flow-assistant-config.js` | Config for flow assistant conversations | Load before the script above |
| `src/inject.js` | Accordion chat widget in right panel | Flow page with an object selected |
| `src/flow-conversation-injection.js` | Static conversation in "Generate Flow" panel | Flow page with Generate Flow open |

## Project Structure

```
dataiku-chat-mockup/
├── src/                          # Injection scripts (paste into console)
│   ├── inject-chat-panel.js      # Flow demo: 50/50 split with chat iframe
│   ├── home-page-fake-chat.js    # Home page demo: interactive fake chat
│   ├── home-page-config.js       # Home page demo: conversation config
│   ├── task-hub-modifications.js # Home page demo: 2026 brand reskin
│   ├── flow-assistant-fake-chat.js
│   ├── flow-assistant-config.js
│   ├── inject.js
│   ├── flow-conversation-injection.js
│   └── inject-title.js
├── chat-ui/                      # Standalone chat UI (iframe for inject-chat-panel)
│   ├── index.html
│   ├── app.js, components.js, config.js
│   ├── styles.css
│   └── serve.js                  # Dev server (localhost:3333)
├── webapp/                       # Standalone patient cohort webapp
├── webapps/patient-lookup/       # Dataiku webapp plugin
├── data/                         # Sample datasets and generator script
├── dist/bookmarklet.txt          # Minified bookmarklet (right panel widget)
└── extension/                    # Chrome extension (right panel widget)
```

## Tips for Demos

1. **Prepare your conversation** — edit the config file with your demo scenario
2. **Match the context** — use actual dataset/column names from your project
3. **Practice timing** — run through the hotkey sequence before recording
4. **Multiple scenarios** — create different config files for different demos

## License

MIT
