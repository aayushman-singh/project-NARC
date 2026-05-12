# Tattletale

Social media feed parser built for investigators — automates capture, documentation, and OSINT enrichment across Instagram, Twitter/X, WhatsApp, Telegram, and more. Smart India Hackathon '24 winner. Deployed by the National Investigation Agency (NIA), Government of India.

> ⚠️ **Teaching repository.** This codebase is published for learners studying OSINT pipelines, multi-platform scrapers, and forensic data workflows. The production deployment runs on a private fork with credentials managed via a secrets vault. The public version ships with `.example.json` shims so you can wire your own credentials safely.

[![License](https://img.shields.io/badge/License-MIT-c8693d?style=flat)](LICENSE) [![Status](https://img.shields.io/badge/SIH%20'24-Winner-1f6feb?style=flat)](https://www.sih.gov.in/)

---

## Why

Manual evidence capture is error-prone and slow. Investigators spend hours screenshotting posts, transcribing handles, and chasing cross-platform identities. Tattletale automates that loop — point it at a target, get a structured report with timeline, location signals, contact graph, and OSINT enrichment. Built so investigators can spend time on the case, not the clicks.

## Features

- **Multi-platform scraping** — Instagram, Twitter/X, WhatsApp, Telegram, Facebook, Discord, Mastodon
- **OSINT integration** — Maigret-based username enrichment across 2,500+ sites
- **Timeline + location capture** — geo + temporal tagging where available
- **Secure storage** — encrypted at rest, optional Google Drive or blockchain upload
- **AI/ML analysis** — entity extraction, visualization, actionable insights
- **Cross-platform** — web app + standalone Windows/Android clients

## Flowchart

<img src="./Readme Section Flowchart.png" alt="Architecture flowchart"/>

## Stack

**Backend** — Node.js · Python 3.10.15 · Express · MongoDB · Mongoose · bcrypt · JWT
**Scraping** — TypeScript · Crawlee · Playwright · Telethon · Puppeteer
**Frontend** — React · Flutter · Tailwind CSS
**OSINT** — Maigret integration
**Storage** — MongoDB · Google Drive (optional) · Blockchain (optional)

## Setup

### Prerequisites

| Tool | Version |
| --- | --- |
| Node.js | 22.11.0 |
| Python | 3.10.15 |
| npm | latest |
| pip | latest |

### Install

```bash
git clone https://github.com/aayushman-singh/project-NARC.git
cd project-NARC

# Python virtual environment (recommended)
python -m venv venv
# Activate:
#   Windows:  .\venv\Scripts\activate
#   Unix/Mac: source venv/bin/activate

# Install Python deps
pip install --upgrade pip
pip install -r requirements.txt

# Install Node deps
npm install
cd scraper && npm install && cd ..
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### Credentials

This repo ships with **example/shim files** showing the expected format. Copy them, fill in your own credentials, and rename:

```bash
cp drive_token.example.json drive_token.json
cp google.example.json google.json
cp token.example.json token.json
```

| Shim file | What it represents | Where to get it |
| --- | --- | --- |
| `drive_token.example.json` | Google Drive OAuth refresh token | OAuth flow against your GCP project |
| `google.example.json` | Google OAuth client config | `console.cloud.google.com` → APIs & Services → Credentials → OAuth 2.0 Client IDs |
| `token.example.json` | Gmail OAuth token | OAuth flow with Gmail scopes |

**Telegram sessions** — see [SESSIONS.md](SESSIONS.md). Generate per-phone `.session` files via the Telegram login flow. **Never commit them.**

### Run

```bash
# Backend
cd backend && npm run dev

# Scraper (separate terminal)
cd scraper && npm run dev

# Frontend (separate terminal)
cd frontend && npm run dev
```

## Project structure

```
project-NARC/
├── backend/                Node.js + Express API
├── scraper/                TypeScript scrapers (Crawlee + Playwright)
│   └── src/Helpers/        Per-platform helpers (Telegram, WhatsApp, etc.)
├── frontend/               React + Tailwind dashboard
├── *.example.json          Credential shims (copy → rename → fill)
├── SESSIONS.md             How Telegram .session files work
├── requirements.txt        Python deps
└── package.json            Root deps
```

## Security notes

- **No live credentials are committed.** Shim files use `YOUR_*` placeholders.
- **`.session` files are gitignored.** Telegram auth keys must never be committed.
- **`server.log` is gitignored.** Logs can leak request paths, IPs, user identifiers.
- If you fork this repo, replace **all** example credentials with your own. Don't ship the example values to production.
- For a leaked-secret incident response checklist, see [SESSIONS.md](SESSIONS.md#if-a-session-leaks).

## License

MIT — see [LICENSE](LICENSE).

## Recognition

- **Smart India Hackathon 2024 — Winner** (National Investigation Agency track)
- Deployed by the **National Investigation Agency**, Government of India

## Author

Built by [Aayushman Singh](https://aayushman.dev) — engineer building autonomous coding agents, decentralized storage, and surveillance-grade software.

- Portfolio — [aayushman.dev](https://aayushman.dev)
- GitHub — [@aayushman-singh](https://github.com/aayushman-singh)
- X — [@aayushman2703](https://x.com/aayushman2703)
- LinkedIn — [in/aayushman-singh-zz](https://www.linkedin.com/in/aayushman-singh-zz/)
