/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The floating dev badge sits on top of the envelope while screenshotting.
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Allow photos hosted anywhere you like (Cloudinary, imgur, your own CDN).
    // Add more hosts here if you link images from elsewhere.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    return [
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
    ];
  },
};

export default nextConfig;
