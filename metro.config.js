const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// expo-sqlite on the web ships SQLite as a WebAssembly file, which Metro must treat as an asset.
config.resolver.assetExts.push('wasm');
module.exports = config;
