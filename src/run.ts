import { scheduleJob } from 'node-schedule';
import { startGPIOListeners } from './gpio';
import { sendWaterUsageToGoogleSheets } from './hourly';
import { queryAndSaveLocalIPAddress } from './minutely';

async function run() {
  await startGPIOListeners();
  await Promise.all([
    sendWaterUsageToGoogleSheets(),
    queryAndSaveLocalIPAddress(),
  ]);
  scheduleJob('0 0 * * * *', sendWaterUsageToGoogleSheets);
  scheduleJob('0 * * * * *', queryAndSaveLocalIPAddress);
}

run();
