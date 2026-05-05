import { PrismaClient } from "@prisma/client";

declare global {
  var __beautyShelfPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__beautyShelfPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__beautyShelfPrisma = prisma;
}
