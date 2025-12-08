/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Ignore optional dependencies that cause build issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'fhevmjs': false,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

    // Handle WASM files if needed
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
};

module.exports = nextConfig;


