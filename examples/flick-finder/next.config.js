/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  env: {
    BACKEND_URL: process.env.NODE_ENV === 'development'
      ? 'http://localhost:8787'
      : 'https://flick-finder-backend.engalidanish.workers.dev/',
    }  
}
