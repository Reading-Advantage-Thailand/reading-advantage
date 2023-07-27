/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        port: 8000,
        baseUrl: "http://localhost:",
        apiVersion: "v1",
    },
}

module.exports = nextConfig
