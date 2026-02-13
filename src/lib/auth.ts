import { getUserByEmail } from '@/lib/users';
import type { UserStatus } from '@/models/User';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { JobSeekerModel } from '@/models/JobSeeker';
import bcrypt from 'bcryptjs';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error('Missing Google OAuth environment variables.');
}

if (!nextAuthSecret) {
  throw new Error('Missing NEXTAUTH_SECRET environment variable.');
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" }
      },
      async authorize(credentials, req) {
        // credentials will have 'identifier' from frontend, or 'email' if we stick to standard NextAuth forms.
        console.log("[Auth] Authorize called with credentials:", JSON.stringify(credentials, null, 2));

        let identifier = credentials?.email || (credentials as any)?.identifier;
        const password = credentials?.password;

        // Check for strict Job Seeker prefix from frontend
        let forceJobSeeker = false;
        if (identifier && identifier.startsWith('JOB-SEEKER-LOGIN:')) {
          console.log(`[Auth] Detected JOB-SEEKER-LOGIN prefix. Enforcing strict Job Seeker mode.`);
          identifier = identifier.replace('JOB-SEEKER-LOGIN:', '');
          forceJobSeeker = true;
        }

        const loginType = forceJobSeeker ? 'job-seeker' : ((credentials as any)?.loginType || req?.body?.loginType || (req?.query as any)?.loginType);

        console.log(`[Auth] Attempting login for: ${identifier} type: ${loginType}`);

        if (!identifier || !password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        await connectToDatabase();

        // Determine if identifier is email or phone
        // Simple check: if it contains '@', assume email. Else phone.
        let query = {};
        if (identifier.includes('@')) {
          query = { email: identifier.toLowerCase() };
        } else {
          // Assume phone, maybe strip non-digits if needed, but for now match exact or strict
          query = { phone: identifier };
        }

        let user = null;
        let isJobSeeker = false;

        if (loginType === 'job-seeker') {
          console.log(`[Auth] Strict Job Seeker Login detected for: ${identifier}`);
          user = await JobSeekerModel.findOne(query);
          isJobSeeker = true;
          if (user) {
            console.log(`[Auth] Job Seeker found in JobSeekerModel: ${user._id}`);
          } else {
            console.log(`[Auth] Job Seeker NOT found in JobSeekerModel`);
          }
        } else {
          console.log(`[Auth] Standard Login detected, querying UserModel for: ${identifier}`);
          user = await UserModel.findOne(query);
        }

        if (!user || !user.password) {
          console.log(`[Auth] User not found or no password set for: ${identifier}`);
          return null;
        }

        if (!isJobSeeker) {
          const userDoc = user as any;
          if (userDoc.category === 'Architect' && userDoc.status === 'pending') {
            console.log(`[Auth] Pending architect login blocked: ${identifier}`);
            throw new Error("ProfileUnderReview");
          }

          // Strict Admin Check for Admin Login Form
          if (loginType === 'admin') {
            if (!userDoc.isAdmin) {
              console.log(`[Auth] Blocked non-admin login attempt for: ${identifier}`);
              return null;
            }
          }
        } else {
          if ((user as any).status === 'banned') {
            throw new Error("AccountBanned");
          }
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          console.log(`[Auth] Invalid password for: ${identifier}`);
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          isJobSeeker: isJobSeeker,
        };
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const authMode = cookieStore.get('auth_mode')?.value;

        if (authMode === 'login') {
          await connectToDatabase();
          // Note: Google login currently defaults to checking UserModel. 
          // If we want Google login for Job Seekers, we'd need a way to distinguish them or check both.
          // For now, assuming Google login is primary for standard Users or handled via email check.

          const existingUser = await UserModel.findOne({ email: user.email });

          if (!existingUser) {
            // Fallback check for Job Seeker if not found in User
            const existingJobSeeker = await JobSeekerModel.findOne({ email: user.email });
            if (existingJobSeeker) return true;

            // Block login if user does not exist
            return '/auth/error?error=AccountNotFound';
          }

          if (existingUser.category === 'Architect' && existingUser.status === 'pending') {
            // Block login if architect is pending
            return '/auth/error?error=ProfileUnderReview';
          }

          if (existingUser.status === 'banned' || existingUser.status === 'rejected') {
            return `/auth/error?error=Account${existingUser.status.charAt(0).toUpperCase() + existingUser.status.slice(1)}`;
          }

          return true;
        }

        return true;
      }
      return true;
    },
    async jwt({ token, account, profile, user }) {
      try {
        if (account && profile) {
          token.googleId = profile.sub ?? account.providerAccountId;
          token.picture = (profile as any).picture;
        }

        // Pass isJobSeeker flag from authorize callback
        if (user) {
          token.isJobSeeker = (user as any).isJobSeeker;
        }

        if (!token.email) {
          return token;
        }

        // If it is explicitly a job seeker login, we fetch from JobSeekerModel
        if (token.isJobSeeker) {
          await connectToDatabase();
          const jobSeeker = await JobSeekerModel.findOne({ email: token.email });
          if (jobSeeker) {
            token.userStatus = jobSeeker.status;
            token.userCategory = 'Job Seeker';
            token.userDbId = jobSeeker._id.toString();
            token.isProfileComplete = true; // Job seekers simpler for now?
            token.isAdmin = false;
          }
          return token;
        }

        const userRecord = await getUserByEmail(token.email);
        console.log(`[JWT] Fetching user ${token.email}. DB Status: ${userRecord?.status}, Complete: ${(userRecord as any)?.isProfileComplete}`);

        token.userStatus = (userRecord?.status ?? null) as UserStatus | null;
        token.userCategory = userRecord?.category ?? null;
        token.userDbId = userRecord ? (userRecord as any)._id?.toString() ?? null : null;
        token.isProfileComplete = (userRecord as any)?.isProfileComplete ?? false;

        if (!token.googleId && userRecord?.googleId) {
          token.googleId = userRecord.googleId;
        }

        // Auto-promote specific admin email
        if (token.email === 'saumitrakulkarni4823@gmail.com' && !(userRecord as any).isAdmin) {
          await UserModel.updateOne({ email: token.email }, { isAdmin: true });
          token.isAdmin = true;
          console.log(`[JWT] Auto-promoted ${token.email} to Admin.`);
        } else {
          token.isAdmin = (userRecord as any)?.isAdmin || false;
        }

        return token;
      } catch (error) {
        console.error("JWT Callback Error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.googleId = token.googleId as string | undefined;
        session.user.status = (token.userStatus as UserStatus | null) ?? undefined;
        session.user.category = (token.userCategory as string | null) ?? undefined;
        session.user.dbId = (token.userDbId as string | null) ?? undefined;
        (session.user as any).isProfileComplete = token.isProfileComplete;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).isJobSeeker = token.isJobSeeker;
      }
      return session;
    },
  },
};
