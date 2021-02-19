import fs from 'fs-extra';
import glob from 'glob';
import cleanSnapshots from '../../scripts/wdio/clean-screenshots';

jest.mock('fs-extra');
jest.mock('glob');

describe('cleanSnapshots', () => {
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

  const setupMocks = () => {
    fs.existsSync.mockReturnValue(true);
    fs.lstatSync.mockReturnValue({ isDirectory: () => true });
    glob.sync.mockImplementation((path) => `${path}/test`);
  };

  describe('searches snapshots', () => {
    const expectToSearchUnder = (path) => {
      expect(glob.sync).toHaveBeenCalledWith(`${process.cwd()}/${path}/__snapshots__/latest`);
      expect(glob.sync).toHaveBeenCalledWith(`${process.cwd()}/${path}/__snapshots__/diff`);
      expect(glob.sync).toHaveBeenCalledWith(`${process.cwd()}/${path}/__snapshots__/screen`);
      expect(glob.sync).toHaveBeenCalledWith(`${process.cwd()}/errorScreenshots`);
      expect(glob.sync).toHaveBeenCalledWith(`${process.cwd()}/${path}/__snapshots__/reference`);
    };

    it('under cwd when snapshot directory is undefined', () => {
      setupMocks();
      cleanSnapshots({ removeReference: true });
      expectToSearchUnder('**');
    });

    it.each`
      snapshotDirectory                   | expectedSearchPath
      ${''}                               | ${'**'}
      ${'snapshotDirectory'}              | ${'snapshotDirectory/**'}
      ${'snapshotDirectory/subDirectory'} | ${'snapshotDirectory/subDirectory/**'}`(
  'under $expectedSearchPath when snapshot directory is $snapshotDirectory',
  ({ snapshotDirectory, expectedSearchPath }) => {
    setupMocks();
    cleanSnapshots({ snapshotDirectory, removeReference: true });
    expectToSearchUnder(expectedSearchPath);
  },
);
  });

  describe('deletes snapshots', () => {
    const expectToDeleteUnder = (path) => {
      expect(fs.removeSync).toHaveBeenCalledWith(`${process.cwd()}/${path}/__snapshots__/latest/test`);
      expect(fs.removeSync).toHaveBeenCalledWith(`${process.cwd()}/${path}/__snapshots__/diff/test`);
      expect(fs.removeSync).toHaveBeenCalledWith(`${process.cwd()}/${path}/__snapshots__/screen/test`);
      expect(fs.removeSync).toHaveBeenCalledWith(`${process.cwd()}/errorScreenshots/test`);
      expect(fs.removeSync).toHaveBeenCalledWith(`${process.cwd()}/${path}/__snapshots__/reference/test`);
    };

    it('under cwd when snapshot directory is undefined', () => {
      setupMocks();
      cleanSnapshots({ removeReference: true });
      expectToDeleteUnder('**');
    });

    it.each`
      snapshotDirectory                   | expectedDeletePath
      ${''}                               | ${'**'}
      ${'snapshotDirectory'}              | ${'snapshotDirectory/**'}
      ${'snapshotDirectory/subDirectory'} | ${'snapshotDirectory/subDirectory/**'}`(
  'under $expectedDeletePath when snapshot directory is $snapshotDirectory',
  ({ snapshotDirectory, expectedDeletePath }) => {
    setupMocks();
    cleanSnapshots({ snapshotDirectory, removeReference: true });
    expectToDeleteUnder(expectedDeletePath);
  },
);
  });
});
