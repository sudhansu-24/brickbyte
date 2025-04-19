/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
  // Configure remote image patterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'brickbyte-backend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'brickbyte-ml.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'sfcexboguumqecgcjfmj.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig 