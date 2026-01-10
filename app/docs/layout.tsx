import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/docs/base-options";
import { getSource } from "@/lib/source";
import { Body } from "./layout.client";
import { auth, getAccessToken } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { BagelLogo } from "@/lib/meta";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  let session: Session | null = null;

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
        nav={{
          title: (
            <span className="inline-flex flex-row items-center gap-3 pb-2 [aside_&]:-ms-1.5">
              <BagelLogo className="size-6" />
              <span className="font-semibold">Drive Docs</span>
            </span>
          ),
        }}
        sidebar={{
          prefetch: false,
        }}
      >
        {children}
      </DocsLayout>
    </Body>
  );
}
