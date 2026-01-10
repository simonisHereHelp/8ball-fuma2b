## 新的main2026


Add app/api/docs/assets/[...path]/route.ts with a GET handler that resolves Drive folder/file IDs using the Drive API and streams file contents with proper auth and caching.
Introduce getAccessToken(session) in auth.tsx and switch lib/sources/drive.ts and the new assets route to use this helper instead of duplicated token logic.
Update components/mdx.tsx to add resolveImageSrc, change createMdxComponents to accept { isAppRouter, filePath }, and provide an img component that rewrites relative image URLs to /api/docs/assets/....
Make app/docs/layout.tsx dynamic and server-side by calling getSource() and render the DocsLayout; remove the previous client-only layout file and update page components to pass filePath and isAppRouter to MDX components.
Add a short README.md snippet showing example GET handler and Page signatures for route handlers.
Moved the access token helper into auth.tsx to keep authentication logic centralized and updated Drive imports to use it from auth.

Updated the docs asset route to pull getAccessToken directly from @/auth for consistency.

### Route handler signatures (Next.js 15+)

```ts
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {}
```

```ts
export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {}
```

## fetch(url?alt=media)
The asset proxy route calls fetch(\${driveBaseUrl}/${fileId}?alt=media`), then returns the response body as an image response, which only works because alt=media` returns the file contents.

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
