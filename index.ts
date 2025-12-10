import { Core } from './core/core.ts';
import { pegarCurso } from './core/database.ts';
import { logger } from './core/middleware/logger.ts';

const core = new Core();

core.router.use([logger]);

core.router.get('/curso/:curso', (req, res) => {
  const slug = req.params.curso;
  const curso = pegarCurso(slug);
  if (curso) {
    res.status(200).json(curso);
  } else {
    res.status(404).json('curso não encontrado');
  }
});


core.init();
