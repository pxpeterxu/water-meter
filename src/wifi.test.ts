import { getLocalIPAddress } from './wifi';

describe(getLocalIPAddress, () => {
  it('gets the local IP address', () => {
    console.log(getLocalIPAddress());
  });
});
