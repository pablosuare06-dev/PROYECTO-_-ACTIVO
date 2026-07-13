# AGENTS.md

## Project Context

This is a standalone React + Vite application. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup and environment variables.

## Key Files

- `src/`: frontend application source.
- `src/api/apiClient.js`: frontend API client (fetch-based) and auth helpers.
- `vite.config.js`: Vite config.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `npm run dev` for local development.
- Configure the backend URL via `VITE_API_BASE_URL` in `.env.local`.
- Run the relevant checks from `package.json` before finishing code changes.
