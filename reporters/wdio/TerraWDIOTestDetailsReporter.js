const events = require("events");
const path = require("path");
const fs = require("fs");
const { description } = require("commander");
events.EventEmitter.defaultMaxListeners = 25
global.Test = ''
class TerraWDIOTestDetailsReporter extends events.EventEmitter {
  constructor() {
    super();
    this.resultsDir = path.resolve(
      process.cwd(),
      "tests",
      "wdio",
      "reports",
      "screenshotResult"
    );
    this.fileName = "";
    this.resultJsonObject = {
      locale: "",
      theme: "wdio",
      formFactor: "",
      browser: "",
      tests: [],
    };

    this.description = '';
    this.success = '';
    this.screenshotLink = '';
    //this.globalTest = {}

    this.latestScreenshots = [];
    

    this.on("terra-wdio:latest-screenshot", (screenshotPath) => {
        console.log(" ____________ terra-wdio:latest-screenshot ____________ ")
        console.log(" ^^^^^^^^^^^^^ global.Test :::: ", global.Test);
        this.latestScreenshots.push({
            [this.description]:screenshotPath
        })
        global.Test = screenshotPath;
        console.log("@@@@@@@ this.latestScreenshots @@@@@ ", this.latestScreenshots);
        // this.latestScreenshots.push()
        // console.log("---------- terra-wdio:latest-screenshot array :::", this.latestScreenshots);
    });

    this.on("runner:start", (runner) => {
        console.log(" ______________ runner:start _________________ ");
        this.resultJsonObject.locale = runner.config.locale;
        this.resultJsonObject.browser = runner.capabilities.browserName;
        this.resultJsonObject.formFactor = runner.capabilities.formFactor;
        this.resultJsonObject.theme =
          runner.capabilities.theme || "default-theme";
        this.fileNameCheck(runner.config, runner.capabilities.browserName);
    });

    this.on("suite:start", (params) => {
        console.log(" _____________________ suite:start ______________")
    });

    this.on("test:start", (test) => {
        console.log(" ______________ test:start ______________");
        this.description = test.title ? test.title : "emptyString";
    });

    this.on("test:pass", (test) => {
        // console.log(" ______________ test:pass _______________");
        this.success = "success";
        console.log(" ***** this.latestScreenshots ::: test:pass ___ ", this.latestScreenshots)
    });

    this.on("test:fail", (test) => {
        // console.log(" _________________ test:fail ________________");
      this.success = "fail"
      const filePathLocation = path.join(
        this.resultsDir,
        `testFail.json`
      );
    });

    this.on("test:end", (test) => {
        console.log("_______________ test:end ______________")
        const cloneResJson = {...this.resultJsonObject};
        // console.log("_________ this.screenshotLink __________ ",this.screenshotLink);
        cloneResJson.tests.push({
          description: this.description,
          success: this.success,
          screenshotLink: this.screenshotLink
        });
        // this.description = this.success = this.screenshotLink = '';
        console.log(" ***** global.Test ::: test:end ___ ", global.Test)
    });

    this.on("suite:end", (suite) => {
        console.log(" _________________ suite:end ____________");
        console.log(" ***** global.Test ::: suit:end ___ ", global.Test)
        // console.log("SuitEnd ::: this.screenshotLink :::", this.screenshotLink);
    });

    this.on("runner:end", (runner) => {
        console.log("_____________ runner:end _________________");
        // console.log("------- latestScreenshots -------", this.latestScreenshots);
        // console.log("****** resultJsonObject ****** ", this.resultJsonObject);
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
  fileNameCheck({ formFactor, locale, theme }, browserName) {
    const fileNameConf = ["result"];
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
