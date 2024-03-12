const esModules = ['nanoid'].join('|');
/*
If, after upgrading/installing new dependencies, jest complains about 
"cannot use import outside of module" and has a dependency in that trace, add the
dependency to this list of esModules, so that it will be transformed into ESM
*/

module.exports = {
  // preset: 'ts-jest/presets/js-with-ts-esm',
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  // disable GamesArea test for green builds as per professor's instructions:
  // it's not possible to import any component that uses Phaser from NodeJS (including in tests)
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/components/Town/interactables/GamesArea.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: "tsconfig.jest.json"
      }
    ],
  }
};
