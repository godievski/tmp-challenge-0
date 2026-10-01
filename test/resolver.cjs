const resolveReactNative = require('@react-native/jest-preset/jest/resolver');
const resolveWorklets = require('react-native-worklets/jest/resolver');

// Worklets uses its JS fallback in Jest; preserve React Native's resolver too.
module.exports = (request, options) =>
  resolveWorklets(request, {
    ...options,
    defaultResolver: (name, nextOptions) =>
      resolveReactNative(name, { ...nextOptions, defaultResolver: options.defaultResolver }),
  });
