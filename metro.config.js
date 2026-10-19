// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bundle Rive animation files (assets/coaches/*.riv).
config.resolver.assetExts.push('riv');

module.exports = config;
