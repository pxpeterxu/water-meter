const { networkInterfaces } = require('os');

/**
 * Get the local network's IP address.
 * Based on https://stackoverflow.com/a/8440736/309011
 */
export function getLocalIPAddress(): string | null {
  const nets = networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return null;
}
