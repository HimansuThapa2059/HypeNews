import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/db";
import { sendMail } from "./sendMail";
import { createAuthMiddleware } from "better-auth/api";
import { passwordSchema } from "@/validations/auth.validation";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  trustedOrigins: ["http://localhost:3000"],
  socialProviders: {
    google: {
      clientId: process.env["GOOGLE_CLIENT_ID"]!,
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
    },
    github: {
      clientId: process.env["GITHUB_CLIENT_ID"]!,
      clientSecret: process.env["GITHUB_CLIENT_SECRET"]!,
    },
  },

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset your password",
        text: `Please reset your password by clicking this link: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    expiresIn: 60 * 60,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Verify your email address",
        text: `Please verify your email by clicking this link: ${url}}`,
      });
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      // Email/password login
      "/sign-in/email": {
        window: 60,
        max: 5,
      },

      //  Username login
      "/sign-in/username": {
        window: 60,
        max: 5,
      },

      // Sign-up — prevent bot/fake account creation
      "/sign-up": {
        window: 60 * 10,
        max: 3,
      },

      // Send password reset email — prevent email spam & abuse
      "/reset-password": {
        window: 60 * 60,
        max: 3,
      },

      //  Send email verification — prevent repeated spamming
      "/send-verification-email": {
        window: 60 * 60, // 1 hour
        max: 3,
      },
    },
  },
  advanced: {
    useSecureCookies: false,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === "/sign-up/email" ||
        ctx.path === "/reset-password" ||
        ctx.path === "/change-password"
      ) {
        const password = ctx.body.password || ctx.body.newPassword;

        const { error } = passwordSchema.safeParse(password);

        if (error) {
          throw new APIError("BAD_REQUEST", {
            message: "Password is not strong enough",
          });
        }
      }
    }),
  },
  plugins: [],
});
