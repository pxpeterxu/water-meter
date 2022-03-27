import { Board, Button } from 'johnny-five';
import ChipIO from 'chip-io';
import { WaterMeter } from './types';
import { incrementWaterMeterUsageByOneGallon } from './waterUsageStore';
import { logger } from './logger';

/**
 * Start listeners for each of the water meters' GPIO ports.
 * We register a gallon whenever we get an "up + down" or "down + up"
 * sequence
 */
export async function startGPIOListeners() {
  await _withReadyBoard(() => {
    logger.info('Initializing GPIO listeners');

    Object.values(WaterMeter).forEach((meter) => {
      logger.info(
        `[${meter}] Initializing GPIO listener on ${meterToPin[meter]}`,
      );
      const button = new Button({ pin: meterToPin[meter] });
      let receivedDownEvent = false;

      let prevUnmatchedEvent: 'down' | 'up' | null = null;

      button.on('down', () => {
        const isMatchingEvent = prevUnmatchedEvent === 'up';
        if (!receivedDownEvent) {
          receivedDownEvent = true;
          logger.info(
            `[${meter}] Received first down signal: ${
              isMatchingEvent ? 'registering gallon' : 'waiting for up'
            }`,
          );
        }

        if (isMatchingEvent) {
          prevUnmatchedEvent = null;

          // We increment water usage whenever we get an "up + down" pair
          incrementWaterMeterUsageByOneGallon(meter);
        } else {
          prevUnmatchedEvent = 'down';
        }
      });

      let receivedUpEvent = false;
      button.on('up', () => {
        const isMatchingEvent = prevUnmatchedEvent === 'down';
        if (!receivedUpEvent) {
          receivedUpEvent = true;
          logger.info(
            `[${meter}] Received first up signal: ${
              isMatchingEvent ? 'registering gallon' : 'waiting for down'
            }`,
          );
        }

        if (isMatchingEvent) {
          prevUnmatchedEvent = null;

          // We increment water usage whenever we get an "up + down" pair
          incrementWaterMeterUsageByOneGallon(meter);
        } else {
          prevUnmatchedEvent = 'up';
        }
      });
    });
  });
}

let board: Board | null = null;
let boardReadyPromise: Promise<void> | null = null;

/** Run a function once the board (the C.H.I.P.) is ready */
async function _withReadyBoard(func: (brd: Board) => unknown) {
  if (!board) {
    logger.info('Initializing board');
    board = new Board({ io: new ChipIO() });
  }

  boardReadyPromise =
    boardReadyPromise ||
    new Promise<void>((resolve) => {
      logger.info('Initialized board');
      board!.on('ready', resolve);
    });

  await boardReadyPromise;

  func(board);
}

/** Add a button listener to a given pin */
export async function _addButtonListener({
  pin,
  onDown,
  onUp,
}: {
  pin: string;
  onDown: () => unknown;
  onUp: () => unknown;
}) {
  _withReadyBoard(() => {
    const button = new Button({ pin });
    button.on('down', onDown);
    button.on('up', onUp);
  });
}

/**
 * A mapping from water meters to the GPIO pins on the CHIP:
 * see https://github.com/sandeepmistry/node-chip-io#pin-guide
 * for a list of all available pins
 */

const meterToPin: { [meter in WaterMeter]: string } = {
  [WaterMeter.seventy]: 'XIO-P0',
  [WaterMeter.seventyTwo]: 'XIO-P1',
  [WaterMeter.seventyFour]: 'XIO-P2',
};
