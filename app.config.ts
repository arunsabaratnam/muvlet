import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // The prototype server uses local HTTP. Never enable this for a production build.
  const localRecognition = process.env.EAS_BUILD_PROFILE === 'development' || process.env.MUVLET_LOCAL_RECOGNITION === '1';
  return {
    ...config,
    name: config.name ?? 'muvlet',
    slug: config.slug ?? 'muvlet',
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        ...(localRecognition ? {
          NSLocalNetworkUsageDescription: 'Connect to your computer to recognize foods in a meal photo.',
          NSAppTransportSecurity: { NSAllowsArbitraryLoads: true },
        } : {}),
      },
    },
    plugins: [
      ...(config.plugins ?? []),
      ['expo-build-properties', { android: { usesCleartextTraffic: localRecognition } }],
    ],
  };
};
