import moment from 'moment';
import { _addButtonListener, meterToPin } from './gpio';
import { delay } from './promises';

describe(_addButtonListener, () => {
  it('fires on button presses', async () => {
    const pins = [meterToPin['1570'], meterToPin['1572'], meterToPin['1574']];
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
