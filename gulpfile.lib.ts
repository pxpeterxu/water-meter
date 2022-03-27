import gulp from 'gulp';
import rsync from 'gulp-rsync';

export function createSyncTask(
  name: string,
  srcGlobs: string | string[],
  rsyncOptions: any,
) {
  gulp.task(name, () => gulp.src(srcGlobs).pipe(rsync(rsyncOptions)));
}
