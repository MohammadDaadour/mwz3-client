import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
    // serverActions: {allowedOrigins: ['http://192.168.135.29']}
    serverActions: { allowedOrigins: ["http://mwz3.com", "https://mwz3.com"] },
  },
  images: {
    // remotePatterns: [{ protocol: "http", hostname: "127.0.0.1", port: "3200", pathname: "images/**" }],
    domains: ["127.0.0.1"],
  },
  env: { API_URL: process.env.NEXT_PUBLIC_API_URL },
  async rewrites() {
    return [
      { source: "/ar/facebook", destination: "http://127.0.0.1:3200/facebook" },
      { source: "/en/facebook", destination: "http://127.0.0.1:3200/facebook" },
      { source: "/ar/google", destination: "http://127.0.0.1:3200/google" },
      { source: "/en/google", destination: "http://127.0.0.1:3200/google" },
    ];
  },
};

export default withNextIntl(nextConfig);
