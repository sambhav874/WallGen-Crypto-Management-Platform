/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        SOL_API_ROUTE: process.env.NEXT_PUBLIC_SOL_API_ROUTE,
        ETH_API_ROUTE: process.env.NEXT_PUBLIC_ETH_API_ROUTE
      },
      reactStrictMode: true
};

export default nextConfig;
