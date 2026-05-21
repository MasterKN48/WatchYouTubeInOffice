# Watch YouTube In Office (MS Teams Stealth Disguise)

An interactive Chrome Extension built with **Preact**, **Vite**, **Tailwind CSS v4**, and **Bun** that transforms your YouTube video page into a high-fidelity Microsoft Teams meeting interface. Work hard, play hard, watch stealthily.

![MS Teams Disguise Screen](public/favicon.svg)

## Features

- 🤫 **Tab & Favicon Masking**: Mask the browser tab favicon with the Microsoft Teams logo and automatically convert the YouTube page title into a customizable corporate meeting name (e.g., *"Weekly Project Sync & Planning"*).
- 🎥 **Dual Display Modes**:
  - **Presentation Mode (Default)**: The YouTube video behaves like a participant's screen share (scaled, centered, and labeled). Other mock participants appear in a strip at the bottom.
  - **Gallery Mode**: The YouTube video is placed directly inside a 3x3 layout of coworker webcam streams (initials and pictures).
- 💬 **Teams Meeting Chat (Real Comments)**: Replaces the Teams chat panel with real comments fetched from the YouTube video. Comments are mapped dynamically to fake corporate names and styled precisely like MS Teams chat bubbles.
- 👥 **Interactive Participant List**: Interactive list of fake coworkers complete with speaking indicators, sound indicators, and organizer roles.
- 🔴 **The Red "Leave" Panic Button**: Instantly redirects the tab to a safe corporate site (like Outlook Web App or Google Docs) or closes the tab. Configurable from the extension settings.
- 🎛️ **Stealth Control Overlay**: Meeting control bar matching MS Teams dark mode:
  - **Mic Toggle**: Syncs to mute/unmute YouTube video audio.
  - **Camera Toggle**: Syncs to play/pause the video.
  - **Reactions**: Click 👍, ❤️, 👏, 😂, or 😮 to send floating reaction emojis up the screen!

---

## Tech Stack

- **Runtime & Package Manager**: [Bun.js](https://bun.sh)
- **Framework**: [Preact](https://preactjs.com/) (Fast, lightweight alternative to React)
- **Build Tool**: [Vite](https://vite.dev/) (Fast bundler)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using the official Vite plugin `@tailwindcss/vite`)

---

## Installation & Setup

### 1. Install Dependencies
Make sure you have [Bun](https://bun.sh/) installed:
```bash
bun install
```

### 2. Build the Extension
Build the extension assets using Vite:
```bash
bun run build
```
This compiles the Preact popup, content script, styles, and copies the `manifest.json` into a single `dist/` directory.

### 3. Load the Extension in Chrome
1. Open Google Chrome.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** (top-left corner).
5. Select the **`dist`** directory inside the project folder.

---

## Configuration & Environment Variables

Create a `.env` file in the root of the project to set the default panic redirect URL:

```env
# Default panic URL for the MS Teams Leave button
VITE_DEFAULT_PANIC_URL=https://outlook.office.com
```

---

## Project Structure

```text
├── public/                 # Static assets copied directly to dist
│   ├── manifest.json       # Chrome extension configuration
│   ├── favicon.svg         # MS Teams icon
│   └── assets/             # Fake participant avatars & icons
├── src/
│   ├── app.jsx             # Preact extension popup component
│   ├── main.jsx            # Entry point for the extension popup
│   ├── content.jsx         # Content script injected into YouTube
│   ├── content.css         # Styling for the MS Teams meeting wrapper
│   └── index.css           # Global styles for the popup
├── vite.config.js          # Vite config for building multi-entry chrome extension
├── package.json            # Script definitions and dependencies
└── .env                    # Environment variables
```

---

## How It Works

To prevent breaking YouTube's rich functionality (subtitles, player keybinds, buffering, ad-handling), the extension does **not** destroy or rebuild the video player.

Instead:
1. It injects a **Shadow DOM** node to isolate the MS Teams UI styles from YouTube's global styles.
2. It uses CSS to hide standard YouTube page layers (header, recommendations, sidebar).
3. It keeps the YouTube video player in the light DOM, positioning it dynamically via fixed absolute styling.
4. A high-performance `ResizeObserver` monitors a transparent placeholder target inside the Shadow DOM Teams UI, ensuring the YouTube video player matches the placeholder's dimensions and location down to the pixel!
