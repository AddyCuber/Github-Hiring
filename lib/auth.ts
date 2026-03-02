import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"

const placeholderMode = process.env.NEXT_PUBLIC_PLACEHOLDER_MODE === "true"
const hasGithubProvider = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    ...(hasGithubProvider
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
            authorization: {
              params: {
                scope: "read:user read:sponsors"
              }
            }
          })
        ]
      : []),
    ...(placeholderMode || !hasGithubProvider
      ? [
          CredentialsProvider({
            id: "demo",
            name: "Demo Account",
            credentials: {},
            async authorize() {
              return {
                id: "1001",
                name: "Demo Maintainer",
                email: "demo@sponsorsrank.dev"
              }
            }
          })
        ]
      : [])
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token
        if (account.provider === "demo") {
          token.accessToken = "placeholder-access-token"
          token.githubId = 1001
        }
      }
      if (profile && "id" in profile) {
        token.githubId = Number(profile.id)
      }
      if (!token.githubId && user?.id) {
        token.githubId = Number(user.id)
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined
      session.githubId = typeof token.githubId === "number" ? token.githubId : undefined
      return session
    }
  }
}
