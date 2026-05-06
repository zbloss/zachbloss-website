/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  webpack(config) {
    // Stub out onnxruntime-node in all bundles. The native binary can't be
    // parsed by webpack (server) or executed in the browser (client). This
    // project only uses onnxruntime-web (WASM) via @xenova/transformers.
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node": false,
    };
    return config;
  },
};

export default nextConfig;
