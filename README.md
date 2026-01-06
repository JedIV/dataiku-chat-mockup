# Dataiku Chat Mockup

A lightweight tool to inject a mock AI chat assistant into Dataiku's right panel for demos and presentations. This is purely visual — it doesn't actually connect to any AI backend.

![Demo](screenshots/demo.png)

## Quick Start

### Option 1: Browser Console (Fastest)

1. Open Dataiku in your browser
2. Navigate to the Flow view and select an object (so the right panel appears)
3. Open DevTools (F12 or Cmd+Option+I)
4. Go to the Console tab
5. Copy and paste the contents of `src/inject.js` (or use the quick snippet below)
6. Press Enter

**Quick snippet** (paste this directly into console):
```javascript
(function(){document.getElementById('dku-chat-styles')?.remove();document.getElementById('dku-chat-widget')?.remove();document.querySelectorAll('.dku-chat-section').forEach(el=>el.remove());const s=document.createElement('style');s.id='dku-chat-styles';s.textContent=`.dku-chat-section{margin:8px;background:#fff;border:1px solid #e0e0e0;border-radius:4px;display:flex;flex-direction:column;height:320px;font-family:"Source Sans Pro",sans-serif}.dku-chat-header{padding:10px 12px;font-weight:600;font-size:13px;color:#333;border-bottom:1px solid #e0e0e0;display:flex;align-items:center;gap:8px;background:#fafafa}.dku-chat-icon{width:24px;height:24px;background:linear-gradient(135deg,#D97757,#E89B7B);border-radius:4px;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold}.dku-chat-messages{flex:1;padding:12px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;background:#fafafa}.dku-chat-bubble{padding:8px 12px;border-radius:8px;font-size:12px;line-height:1.4;max-width:90%}.dku-chat-bubble.assistant{background:#fff;border:1px solid #e0e0e0;align-self:flex-start}.dku-chat-bubble.user{background:#0078D4;color:white;align-self:flex-end}.dku-chat-input-area{padding:10px;border-top:1px solid #e0e0e0;display:flex;gap:8px}.dku-chat-input{flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:4px;font-size:12px;outline:none}.dku-chat-send{padding:8px 14px;background:#0078D4;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px}`;document.head.appendChild(s);const target=document.querySelector('.details-tab.oa')||document.querySelector('.right-panel__content');if(target){target.insertAdjacentHTML('beforeend',`<div class="dku-chat-section" id="dku-chat-widget"><div class="dku-chat-header"><div class="dku-chat-icon">AI</div><span>Data Assistant</span></div><div class="dku-chat-messages"><div class="dku-chat-bubble assistant">Hi! I can help you explore this flow. What would you like to know?</div><div class="dku-chat-bubble user">What does the Visual Agent do?</div><div class="dku-chat-bubble assistant">The Visual Agent processes your input_dataset and produces output_dataset.</div></div><div class="dku-chat-input-area"><input type="text" class="dku-chat-input" placeholder="Ask about your data..."><button class="dku-chat-send">Send</button></div></div>`);document.getElementById('dku-chat-widget').scrollIntoView({behavior:'smooth'})}else{alert('Right panel not found. Select an object in the Flow view first.')}})();
```

### Option 2: Bookmarklet (One-Click)

1. Create a new bookmark in your browser
2. Name it "Dataiku Chat"
3. Paste the contents of `dist/bookmarklet.txt` as the URL
4. Navigate to Dataiku, then click the bookmarklet

### Option 3: Chrome Extension (Best for Repeated Use)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/` folder
5. Click the extension icon when on a Dataiku page

## Customization

Edit the `CONFIG` object in `src/inject.js` to customize:

```javascript
const CONFIG = {
  title: 'Data Assistant',           // Header title
  placeholder: 'Ask about your data...', // Input placeholder
  iconText: 'AI',                    // Icon text
  
  // Conversation messages
  messages: [
    { role: 'assistant', text: 'Hello!' },
    { role: 'user', text: 'Hi there' },
    // Add more messages...
  ],

  // Colors
  accentColor: '#D97757',            // Icon background
  userBubbleColor: '#0078D4',        // User message bubbles
  chatHeight: '320px'                // Widget height
};
```

## Project Structure

```
dataiku-chat-mockup/
├── README.md
├── src/
│   └── inject.js          # Main script (well-commented, editable)
├── dist/
│   └── bookmarklet.txt    # Minified bookmarklet version
├── extension/             # Chrome extension
│   ├── manifest.json
│   ├── background.js
│   └── content.js
└── screenshots/
    └── (add your demo screenshots here)
```

## Features

- **Matches Dataiku's UI**: Uses similar fonts, colors, and styling
- **Interactive**: You can type messages and get mock responses
- **Typing indicator**: Shows animated dots while "thinking"
- **Easy to customize**: Change messages, colors, and positioning
- **Non-destructive**: Removes cleanly, no page reload needed

## Re-injecting / Removing

**To re-inject:** Run the script again or call `window.dataikuChatMockup.inject()`

**To remove:** Run in console:
```javascript
document.getElementById('dku-chat-widget')?.remove();
document.getElementById('dku-chat-styles')?.remove();
```

## Tips for Demos

1. **Prepare your conversation**: Edit the `messages` array to show a relevant conversation for your demo scenario
2. **Match the context**: Reference actual dataset/recipe names from your Dataiku project
3. **Screenshot timing**: The chat appears at the bottom of the right panel, so make sure it's visible in your screen capture
4. **Multiple scenarios**: Create different versions of the script with different conversations

## Troubleshooting

**"Right panel not found"**
- Make sure you're on the Flow view
- Select an object (dataset, recipe, etc.) so the right panel opens
- Wait a moment for Dataiku's Angular app to render

**Widget appears in wrong position**
- The script targets `.right-panel__content` — inspect your Dataiku version to confirm this selector still exists
- Adjust the selector in `findRightPanel()` if needed

## License

MIT — use freely for demos and presentations.
