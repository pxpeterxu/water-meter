import moment from 'moment';
import {
  loadLastHourWithSavedUsage,
  saveWaterMeterReadings,
} from './googleSheets';
import { getWaterUsageForHour } from './waterUsageStore';
import { logger } from './logger';

/** Send the last few hours' worth of water usage to Google Sheets */
export async function sendWaterUsageToGoogleSheets() {
  logger.info('Starting hourly upload');

  const lastHourWithUsage = await loadLastHourWithSavedUsage();
  logger.info(`Last hour with saved usage ${lastHourWithUsage}`);
  const momentObj = moment(lastHourWithUsage).local().add(1, 'hour');
  const startOfThisHour = moment().local().startOf('hour');

  logger.info(
    `Uploading all data after ${moment(
      lastHourWithUsage,
    ).format()} and before now (${startOfThisHour.format()})`,
  );

  while (momentObj.isBefore(startOfThisHour)) {
    // eslint-disable-next-line no-await-in-loop
    const usage = await getWaterUsageForHour(momentObj.toDate());
    logger.info(
      `Uploading water usage for ${momentObj.format()}: ${JSON.stringify(
        usage,
      )}`,
    );
    // eslint-disable-next-line no-await-in-loop
    await saveWaterMeterReadings(momentObj.toDate(), usage);
    momentObj.add(1, 'hour').startOf('hour');
  }

  logger.info('Done hourly upload');
}
