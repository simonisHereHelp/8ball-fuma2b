import { signIn, signOut } from "@/auth";

export function AuthButtons({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (isAuthenticated) {
    return (
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="rounded-full border px-6 py-2.5 text-sm font-medium"
        >
          Sign out
        </button>
      </form>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="rounded-full bg-fd-primary px-6 py-2.5 text-sm font-medium text-fd-primary-foreground"
      >
        Sign in with Google
      </button>
    </form>
  );
}
