import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { getSource } from "@/lib/source";
import { baseOptions } from "@/app/docs/base-options";
import { Body } from "./layout.client";

export const dynamic = "force-dynamic";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  console.info("[docs-layout] Building docs layout.");
  const source = await getSource();
  console.info("[docs-layout] Loaded source for page tree.");
  return (
    <Body>
      <DocsLayout
        tree={source.pageTree}
        {...baseOptions}
        sidebar={{
          prefetch: false,
        }}
      >
        {children}
      </DocsLayout>
    </Body>
  );
}
