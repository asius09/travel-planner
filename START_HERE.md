# Start Here

Run from the intended project directory, after checking for existing work.

```bash
pwd
ls -la
git status --short --branch 2>/dev/null || true
node --version
pnpm --version || corepack pnpm --version
gh auth status
```

Then paste `INITIAL_BUILD_PROMPT.md` into your coding agent with access to the project folder and terminal.

The agent must create or verify the GitHub repository, run the UI Taste and Apple/iOS design skill setup, configure REA if available, initialize the pnpm monorepo, install compatible Expo packages, build the Hono backend, and verify the first commit before implementing features.

Do not put actual credentials in chat or source control. Populate local `.env` from `.env.example`, then configure deployment secrets in the host dashboard.
