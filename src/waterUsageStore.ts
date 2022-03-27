import * as fs from 'fs';
import moment from 'moment';
import { WaterMeter, WaterUsage } from './types';
import { logger } from './logger';

let lastIncrementPromise: Promise<void> | null = null;

/**
 * Save the latest water meter usage both into a JSON file and
 * into memory
 */
export async function incrementWaterMeterUsageByOneGallon(meter: WaterMeter) {
  const prevLastIncrementPromise = lastIncrementPromise;
  lastIncrementPromise = (async () => {
    // Make sure we don't have any race conditions
    await prevLastIncrementPromise;
    const prevUsage = await getThisHourWaterUsage();
    const nextUsage = {
      ...prevUsage,
      [meter]: prevUsage[meter] + 1,
    };
    await setThisHourWaterUsage(nextUsage);
  })();

  await lastIncrementPromise;
}

/** Get the water usage for some past hour */
export async function getWaterUsageForHour(time: Date | null = null) {
  const filename = _makeWaterUsageFilename(time);
  if (fs.existsSync(filename)) {
    try {
      return JSON.parse(await fs.promises.readFile(filename, 'utf8'));
    } catch (err) {
      logger.error();
      return noUsage;
    }
  }

  return noUsage;
}

/** Zero usage default values for the water use for an hour */
const noUsage: WaterUsage = {
  [WaterMeter.seventy]: 0,
  [WaterMeter.seventyTwo]: 0,
  [WaterMeter.seventyFour]: 0,
};

interface WaterUsageWithHour {
  /** The filename for the current hour */
  filename: string;
  usage: WaterUsage;
}

let thisHourWaterUsage: WaterUsageWithHour | null = null;
let thisHourWaterUsagePromise: Promise<WaterUsage> | null = null;

/**
 * Get the current amount of gallons used by each meter for
 * this current hour.
 * 1. Tries to get it from in-memory store
 * 2. If there's a pending request, use it
 * 3. Get it by trying to reading a file from the filesystem
 *    (for when the server restarts), or if that fails, just
 *    set it to zeros
 */
async function getThisHourWaterUsage(): Promise<WaterUsage> {
  const filename = _makeWaterUsageFilename();

  // If we've got live, in-memory usage data, return it
  if (thisHourWaterUsage && thisHourWaterUsage.filename === filename)
    return thisHourWaterUsage.usage;
  if (thisHourWaterUsagePromise) return thisHourWaterUsagePromise;

  thisHourWaterUsagePromise = (async () => {
    let usage: WaterUsage = {
      [WaterMeter.seventy]: 0,
      [WaterMeter.seventyTwo]: 0,
      [WaterMeter.seventyFour]: 0,
    };
    if (fs.existsSync(filename)) {
      try {
        usage = JSON.parse(await fs.promises.readFile(filename, 'utf8'));
      } catch (err) {
        logger.info(
          `Failed to parse JSON file (${filename}) for this hour: ${err.stack}`,
        );
      }
    }

    thisHourWaterUsage = { filename, usage };

    thisHourWaterUsagePromise = null;
    return thisHourWaterUsage.usage;
  })();
  return thisHourWaterUsagePromise;
}

/**
 * Sets the current hour's water usage, both in memory and to the
 * file given
 */
async function setThisHourWaterUsage(usage: WaterUsage) {
  const filename = _makeWaterUsageFilename();
  if (thisHourWaterUsage?.filename === filename) {
    thisHourWaterUsage.usage = usage;
  } else {
    thisHourWaterUsage = { filename, usage };
  }

  if (!fs.existsSync(dataDir)) {
    await fs.promises.mkdir(dataDir, { recursive: true });
  }

  await fs.promises.writeFile(
    _makeWaterUsageFilename(),
    JSON.stringify(usage, null, 2),
    'utf8',
  );
}

const dataDir = `${__dirname}/data`;

export function _makeWaterUsageFilename(time: Date | null = null) {
  return `${__dirname}/data/${moment(time || undefined).format(
    'YYYY-MM-DD-HH',
  )}.json`;
}
