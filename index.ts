import { Core } from './core/core.ts';
import { logger } from './core/middleware/logger.ts';
import { AuthApi } from './api/auth/index.ts';
import { LmsApi } from './api/lms/index.ts';
import { readFile } from 'fs/promises';
import { FilesApi } from './api/files/index.ts';
const core = new Core();

core.router.use([logger]);

new AuthApi(core).init();
new LmsApi(core).init();
new FilesApi(core).init();

core.init();

//shutdown

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down...`);
  core.server.close(() => {
    console.log('HTTP server closed');
    core.db.close();
    console.log('Database closed');
    process.exit(0);
  });
  core.server.closeAllConnections();
  setTimeout(() => {
    console.log('Timeout reached, force closing...');
    process.exit(0);
  }, 5_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
