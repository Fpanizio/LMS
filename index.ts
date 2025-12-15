import { Core } from './core/core.ts';
import { logger } from './core/middleware/logger.ts';
import { AuthApi } from './api/auth/index.ts';
import { LmsApi } from './api/lms/index.ts';
import { readFile } from 'fs/promises';
import { RouteError } from './core/utils/route-error.ts';

const core = new Core();

core.router.use([logger]);

new AuthApi(core).init();
new LmsApi(core).init();

core.router.get('/', async (req, res) => {
  const index = await readFile(new URL('./front/index.html', import.meta.url));
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).end(index);
});

core.router.get('/safe', async (req, res) => {
  const id = req.headers.cookie?.replace(/^sid=/, '');
  if (!id) {
    throw new RouteError('Not authenticated', 401);
  }
  const session = core.db.query(/* sql */ `
    SELECT "user_id" FROM "sessions" WHERE "sid_hash" = ?
  `).get(id);
  if (!session) {
    throw new RouteError('User not found', 404);
  }
  res.status(200).json(session);
});

core.init();
