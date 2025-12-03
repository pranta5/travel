// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dglb6gn6v/**", // Your cloud name (from URL)
      },
    ],
  },
  // Other config...
};

module.exports = nextConfig;
