import { auth } from "@/auth";
import { AuthButtons } from "@/components/auth-buttons";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-xl font-semibold">我的文件啊</h1>
      <p className="text-fd-muted-foreground mb-6 max-w-xl mx-auto">
        Sign in with Google to access.
      </p>
      <AuthButtons isAuthenticated={Boolean(session)} />
      {session ? (
        <div className="mt-6 flex justify-center">
          <Link
            href="/docs/pages"
            className="inline-flex items-center justify-center rounded-full border border-fd-border px-4 py-2 text-sm font-medium text-fd-foreground transition-colors hover:border-fd-accent hover:text-fd-accent-foreground"
          >
            View docs
          </Link>
        </div>
      ) : null}
    </main>
  );
}
