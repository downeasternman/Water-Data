const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add fallbacks for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "vm": false,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "path": require.resolve("path-browserify"),
    "fs": false,
    "os": require.resolve("os-browserify/browser"),
  };

  return config;
}; 