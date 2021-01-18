# Terra WDIO Test Details Reporter

Wdio Test Details Reporter is a reporter that logs wdio visualRegression test output to a file with the following attributes

- Locale, Form Factor, Browsers and Theme of the tests

- Name of the tests, whether they've succeeded or failed and the screenshot link

**WDIO test output Directory**
Terra WDIO Test Details Reporter logs the WDIO test output in tests/wdio/reports/details or test/wdio/reports/details depending on whether tests or test is the directory that contains specs

**Check for Mono Repo**
Terra WDIO Test Details Reporter assumes mono-repo will have packages directory in the root folder

## Usage

Add TerraWDIOTestDetailsReporter as an additional reporter within the wdio.config file. Include "dot" to avoid overriding default reporters

```javascript

const TerraWDIOTestDetailsReporter = require('terra-toolkit/reporters/wdio/TerraWDIOTestDetailsReporter');
{
 reporters: ['dot', TerraWDIOSpecReporter, TerraWDIOTestDetailsReporter],
}

```

Add event emitter in the visualRegressionConfig.js so that when ever a screenshot is taken a the screenshot link is send

```javascript

screenshotName: (context) => {
    const screenshotPath = getScreenshotPath('screenshot')(context);
    process.send({ event: 'terra-wdio:latest-screenshot', screenshotPath });
    return screenshotPath;
}

```

## Report Format

- The name of the log file for non-monorepo will be **result-details-\<locale>-\<theme>-\<form-factor>-\<browser>-\<repo-name>.json**(eg: result-details-en-huge-chrome-terra-toolkit-boneyard.json)

- The name of the log file for mono-repo will be **result-details-\<locale>-\<theme>-\<form-factor>-\<browser>-<Package-name>.json**(eg: result-details-clinical-lowlight-theme-chrome-terra-clinical-data-grid.json)

- Example output  [a relative link](details-reporter-sample-results.json)
s