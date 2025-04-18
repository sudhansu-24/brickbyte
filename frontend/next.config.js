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
  // Ensure proper module resolution
  experimental: {
    esmExternals: 'loose',
  },
  // Add proper image domains if needed
  images: {
    domains: ['brickbyte-backend.onrender.com', 'brickbyte-ml.onrender.com', 'sfcexboguumqecgcjfmj.supabase.co'],
  },
}

module.exports = nextConfig 