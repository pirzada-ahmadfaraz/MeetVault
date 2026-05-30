import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

// Only register a provider when its credentials are actually present.
// This keeps the app from crashing with "client_id is required" when
// OAuth hasn't been configured yet — add the keys to .env.local to enable.
const providers: NextAuthOptions['providers'] = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )
}

const handler = NextAuth({
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // Bridge the OAuth identity into our backend (creates/links the user, returns a JWT)
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/oauth`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                provider: account.provider,
                providerId: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
              }),
            }
          )
          if (response.ok) {
            const data = await response.json()
            token.backendToken = data.data.token
            token.refreshToken = data.data.refreshToken
            token.userId = data.data.user._id
          }
        } catch (error) {
          console.error('Failed to register/login user with backend:', error)
        }
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string
        session.provider = token.provider as string
        session.backendToken = token.backendToken as string
        session.refreshToken = token.refreshToken as string
        session.userId = token.userId as string
      }
      return session
    },
    async signIn() {
      return true
    },
  },
  pages: { signIn: '/auth/login' },
  session: { strategy: 'jwt' },
})

export { handler as GET, handler as POST }
