import fs from 'fs';
import TerraWDIOTestDetailsReporter from '../../reporters/wdio/TerraWDIOTestDetailsReporter';

jest.mock('fs');

describe('TerraWDIOTestDetailsReporter', () => {
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
});
