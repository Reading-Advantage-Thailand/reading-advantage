/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["next-international", "international-types"],
  reactStrictMode: false,
  pageExtensions: ["tsx", "ts", "jsx", "js"],
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
};

export default nextConfig;
