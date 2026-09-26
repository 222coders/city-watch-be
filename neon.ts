import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true,
  buckets: {
    "city-watch-reports": { access: "public_read" },
  },
});
