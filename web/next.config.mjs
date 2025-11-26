/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["next-international", "international-types"],
  reactStrictMode: false,
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  // Skip type checking and linting during build to save memory
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        pathname: "**",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Optimize build memory usage
  swcMinify: false,
  experimental: {
    // Optimize memory during build
    workerThreads: false,
    cpus: 1,
  },
  // Reduce build output size
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://app.reading-advantage.com/",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
