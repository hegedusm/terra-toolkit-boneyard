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
      tests: {},
    };
    this.moduleName = process.cwd().split('/').pop();
    this.setResultsDir.bind(this);
    this.hasResultsDir.bind(this);
    this.setTestModule = this.setTestModule.bind(this);
    this.description = "";
    this.success = "";
    this.screenshotLink = "";
    this.parent = ""
    this.child = ""

    this.on("terra-wdio:latest-screenshot", (screenshotPath) => {
      this.screenshotLink = screenshotPath;
    });

    this.on("runner:start", (runner) => {
      this.setTestModule(runner.specs[0]);
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
      if(params.parent != params.title && params.title && params.title !== this.child){
        this.child = params.title
      } else if(params.parent == params.title) {
        this.child = ''
      }
      this.parent = params.parent
    });

    this.on("test:start", (test) => {
      this.description = test.title;
    });

    this.on("test:pass", (test) => {
      this.success = "success";
    });

    this.on("test:fail", (test) => {
      this.success = "fail";
    });

    this.on("test:end", (test) => {
      if(!this.resultJsonObject.tests[this.parent]) {
        this.resultJsonObject.tests[this.parent] = {
          description: this.parent,
          tests: []
        };
      }
      if (this.child && !this.resultJsonObject.tests[this.parent][this.child]) {
        this.resultJsonObject.tests[this.parent][this.child] = {
          description: this.child,
          tests: []
        };
      }
      const cloneResJson = { ...this.resultJsonObject };
        if (this.child && cloneResJson.tests[this.parent][this.child]) {
        cloneResJson.tests[this.parent][this.child].tests.push({
          description: this.description,
          success: this.success,
          screenshotLink: this.screenshotLink.screenshotPath,
        });
      } else {
        cloneResJson.tests[this.parent].tests.push({
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
    if (reporterOptions && reporterOptions.detailsReporter) {
      this.resultsDir = reporterOptions.detailsReporter;
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
