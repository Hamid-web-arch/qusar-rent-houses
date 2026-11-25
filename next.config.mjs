/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Supabase Storage-dan gələn ev şəkilləri
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
