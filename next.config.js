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

  // Remote image configuration for Supabase storage assets + IPFS gateways
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'swemmmqiaieanqliagkd.supabase.co',
        pathname: '/storage/v1/object/public/**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'i.pcmag.com',
        pathname: '/**'
      },
      // IPFS Gateways
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/ipfs/**'
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        pathname: '/ipfs/**'
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**'
      },
      {
        protocol: 'https',
        hostname: 'dweb.link',
        pathname: '/ipfs/**'
      },
      // Common image hosting services (for user-uploaded external images)
      {
        protocol: 'https',
        hostname: '**.imgur.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        pathname: '/**'
      }
    ],
    // Disable optimization in development to allow any external image
    unoptimized: process.env.NODE_ENV === 'development',
    // Fallback for images from unconfigured domains
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  
  // Trailing slash handling
  trailingSlash: false
}

module.exports = nextConfig
