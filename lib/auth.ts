import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const validUsername = process.env.EMPLOYEE_USERNAME;
        const validPassword = process.env.EMPLOYEE_PASSWORD;

        if (
          credentials.username === validUsername &&
          credentials.password === validPassword
        ) {
          return { id: "1", name: credentials.username };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};
