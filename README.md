# Job Description Scanner Chrome Extension (Scaffold)

This is a Manifest V3 Chrome extension scaffold that:
- Injects a content script (`content.js`) on all pages
- Scans for the phrase "Job Description" in visible page content
- If found, shows a floating button: "Generate Cover Letter?"
- On click, logs the DOM snapshot to the console (for future OpenAI integration)

## Installation

1. Clone or download this folder.
2. Go to `chrome://extensions` in Chrome.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select this folder.
5. Visit any page with the phrase "Job Description" to see the button.

## Notes
- No OpenAI integration yet; this is just the UI and hook scaffold.
- The button only appears if the phrase is found in visible text. 