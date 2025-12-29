import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Proxy API requests to the backend
  async rewrites() {
    // INTERNAL_API_URL should be the service name (e.g., http://backend:9006) when running in Docker.
    // If not set, we default to the service name as it's the most common case for our containerized environment.
    const backendUrl = process.env.INTERNAL_API_URL || "http://backend:9006";

    // Log for debugging (visible in Docker logs during build/startup)
    if (process.env.NODE_ENV === 'production') {
      console.log(`[NextConfig] Production rewrite: proxying /api to ${backendUrl}`);
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

