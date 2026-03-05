/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  rewrites: async () => {
    // Para rewrites server-side, sempre usar localhost
    // Para requisições client-side via ngrok, o browser acessará diretamente a URL ngrok do backend
    return {
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `http://localhost:3000/api/:path*`,
        },
      ],
    };
  },
  images: {
    unoptimized: true, // Desabilitar otimização de imagens em desenvolvimento
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.mercadolibre.com',
      },
      {
        protocol: 'https',
        hostname: '**.mercadolibre.com.br',
      },
    ],
  },
};

export default nextConfig;
