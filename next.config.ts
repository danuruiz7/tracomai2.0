import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['pdf-parse', 'pdf-poppler', 'tesseract.js'],
};

export default nextConfig;
