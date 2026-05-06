import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_OUTPUT === 'export'
    ? 'export'
    : process.env.NEXT_OUTPUT === 'standalone'
    ? 'standalone'
    : undefined,
  // Required for standalone output to trace deps from the monorepo root
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
