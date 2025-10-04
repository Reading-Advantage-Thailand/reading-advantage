import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Cloud SQL connection pooling configuration
    // Helps prevent connection exhaustion in serverless environments
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Graceful shutdown for Cloud Run
if (process.env.NODE_ENV === "production") {
  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
