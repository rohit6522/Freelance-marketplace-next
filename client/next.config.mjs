import path from "node:path";
import { fileURLToPath } from "node:url";

const API_URL = process.env.API_URL || "http://localhost:5000";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: __dirname },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
  
};

export default nextConfig;