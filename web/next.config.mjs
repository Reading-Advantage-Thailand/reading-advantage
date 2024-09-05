/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["next-international", "international-types"],
  reactStrictMode: false,
  pageExtensions: ["tsx", "ts", "jsx", "js"],
};

export default nextConfig;
