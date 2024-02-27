/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },

  env: {
    API_KEY: process.env.BASE_URL,
    S3_URL: process.env.S3_URL,
  },

  images: {
    domains: [
      'bucket3dparts.s3.eu-central-1.amazonaws.com',
      'bucket3dpart.s3.eu-central-1.amazonaws.com',
    ],
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/products',
        statusCode: 301,
      },
      {
        source: '/',
        destination: '/products',
        statusCode: 301,
      },
      {
        source: '/my-index',
        destination: '/index',
        statusCode: 301,
      },
    ]
  },

  reactStrictMode: false,
}

module.exports = nextConfig
