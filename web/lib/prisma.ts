import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

// Check if DATABASE_URL is a placeholder (used during build)
const isPlaceholder = process.env.DATABASE_URL?.includes("placeholder");
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

// Construct the appropriate DATABASE_URL for the environment
function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  
  // If placeholder or build time, return placeholder
  if (isPlaceholder || isBuildTime) {
    return "postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public";
  }

  // If DATABASE_URL is already set and valid, use it
  if (dbUrl) {
    return dbUrl;
  }

  // Fallback to constructing from individual variables
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "5432";
  const database = process.env.DB_NAME || "reading_advantage_db";
  const username = process.env.DB_USER || "postgres";
  const password = process.env.DB_PASSWORD || "";
  const schema = process.env.DB_SCHEMA || "public";

  // If running on Cloud Run with Cloud SQL, use Unix socket
  if (process.env.CLOUD_SQL_CONNECTION_NAME && host.startsWith("/cloudsql")) {
    return `postgresql://${username}:${password}@/${database}?host=${host}&schema=${schema}`;
  }

  // Otherwise use TCP connection
  return `postgresql://${username}:${password}@${host}:${port}/${database}?schema=${schema}`;
}

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
    
    const databaseUrl = getDatabaseUrl();
    console.log(`🔌 Connecting to database...`);
    
    return new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
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
