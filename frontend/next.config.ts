/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'aqdgpxrvyszgdtavfbzy.supabase.co',
      },

      {
  protocol: 'https',
  hostname: 'img.clerk.com',
 },
    ],
  },
};

export default nextConfig;
