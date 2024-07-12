/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    mapbox_key: process.env.MAPBOX_ACCESS_TOKEN,
  },
}

export default nextConfig
