import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma with custom output (src/generated/prisma) needs explicit tracing on Vercel.
  // https://pris.ly/d/file-tracing-not-found / https://github.com/prisma/prisma/issues/26966
  // Prisma 6 uses library engine (libquery_engine-rhel-openssl-3.0.x.so.node) loaded at runtime
  // via @prisma/client/runtime/library.mjs — Next's nft must copy it, hence tracing.
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    // "/*" is the documented fix for custom output on Vercel. Add "/**/*" as safety for
    // App Router lambdas (e.g. /api/auth/[...nextauth]) which each get their own trace.
    "/*": ["./src/generated/prisma/**/*"],
    "/**/*": ["./src/generated/prisma/**/*"],
  },
  // Next 16 defaults to Turbopack. The PrismaPlugin is webpack-only, so we keep Turbopack
  // enabled and rely on tracing + serverExternalPackages. If someone builds with
  // --webpack, the plugin fallback below still runs.
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");
        config.plugins = [...(config.plugins ?? []), new PrismaPlugin()];
      } catch {
        // plugin optional — tracing is the primary fix
      }
    }
    return config;
  },
};

export default nextConfig;
