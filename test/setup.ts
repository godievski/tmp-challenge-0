// CSS is compiled by Metro. These component tests exercise behavior, not styling.
jest.mock('uniwind', () => ({
  Uniwind: { currentTheme: 'light', updateInsets: jest.fn() },
  useUniwind: () => ({ theme: 'light', hasAdaptiveThemes: false }),
  useCSSVariable: (variables: string | string[]) =>
    Array.isArray(variables) ? variables.map(() => '#30241d') : '#30241d',
  useResolveClassNames: () => ({}),
  withUniwind: (component: unknown) => component,
}));

jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  useReducedMotion: () => false,
}));
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
