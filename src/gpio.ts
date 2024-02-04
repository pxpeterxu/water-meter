import { Board, Button } from 'johnny-five';
import { RaspiIO } from 'raspi-io';
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
    board = new Board({
      io: new RaspiIO(),
    });
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
    // Since we connect to ground, use a pull-up resistor, which
    // is also supposed to be slightly better for noise-tolerance:
    // Our diagram: https://docs.google.com/drawings/d/1mreJUlSr_8Lj_v_qnm54Mb6FJzXbTNlOOgfM4Ys-_sU/edit
    // Johnny-Five diagram:
    // https://johnny-five.io/examples/button-pullup/
    // https://imgur.com/a/XHpiYgp (mirror)
    //
    // Why pull-up is better than pull-down:
    // https://electronics.stackexchange.com/a/405369
    const button = new Button({ pin, isPullup: true });
    button.on('down', onDown);
    button.on('up', onUp);
  });
}

/**
 * A mapping from water meters to the GPIO pins
 */
export const meterToPin: { [meter in WaterMeter]: string } = {
  // See https://github.com/nebrius/raspi-io/wiki/Pin-Information#model-abraspberry-pi-2raspberry-pi-3raspberry-pi-4raspberry-pi-zero
  // for a list of all available pins
  // and https://pi4j.com/1.2/pins/model-zerow-rev1.html
  // for a diagram
  //
  // Keep colors in sync with
  // https://docs.google.com/drawings/d/1mreJUlSr_8Lj_v_qnm54Mb6FJzXbTNlOOgfM4Ys-_sU/edit
  [WaterMeter.seventy]: 'GPIO21', // Red
  [WaterMeter.seventyTwo]: 'GPIO20', // Yellow
  [WaterMeter.seventyFour]: 'GPIO16', // White
};
