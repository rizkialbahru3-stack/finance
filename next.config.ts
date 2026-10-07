import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Aplikasi CRUD dinamis (SQLite per-request): jangan aktifkan cacheComponents. */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
