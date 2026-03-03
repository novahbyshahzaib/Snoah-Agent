# Snoah Agent 🤖

A beautiful, production-quality AI chat application built with React + TypeScript + Vite, powered by Google's Gemini API.

## Features

- **Streaming responses** — Messages appear chunk by chunk in real time
- **MathJax rendering** — Full LaTeX math support (inline and block equations)
- **Code highlighting** — Syntax-highlighted code blocks with a one-click copy button
- **Thinking mode** — View the model's internal reasoning in a collapsible section (Gemini 2.5 Flash/Pro)
- **Agent mode** — Extended output with step-by-step task breakdown for complex tasks
- **Image uploads** — Attach images directly to your messages (multimodal)
- **Chat history** — Persistent sidebar with per-conversation context, stored in `localStorage`
- **AI personalization** — Set a custom AI name and system prompt; choose from built-in presets
- **Settings panel** — Configure your API key, select a Gemini model, and adjust temperature
- **Mobile-first UI** — Dark theme with violet/cyan gradient accents, collapsible sidebar, and smooth animations

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

### 3. Add your Gemini API Key

Open the app, click the ⚙️ Settings icon in the top-right, and paste your Gemini API key.

Get a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### 4. Start chatting!

## Build for production

```bash
npm run build
```

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — fast build tooling
- **Tailwind CSS** — utility-first styling
- **@google/generative-ai** — Gemini API SDK
- **react-markdown** + **remark-math** + **rehype-mathjax** — markdown & math rendering
- **rehype-highlight** + **highlight.js** — syntax highlighting
- **lucide-react** — icons

## Models Supported

| Model | Notes |
|---|---|
| `gemini-2.5-flash` | Recommended — fast, thinking support |
| `gemini-2.5-pro` | Most capable |
| `gemini-2.0-flash` | Fast and efficient |
| `gemini-1.5-flash` | Stable, widely available |
| `gemini-1.5-pro` | High capability |
