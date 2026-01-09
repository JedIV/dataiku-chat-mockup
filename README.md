# Dataiku Chat Mockup

A lightweight tool to inject mock AI chat assistants into Dataiku for demos and presentations. This is purely visual — it doesn't actually connect to any AI backend.

## Scripts

### Flow Assistant Fake Chat (Recommended)

Interactive fake conversation system for the Flow Assistant panel. Supports hotkey-driven playback for recording demo videos.

**Usage:**
1. Open Dataiku Flow page and open the Flow Assistant panel
2. Open DevTools (F12 or Cmd+Option+I) → Console
3. Paste `src/flow-assistant-config.js` (optional, for custom conversations)
4. Paste `src/flow-assistant-fake-chat.js`

**Hotkeys:**
- `Ctrl+Shift+N` - Advance to next scripted message
- `Ctrl+Shift+T` - Toggle fake/real mode
- `Ctrl+Shift+R` - Reset conversation

**Customizing conversations:**

Edit `src/flow-assistant-config.js`:

```javascript
window.fakeChatConfig = {
  conversation: [
    {
      role: 'user',
      text: 'Your question here'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Explanation text with <em>emphasis</em>',
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
  typingSpeed: 30,        // ms per character
  aiResponseDelay: 800    // ms before AI responds
};
```

Use `<span style="color:#28a9dd">name</span>` to highlight dataset/column names.

### Right Panel Chat Widget

Injects a mock chat widget into Dataiku's right panel (when an object is selected).

**Usage:**
1. Navigate to Flow view and select an object
2. Paste `src/inject.js` into console

### Flow Conversation Injection

Static conversation injection for the "Generate Flow" panel.

**Usage:**
1. Navigate to Flow page with Generate Flow panel open
2. Paste `src/flow-conversation-injection.js` into console

## Project Structure

```
dataiku-chat-mockup/
├── README.md
├── src/
│   ├── flow-assistant-config.js      # Conversation config (edit this)
│   ├── flow-assistant-fake-chat.js   # Interactive fake chat script
│   ├── flow-conversation-injection.js # Static conversation injection
│   └── inject.js                      # Right panel widget
├── dist/
│   └── bookmarklet.txt
├── extension/
│   ├── manifest.json
│   ├── background.js
│   └── content.js
└── screenshots/
```

## Features

- **Matches Dataiku's UI**: Uses native fonts, colors, and styling
- **Interactive**: Hotkey-driven playback for video recording
- **Typing animation**: User messages type out character by character
- **Typing indicator**: Shows animated dots while AI "thinks"
- **Mode toggle**: Switch between fake and real mode
- **Auto-reset**: Clears fake messages when clicking "New Task"

## Tips for Demos

1. **Prepare your conversation**: Edit the config file with your demo scenario
2. **Match the context**: Use actual dataset/column names from your project
3. **Practice timing**: Run through the hotkey sequence before recording
4. **Multiple scenarios**: Create different config files for different demos

## License

MIT — use freely for demos and presentations.
