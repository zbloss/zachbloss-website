/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  webpack(config) {
    // Exclude native Node.js modules — transformers.js uses WASM in the browser.
    // onnxruntime-node provides native binaries that only work in Node, not in
    // webpack/browser bundles. We also exclude the node-specific env resolution.
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node": false,
    };
    config.externals = [...(config.externals || []), "onnxruntime-node"];
    return config;
  },
};

export default nextConfig;
