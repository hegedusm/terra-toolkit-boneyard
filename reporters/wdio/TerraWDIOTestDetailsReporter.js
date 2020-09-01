const events = require("events");
const path = require("path");
const fs = require("fs");
const { description } = require("commander");
events.EventEmitter.defaultMaxListeners = 25;
global.Test = "";
class TerraWDIOTestDetailsReporter extends events.EventEmitter {
  constructor() {
    super();
    this.fileName = "";
    this.resultJsonObject = {
      locale: "",
      theme: "wdio",
      formFactor: "",
      browser: "",
      tests: [],
    };

    this.description = "";
    this.success = "";
    this.screenshotLink = "";
    this.setResultsDir = this.setResultsDir.bind(this);

    this.latestScreenshots = [];

    this.on("terra-wdio:latest-screenshot", ({ screenshotPath }) => {
      console.log(" ____________ terra-wdio:latest-screenshot ____________ ");
      this.screenshotLink = screenshotPath;
      // this.latestScreenshots.push({
      //     [this.description]:screenshotPath
      // })
    });

    this.on("runner:start", (runner) => {
      console.log(" ______________ runner:start _________________ ");
      this.resultJsonObject.locale = runner.config.locale;
      this.resultJsonObject.browser = runner.capabilities.browserName;
      this.resultJsonObject.formFactor = runner.capabilities.formFactor;
      this.resultJsonObject.theme = runner.capabilities.theme || "wdio";
      this.fileNameCheck(runner.config, runner.capabilities.browserName);
    });

    this.on("suite:start", (params) => {
      console.log(" _____________________ suite:start ______________");
    });

    this.on("test:start", (test) => {
      console.log(" ______________ test:start ______________");
      this.description = test.title;
    });

    this.on("test:pass", (test) => {
      // console.log(" ______________ test:pass _______________");
      this.success = "success";
    });

    this.on("test:fail", (test) => {
      // console.log(" _________________ test:fail ________________");
      this.success = "fail";
      // const filePathLocation = path.join(this.resultsDir, `testFail.json`);
    });

    this.on("test:end", (test) => {
      console.log("_______________ test:end ______________");
      const cloneResJson = { ...this.resultJsonObject };

      cloneResJson.tests.push({
        description: this.description,
        success: this.success,
        screenshotLink: this.screenshotLink,
      });
      console.log(
        "_________ test:end ::: this.latestScreenshots __________ ",
        this.latestScreenshots
      );
    });

    // this.on("suite:end", (suite) => {
    //     console.log(" _________________ suite:end ____________");
    //     // console.log(" ***** global.Test ::: suit:end ___ ", global.Test)
    //     console.log("SuitEnd ::: this.latestScreenshots :::", this.latestScreenshots);
    // });

    this.on("runner:end", (runner) => {
      console.log("_____________ runner:end _________________");
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

  /**
   * Sets results directory for the test run
   * it outputs to tests?/wdio/reports.
   * @return null;
   */
  setResultsDir() {
    let testDir = 'tests';
    if (fs.existsSync(path.join(process.cwd(), 'test'))) {
      testDir = 'test';
    }
    this.resultsDir = path.join(process.cwd(), testDir, 'wdio', 'reports', 'details');
  }

  fileNameCheck({ formFactor, locale, theme }, browserName) {
    const fileNameConf = ['result'];
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

    this.fileName = fileNameConf.join('-');
  }
}

TerraWDIOTestDetailsReporter.reporterName = "TerraWDIOTestDetailsReporter";
module.exports = TerraWDIOTestDetailsReporter;
