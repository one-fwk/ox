process.env.CHROMIUM_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
  config.set({
    basePath: '',
    frameworks: [
      'jasmine',
      'karma-typescript',
      'jasmine-matchers',
    ],
    preprocessors: {
      'packages/**/*.+(ts|tsx)': ['karma-typescript'],
    },
    files: [
      'packages/**/*.+(ts|tsx)'
    ],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-spec-reporter',
      'karma-typescript',
      'karma-jasmine-matchers',
    ],
    karmaTypescriptConfig: {
      tsconfig: './tsconfig.spec.json',
    },
    reporters: ['spec', 'karma-typescript'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['WslChromiumHeadless'],
    concurrency: Infinity,
    customLaunchers: {
      WslChromiumHeadless: {
        base: 'ChromiumHeadless',
        flags: ['--disable-gpu', '--no-sandbox', '--remote-debugging-port=9222'],
      }
    },
  });
};