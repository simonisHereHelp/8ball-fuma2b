import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { getSource } from "@/lib/source";
import { baseOptions } from "@/app/docs/base-options";
import { Body } from "./layout.client";
import { BoxIcon } from "lucide-react";

export default async function Layout({ children }: { children: ReactNode }) {
  const source = await getSource();
  return (
    <Body>
      <DocsLayout
        tree={source.pageTree}
        {...baseOptions}
        sidebar={{
          prefetch: false,
          tabs: [
            {
              title: "Bagel Docs",
              description: "documentation systm",
              icon: (
                <span className="border border-blue-600/50 bg-gradient-to-t from-blue-600/30 rounded-lg p-1 text-blue-600">
                  <BoxIcon />
                </span>
              ),
              url: "/docs/pages",
            },
            {
              title: "Page 2",
              description: "Features available in /pages",
              icon: (
                <span className="border purple-blue-600/50 bg-gradient-to-t from-purple-600/30 rounded-lg p-1 text-purple-600">
                  <BoxIcon />
                </span>
              ),
              url: "/docs/gallery",
            },
          ],
        }}
      >
        {children}
      </DocsLayout>
    </Body>
  );
}
