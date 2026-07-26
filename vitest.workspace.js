export default [
  {
    test: {
      name: 'frontend',
      root: '.',
      environment: 'jsdom',
      setupFiles: ['./tests/setup.js'],
      include: ['tests/frontend/**/*.test.{js,jsx}'],
      globals: true,
    },
  },
  {
    test: {
      name: 'backend',
      root: '.',
      environment: 'node',
      include: ['tests/backend/**/*.test.js'],
      globals: true,
    },
  },
];
