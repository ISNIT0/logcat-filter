# Logcat-filter and analysis tool

> The checkLoggingCoverage.js tool probably belongs more in [log-searcher](https://github.com/ISNIT0/log-searcher)

## Requirements
* ADB (>=1.0.39)
* NodeJS (>=8.0.0)
* NPM dependencies:
    ```bash
    npm install
    ```

## Logcat-filter => JSON file

To start listening for logs for a specific package(s):
```bash
node ./index.js --package org.kiwix.kiwixmobile --package org.kiwix.kiwixcustomexample
```
Each time the Android package(s) is started, a new file will be opened and appended to.

## Logging Coverage Checker

To check log coverage, ensure you have successfully run [log-searcher](https://github.com/ISNIT0/log-searcher).

```bash
node ./checkLoggingCoverage.js --logsJSON ./<YOUR_OUTPUT_FILE>log.json --logAnalysis ../log-searcher/data.json
```
* __--logsJSON__ is a completed output file from logcat-filter (./index.js)
* __--logAnalysis__ is the output of log-searcher

This will generate `reportData.json`.

To view a report, run
```bash
npm run serve
```
