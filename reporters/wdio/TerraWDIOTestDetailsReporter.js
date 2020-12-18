const events = require("events");
const path = require("path");
const fs = require("fs");
const { json } = require("express");
// const { description } = require("commander");
// const { json } = require("express");
// const { cosh } = require("core-js/fn/number");
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
    this.endResult = {
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
    this.grandParent = ""
    this.parent = ""
    this.child = ""
    this.suiteCount = 0,
    this.childArray = [],
    this.parentArray = [],
    this.suitesHasEntry.bind(this);
    this.testsHasEntry.bind(this);
    this.specHashData = {};
    this.reachedTestEnd = false;
    // this.parentCount = 0;

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
      // console.log("params/;;; suit:start -> ", JSON.stringify(params, null, 2));
      if (!this.specHashData[params.specHash]) {
        this.specHashData[params.specHash] = {}
      }

      if (!this.specHashData[params.specHash][params.title]) {
        //this.specHashData[params.specHash][params.title] = {};
        this.specHashData[params.specHash][params.title] = {
          parent: params.parent,
          description: params.title,
          tests: []
        }
        // if(params.title === params.parent) {
        //   this.specHashData[params.specHash][params.title] = {};
        //   //this.parent = params.parent;
        // } else if(this.specHashData[params.specHash][params.parent]) {
        //   this.specHashData[params.specHash][params.parent][params.title] = {}
        // } else {
        //   this.specHashData[params.specHash][params.parent] = {}
        // }
      }
      //  else{
      //   console.log("*********** inside the else suit:start ***********");
      //   this.specHashData[params.specHash][params.parent]({
      //     [params.title]: []
      //   })
      // }
      // this.suiteCount++;
      // console.log(" ____________ suit:start _____________ ");
    });

    this.on("test:start", (test) => {
      //console.log("_________ test:start ___________ ", JSON.stringify(test, null,2));
      this.description = test.title;
    });

    this.on("test:pass", (test) => {
      this.success = "success";
    });

    this.on("test:fail", (test) => {
      this.success = "fail";
    });

    this.on("test:end", (test) => {
      // fs.appendFile(
      //   path.join(
      //     this.resultsDir,
      //     `test_end.json`
      //   ), 
      //   `${JSON.stringify(test, null, 2)}`,
      //   (err) => {
      //     if (err) {
      //       console.log("err: ", err);
      //     }
      //   }
      // );
      //console.log(" __________________ test End _____________________", JSON.stringify(test, null,2));
      // console.log("this.grandparent in test:end :::***** ", this.grandParent);
      // console.log(`parent ::: ${this.parent}, child::: ${this.child}`);

      // console.log("---- this.specHashData ------ ", JSON.stringify(this.specHashData, null,2));

      // if (this.parent && this.child) {
      //   const parentIndex = this.suitesHasEntry(this.parent)
      //   const childIndex = this.testsHasEntry(this.parent, this.child)
      //   // console.log(`this.parent && this.child  - > parentIndex ::: ${parentIndex}, childIndex::: ${childIndex}`);
      //   if (parentIndex === -1 && childIndex === -1) {
      //     // for(var i=0; i< this.resultJsonObject.suits.length; i++ ){
      //     //   for(var j=0; j<this.)
      //     //   if(this.resultJsonObject.suites[i].test[i].description === this.parent ){

      //     //   }
      //     // }
      //     // console.log(`parent name ::: parentIndex === -1 && childIndex === -1 -> parent:  ${this.parent} -> child: ${this.child} -> description: ${this.description}`)
      //     this.resultJsonObject.suites.push({
      //       description: this.parent,
      //       tests: []
      //     });
      //     const updatedIndex = this.suitesHasEntry(this.parent);
      //     // console.log("updatedIndex :----->>>>", updatedIndex);
      //     this.resultJsonObject.suites[updatedIndex].tests.push({
      //       description: this.child,
      //       tests:[{
      //         description: this.description,
      //         success: this.success,
      //         screenshotLink: this.screenshotLink.screenshotPath
      //       }]
      //     })
      //   } else if(parentIndex > -1 && childIndex === -1) {
      //       // console.log(`parent name ::: parentIndex > -1 && childIndex === -1 -> parent:  ${this.parent} -> child: ${this.child} -> description: ${this.description}`)
      //       // this.resultJsonObject.suites.push({
      //       //   description: this.parent,
      //       //   tests: []
      //       // });
      //       //const updatedIndex = this.suitesHasEntry(this.parent);
      //       //console.log("updatedIndex :----->>>>", updatedIndex);
      //       this.resultJsonObject.suites[parentIndex].tests.push({
      //         description: this.child,
      //         tests:[{
      //           description: this.description,
      //           success: this.success,
      //           screenshotLink: this.screenshotLink.screenshotPath
      //         }]
      //       })
      //     // this.resultJsonObject.suites[parentIndex].tests.push({
      //     //   description: this.description,
      //     //   success: this.success,
      //     //   screenshotLink: this.screenshotLink.screenshotPath,
      //     // })
      //   } 
      //   else {
      //     // console.log(`parent name  inside else-> parent:  ${this.parent} -> child: ${this.child} -> description: ${this.description}`);
      //     // console.log("this.resultJsonObject.suites[parentIndex] :::: ", this.resultJsonObject.suites[parentIndex]);
      //     this.resultJsonObject.suites[parentIndex].tests[childIndex].tests.push({
      //       description: this.description,
      //       success: this.success,
      //       screenshotLink: this.screenshotLink.screenshotPath,
      //     })
      //   }
      // } else if(this.parent && !this.child) {
      //   const parentIndex = this.suitesHasEntry(this.parent)
      //   // console.log(`no child only parent  - >  parentIndex ::: ${parentIndex}, parent: ${this.parent}`);
      //   if (parentIndex > -1) {
      //     // console.log(`no child only parent && parentIndex > -1   - >  parentIndex ::: ${parentIndex}, parent: ${this.parent}, description: ${this.description}`);
      //     this.resultJsonObject.suites[parentIndex].tests.push({
      //       description: this.description,
      //       success: this.success,
      //       screenshotLink: this.screenshotLink.screenshotPath,
      //     })
      //   } else {
      //     // console.log("inside else");
      //     this.resultJsonObject.suites.push({
      //       description: this.parent,
      //       tests: [{
      //         description: this.description,
      //         success: this.success,
      //         screenshotLink: this.screenshotLink.screenshotPath,
      //       }]
      //     });
      //   }
      // }
      // this.reachedTestEnd = true;

      if(this.specHashData[test.specHash]) {
        if(this.specHashData[test.specHash][test.parent]) {
          this.specHashData[test.specHash][test.parent].tests.push({
            description: this.description,
            success: this.success,
            screenshotLink: this.screenshotLink.screenshotPath,
          })
        }
      }
      
      // this.resultJsonObject.suites.push(this.specHashData[test.specHash]);
      // this.resultJsonObject.suites.forEach(function (suit) {
      //   console.log("(((((((((((((( : ", suit[test.parent])
        // if(!suit[test.parent]) {
          
        //   this.endResult.suites.push(this.specHashData[test.specHash]);
        //   console.log("this.endResult ******* ", this.endResult);
        // }
      // });
      
      // if(this.resultJsonObject.suites.findIndex(({parent}) => parent === test.parent) < 0) {
      //   this.resultJsonObject.suites.push(this.specHashData[test.specHash]);
      //   console.log("__________________ : ", this.resultJsonObject.suites.findIndex(({parent}) => parent === test.parent));
        
      //   //   // this.resultJsonObject.suites[test.parent] = this.specHashData[test.specHash][test.parent]
      // }
      // if(this.resultJsonObject.suites[test.parent].tests.length < 0){

      // }
      // else{
      //   // this.resultJsonObject.suites.push(this.specHashData[test.specHash]);
      // }
      
      // const suiteIndex = this.suitesHasEntry(this.parent)
      // if (this.parent && suiteIndex === -1) {
      //   this.resultJsonObject.suites.push({
      //     description: this.parent,
      //     tests: [{
      //       description: this.description,
      //       success: this.success,
      //       screenshotLink: this.screenshotLink.screenshotPath,
      //     }]
      //   });
      // }

      // console.log(`suit index ::: ${suiteIndex}`)
      // if(!this.child || (this.suiteCount >= 1 && this.suiteCount <= 3)) {
      //   if (suiteIndex > -1) {
      //     this.resultJsonObject.suites[suiteIndex].tests.push({
      //       description: this.description,
      //       success: this.success,
      //       screenshotLink: this.screenshotLink.screenshotPath,
      //     })
      //   }
      //   this.suiteCount = 0;
      // }

      
      // if(this.child) {
      //   const testIndex = this.testsHasEntry(this.parent,this.child)
      //   console.log(`test index ::: ${testIndex}`)
      //   if (testIndex === -1 && suiteIndex > -1) {
      //     this.resultJsonObject.suites[suiteIndex].tests.push({
      //       description: this.child,
      //       tests: [{
      //         description: this.description,
      //         success: this.success,
      //         screenshotLink: this.screenshotLink.screenshotPath,
      //       }]
      //     });
      //   } else if(this.resultJsonObject.suites[suiteIndex]) {
      //     this.resultJsonObject.suites[suiteIndex].tests[testIndex].tests.push({
      //       description: this.description,
      //       success: this.success,
      //       screenshotLink: this.screenshotLink.screenshotPath,
      //     })
      //   } else if(testIndex > -1) {
      //     const parentIndex = this.suitesHasEntry(this.parent)
      //     this.resultJsonObject.suites[parentIndex].tests[testIndex].tests.push({
      //       description: this.description,
      //       success: this.success,
      //       screenshotLink: this.screenshotLink.screenshotPath,
      //     })
      //   } else {
      //     const parentIndex = this.suitesHasEntry(this.parent)
      //     this.resultJsonObject.suites[parentIndex].tests.push({
      //       description: this.child,
      //       tests: [{
      //         description: this.description,
      //         success: this.success,
      //         screenshotLink: this.screenshotLink.screenshotPath,
      //       }]
      //     });
      //   }
      // }
      //this.suiteCount = 0;
    });

    this.on("runner:end", (runner) => {
      console.log("__________ specHashData >>>>>>>>>>>> ", JSON.stringify(this.specHashData, null,2));
      // fs.writeFileSync(
      //   path.join(
      //     this.resultsDir,
      //     'specdata.json'),  
      //   `${JSON.stringify(this.specHashData, null, 2)}`,
      //   { flag: "w+" },
      //   (err) => {
      //     if (err) {
      //       Logger.error(err.message, { context: LOG_CONTEXT });
      //     }
      //   }
      // );
      var arrayData = this.specHashData
      // console.log("__________ runner end ___________");
      const filePathLocation = path.join(
        this.resultsDir,
        `${this.fileName}.json`
      );
      // console.log(" ____________________________________________________________ ")
      // console.log("this.resultJsonObject ::: runner:end", this.resultJsonObject)
      fs.writeFileSync(
        filePathLocation, 
        `${JSON.stringify(this.endResult, null, 2)}`,
        { flag: "w+" },
        (err) => {
          if (err) {
            Logger.error(err.message, { context: LOG_CONTEXT });
          }
        }
      );
    });
    this.on('suite:end', suite => {
      // console.log("_________suit:end __________");
      // const suiteStat = this.suites[suite.uid];
      // suiteStat.complete();
      // this.currentSuites.pop();
      // this.onSuiteEnd(suiteStat);
      // this.childArray = [];
      // this.parentArray = [];
      // fs.appendFile(
      //   path.join(
      //     this.resultsDir,
      //     `suite_end.json`
      //   ), 
      //   `${JSON.stringify(suite, null, 2)}`,
      //   (err) => {
      //     if (err) {
      //       console.log("err: ", err);
      //     }
      //   }
      // );
      fs.appendFile(
        path.join(
          this.resultsDir,
          `spechHash_data.json`
        ), 
        `${JSON.stringify(this.specHashData, null, 2)}`,
        (err) => {
          if (err) {
            console.log("err: ", err);
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
