//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Older extension builds still link to the retired pricing page.
  async redirects() {
    return [{ source: '/pricing', destination: '/', permanent: true }]
  }
}

export default nextConfig
