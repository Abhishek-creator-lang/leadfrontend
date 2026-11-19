/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server components read markdown/code straight from /content at request time.
  outputFileTracingIncludes: {
    '/**': ['./content/**/*'],
  },
  modularizeImports: {
    '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
  },
};

export default nextConfig;
