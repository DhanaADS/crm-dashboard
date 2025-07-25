const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Disable linting and type checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  experimental: {
    serverActions: {} // ✅ use empty object if needed
  },
  
  // Add images configuration for Supabase
  images: {
    domains: [
      'ssgnlacbvklqjnuxxyci.supabase.co', // Your Supabase domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  async redirects() {
    return []
  },
  
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    return config
  }
}

module.exports = nextConfig