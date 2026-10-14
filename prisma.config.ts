import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Keep in sync with src/lib/db.ts (same default, single env override).
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
