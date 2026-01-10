import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Link from "next/link";
import { BagelLogo } from "@/lib/meta";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <header className="flex items-center justify-center px-6 py-4">
            <Link href="/" className="inline-flex items-center">
              <BagelLogo />
            </Link>
          </header>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
