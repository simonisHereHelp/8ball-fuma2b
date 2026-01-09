import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/docs/base-options";
import { getSource } from "@/lib/source";
import { Body } from "./layout.client";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  const source = await getSource();
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
