const fs = require('fs-extra');
const glob = require('glob');
const Logger = require('../utils/logger');

// eslint-disable-next-line global-require, import/no-dynamic-require
const isDirectory = filePath => (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory());

const cleanSnapshots = (options) => {
  const {
    removeReference,
    snapshotDirectory,
  } = options;

  const snapshotRoot = snapshotDirectory ? `${snapshotDirectory}/**` : '**';

  const patterns = [
    `${process.cwd()}/${snapshotRoot}/__snapshots__/latest`,
    `${process.cwd()}/${snapshotRoot}/__snapshots__/diff`,
    `${process.cwd()}/${snapshotRoot}/__snapshots__/screen`,
    `${process.cwd()}/errorScreenshots`,
  ];

  if (removeReference) {
    patterns.push(`${process.cwd()}/${snapshotRoot}/__snapshots__/reference`);
  }

  let screenshotDirectories = [];
  patterns.forEach((pattern) => {
    screenshotDirectories = screenshotDirectories.concat(glob.sync(pattern));
  });

  const removedDirs = [];
  screenshotDirectories.forEach((dir) => {
    if (isDirectory(dir)) {
      removedDirs.push(dir);
      fs.removeSync(dir);
    }
  });

  Logger.log('Cleaned screenshot directories\n', { context: '[Terra-Tookit:wdio-clean-screenshots]' });
};

module.exports = cleanSnapshots;
