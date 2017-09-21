const fs = require('fs');
const argv = require('yargs').argv

const logcat = require('adbkit-logcat');
const spawn = require('child_process').spawn;
const execSync = require('child_process').execSync;
const moment = require('moment');

const packageNames = [].concat(argv.package);

const extractPID = /(?:Start proc (\d+))|(?: pid=(\d*))/;

console.warn(`*** FLUSHING LOGS ***`);
execSync('adb logcat -c');
console.warn(`*** Android Logs Flushed ***`);
const connectedDeviceModel = execSync('adb shell getprop ro.product.model').toString().trim();
console.info(`Found device [${connectedDeviceModel}]`);

// Retrieve a binary log stream 
const proc = spawn('adb', ['logcat', '-B']);

// Connect logcat to the stream 
const reader = logcat.readStream(proc.stdout);

packageNames.forEach(watchPackage);

async function watchPackage(packageName) {
    try {
        const {
            pid: procId,
            procStartLog
        } = await watchForPID(reader, packageName);
        const filename = `./${packageName}.${(new Date()).toISOString()}.${connectedDeviceModel.replace(/\s/g, '_')}.log.json`;
        console.info(`Streaming logs for ${procId} (${packageName}) into ${filename}`);
        const eot = `Killing ${procId}`;
        let isFirst = true;
        let fileEnded = false;
        fs.writeFileSync(filename, '[' + JSON.stringify(procStartLog) + ',\n'); //Starting file
        reader.on('entry', function (entry) {
            if (entry.pid === Number(procId) /* && !!~entry.tag.indexOf('iwix')*/ ) {
                fs.appendFileSync(filename, (isFirst ? '' : ',') + JSON.stringify(entry) + '\n');
                isFirst = false;
            }
            if (~entry.message.indexOf(eot)) {
                if (!fileEnded) {
                    fs.appendFileSync(filename, ']');
                }
                console.info(`${procId} closed... Ended log stream to (${filename})`);
                watchPackage(packageName);
            }
        });

        process.on('SIGINT', function () {
            proc.kill();
            if (!fileEnded) {
                fs.appendFileSync(filename, ']');
            }
        });
    } catch (err) {
        console.error(err);
    }
}

async function watchForPID(reader, packageName) {
    console.info(`Watching for PID of [${packageName}]`);
    return new Promise((resolve, reject) => {
        reader.on('entry', function (entry) {
            const isProcessStarting = !!~entry.message.indexOf(`${packageName}`) && !!~entry.message.indexOf('Start proc');
            if (isProcessStarting) {
                const match = entry.message.match(extractPID);
                if (match) {
                    const PID = match[1] || match[2];
                    if (PID) {
                        console.info(`Found ${PID} for [${packageName}]`);
                        resolve({
                            pid: PID,
                            procStartLog: entry
                        });
                    } else {
                        console.warn(`Found Process Start, but no PID detected for message [${entry.message}]`);
                    }
                }
            }
        });
        reader.on('end', () => reject(`Logcat stream ended`));
    });
}


//TODO: Exceptions?