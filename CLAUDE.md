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
- `.flow-assistant-title span` - Flow Assistant panel title text
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

## Dataiku Brand Style Guide (2026)

All UI work in this project MUST follow the official Dataiku brand guidelines below.

### Color Palette

**Foundation Colors:**
- Core Black: `#1A1A1A` (primary text, dark backgrounds)
- Core White: `#FEFEF9` (page backgrounds — note: warm off-white, NOT pure white)

**Signature Colors:**
- Dark Green: `#06312E` (deep accent, dark sections)
- Beige: `#F8F4E4` (light warm backgrounds, cards)
- Green: `#3EDAB2` (primary brand accent, CTAs)
- Light Green: `#C7FFF1` (highlights, hover states, light accents)

**Secondary & Neutral Colors:**
- Blue: `#7092F2` (secondary accent)
- Blue 40%: 40% opacity of `#7092F2`
- Blue Grey: `#42485B` (muted text, secondary UI elements)
- Orange: `#EDAB4F` (warnings, attention)
- Orange 40%: 40% opacity of `#EDAB4F`
- Brown: `#816948` (tertiary accent)

**Important:** Do NOT use the old Dataiku blue (`#3b99fc`). Use the palette above.

### Typography

Load from Google Fonts. Three font families:

- **Spectral** (serif) — Primary, used for titles and headings. Weights: Normal (400), Semi-Bold (600).
- **Roboto** (sans-serif) — Secondary, used for body text. Weights: Light (300), Normal (400), Bold (700).
- **DM Mono** (monospace) — Supporting, used for small text, code, labels. Weights: Normal (400), Bold (700).

### Icons

Use **Google Material Symbols** icon library with these settings:
- Style: Material Symbols (new)
- Variant: **Sharp**
- Fill: Enabled
- Weight: 500
- Grade: 200
- Optical Size: 24
- Use only black (`#1A1A1A`) or white (`#FEFEF9`) icons for accessibility.

### Logo

The Dataiku logo is a bird icon. Appears in dark (on light backgrounds) or white (on dark backgrounds). The wordmark "Dataiku" uses the Spectral font.

### Overall Aesthetic

- Warm, minimal, elegant feel — off-white (`#FEFEF9`) backgrounds, not stark white
- Clean spacing with generous whitespace
- Reference design: centered layout with logo at top, serif heading, and a clean input field (see the "What are we building today?" mockup page)
