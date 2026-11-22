/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Knex lazily requires every SQL driver it supports; load it from node_modules instead of bundling.
  serverExternalPackages: ['knex', 'pg'],
  // Server components read markdown/code straight from /content at request time.
  outputFileTracingIncludes: {
    '/**': ['./content/**/*'],
  },
  modularizeImports: {
    '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
  },
};

export default nextConfig;
