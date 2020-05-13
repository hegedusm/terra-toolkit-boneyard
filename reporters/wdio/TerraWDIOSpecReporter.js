const WDIOSpecReporter = require('wdio-spec-reporter/build/reporter');
const stripAnsi = require('strip-ansi');
const fs = require('fs');
const endOfLine = require('os').EOL;
const path = require('path');
const Logger = require('../../scripts/utils/logger');

const LOG_CONTEXT = '[Terra-Toolkit:terra-wdio-spec-reporter]';

class TerraWDIOSpecReporter extends WDIOSpecReporter {
  constructor(globalConfig, options) {
    super(globalConfig);
    this.options = options;
    this.runners = [];
    this.resultJsonObject = {
      startDate: '',
      type: 'wdio',
      locale: '',
      formFactor: '',
      theme: '',
      output: [],
      endDate: '',
    };
    this.fileName = '';
    this.moduleName = '';
    this.isMonoRepo = false;
    this.setResultsDir = this.setResultsDir.bind(this);
    this.hasReportDir = this.hasReportDir.bind(this);
    this.setTestModule = this.setTestModule.bind(this);
    this.hasMonoRepo = this.hasMonoRepo.bind(this);
    this.monoRepoPrintSuitesSummary = this.monoRepoPrintSuitesSummary.bind(this);
    this.setTestDirPath = this.setTestDirPath.bind(this);
    this.hasMonoRepo();
    this.setTestDirPath();
    this.setResultsDir(options);
    this.hasReportDir();
    this.on('runner:end', (runner) => {
      this.runners.push(runner);
    });
  }

  setTestDirPath() {
    if (fs.existsSync(path.join(process.cwd(), '/tests'))) {
      this.filePath = '/tests/jest/reports/results';
    } else if (fs.existsSync(path.join(process.cwd(), '/test'))) {
      this.filePath = '/test/jest/reports/results';
    } else {
      this.filePath = '/tests/jest/reports/results';
    }
  }

  setResultsDir(options) {
    if (options.reporterOptions && options.reporterOptions.outputDir) {
      this.filePath = options.reporterOptions.outputDir;
    } else {
      this.filePath = path.join(process.cwd(), '/tests/wdio/reports/results');
    }
  }

  hasReportDir() {
    const reportDir = path.join(this.filePath, '..');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(this.filePath, { recursive: true }, (err) => {
        if (err) throw err;
      });
    }
  }

  hasMonoRepo() {
    if (fs.existsSync(path.join(process.cwd(), '/packages'))) {
      this.isMonoRepo = true;
    }
  }

  fileNameCheck() {
    const { LOCALE, THEME, FORM_FACTOR } = process.env;
    const fileNameConf = [];
    if (LOCALE) {
      fileNameConf.push(LOCALE);
    }
    if (THEME) {
      fileNameConf.push(THEME);
    }
    if (FORM_FACTOR) {
      fileNameConf.push(FORM_FACTOR);
    }
    if (fileNameConf.length === 0) {
      this.fileName = '/result';
    }
    if (fileNameConf.length >= 1) {
      this.fileName = `/result-${fileNameConf.join('-')}`;
    }
  }

  setTestModule(specsValue) {
    const index = specsValue.lastIndexOf('packages/');
    if (index > -1) {
      const testFilePath = specsValue.substring(index).split('/');
      const moduleName = testFilePath && testFilePath[1] ? testFilePath[1] : '';
      if (moduleName && moduleName !== this.moduleName) {
        this.moduleName = moduleName;
      }
    }
  }

  monoRepoPrintSuitesSummary(runners) {
    if (runners && runners.length) {
      runners.forEach((runner) => {
        this.setTestModule(runner.specs[0]);
        if (!this.resultJsonObject.output[this.moduleName]) {
          this.resultJsonObject.output[this.moduleName] = [];
        }
        const readableMessage = `${stripAnsi(this.getSuiteResult(runner))}${endOfLine}`;
        if (readableMessage.search('\n') !== -1) {
          this.resultJsonObject.output[this.moduleName].push(readableMessage.split(/\n/g));
        }
      });
    }
    this.fileNameCheck();
    const {
      endDate,
      startDate,
      locale,
      formFactor,
      theme,
      output,
    } = this.resultJsonObject;
    const moduleKeys = Object.keys(output) || [];
    if (output && moduleKeys.length) {
      moduleKeys.forEach(key => {
        const fileData = {
          endDate,
          startDate,
          locale,
          theme,
          formFactor,
          output: output[key],
        };
        fs.writeFileSync(`${this.filePath}${this.fileName}${key}.json`, `${JSON.stringify(fileData, null, 2)}`, { flag: 'w+' }, (err) => {
          if (err) {
            Logger.error(err.message, { context: LOG_CONTEXT });
          }
        });
      });
    }
  }

  printSuitesSummary() {
    const { end, start } = this.baseReporter.stats;
    const { LOCALE, THEME, FORM_FACTOR } = process.env;
    this.resultJsonObject.endDate = new Date(end).toLocaleString();
    this.resultJsonObject.startDate = new Date(start).toLocaleString();
    this.resultJsonObject.locale = LOCALE;
    this.resultJsonObject.formFactor = FORM_FACTOR;
    this.resultJsonObject.theme = THEME || 'default-theme';
    const { runners } = this;
    if (!this.isMonoRepo) {
      if (runners && runners.length) {
        runners.forEach((runner) => {
          const readableMessage = `${stripAnsi(this.getSuiteResult(runner))}${endOfLine}`;
          if (readableMessage.search('\n') !== -1) {
            this.resultJsonObject.output.push(readableMessage.split(/\n/g));
          }
        });
      }
      this.fileNameCheck();
      fs.writeFileSync(`${this.filePath}${this.fileName}.json`, `${JSON.stringify(this.resultJsonObject, null, 2)}`, { flag: 'w+' }, (err) => {
        if (err) {
          Logger.error(err.message, { context: LOG_CONTEXT });
        }
      });
    } else {
      this.monoRepoPrintSuitesSummary(runners);
    }
  }
}

module.exports = TerraWDIOSpecReporter;
