const events = require("events");
const path = require("path");
const fs = require("fs");
const { description } = require("commander");
const { json } = require("express");
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
      suites: [],
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
    this.suitesHasEntry.bind(this);
    this.testsHasEntry.bind(this);

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
      fs.appendFile(
        path.join(
          this.resultsDir,
          `suit_start.json`
        ), 
        `${JSON.stringify(params, null, 2)}`,
        (err) => {
          if (err) {
            console.log("err: ", err);
          }
        }
      );
      if(params.parent != params.title && params.title && params.title !== this.child){
        // console.log("params::: suit:start ::: ", JSON.stringify(params, null, 2));
        this.child = params.title
      } else if(params.parent == params.title) {
        this.child = ''
      }
      this.parent = params.parent
      console.log(" _____________________________suit:start_______________________________ ")
      console.log("params.parent, params.title, ",  params.parent, params.title);
      console.log("this.parent",  this.parent);
      console.log("this.child",  this.child);
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
      console.log(" ____________________________________________________________ ")
      console.log("test:end ::: this.parent ", this.parent );
      const suiteIndex = this.suitesHasEntry(this.parent)
      console.log("suiteIndex :::: this.child", suiteIndex, this.child)
      if(!this.child) {
        if(this.parent && suiteIndex === -1) {
          this.resultJsonObject.suites.push({
            description: this.parent,
            tests: [{
              description: this.description,
              success: this.success,
              screenshotLink: this.screenshotLink.screenshotPath,
            }]
          });
        } else {
          this.resultJsonObject.suites[suiteIndex].tests.push({
            description: this.description,
            success: this.success,
            screenshotLink: this.screenshotLink.screenshotPath,
          })
        }
      }

      
      if(this.child) {
        const testIndex = this.testsHasEntry(this.parent,this.child)
        if (testIndex === -1 && suiteIndex > 0) {
          this.resultJsonObject.suites[suiteIndex].tests.push({
            description: this.child,
            tests: [{
              description: this.description,
              success: this.success,
              screenshotLink: this.screenshotLink.screenshotPath,
            }]
          });
        } else if(this.resultJsonObject.suites[suiteIndex]) {
          this.resultJsonObject.suites[suiteIndex].tests[testIndex].tests.push({
            description: this.description,
            success: this.success,
            screenshotLink: this.screenshotLink.screenshotPath,
          })
        }
      }
    });

    this.on("runner:end", (runner) => {
      const filePathLocation = path.join(
        this.resultsDir,
        `${this.fileName}.json`
      );
      // console.log(" ____________________________________________________________ ")
      // console.log("this.resultJsonObject ::: runner:end", this.resultJsonObject)
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

  suitesHasEntry(parent) {
    return this.resultJsonObject.suites.findIndex(({description}) => description === parent)
  }

  testsHasEntry(parent, child) {
    const parentIndex = this.resultJsonObject.suites.findIndex(({description}) => description === parent)
    if (parentIndex > -1) {
      return this.resultJsonObject.suites[parentIndex].tests.findIndex(({description}) => description === child)
    }
    return -1;
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
