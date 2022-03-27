import { google } from 'googleapis';
import moment from 'moment';
import { WaterMeter, WaterUsage } from './types';
import { logger } from './logger';
import { googleCloudKeyFile, googleSpreadsheetId } from './config';

/**
 * Save the latest water meter readings to the Google Sheets
 * specified by adding a row
 */
export async function saveWaterMeterReadings(
  time: Date,
  waterUsage: WaterUsage,
) {
  (await getSheetsClient()).append({
    spreadsheetId: _spreadsheetId,
    range: 'A:D',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
          moment(time).format('YYYY-MM-DD HH:mm'),
          ...Object.values(WaterMeter).map((meter) => waterUsage[meter]),
        ],
      ],
    },
  });
}

/**
 * Get the last hour for which we've saved usage to the Google Sheets.
 * We use this to figure out when to start sending
 */
export async function loadLastHourWithSavedUsage(): Promise<Date> {
  const oneHourAgo = moment().subtract(1, 'hour').startOf('hour').toDate();
  try {
    const client = await getSheetsClient();
    const result = await client.get({
      spreadsheetId: _spreadsheetId,
      range: 'G1',
      valueRenderOption: 'FORMATTED_VALUE',
    });
    const time = result.data.values?.[0]?.[0] || null;

    if (time) {
      // Use the local timezone to parse
      const timezoneStr = moment().format('Z');
      const momentObj = moment(
        `${time} ${timezoneStr}`,
        'YYYY-MM-DD HH:mm:ss Z',
      ).local();
      if (momentObj.isValid()) return momentObj.toDate();
    } else return oneHourAgo;
  } catch (err) {
    logger.error(`Got error while getting list hour with usage: ${err.stack}`);
    // eslint-disable-next-line no-unsafe-finally
    return oneHourAgo;
  }

  return oneHourAgo;
}

/**
 * Save the IP address that the device is registered on the local network.
 * Helpful for debugging since it avoids having to hunt for the IP
 */
export async function saveLocalIPAddress(ipAddress: string) {
  await (
    await getSheetsClient()
  ).update({
    spreadsheetId: _spreadsheetId,
    range: 'G2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[ipAddress]] },
  });
}

async function getSheetsClient() {
  const jwtClient = new google.auth.JWT({
    keyFile: googleCloudKeyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  await jwtClient.authorize();
  return google.sheets({ version: 'v4', auth: jwtClient }).spreadsheets.values;
}

export const _spreadsheetId = googleSpreadsheetId;
