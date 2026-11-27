import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { organization } from "better-auth/plugins";

import { db } from "@/db";

import {
  ac,
  owner,
  admin,
  dispatcher,
  driver,
} from "@/lib/permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  plugins: [
    organization({
      ac,
      roles: {
        owner,
        admin,
        dispatcher,
        driver,
      },
    }),
  ],

trustedOrigins: [
  "http://localhost:3000",
  "https://routesync-two.vercel.app",
  process.env.BETTER_AUTH_URL!,
  process.env.NEXT_PUBLIC_APP_URL!,
],
});