import {config} from 'dotenv';
import type {NextConfig} from 'next';

// Load environment variables from .env file at the very beginning.
config();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
