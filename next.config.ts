import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix Prisma custom output on Vercel: ensure libquery_engine-rhel-openssl-3.0.x.so.node is traced
  // https://pris.ly/d/file-tracing-not-found / https://github.com/prisma/prisma/issues/23084
  outputFileTracingIncludes: {
    "/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
