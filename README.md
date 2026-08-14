# EduPilot — Full-Stack Secure Version

## Project structure

```text
edupilot-fullstack/
├── index.html
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Run locally

1. Install Node.js 18+.
2. Copy `.env.example` to `.env`.
3. Put your AI provider key in `.env`:

```env
ANTHROPIC_API_KEY=your_real_key
```

4. Install dependencies:

```bash
npm install
```

5. Start:

```bash
npm start
```

6. Open:

```text
http://localhost:3000
```

## Security

- The API key is read only by `server.js`.
- The frontend calls `/api/ai`; it never contains the secret.
- `.env` is ignored by Git.
- Never commit `.env` or paste the secret into `index.html`.
- Use HTTPS and restrict `FRONTEND_ORIGIN` in production.
- Add authentication/rate limiting before exposing the AI endpoint publicly.
