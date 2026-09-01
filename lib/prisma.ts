import { PrismaClient } from "@prisma/client";

// Ensure DATABASE_URL uses the reliable direct Neon connection endpoint
function getSanitizedDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes("-pooler.")) {
    url = url.replace("-pooler.", ".");
  }
  if (url.includes("&channel_binding=require")) {
    url = url.replace("&channel_binding=require", "");
  } else if (url.includes("channel_binding=require&")) {
    url = url.replace("channel_binding=require&", "");
  }
  return url;
}

const sanitizedUrl = getSanitizedDatabaseUrl();
if (sanitizedUrl) {
  process.env.DATABASE_URL = sanitizedUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Force create fresh client with the sanitized direct database URL
export const prisma =
  new PrismaClient({
    datasources: sanitizedUrl ? { db: { url: sanitizedUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
