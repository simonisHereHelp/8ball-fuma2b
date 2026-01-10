import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/docs/base-options";
import { getSource } from "@/lib/source";
import { Body } from "./layout.client";
import { auth, getAccessToken } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  let session: Awaited<ReturnType<typeof auth>> | null = null;

  try {
    session = await auth();
  } catch (error) {
    console.error("[docs] Failed to load auth session.", error);
    redirect("/");
  }

  if (!session || !getAccessToken(session)) {
    redirect("/");
  }

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
