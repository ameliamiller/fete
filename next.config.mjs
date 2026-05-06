/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Next.js from trying to bundle server-only packages
  serverExternalPackages: ["twilio", "@prisma/client", "prisma"],
};

export default nextConfig;
