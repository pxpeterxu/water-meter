import moment from 'moment';
import { _addButtonListener } from './gpio';
import { delay } from './promises';

describe(_addButtonListener, () => {
  it('fires on button presses', async () => {
    const pins = ['XIO-P0', 'XIO-P1', 'XIO-P2', 'XIO-P3'];
    await Promise.all(
      pins.map((pin) =>
        _addButtonListener({
          pin,
          onDown: () => {
            console.log(
              `${moment().format()}: ${pin} down (pressed/connected)`,
            );
          },
          onUp: () => {
            console.log(
              `${moment().format()}: ${pin} up (released/disconnected)`,
            );
          },
        }),
      ),
    );
    console.log(
      `${moment().format()} Listeners added for pins ${pins.join(', ')}`,
    );

    // Keep running indefinitely
    await delay(10000000);
  }, 10000000);
});
