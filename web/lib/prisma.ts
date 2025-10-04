import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

// Check if DATABASE_URL is a placeholder (used during build)
const isPlaceholder = process.env.DATABASE_URL?.includes("placeholder");
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

// During build time with placeholder, create a mock Prisma client
// This prevents errors when Next.js tries to pre-render pages during build
export const prisma: PrismaClient =
  globalForPrisma.prisma ||
  (() => {
    if ((isPlaceholder || isBuildTime) && typeof window === "undefined") {
      // Return a proxy that throws informative errors if used during build
      return new Proxy({} as PrismaClient, {
        get: (target, prop) => {
          if (prop === "$disconnect" || prop === "$connect") {
            return async () => {}; // No-op for lifecycle methods
          }
          console.warn(`⚠️  Prisma client accessed during build time: ${String(prop)}`);
          // Return empty results for build-time queries
          return () => Promise.resolve(null);
        },
      });
    }
    
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      // Cloud SQL connection pooling configuration
      // Helps prevent connection exhaustion in serverless environments
    });
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Graceful shutdown for Cloud Run
if (process.env.NODE_ENV === "production" && !isPlaceholder && !isBuildTime) {
  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
