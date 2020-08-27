const events = require('events');

class TryReporter extends events.EventEmitter {
  constructor() {
    super();

    this.latestScreenshots = [];

    this.on('terra-wdio:latest-screenshot', (screenshotPath) => {
      console.log('     > listener :', screenshotPath);
    });

    this.on('runner:end', () => {
      console.log('Runner end');
    });
  }
}

TryReporter.reporterName = 'TryReporter';
module.exports = TryReporter;
