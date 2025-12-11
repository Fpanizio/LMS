import { authTables } from "./tables.ts";
import { AuthQuery } from "./query.ts";
import { RouteError } from "../../core/utils/route-error.ts";
import { Api } from "../../core/utils/abstract.ts";

export class AuthApi extends Api {
    query = new AuthQuery(this.db);
    handlers = {
        postUser: (req, res) => {
            const { name, username, email, password } = req.body;
            const password_hash = password;
            const writeResult = this.query.insertUser({ name, username, email, role: 'user', password_hash });
            if (writeResult.changes === 0) {
                throw new RouteError('User already exists', 400);
            }
            res.status(201).json({ title: "Created user" });
        }
    } satisfies Api['handlers']
    table(): void {
        this.db.exec(authTables);
    }

    routes(): void {
        this.router.post('/auth/user', this.handlers.postUser);
    }
}