import type { Middleware } from '../router.ts';
import { formatDate } from '../utils/format-data.ts';

export const logger: Middleware = (req, res) => {

    console.log(`[${formatDate(new Date())}] ${req.method} ${req.pathname}`);
};


