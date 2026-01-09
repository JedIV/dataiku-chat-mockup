# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dataiku Chat Mockup is a demonstration tool that injects mock AI chat interfaces into Dataiku's web application for demos and presentations. It is purely visual and does not connect to any AI backend.

## Development

**No build process required.** All files are vanilla JavaScript with zero external dependencies.

### Usage Methods

1. **Browser Console**: Copy `src/inject.js` contents → paste in DevTools Console → Enter
2. **Bookmarklet**: Use minified version from `dist/bookmarklet.txt`
3. **Chrome Extension**: Load unpacked from `/extension` folder at `chrome://extensions/`

### Testing

Manual testing only. Requires a Dataiku instance running at `localhost`, `127.0.0.1`, or `*.dataiku.com`.

## Architecture

### Injection Pattern

All scripts use self-contained IIFEs (Immediately Invoked Function Expressions) for scope isolation. Each script is independently injectable via browser console.

### Key Scripts

- **`src/inject.js`** - Main accordion-style chat widget for the right panel. Configurable via `CONFIG` object for messages, colors, and appearance.
- **`src/flow-assistant-fake-chat.js`** - Interactive fake conversation for Flow Assistant with hotkey-driven playback. Features:
  - `Ctrl+Shift+N` - Advance to next scripted message (with typing animation for user messages)
  - `Ctrl+Shift+T` - Toggle between fake/real mode
  - `Ctrl+Shift+R` - Reset conversation
  - Visual "FAKE MODE" / "REAL MODE" indicator
- **`src/flow-conversation-injection.js`** - Injects static fake AI conversation into "Generate Flow" panel with energy consumption insights mockup.
- **`src/task-hub-modifications.js`** - Transforms Dataiku AI Search page to "Lovable" design. Uses MutationObserver for lazy-loaded content.
- **`src/inject-title.js`** - Adds custom title to Flow generation panel.
- **`extension/content.js`** - Chrome extension version of the chat widget.

### DOM Targets

Scripts target these Dataiku selectors:
- `.right-panel__content` - Right panel content area
- `.details-tab.oa` - Object details tab
- `.object-right-column-summary` - Summary column
- `.text-to-flow-scrollable-section` - Flow generation panel
- `.flow-assistant-container` - Flow Assistant main container
- `.flow-assistant-scrollable-section` - Flow Assistant message area
- `.flow-assistant-chat-container` - Flow Assistant chat container
- `.flow-assistant-message-container` - Individual message wrapper
- `.flow-assistant-chat-message__user` - User message bubble
- `.flow-assistant-chat-message__assistant` - Assistant message bubble
- `.cm-content` - CodeMirror 6 input field (contentEditable)

### Styling

All styles are injected as `<style>` elements with inline CSS. Uses Dataiku brand colors (#3b99fc) and configurable accent colors via CONFIG objects.

## Customization

Each script has a `CONFIG` object at the top for customization:
- `title`, `placeholder`, `iconText` - Widget text
- `messages` - Array of `{role, text}` conversation objects
- `accentColor`, `userBubbleColor` - Theme colors
- `chatHeight`, `startExpanded` - Layout options
