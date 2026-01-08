import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { getSource } from "@/lib/source";
import { baseOptions } from "@/app/docs/base-options";
import { Body } from "./layout.client";

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
