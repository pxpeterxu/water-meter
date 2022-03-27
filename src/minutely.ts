import { saveLocalIPAddress } from './googleSheets';
import { getLocalIPAddress } from './wifi';
import { logger } from './logger';

let previousIpAddress: string | null = null;

/**
 * Every minute, save what IP address we're currently connected to so that
 * it's easy to debug
 */
export async function queryAndSaveLocalIPAddress() {
  const ipAddress = getLocalIPAddress() || 'Disconnected';
  try {
    if (ipAddress !== previousIpAddress) {
      previousIpAddress = ipAddress;
      logger.info(`Got local IP address: ${ipAddress}`);
      await saveLocalIPAddress(ipAddress);
      logger.info(`Saved local IP address: ${ipAddress}`);
    }
  } catch (err) {
    logger.error(`Failed to save local IP address: ${err.stack}`);
  }
}
