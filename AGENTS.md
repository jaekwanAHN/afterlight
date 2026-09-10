<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Workflow

Every code change, no matter how small, follows this sequence:

1. **Issue first** — `gh issue create` describing the goal and scope before touching code. Ask the user only when the scope is genuinely ambiguous.
2. **Branch per issue** — branch off up-to-date `main` as `<type>/<short-slug>` (`feat/`, `fix/`, `refactor/`, `chore/`). Never commit directly to `main`.
3. **Verify before commit** — `npm run typecheck`, `npm run lint`, `npm test` must pass.
4. **PR with details** — `gh pr create` with a body that explains what changed and why, section by section when several concerns are mixed; include `Closes #<issue>` so the issue closes on merge.
5. **Never merge the PR yourself.** The user tests the branch on the local dev server and merges on GitHub. Hand over the PR link and stop. After the user reports the merge, run `git checkout main && git pull` and delete the local branch before starting the next task.

Commit messages: conventional prefix (`feat:`, `fix:`, …), imperative summary, body explaining the reasoning when it's not obvious from the diff.
