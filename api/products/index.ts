import { Api } from "../../core/utils/abstract.ts";
import { RouteError } from "../../core/utils/route-error.ts";

export class ProductsApi extends Api {
    handlers = {
        getProducts: (req, res) => {
            const { slug } = req.params;
            const product = this.db.query(`SELECT * FROM products WHERE slug = ?`).get(slug);
            if (!product) {
                throw new RouteError('Product not found', 404);
            }
            res.status(200).json(product);
        }
    } satisfies Api['handlers'];

    table(): void {
        this.db.exec(/* sql */ `
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                slug TEXT NOT NULL,
                price REAL NOT NULL
            );
        `);
    }

    routes(): void {
        this.router.get('/products/:slug', this.handlers.getProducts);
    }
}