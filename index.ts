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

core.router.get('/', async (req, res) => {
  const index = await readFile(new URL('./front/index.html', import.meta.url));
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).end(index);
});

core.init();
