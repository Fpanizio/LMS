import { Core } from './core/core.ts';
import { pegarCurso } from './core/database.ts';
import { logger } from './core/middleware/logger.ts';
import { RouteError } from './core/utils/route-error.ts';

const core = new Core();

core.router.use([logger]);

core.router.get('/course/:course', (req, res) => {
  const slug = req.params.course;
  const course = pegarCurso(slug);
  if (!course) {
    throw new RouteError('Course not found', 404);
  }
  res.status(200).json(course);
});


core.init();
