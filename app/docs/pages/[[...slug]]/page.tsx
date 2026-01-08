import { createMdxComponents } from "@/components/mdx";
import { getSource, isLocal } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
  DocsCategory,
} from "fumadocs-ui/page";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 7200;
export const dynamic = "force-dynamic";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const docsSource = await getSource();
  const params = await props.params;
  const page = docsSource.getPage(params.slug);
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

  if (content.source) {
    const sourcePage = docsSource.getPage(content.source.split("/"));

    if (!sourcePage)
      throw new Error(
        `unresolved source in frontmatter of ${page.file.path}: ${content.source}`,
      );
    content = await sourcePage.data.load();
  }

  const MdxContent = content.body;

  return (
    <DocsPage toc={content.toc} full={content.full}>
      <DocsTitle>{content.title}</DocsTitle>
      <DocsDescription>{content.description}</DocsDescription>
      <DocsBody>
        <MdxContent
          components={createMdxComponents(params.slug?.[0] === "app")}
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
  const page = docsSource.getPage(params.slug);
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
