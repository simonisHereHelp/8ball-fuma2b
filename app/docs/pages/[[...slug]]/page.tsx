import { createMdxComponents } from "@/components/mdx";
import { getSource, isLocal, normalizeRouteSegments } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
  DocsCategory,
} from "fumadocs-ui/page";
import type { Page } from "fumadocs-core/source";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 7200;
export const dynamic = "force-dynamic";

const getOrderedPages = (pages: Page[]) => {
  const withOrder = pages
    .map((item) => ({ item, order: getPageTreeNo(item) }))
    .filter((entry) => entry.order !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((entry) => entry.item);

  return withOrder.length > 0 ? withOrder : pages;
};

const toFooterItem = (item?: Page) =>
  item
    ? {
        name: item.data.title,
        url: item.url,
      }
    : undefined;

const getPageTreeNo = (page: Page) => {
  const pageData = page.data as { pageTreeNo?: number };
  return pageData.pageTreeNo ?? null;
};

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const docsSource = await getSource();
  const params = await props.params;
  const slug = normalizeRouteSegments(params.slug);
  const page = docsSource.getPage(slug);
  if (!page) {
    if (!params.slug) {
      const pages = getOrderedPages(docsSource.getPages());

      return (
        <DocsPage toc={[]} full>
          <DocsTitle>Docs</DocsTitle>
          <DocsDescription>Browse the available documents.</DocsDescription>
          <DocsBody>
            <ul className="space-y-2">
              {pages.map((item) => (
                <li key={item.url}>
                  <Link
                    className="text-fd-primary underline-offset-4 hover:underline"
                    href={item.url}
                  >
                    {item.data.title}
                  </Link>
                </li>
              ))}
            </ul>
          </DocsBody>
        </DocsPage>
      );
    }

    notFound();
  }

  let content = await page.data.load();
  console.info("[docs-page] Loaded page content.", page.file.path);
  let renderFilePath = page.file.path;

  if (content.source) {
    const sourcePage = docsSource.getPage(content.source.split("/"));

    if (!sourcePage)
      throw new Error(
        `unresolved source in frontmatter of ${page.file.path}: ${content.source}`,
      );
    content = await sourcePage.data.load();
    console.info("[docs-page] Loaded source content.", sourcePage.file.path);
    renderFilePath = sourcePage.file.path;
  }

  const MdxContent = content.body;
  const orderedPages = getOrderedPages(docsSource.getPages());
  const totalItems = orderedPages.length;
  const currentIndex = orderedPages.findIndex((item) => item.url === page.url);
  const previousIndex =
    totalItems > 0 && currentIndex >= 0
      ? currentIndex - 1 < 0
        ? totalItems - 1
        : currentIndex - 1
      : -1;
  const nextIndex =
    totalItems > 0 && currentIndex >= 0
      ? currentIndex + 1 >= totalItems
        ? 0
        : currentIndex + 1
      : -1;
  const previous = previousIndex >= 0 ? orderedPages[previousIndex] : undefined;
  const next = nextIndex >= 0 ? orderedPages[nextIndex] : undefined;

  return (
    <DocsPage
      toc={content.toc}
      full={content.full}
      footer={{
        items: {
          previous: toFooterItem(previous),
          next: toFooterItem(next),
        },
      }}
    >
      <DocsTitle>{content.title}</DocsTitle>
      <DocsBody>
        <MdxContent
          components={createMdxComponents({
            isAppRouter: params.slug?.[0] === "app",
            filePath: renderFilePath,
          })}
        />
        {page.file.name === "index" && (
          <DocsCategory page={page} from={docsSource} />
        )}
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams(): Promise<{ slug?: string[] }[]> {
  if (!isLocal) return [];
  const docsSource = await getSource();
  return docsSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const docsSource = await getSource();
  const params = await props.params;
  const slug = normalizeRouteSegments(params.slug);
  const page = docsSource.getPage(slug);
  if (!page) {
    if (!params.slug) {
      return {
        title: "Docs",
      };
    }
    notFound();
  }

  return {
    title: page.data.title,
  };
}
