import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
  type Server,
} from 'node:http';
import { Router } from './router.ts';
import { customRequest } from './http/custom-request.ts';
import { customResponse } from './http/custom-response.ts';
import { bodyJson } from './middleware/body-json.ts';
import { RouteError } from './utils/route-error.ts';
import { formatDate } from './utils/format-data.ts';
import { Database } from './database.ts';
import { DB_PATH, EMAIL_KEY } from '../env.ts';
import { Mail } from '../api/auth/mail/mail.ts';

DB_PATH;
export class Core {
  router: Router;
  server: Server;
  db: Database;
  mail: Mail;
  constructor() {
    this.router = new Router();
    this.router.use([bodyJson]);
    this.db = new Database(DB_PATH);
    this.server = createServer(this.handler);
    this.mail = new Mail(EMAIL_KEY);
  }

  handler = async (request: IncomingMessage, response: ServerResponse) => {
    try {
      const req = await customRequest(request);
      const res = customResponse(response);

      for (const middleware of this.router.middleware) {
        await middleware(req, res);
      }

      const matched = this.router.find(req.method || '', req.pathname);
      if (!matched) {
        throw new RouteError('Not found', 404);
      }
      const { route, params } = matched;
      req.params = params;

      for (const middleware of route.middleware) {
        await middleware(req, res);
      }

      await route.handler(req, res);
    } catch (error) {
      if (error instanceof RouteError) {
        console.error(
          `[${formatDate(new Date())}] [${error.status}] ${error.message} - ${
            request.method
          } ${request.url}`
        );
        response.statusCode = error.status;
        response.setHeader('Content-Type', 'application/problem+json');
        response.end(
          JSON.stringify({ status: response.statusCode, title: error.message })
        );
      } else {
        console.error(`[${formatDate(new Date())}] `, error);
        response.statusCode = 500;
        response.setHeader('Content-Type', 'application/problem+json');
        response.end(
          JSON.stringify({
            status: response.statusCode,
            title: 'Internal server error',
          })
        );
      }
    }
  };
  init() {
    this.server.listen(3000, () => {
      console.log('Server: http://localhost:3000');
    });
    this.server.on('clientError', (error, socket) => {
      console.log(error);
      socket.destroy();
    });
  }
}
