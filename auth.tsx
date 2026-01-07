// auth.tsx
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const {
  handlers,
  auth, // used server-side to read the session
  signIn,
  signOut,
} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/drive.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,

  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Prefer the AccessToken shape for downstream Drive calls
      (session as any).AccessToken = token.accessToken ?? null;
      (session as any).accessToken = token.accessToken ?? null;
      return session;
    },
  },
});

export { auth, signIn, signOut };
export const { GET, POST } = handlers;