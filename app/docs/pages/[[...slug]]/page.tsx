import { createMdxComponents } from "@/components/mdx";
import { getSource, isLocal } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
  DocsCategory,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";

export const revalidate = 7200;

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const source = await getSource();
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  let content = await page.data.load();

  if (content.source) {
    const sourcePage = source.getPage(content.source.split("/"));

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
          <DocsCategory page={page} from={source} />
        )}
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams(): Promise<{ slug?: string[] }[]> {
  if (!isLocal) return [];
  const source = await getSource();
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const source = await getSource();
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
  };
}
