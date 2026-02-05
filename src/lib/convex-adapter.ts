import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from "next-auth/adapters";

const getConvexClient = () => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }
  return new ConvexHttpClient(url);
};

export function ConvexAdapter(): Adapter {
  const convex = getConvexClient();
  return {
    async createUser(user) {
      const userId = await convex.mutation(api.auth.createUser, {
        name: user.name!,
        email: user.email!,
        password: null,
        emailVerified: user.emailVerified?.toISOString() || null,
        image: user.image || null,
      });
      return {
        id: userId,
        name: user.name!,
        email: user.email!,
        emailVerified: user.emailVerified || null,
        image: user.image || null,
      } as AdapterUser;
    },
    async getUser(id) {
      const user = await convex.query(api.auth.getUserById, { id: id as any });
      if (!user) return null;
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        image: user.image,
      } as AdapterUser;
    },
    async getUserByEmail(email) {
      const user = await convex.query(api.auth.getUserByEmail, { email });
      if (!user) return null;
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        image: user.image,
      } as AdapterUser;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await convex.query(api.auth.getAccountByProvider, {
        provider,
        providerAccountId,
      });
      if (!account) return null;
      const user = await convex.query(api.auth.getUserById, {
        id: account.userId as any,
      });
      if (!user) return null;
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        image: user.image,
      } as AdapterUser;
    },
    async updateUser(user) {
      await convex.mutation(api.auth.updateUser, {
        id: user.id as any,
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        emailVerified: user.emailVerified?.toISOString(),
        image: user.image ?? undefined,
      });
      const updated = await convex.query(api.auth.getUserById, {
        id: user.id as any,
      });
      if (!updated) throw new Error("User not found");
      return {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        emailVerified: updated.emailVerified ? new Date(updated.emailVerified) : null,
        image: updated.image,
      } as AdapterUser;
    },
    async linkAccount(account) {
      const sessionState =
        typeof account.session_state === "string" ? account.session_state : null;

      await convex.mutation(api.auth.createAccount, {
        userId: account.userId as any,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token || null,
        access_token: account.access_token || null,
        expires_at: account.expires_at || null,
        token_type: account.token_type || null,
        scope: account.scope || null,
        id_token: account.id_token || null,
        session_state: sessionState,
      });
    },
    async createSession({ sessionToken, userId, expires }) {
      const sessionId = await convex.mutation(api.auth.createSession, {
        userId: userId as any,
        sessionToken,
        expires: expires.getTime(),
      });
      const session = await convex.query(api.auth.getSessionByToken, {
        sessionToken,
      });
      if (!session) throw new Error("Session not found");
      return {
        id: session._id,
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: new Date(session.expires),
      } as AdapterSession;
    },
    async getSessionAndUser(sessionToken) {
      const session = await convex.query(api.auth.getSessionByToken, {
        sessionToken,
      });
      if (!session) return null;
      const user = await convex.query(api.auth.getUserById, {
        id: session.userId as any,
      });
      if (!user) return null;
      return {
        session: {
          id: session._id,
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: new Date(session.expires),
        } as AdapterSession,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          image: user.image,
        } as AdapterUser,
      };
    },
    async updateSession({ sessionToken, expires }) {
      if (!expires) {
        return null;
      }
      const session = await convex.query(api.auth.getSessionByToken, {
        sessionToken,
      });
      if (!session) return null;
      await convex.mutation(api.auth.createSession, {
        userId: session.userId as any,
        sessionToken,
        expires: expires.getTime(),
      });
      const updated = await convex.query(api.auth.getSessionByToken, {
        sessionToken,
      });
      if (!updated) return null;
      return {
        id: updated._id,
        sessionToken: updated.sessionToken,
        userId: updated.userId,
        expires: new Date(updated.expires),
      } as AdapterSession;
    },
    async deleteSession(sessionToken) {
      const session = await convex.query(api.auth.getSessionByToken, {
        sessionToken,
      });
      if (session) {
        await convex.mutation(api.auth.deleteSession, { id: session._id });
      }
    },
    async createVerificationToken({ identifier, expires, token }) {
      const tokenId = await convex.mutation(api.auth.createVerificationToken, {
        identifier,
        token,
        expires: expires.getTime(),
      });
      const verificationToken = await convex.query(
        api.auth.getVerificationTokenByToken,
        { token },
      );
      if (!verificationToken) throw new Error("Verification token not found");
      return {
        id: verificationToken._id,
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: new Date(verificationToken.expires),
      } as VerificationToken;
    },
    async useVerificationToken({ identifier, token }) {
      const verificationToken = await convex.query(
        api.auth.getVerificationTokenByToken,
        { token },
      );
      if (!verificationToken || verificationToken.identifier !== identifier) return null;
      await convex.mutation(api.auth.deleteVerificationToken, {
        id: verificationToken._id,
      });
      return {
        id: verificationToken._id,
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: new Date(verificationToken.expires),
      } as VerificationToken;
    },
  };
}
