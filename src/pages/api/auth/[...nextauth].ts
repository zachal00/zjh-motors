import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin", // Redirect to /admin for sign-in
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and other data to the JWT on first sign in
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile?.id;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, such as an access_token from a provider.
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      return session;
    },
  },
};

export default NextAuth(authOptions);