import mockdate from 'mockdate';
import * as fs from 'fs';
import {
  _makeWaterUsageFilename,
  getWaterUsageForHour,
  incrementWaterMeterUsageByOneGallon,
} from './waterUsageStore';
import { WaterMeter } from './types';

describe(getWaterUsageForHour, () => {
  it('sets and gets water usage without issues', async () => {
    const firstHour = new Date(2022, 0, 1, 0);
    mockdate.set(firstHour);
    const firstHourFilename = _makeWaterUsageFilename(firstHour);
    if (fs.existsSync(firstHourFilename)) {
      await fs.promises.unlink(firstHourFilename);
    }

    // Initially, should get 0s for all water usage
    expect(await getWaterUsageForHour()).toEqual({
      [WaterMeter.seventy]: 0,
      [WaterMeter.seventyTwo]: 0,
      [WaterMeter.seventyFour]: 0,
    });

    // After a single increment, we should have the right values
    await incrementWaterMeterUsageByOneGallon(WaterMeter.seventy);

    expect(await getWaterUsageForHour()).toEqual({
      [WaterMeter.seventy]: 1,
      [WaterMeter.seventyTwo]: 0,
      [WaterMeter.seventyFour]: 0,
    });

    // Do two simultaneous increments
    await Promise.all([
      incrementWaterMeterUsageByOneGallon(WaterMeter.seventy),
      incrementWaterMeterUsageByOneGallon(WaterMeter.seventyTwo),
    ]);

    expect(await getWaterUsageForHour()).toEqual({
      [WaterMeter.seventy]: 2,
      [WaterMeter.seventyTwo]: 1,
      [WaterMeter.seventyFour]: 0,
    });

    const secondHour = new Date(2022, 0, 1, 1);
    mockdate.set(secondHour);

    const secondHourFilename = _makeWaterUsageFilename(secondHour);
    if (fs.existsSync(secondHourFilename)) {
      await fs.promises.unlink(secondHourFilename);
    }

    // It's a new hour! We should have zeros
    expect(await getWaterUsageForHour()).toEqual({
      [WaterMeter.seventy]: 0,
      [WaterMeter.seventyTwo]: 0,
      [WaterMeter.seventyFour]: 0,
    });

    // Do two simultaneous increments
    await Promise.all([
      incrementWaterMeterUsageByOneGallon(WaterMeter.seventyTwo),
      incrementWaterMeterUsageByOneGallon(WaterMeter.seventyFour),
    ]);

    expect(await getWaterUsageForHour()).toEqual({
      [WaterMeter.seventy]: 0,
      [WaterMeter.seventyTwo]: 1,
      [WaterMeter.seventyFour]: 1,
    });
  });
});
