import fs from 'fs';
import TerraWDIOTestDetailsReporter from '../../reporters/wdio/TerraWDIOTestDetailsReporter';

jest.mock('fs');

describe.only('TerraWDIOTestDetailsReporter', () => {
  const originalProcessCwd = process.cwd;
  beforeAll(() => {
    process.cwd = jest.fn().mockImplementation(() => './terra-toolkit-boneyard');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.cwd = originalProcessCwd;
  });

  describe('initialization', () => {
    it('defines resultJsonObject', () => {
      const reporter = new TerraWDIOTestDetailsReporter({}, {});
      expect(reporter.resultJsonObject).toHaveProperty('locale');
      expect(reporter.resultJsonObject).toHaveProperty('theme');
      expect(reporter.resultJsonObject).toHaveProperty('formFactor');
      expect(reporter.resultJsonObject).toHaveProperty('browser');
      expect(reporter.resultJsonObject).toHaveProperty('suites');
      expect(typeof reporter.resultJsonObject.suites).toEqual('object');
    });

    it('defines fileName', () => {
      const reporter = new TerraWDIOTestDetailsReporter({}, {});
      expect(reporter.fileName).toBe('');
    });

    describe('determines results dir', () => {
      it('when outputDir has not been defined in configuration', () => {
        fs.existsSync.mockReturnValue(true);
        let reporter = new TerraWDIOTestDetailsReporter({}, {});
        reporter.setResultsDir()
        expect(reporter.resultsDir).toEqual(expect.stringContaining('test/wdio/reports/details'));

        fs.existsSync.mockReturnValue(false);
        reporter = new TerraWDIOTestDetailsReporter({}, {});
        reporter.setResultsDir()
        expect(reporter.resultsDir).toEqual(expect.stringContaining('tests/wdio/reports/details'));
      });

      it('when outputDir is defined in configuration', () => {
        const reporter = new TerraWDIOTestDetailsReporter({}, { reporterOptions: { detailsReporter: 'my-test-reports/wdio' } });
        reporter.setResultsDir()
        expect(reporter.resultsDir).toEqual('my-test-reports/wdio');
      });
    });

    describe('ensures results dir exists', () => {
      it('when dir exists', () => {
        fs.existsSync.mockReturnValue(true);
        const reporter = new TerraWDIOTestDetailsReporter({}, {});
        reporter.hasResultsDir();
        expect(fs.mkdirSync).not.toHaveBeenCalled();
      });

      it('when dir does not exists', () => {
        fs.existsSync.mockReturnValue(false);
        const reporter = new TerraWDIOTestDetailsReporter({}, {});
        reporter.hasResultsDir();
        expect(fs.mkdirSync).toHaveBeenCalled();
      });
    });
  });

  describe('fileNameCheck', () => {
    it('sets default file name', () => {
      const reporter = new TerraWDIOTestDetailsReporter({}, {});
      reporter.fileNameCheck({ }, '');
      expect(reporter.fileName).toEqual('result-details');
      expect(reporter.resultJsonObject).toHaveProperty('locale', '');
      expect(reporter.resultJsonObject).toHaveProperty('theme', '');
      expect(reporter.resultJsonObject).toHaveProperty('formFactor', '');
      expect(reporter.resultJsonObject).toHaveProperty('browser', '');
    });

    it('sets file name with locale', () => {
      const reporter = new TerraWDIOTestDetailsReporter({}, {});
      reporter.fileNameCheck({ locale: 'en' }, '');
      expect(reporter.fileName).toEqual('result-details-en');
      expect(reporter.resultJsonObject).toHaveProperty('locale', 'en');
      expect(reporter.resultJsonObject).toHaveProperty('theme', '');
      expect(reporter.resultJsonObject).toHaveProperty('formFactor', '');
      expect(reporter.resultJsonObject).toHaveProperty('browser', '');
    });

    it('sets file name with locale and theme', () => {
      const reporter = new TerraWDIOTestDetailsReporter({}, {});
      reporter.fileNameCheck({ locale: 'en', theme: 'default' }, '');
      expect(reporter.fileName).toEqual('result-details-en-default');
      expect(reporter.resultJsonObject).toHaveProperty('locale', 'en');
      expect(reporter.resultJsonObject).toHaveProperty('theme', 'default');
      expect(reporter.resultJsonObject).toHaveProperty('formFactor', '');
      expect(reporter.resultJsonObject).toHaveProperty('browser', '');
    });

    it('sets file name with locale, theme and formFactor', () => {
      const reporter = new TerraWDIOTestDetailsReporter({}, {});
      reporter.fileNameCheck({ locale: 'en', theme: 'default', formFactor: 'tiny' }, '');
      expect(reporter.fileName).toEqual('result-details-en-default-tiny');
      expect(reporter.resultJsonObject).toHaveProperty('locale', 'en');
      expect(reporter.resultJsonObject).toHaveProperty('theme', 'default');
      expect(reporter.resultJsonObject).toHaveProperty('formFactor', 'tiny');
      expect(reporter.resultJsonObject).toHaveProperty('browser', '');
    });

    it('sets file name with locale, theme, formFactor and browser', () => {
      const reporter = new TerraWDIOTestDetailsReporter({}, {});
      reporter.fileNameCheck({ locale: 'en', theme: 'default', formFactor: 'tiny' }, {browserName: 'chrome'});
      expect(reporter.fileName).toEqual('result-details-en-default-tiny-chrome');
      expect(reporter.resultJsonObject).toHaveProperty('locale', 'en');
      expect(reporter.resultJsonObject).toHaveProperty('theme', 'default');
      expect(reporter.resultJsonObject).toHaveProperty('formFactor', 'tiny');
      expect(reporter.resultJsonObject).toHaveProperty('browser', 'chrome');
    });
  });

  describe('setTestModule', () => {
    it('updates moduleName if mono-repo test file', () => {
      const reporter = new TerraWDIOTestDetailsReporter({}, {});
      expect(reporter.moduleName).toEqual('');
      reporter.setTestModule('terra-toolkit-boneyard/packages/my-package/tests/wdio/test-spec.js');
      expect(reporter.moduleName).toEqual('my-package');
    });

    it('does not updates moduleName if non mono-repo test file', () => {
      const reporter = new TerraWDIOTestDetailsReporter({}, {});
      expect(reporter.moduleName).toEqual('');
      reporter.setTestModule('terra-toolkit/tests/wdio/test-spec.js');
      expect(reporter.moduleName).toEqual('');
    });
  });

  describe('test:start', () => {
      it('test:start description should set ', () => {
        const reporter = new TerraWDIOTestDetailsReporter({}, {});
       reporter.emit('test:start', {title: 'title of the it'})
        expect(reporter.description).toEqual('title of the it')
    })
})
    describe('reaches test:pass or test:fail', () => {
        it('test:pass description should set ', () => {
            const reporter = new TerraWDIOTestDetailsReporter({}, {});
            reporter.emit('test:pass', {success: 'success'})
            expect(reporter.success).toEqual('success')
        })
        it('test:fail description should set ', () => {
            const reporter = new TerraWDIOTestDetailsReporter({}, {});
            reporter.emit('test:fail', {success: 'fail'})
            expect(reporter.success).toEqual('fail')
        })
    })

    describe('terra-wdio:latest-screenshot', () => {
        it('terra-wdio:latest-screenshotshould set screenshotLink', () => {
            const reporter = new TerraWDIOTestDetailsReporter({}, {});
            reporter.emit('terra-wdio:latest-screenshot', {screenshotLink: 'opt/Image.png'})
            expect(reporter.screenshotLink).toEqual({"screenshotLink": "opt/Image.png"})
        })
    })
    describe('runner:start', () => {
        it('runner:start should call the funtions', () => {
            const runner = {
                    "event": "runner:start",
                    "cid": "0-1",
                    "specs": [
                      "/opt/module/tests/wdio/validateElement-spec.js"
                    ],
                    "capabilities": {
                      "browserName": "chrome",
                      "maxInstances": 1,
                    },
                    "config": {
                      "host": "standalone-chrome",
                      "port": 4444,
                      "sync": true,
                      "specs": [
                        "test*/wdio/**/*-spec.js"
                      ],
                      "locale": "fr",
                      "formFactor": "huge",
                      "desiredCapabilities": {
                        "browserName": "chrome",
                        "maxInstances": 1,
                      }
                    },
                    "specHash": "fa372c346f402d6e30314f44107e880c"
                  
            }
            const reporter = new TerraWDIOTestDetailsReporter({}, {});
            reporter.emit('runner:start', runner);
            reporter.setTestModule(runner.specs[0]);
            reporter.setResultsDir();
            reporter.hasResultsDir();
            expect(reporter.resultJsonObject.locale ).toEqual('fr')
            expect(reporter.resultJsonObject.browser ).toEqual('chrome')
            expect(reporter.resultJsonObject.formFactor ).toEqual('huge')
            expect(reporter.resultJsonObject.theme ).toEqual('default-theme')
            reporter.fileNameCheck(runner.config, runner.capabilities);
        })
    })
    describe('suite:start', () => {
        it('suite:start for mono repo', () => {
            const reporter = new TerraWDIOTestDetailsReporter({}, {});
            const params = {
                "specHash" : "f75728c9953420794e669cae74b03d58",
                "title": "group2",
                "parent": "hideInputCaret"
            }
            reporter.moduleName = "terra-clinical";
            reporter.emit('suite:start', params)
            expect(reporter.specHashData).toHaveProperty(reporter.moduleName);
            expect(reporter.specHashData[reporter.moduleName][params.specHash][params.title]).toHaveProperty('parent');
            expect(reporter.specHashData[reporter.moduleName][params.specHash][params.title]).toHaveProperty('description');
            expect(reporter.specHashData[reporter.moduleName][params.specHash][params.title]).toHaveProperty('tests');
            expect(typeof reporter.specHashData[reporter.moduleName][params.specHash][params.title].tests).toEqual('object')

        })
        it('suite:start for non mono repo', () => {
          const reporter = new TerraWDIOTestDetailsReporter({}, {});
          const params = {
              "specHash" : "f75728c9953420794e669cae74b03d58",
              "title": "group2",
              "parent": "hideInputCaret"
          }
          reporter.emit('suite:start', params)
          expect(reporter.specHashData).not.toHaveProperty(reporter.moduleName);
          expect(reporter.specHashData[params.specHash][params.title]).toHaveProperty('parent');
          expect(reporter.specHashData[params.specHash][params.title]).toHaveProperty('description');
          expect(reporter.specHashData[params.specHash][params.title]).toHaveProperty('tests');
          expect(typeof reporter.specHashData[params.specHash][params.title].tests).toEqual('object')

      })
    })
    describe('runner:end', () => {
        it('suite:start for mono repo', () => {
            const reporter = new TerraWDIOTestDetailsReporter({}, {});
            reporter.specHashData  =  { 'terra-clinical-data-grid':
            { f75728c9953420794e669cae74b03d58:
              { hideInputCaret:
                 { parent: 'hideInputCaret',
                   description: 'hideInputCaret',
                   tests: [
                    {
                      "description": "Express correctly sets the application locale",
                      "success": "success"
                    },
                    {
                      "description": "[default] to be within the mismatch tolerance",
                      "success": "success",
                      "screenshotLink": "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/i18n-spec/I18n_Locale[default].png"
                    }
                   ] 
                  },
              }
             }
            }
         
            reporter.moduleName = "terra-clinical-data-grid";
            reporter.emit('runner:end')
            expect(reporter.resultJsonObject).toHaveProperty('suites');
            expect(typeof reporter.resultJsonObject).toEqual('object')
            expect(reporter.resultJsonObject.suites[reporter.moduleName].tests.length).toBeGreaterThanOrEqual(1);
            expect(fs.writeFileSync).toHaveBeenCalled();

        })
        it('suite:start for non mono repo', () => {
          const reporter = new TerraWDIOTestDetailsReporter({}, {});
          reporter.specHashData  =  {
            "f75728c9953420794e669cae74b03d58": {
              "hideInputCaret": {
                "parent": "hideInputCaret",
                "description": "hideInputCaret",
                "tests": []
              },
              "group1": {
                "parent": "hideInputCaret",
                "description": "group1",
                "tests": [
                  {
                    "description": "validates the textarea's caret-color is inherited as transparent",
                    "success": "success",
                    "screenshotLink": "/opt/module/tests/wdio/__snapshots__/latest/en/chrome_tiny/validateElement-spec/full_implementation[default].png"
                  }
                ]
              }
            }
          }          
          reporter.emit('runner:end')
          expect(reporter.resultJsonObject).toHaveProperty('suites');
          expect(typeof reporter.resultJsonObject).toEqual('object')
          expect(reporter.resultJsonObject.suites.length).toBeGreaterThanOrEqual(1);
          expect(fs.writeFileSync).toHaveBeenCalled();

      })
    })
});
