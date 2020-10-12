const events = require("events");
const path = require("path");
const fs = require("fs");
const { description } = require("commander");
class TerraWDIOTestDetailsReporter extends events.EventEmitter {
  constructor(globalConfig, options) {
    super(globalConfig);
    this.options = options;
    this.fileName = "";
    this.resultJsonObject = {
      locale: "",
      theme: "wdio",
      formFactor: "",
      browser: "",
      tests: [],
    };
    this.moduleName = process.cwd().split('/').pop();
    console.log('process.cwd() :::: ------> ',process.cwd());
    this.setResultsDir.bind(this);
    this.hasResultsDir.bind(this);
    this.setTestModule = this.setTestModule.bind(this);
    this.description = "";
    this.success = "";
    this.screenshotLink = "";

    this.on("terra-wdio:latest-screenshot", (screenshotPath) => {
      console.log(" ____________ terra-wdio:latest-screenshot ____________ ");
      this.screenshotLink = screenshotPath;
    });

    this.on("runner:start", (runner) => {
      this.setTestModule(runner.specs[0]);
      console.log(" ______________ runner:start _________________ ");
      this.setResultsDir();
      this.hasResultsDir();
      this.resultJsonObject.locale = runner.config.locale;
      this.resultJsonObject.browser = runner.config.browserName;
      this.resultJsonObject.formFactor = runner.config.formFactor;
      this.resultJsonObject.theme =
        runner.capabilities.theme || "default-theme";
      this.fileNameCheck(runner.config, runner.capabilities);

    });

    this.on("suite:start", (params) => {
      console.log(" _____________________ suite:start ______________");
    });

    this.on("test:start", (test) => {
      // console.log(" ______________ test:start ______________");
      this.description = test.title;
    });

    this.on("test:pass", (test) => {
      // console.log(" ______________ test:pass _______________");
      this.success = "success";
    });

    this.on("test:fail", (test) => {
      // console.log(" _________________ test:fail ________________");
      this.success = "fail";
    });

    this.on("test:end", (test) => {
      console.log("_______________ test:end ______________");
      const cloneResJson = { ...this.resultJsonObject };
      if (this.screenshotLink && this.screenshotLink.screenshotPath) {
        cloneResJson.tests.push({
          description: this.description,
          success: this.success,
          screenshotLink: this.screenshotLink.screenshotPath,
        });
      }
    });

    this.on("runner:end", (runner) => {
      const filePathLocation = path.join(
        this.resultsDir,
        `${this.fileName}.json`
      );
      fs.writeFileSync(
        filePathLocation,
        `${JSON.stringify(this.resultJsonObject, null, 2)}`,
        { flag: "w+" },
        (err) => {
          if (err) {
            Logger.error(err.message, { context: LOG_CONTEXT });
          }
        }
      );
    });
  }

  setTestModule(specsValue) {
    const index = specsValue.lastIndexOf('packages/');
    if (index > -1) {
      const testFilePath = specsValue.substring(index).split('/');
      const moduleName = testFilePath && testFilePath[1] ? testFilePath[1] : process.cwd().split('/').pop();
      if (moduleName && moduleName !== this.moduleName) {
        this.moduleName = moduleName;
        
      }
    }
  }

  /**
   * Check and create reports dir if doesn't exist
   * @return null
   */
  hasResultsDir() {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true }, (err) => {
        if (err) {
          Logger.error(err.message, { context: LOG_CONTEXT });
        }
      });
    }
  }

  setResultsDir() {
    const { reporterOptions } = this.options;
    if (reporterOptions && reporterOptions.outputDir) {
      this.resultsDir = reporterOptions.outputDir;
    } else {
      let testDir = 'tests';
      if (fs.existsSync(path.join(process.cwd(), 'test'))) {
        testDir = 'test';
      }
      this.resultsDir = path.join(process.cwd(), testDir, 'wdio', 'reports','details');
    }
  }

  fileNameCheck({ formFactor, locale, theme }, { browserName }) {
    const fileNameConf = ["result-details"];
    if (locale) {
      fileNameConf.push(locale);
      this.resultJsonObject.locale = locale;
    }

    if (theme) {
      fileNameConf.push(theme);
      this.resultJsonObject.theme = theme;
    }

    if (formFactor) {
      fileNameConf.push(formFactor);
      this.resultJsonObject.formFactor = formFactor;
    }

    if (browserName) {
      fileNameConf.push(browserName);
    }

    this.fileName = fileNameConf.join("-");
  }
}

TerraWDIOTestDetailsReporter.reporterName = "TerraWDIOTestDetailsReporter";
module.exports = TerraWDIOTestDetailsReporter;
