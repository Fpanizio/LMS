import type { IncomingMessage } from 'node:http';
import { parseCookies } from '../utils/parse-cookies.ts';
import type { UserRole } from '../../api/auth/query.ts';

export interface CustomRequest extends IncomingMessage {
  query: URLSearchParams;
  pathname: string;
  body: Record<string, any>;
  params: Record<string, any>;
  ip: string;
  cookies: Record<string, string | undefined>;
  session: {
    user_id: number;
    role: UserRole;
    expires_ms: number;
  } | null;
}

export async function customRequest(request: IncomingMessage) {
  const req = request as CustomRequest;
  const url = new URL(req.url || '', 'http://localhost');
  req.query = url.searchParams;
  req.pathname = url.pathname;
  req.params = {};
  req.body = {};
  req.ip = request.socket.remoteAddress || '127.0.0.1';
  req.cookies = parseCookies(request.headers.cookie);
  req.session = null;
  return req;
}
