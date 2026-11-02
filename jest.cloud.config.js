// Plain-Node Jest config for tests that make real network calls (tests/cloud).
// The default config uses the React Native preset, which swaps in its own fetch/Response and breaks supabase-js.
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/cloud/**/*.test.ts'],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { babelrc: false, configFile: false, presets: ['@babel/preset-typescript'], plugins: ['@babel/plugin-transform-modules-commonjs'] }],
  },
};
