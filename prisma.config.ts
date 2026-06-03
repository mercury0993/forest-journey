import { defineConfig } from "prisma";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    directory: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
