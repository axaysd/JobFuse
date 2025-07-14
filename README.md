# JobFuse: AI-powered Job Application Assistant (Chrome Extension)

JobFuse is a Chrome extension that helps you generate tailored cover letters and find hiring manager leads directly from LinkedIn job pages, powered by OpenAI.

## Features

- **OpenAI Integration:** Uses your OpenAI API key (GPT-4o/4.1) for cover letter and lead search generation.
- **Secure API Key Storage:** Prompts for your OpenAI API key on first use and stores it securely in your browser (localStorage).
- **LinkedIn Job Page Support:** Works on LinkedIn job pages, automatically extracting job details.
- **Floating Action Button:** Shows a floating "Open JobFuse" button on supported pages.
- **Guided User Prompts:** Prompts you for your resume and personal details (only once, stored securely).
- **Cover Letter Generation:** Generates a modern, tailored cover letter using your details, resume, and the extracted job description.
- **Expandable Details:** View the extracted job description and your resume as expandable panels inside the cover letter editor for easy reference.
- **Hiring Manager Lead Search:** Generates LinkedIn Sales Navigator search URLs for likely hiring managers using AI.
- **Download as Word:** Download your generated cover letter as a .doc file.

## Installation

1. Clone or download this folder.
2. Go to `chrome://extensions` in Chrome.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select this folder.
5. Visit a LinkedIn job page to see the floating JobFuse button.

## Usage

1. Click the floating JobFuse button on a LinkedIn job page.
2. On first use, enter your OpenAI API key (find it at https://platform.openai.com/api-keys).
3. Paste your resume and fill in your personal details (only once).
4. Review the extracted job description and your resume using the expandable panels in the cover letter editor.
5. Click "Generate Cover Letter" to get a tailored cover letter.
6. Use the "Show Job Description" and "Show Resume" buttons for quick reference.
7. Use the "Search leads" button to generate LinkedIn Sales Navigator URLs for hiring managers.
8. Download your cover letter as a Word document if desired.

## Notes
- Your API key, resume, and details are stored only in your browser (localStorage) and never sent anywhere except to OpenAI for generation.
- The extension only works on LinkedIn job pages or pages with a visible job description.
- You can update your API key, resume, or details by clearing them from localStorage. 