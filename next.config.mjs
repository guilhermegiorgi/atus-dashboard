/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable experimental features that might cause 404s
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Disable PWA and other features that try to load non-existent routes
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
