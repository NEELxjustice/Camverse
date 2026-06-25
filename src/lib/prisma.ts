import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined;
};

let prismaInstance: PrismaClient | null = null;

try {
  // Only attempt to construct Prisma if a database URL seems valid/present in environment
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes("randompassword")) {
    prismaInstance = globalForPrisma.prisma ?? new PrismaClient();
  } else {
    console.warn("Prisma: DATABASE_URL is a placeholder. Prisma client will not start.");
  }
} catch (e) {
  console.warn("Prisma client failed to construct during build/init:", e);
}

export const prisma = prismaInstance;

if (prismaInstance && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaInstance;
}

