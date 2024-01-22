import gulp from 'gulp';
import { createSyncTask } from './gulpfile.lib';

// Sync tasks
const syncGlobs = [
  './src',
  './types',
  './sysadmin',
  './yarn.lock',
  './*.js',
  './*.ts',
  './*.json',
  './.*',
];
const syncWatchGlobs = [
  '{src,types,sysadmin}/**',
  '*.js',
  '*.ts',
  '*.json',
  'yarn.lock',
  '.*',
];

createSyncTask('run-sync', syncGlobs, {
  username: 'root',
  // Allow overriding the server to sync to using an environment variable:
  // e.g., `SYNC_SERVER=someother.wldev.wanderlog.com gulp sync`
  hostname: process.env.SYNC_SERVER,
  destination: '/root/water-meter',
  root: './',
  archive: true,
  silent: false,
  compress: true,
  recursive: true,
  emptyDirectories: true,
  // Delete files that have been deleted locally
  clean: true,
});

gulp.task('watch-sync', (cb) => {
  gulp.watch(syncWatchGlobs, gulp.parallel(['run-sync']));
  cb();
});

gulp.task('sync', gulp.parallel(['run-sync', 'watch-sync']));
