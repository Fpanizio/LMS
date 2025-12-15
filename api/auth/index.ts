import { authTables } from "./tables.ts";
import { AuthQuery } from "./query.ts";
import { RouteError } from "../../core/utils/route-error.ts";
import { Api } from "../../core/utils/abstract.ts";
import { COOKIE_SID_KEY, SessionService } from "./services/session.ts";

export class AuthApi extends Api {
    query = new AuthQuery(this.db);
    session = new SessionService(this.core);
    handlers = {
        postUser: (req, res) => {
            const { name, username, email, password } = req.body;
            const password_hash = password;
            const writeResult = this.query.insertUser({ name, username, email, role: 'user', password_hash });
            if (writeResult.changes === 0) {
                throw new RouteError('User already exists', 400);
            }
            res.status(201).json({ title: "Created user" });
        },
        postLogin: async (req, res) => {
            const { email, password } = req.body;
            const user = this.db.query(/* sql */ `
                SELECT "id", "password_hash" FROM "users" WHERE "email" = ?
            `).get(email);
            if (!user || password !== user.password_hash) {
                throw new RouteError('User not found, please check your email and password', 404);
            }

            const { cookie } = await this.session.create({ userId: user.id, ip: req.ip, ua: req.headers['user-agent'] ?? '' });


            res.setCookie(cookie);
            res.status(200).json({ title: 'Login successful' });
        },

        getSession: (req, res) => {
            const sid = req.cookies[COOKIE_SID_KEY];
            if (!sid) {
                throw new RouteError('Not authenticated', 401);
            }
            const { valid, cookie, session } = this.session.validate(sid);
            res.setCookie(cookie);
            if (!valid || !session) {
                return res.status(401).json({ title: 'Not authenticated' });
            }
            res.setHeader('Cache-Control', 'private, no-store');
            res.setHeader('Vary', 'Cookie');
            res.status(200).json(session);
        }
    } satisfies Api['handlers']
    table(): void {
        this.db.exec(authTables);
    }

    routes(): void {
        this.router.post('/auth/user', this.handlers.postUser);
        this.router.post('/auth/login', this.handlers.postLogin);
        this.router.get('/auth/session', this.handlers.getSession);
    }
}