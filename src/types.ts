/** Names of the different water meters we're monitoring */
export enum WaterMeter {
  // Warning: the orders of these are important since they're
  // assumed to be the order that we have them in the Google Sheets!
  // Don't change the order of them
  seventy = '1570',
  seventyTwo = '1572',
  seventyFour = '1574',
}

/**
 * Map of what's the latest number of gallons used by each
 * water meter based on the info seen
 */
export type WaterUsage = { [meter in WaterMeter]: number };
