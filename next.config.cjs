/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Production optimizations
  reactStrictMode: true,
  swcMinify: true,

  // Remote image configuration for Supabase storage assets
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'swemmmqiaieanqliagkd.supabase.co',
        pathname: '/storage/v1/object/public/**'
      }
    ]
  },
  
  // Trailing slash handling
  trailingSlash: false
}

module.exports = nextConfig
