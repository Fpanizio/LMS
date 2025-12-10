import { Core } from './core/core.ts';
import { logger } from './core/middleware/logger.ts';
import { RouteError } from './core/utils/route-error.ts';

const core = new Core();

core.router.use([logger]);

core.db.exec( /* sql */ `
  CREATE TABLE IF NOT EXISTS products (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" REAL NOT NULL
  );
  INSERT OR IGNORE INTO products ("name", "slug", "price") VALUES ('Notebook', 'notebook', 5000);
`);

core.router.get('/products/:slug', (req, res) => {
  const { slug } = req.params;
  const product = core.db.query(`SELECT * FROM products WHERE slug = ?`).get(slug);
  if (!product) {
    throw new RouteError('Product not found', 404);
  }
  res.status(200).json(product);
});


core.init();
