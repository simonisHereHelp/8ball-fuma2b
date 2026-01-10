import { createMdxComponents } from "@/components/mdx";
import { getSource, isLocal, normalizeRouteSegments } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
  DocsCategory,
} from "fumadocs-ui/page";
import type { PageTree } from "fumadocs-core/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 7200;
export const dynamic = "force-dynamic";

const collectNavItems = (nodes: PageTree.Node[]): PageTree.Item[] => {
  const list: PageTree.Item[] = [];

  for (const node of nodes) {
    if (node.type === "folder") {
      if (node.index) {
        list.push(node.index);
      }
      list.push(...collectNavItems(node.children));
      continue;
    }

    if (node.type === "page" && !node.external) {
      list.push(node);
    }
  }

  return list;
};

const toFooterItem = (item?: PageTree.Item) =>
  item
    ? {
        name: typeof item.name === "string" ? item.name : String(item.name),
        url: item.url,
      }
    : undefined;

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const docsSource = await getSource();
  const params = await props.params;
  const slug = normalizeRouteSegments(params.slug);
  const page = docsSource.getPage(slug);
  if (!page) {
    if (!params.slug) {
      const pages = docsSource.getPages();

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
  const pageTreeItems = collectNavItems(docsSource.pageTree.children);
  const totalItems = pageTreeItems.length;
  const currentIndex = pageTreeItems.findIndex((item) => item.url === page.url);
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
  const previous = previousIndex >= 0 ? pageTreeItems[previousIndex] : undefined;
  const next = nextIndex >= 0 ? pageTreeItems[nextIndex] : undefined;

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
