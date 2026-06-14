import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {},
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_ISSUE_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_MANTLEUSD_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_ALCHEMY_API_KEY: z.string().optional(),
    NEXT_PUBLIC_ZK_BACKEND_GENERATE_PROOF: z.string().optional(),
    NEXT_PUBLIC_ZK_BACKEND_GET_ACCESS_TOKEN: z.string().optional(),
    NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_MANTLE_RPC_URL: z.string().optional(),
    NEXT_PUBLIC_BUNDLER_RPC_URL: z.string().optional(),
    NEXT_PUBLIC_PAYMASTER_RPC_URL: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().optional(),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_ISSUE_ADDRESS: process.env.NEXT_PUBLIC_ISSUE_ADDRESS,
    NEXT_PUBLIC_MANTLEUSD_ADDRESS: process.env.NEXT_PUBLIC_MANTLEUSD_ADDRESS,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    NEXT_PUBLIC_ZK_BACKEND_GENERATE_PROOF: process.env.NEXT_PUBLIC_ZK_BACKEND_GENERATE_PROOF,
    NEXT_PUBLIC_ZK_BACKEND_GET_ACCESS_TOKEN: process.env.NEXT_PUBLIC_ZK_BACKEND_GET_ACCESS_TOKEN,
    NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    NEXT_PUBLIC_MANTLE_RPC_URL: process.env.NEXT_PUBLIC_MANTLE_RPC_URL,
    NEXT_PUBLIC_BUNDLER_RPC_URL: process.env.NEXT_PUBLIC_BUNDLER_RPC_URL,
    NEXT_PUBLIC_PAYMASTER_RPC_URL: process.env.NEXT_PUBLIC_PAYMASTER_RPC_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
