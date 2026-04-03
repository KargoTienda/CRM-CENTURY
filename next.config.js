/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.zonaprop.com.ar" },
      { protocol: "https", hostname: "**.zonapropcdn.com" },
      { protocol: "https", hostname: "**.argenprop.com" },
      { protocol: "https", hostname: "**.propio.com.ar" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

module.exports = nextConfig;
