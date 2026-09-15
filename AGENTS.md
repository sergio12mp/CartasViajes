# CartasViajes

- Use English for code and comments, Spanish for UI and errors.
- Never print or commit secrets or `.env` files. Never push; the user publishes.
- Keep Prisma changes additive. Use `prisma db push`; do not delete production data.
- Keep game rules pure in `src/lib/game/` and cover their branches with tests.
- Authenticate and authorize every page and mutation on the server.
- Keep writes transactional, with conditional updates and count checks.
- After each phase run `npx prisma validate`, `npm run lint`, `npm test`, and `npm run build`.
