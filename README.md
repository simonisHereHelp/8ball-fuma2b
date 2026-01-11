## 新的main2026

成功：
1）Drive Assets -> fetch(?alt=media) -> docs/pages/ + docs/pages/assets (這是proxy）
···
fetch(url?alt=media)
The asset proxy route calls fetch(\${driveBaseUrl}/${fileId}?alt=media`), then returns the response body as an image response, which only works because alt=media` returns the file contents.
···

2）components/mdx.tsx： resolveImageSrc （可以是 Drive 本地，也可以是 HTTPs）中文+英文都可以
3) docs route (如果含中文）需要在做 percent segment(因爲slugKey？）, 否則在browser 會出現404。
4）assets route: 未經NFC 或是 dash variant標準化，也無需 percent segment, 不會出現404.
```
圖片源: 本地或http, 英文或中文 都可以
![./local_image.png](./local_image.png)

![./卡片.jpg](./卡片.jpg)

![http_FSU.edu](https://people.sc.fsu.edu/~jburkardt/data/jpg/vt_logo2.jpg)

![http_oxxostuido.tw](https://www.oxxostudio.tw/img/articles/201405/about-me.jpg)
```

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

## Why [[...slug]]
The docs route uses `[[...slug]]` so the same page can render both the docs index (`/docs/pages`) and nested document paths (`/docs/pages/...`). The double brackets make the slug optional, which avoids needing a separate index route.

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
