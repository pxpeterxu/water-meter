import moment from 'moment';

export const logger = {
  info: (...args: any[]) =>
    // eslint-disable-next-line no-console
    console.info(makeLogPrefix('info'), ...args),
  error: (...args: any[]) => console.error(makeLogPrefix('error'), ...args),
};

function makeLogPrefix(logLevel: string) {
  return `[${moment.utc().format('YYYY-MM-DD[T]HH:mm:ssZ')} - ${logLevel}]`;
}
