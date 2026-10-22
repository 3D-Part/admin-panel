/** @type {import('next').NextConfig} */

// next/image refuses any host that is not listed below. Deriving it from
// S3_URL means a local image server (see the dev docker stack) works without
// editing this file.
const s3Hostname = (() => {
  try {
    return new URL(process.env.S3_URL).hostname
  } catch {
    return null
  }
})()

const nextConfig = {
  env: {
    API_KEY: process.env.BASE_URL,
    S3_URL: process.env.S3_URL,
  },

  images: {
    domains: [
      'bucket3dparts.s3.eu-central-1.amazonaws.com',
      'bucket3dpart.s3.eu-central-1.amazonaws.com',
      ...(s3Hostname ? [s3Hostname] : []),
    ],
  },

  async redirects() {
    return [
      // {
      //   source: '/home',
      //   destination: '/products',
      //   statusCode: 301,
      // },
      // {
      //   source: '/',
      //   destination: '/products',
      //   statusCode: 301,
      // },
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
