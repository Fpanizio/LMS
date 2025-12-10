import type { CustomRequest } from './http/custom-request.ts';
import type { CustomResponse } from './http/custom-response.ts';

export type Handler = (
  req: CustomRequest,
  res: CustomResponse,
) => Promise<void> | void;

export type Middleware = (
  req: CustomRequest,
  res: CustomResponse,
) => Promise<void> | void;

type Routes = {
  [method: string]: {
    [path: string]: {
      handler: Handler;
      middleware: Middleware[];
    };
  }
};

export class Router {
  routes: Routes = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {},
    HEAD: {},
  };
  middleware: Middleware[] = [];
  get(route: string, handler: Handler, middleware: Middleware[] = []) {
    this.routes['GET'][route] = { handler, middleware };
  }
  post(route: string, handler: Handler, middleware: Middleware[] = []) {
    this.routes['POST'][route] = { handler, middleware };
  }
  put(route: string, handler: Handler, middleware: Middleware[] = []) {
    this.routes['PUT'][route] = { handler, middleware };
  }
  delete(route: string, handler: Handler, middleware: Middleware[] = []) {
    this.routes['DELETE'][route] = { handler, middleware };
  }
  head(route: string, handler: Handler, middleware: Middleware[] = []) {
    this.routes['HEAD'][route] = { handler, middleware };
  }
  use(middleware: Middleware[]) {
    this.middleware.push(...middleware);
  }
  find(method: string, pathName: string) {

    const routesByMethod = this.routes[method];
    if (!routesByMethod) return null;
    const matchedRoute = routesByMethod[pathName];
    if (matchedRoute) return { route: matchedRoute, params: {} };

    const reqParts = pathName.split('/').filter(Boolean);

    for (const route of Object.keys(routesByMethod)) {
      if (!route.includes(':')) continue;
      const routeParts = route.split('/').filter(Boolean);
      if (reqParts.length !== routeParts.length) continue;
      if (reqParts[0] !== routeParts[0]) continue;

      const params: Record<string, string> = {};
      let ok = true;
      for (let i = 0; i < reqParts.length; i++) {
        const segment = routeParts[i];
        const value = reqParts[i];
        if (segment.startsWith(':')) {
          params[segment.slice(1)] = value;
        } else if (segment !== value) {
          ok = false;
          break;
        }
      }
      if (ok) return { route: routesByMethod[route], params };
    }
    return null;
  }
}
