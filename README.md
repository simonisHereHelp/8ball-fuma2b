## 新的main2026

原始
https://github.com/fuma-nama/nextjs-fumadocs.git

### Preview in Development Mode

This example fetches content from Next.js repo using GitHub API, make sure to put your GitHub token in `.env.local` in `GITHUB_TOKEN` variable.

You can also preview content locally with:

```bash
pnpm sync:docs
pnpm dev:local
```

This will clone the Next.js repo using Git Submodules (`git submodule update --init`).
`dev:local` command will preview the docs using local file system instead of GitHub API.

### ISR in Production Mode

```bash
pnpm build
```

For production build, it clones the docs content from `vercel/next.js` repo, and pre-render them locally. Vercel supports Git Submodules by default, hence no further configurations are needed.

Once deployed/started in production mode, it will instead use GitHub API to fetch the latest docs content, no need to re-trigger another build for new content updates.

### Unicode filename normalization (NFC vs NFD)

Some filenames with non-ASCII characters can be represented by multiple Unicode sequences (e.g. composed NFC vs decomposed NFD). Browsers and storage providers may normalize differently, which can lead to route lookup mismatches and 404s if the stored slug and the incoming URL segments are in different forms. This project normalizes doc slugs to NFC during page-tree generation and when resolving route params so filenames remain consistent and routable.
