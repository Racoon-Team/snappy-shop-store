const runtimeCaching = require("next-pwa/cache");
const nextTranslate = require("next-translate-plugin");

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest\.json$/],
  scope: "/",
  sw: "service-worker.js",
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  reactStrictMode: true,

  // ✅ ESLint config
  eslint: {
    // Set to false to enforce linting during builds (recommended)
    ignoreDuringBuilds: false,
    // Optional: you can specify dirs to lint
    // dirs: ["pages", "components", "lib", "utils"],
  },

  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  ...nextTranslate(),
});