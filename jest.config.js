/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // dile a jest dónde buscar tests (incluye tu carpeta /test)
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
  // si usas paths en tsconfig, podemos mapearlos aquí (déjalo vacío si no usas)
  // moduleNameMapper: {},
  // útil si usas ESM en otros lados:
  // extensionsToTreatAsEsm: ['.ts'],
  // transform: { '^.+\\.tsx?$': ['ts-jest', { useESM: true }] },
};
