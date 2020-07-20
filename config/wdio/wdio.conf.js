const localIP = require('ip');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const determineSeleniumConfig = require('./selenium.config').determineConfig;
const { dynamicRequire } = require('../configUtils');
const launchChromeAndRunLighthouse = require('../../lightHouse/lightHouse');
const { generateSessionToken, getSessionToken, validateSession } = require('../../lightHouse/sessionHelper');
const { compareReports } = require('../../lightHouse/reportCompareHelper');
const { addReportData, generateReport } = require('../../lightHouse/reportGenerator');

const {
  SeleniumDocker: SeleniumDockerService, ServeStaticService, Terra: TerraService,
} = require('../../lib/wdio/services/index');
const visualRegressionConfig = require('./visualRegressionConf');

/* Use to pass your host's IP when running wdio tests from a VM or behind a proxy. */
const ip = process.env.WDIO_EXTERNAL_HOST || localIP.address();

/* Use to post the wdio run to a different docker port. */
const externalPort = process.env.WDIO_EXTERNAL_PORT || 8080;

/* Use to run wdio tests on a different port. */
const internalPort = process.env.WDIO_INTERNAL_PORT || 8080;

/* Use to set configuration for build tools like Travis CI. */
const ci = process.env.CI;

/* Use to bail fast while running locally. */
const bail = process.env.WDIO_BAIL !== 'false' && (process.env.WDIO_BAIL || ci);

/* Use to disable test assertions on the screenshot(s) comparison results. */
const ignoreComparisonResults = process.env.WDIO_IGNORE_COMPARISON_RESULTS === 'true';
visualRegressionConfig.ignoreComparisonResults = ignoreComparisonResults;

/* Use to change the locale used in the wdio run. */
const locale = process.env.LOCALE;

/* Use to change the form factor (test viewport) used in the wdio run. */
const formFactor = process.env.FORM_FACTOR;

/* Use to disable running webpack in the ServeStatic Service, provide the packed site to serve directly. */
const site = process.env.SITE;

/* Use to set enable running test against a hosted selenium grid. Enables IE capabilities if the grid supports it. */
const seleniumGridUrl = process.env.SELENIUM_GRID_URL;

/**
 * Use to run tests against the various browsers. Headless Chrome and Headless Firefox browsers are available. IE is
 * an option when a SELENIUM_GRID_URL is provided.
 */
const browsers = process.env.BROWSERS;

/* Use to enable running light house performance against each test. */
const runLightHouse = process.env.RUN_LIGHT_HOUSE || true; // 'true' adding true for testing.

/* Use to set average performance score to validate light house reports. */
const averagePerformanceScore = process.env.AVERAGE_PERFORMANCE_SCORE || 75;

/* Use to override default theme for theme visual regression tests. */
const theme = process.env.THEME;

const hasPackages = glob.sync((path.join(process.cwd(), 'packages'))).length > 0;

const seleniumConfig = determineSeleniumConfig({
  ci, seleniumGridUrl, browsers,
});

// Try to find the local to process.cwd webpack config
const webpackConfig = dynamicRequire(path.resolve(process.cwd(), 'webpack.config.js'));

