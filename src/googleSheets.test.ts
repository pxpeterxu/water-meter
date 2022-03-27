import moment from 'moment';
import {
  _spreadsheetId,
  loadLastHourWithSavedUsage,
  saveLocalIPAddress,
  saveWaterMeterReadings,
} from './googleSheets';
import { WaterMeter } from './types';

describe(saveWaterMeterReadings, () => {
  it('adds a row', async () => {
    await saveWaterMeterReadings(new Date(2022, 0, 1, 0), {
      [WaterMeter.seventy]: 11570,
      [WaterMeter.seventyTwo]: 11572,
      [WaterMeter.seventyFour]: 11574,
    });
  });
});

describe(saveLocalIPAddress, () => {
  it('saves a sample IP address', async () => {
    await saveLocalIPAddress('123.45.67.89');
  });
});

describe(loadLastHourWithSavedUsage, () => {
  it('gets the correct value', async () => {
    console.log(
      `Verify by opening https://docs.google.com/spreadsheets/d/${_spreadsheetId}/edit that this is the last row`,
    );
    console.log(
      moment(await loadLastHourWithSavedUsage()).format('YYYY-MM-DD HH:mm'),
    );
  });
});
