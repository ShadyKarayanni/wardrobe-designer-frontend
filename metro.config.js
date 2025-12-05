const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add tamagui to the list of packages that should be resolved
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
