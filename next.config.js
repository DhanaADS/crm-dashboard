/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {} // ✅ use empty object if needed
  },
  async redirects() {
    return []
  }
}

module.exports = nextConfig