const config = {
  ...webpackConfig && { webpackConfig },
  ...seleniumConfig,

  specs: hasPackages ? [
    path.join('packages', '*', 'test*', 'wdio', '**', '*-spec.js'),
  ] : [
    path.join('test*', 'wdio', '**', '*-spec.js'),
  ],

  sync: true,
  logLevel: 'silent',
  coloredLogs: true,
  bail: bail ? 1 : 0,
  screenshotPath: path.join('.', 'errorScreenshots'),
  waitforTimeout: 3000,
  connectionRetryTimeout: 1200000,
  connectionRetryCount: 1,
  services: ['visual-regression', TerraService, SeleniumDockerService, ServeStaticService],

  visualRegression: visualRegressionConfig,

  baseUrl: `http://${ip}:${externalPort}`,

  ...site && { site },
  serveStatic: {
    port: internalPort,
  },
  ...locale && { locale },
  ...formFactor && { formFactor },

  // Ignore deprecation warnings. When chrome supports /actions API we'll update to use those.
  deprecationWarnings: false,

  axe: {
    inject: true,
    options: {
      rules: [
        // The lowlight theme adheres to a non-default color contrast ratio and fails the default ratio check.
        // The color-contrast ratio check must be disabled for lowlight theme testing.
        { id: 'color-contrast', enabled: theme !== 'clinical-lowlight-theme' },
      ],
    },
  },

  terra: {
    selector: '[data-terra-dev-site-content] *:first-child',
  },

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 1200000,
    bail,
  },

  before() {
    if (runLightHouse) {
      generateSessionToken();
      fs.rmdirSync('report//performance-report.json');
      fs.rmdirSync('report//performance-report.html');
    }
  },

  async afterTest(test) {
    if (runLightHouse) {
      const url = await global.browser.getUrl();
      const isMobileDevice = test.fullTitle.includes('tiny') || test.fullTitle.includes('small');
      let fileName = test.fullTitle.trim();
      fileName = (isMobileDevice) ? fileName.replace(/tiny|small/gi, '[Mobile] ')
        : fileName.replace(/medium|large|huge|enormous/gi, '[Desktop] ');
      const newFileUrl = `${fileName.replace(/ /g, '-')}${getSessionToken()}.html`;

      if (!fs.existsSync('report')) {
        fs.mkdirSync('report');
      }

      if (!fs.existsSync('report/html')) {
        fs.mkdirSync('report/html');
      }

      // Skips running tests for multiple viewports
      if (!fs.existsSync(`report//html//${newFileUrl}`)) {
        const results = await launchChromeAndRunLighthouse(url, isMobileDevice);
        const newReportOutput = JSON.parse(JSON.stringify(results.json));
        let extReportOutput;
        let isReportCreated = false;
        const fileNames = fs.readdirSync('report//html//');
        if (fileNames.length > 0) {
          fileNames.forEach((extfileUrl) => {
          // check if previous report exist. if true creates report only when there is difference between current and previous report.
            if (validateSession(extfileUrl, newFileUrl)) {
              extReportOutput = JSON.parse(JSON.stringify(fs.readFileSync(`report//html//${extfileUrl}`)));
              if (compareReports(newReportOutput, extReportOutput, test.fullTitle)) {
                fs.writeFileSync(`report//html//${newFileUrl}`, results.html);
                addReportData(averagePerformanceScore, extReportOutput, newReportOutput, newFileUrl);
                isReportCreated = true;
                fs.rmdirSync(`report//html//${extfileUrl}`);
              }
            }
          });
        }
        // Prevents re-writing of existing report if there are no changes in performance score.
        if (extReportOutput === undefined && !isReportCreated) {
          fs.writeFileSync(`report//html//${newFileUrl}`, results.html);
          addReportData(averagePerformanceScore, extReportOutput, newReportOutput, newFileUrl);
        }
      }
    }
  },

  onComplete() {
    if (runLightHouse) generateReport(averagePerformanceScore);
  },

  ...theme && { theme },
};

// This code only executes for monorepos.  It will create a set of suites that can then be executed
// independently and/or in parallel via 'wdio --suite suite1' for example
if (hasPackages) {
  const packageLocationsWithTests = glob.sync((path.join(process.cwd(), 'packages', '*', 'test*', 'wdio', '**', '*-spec.js')));

  const numberOfPackagesWithTests = packageLocationsWithTests.length;
  if (numberOfPackagesWithTests > 0) {
    const numberOfSuites = Math.min(numberOfPackagesWithTests, 4);
    config.suites = {};
    [...Array(numberOfSuites)].forEach((_, index) => {
      config.suites[`suite${index + 1}`] = [];
    });

    packageLocationsWithTests.forEach((packageLocation, index) => {
      const currentSuite = `suite${(index % numberOfSuites) + 1}`;
      config.suites[currentSuite] = config.suites[currentSuite].concat(packageLocation);
    });
  }
}

exports.config = config;
