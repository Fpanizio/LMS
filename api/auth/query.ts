import { Query } from "../../core/utils/abstract.ts";

export type UserRole = 'user' | 'editor' | 'admin';

type UserData = {
    id: number;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    password_hash: string;
    created: string;
    updated: string;
}

type SessionData = {
    sid_hash: Buffer;
    user_id: number;
    created: number;
    expires: number;
    ip: string;
    ua: string;
    revoked: number; // 0: not revoked, 1: revoked
}

type UserCreate = Omit<UserData, 'id' | 'created' | 'updated'>;
type SessionCreate = Omit<SessionData, 'created' | 'revoked' | 'expires'> & { expires_ms: number };

export class AuthQuery extends Query {
    insertUser({ name, username, email, role, password_hash }: UserCreate) {
        return this.db.query(/* sql */ `
            INSERT OR IGNORE INTO "users" ("name", "username", "email", "role", "password_hash") VALUES (?, ?, ?, ?, ?);
        `).run(name, username, email, role, password_hash);
    }
    selectUser(key: 'email' | 'username' | 'id', value: string | number) {
        return this.db.query(/* sql */ `
            SELECT "id", "password_hash" FROM "users" WHERE ${key} = ?;
        `).get(value) as { id: number, password_hash: string } | undefined;
    }
    insertSession({ sid_hash, user_id, expires_ms, ip, ua }: SessionCreate) {
        return this.db.query(/* sql */ `
            INSERT OR IGNORE INTO "sessions"
            ("sid_hash", "user_id", "expires", "ip", "ua") 
            VALUES (?, ?, ?, ?, ?);
        `).run(sid_hash, user_id, Math.floor(expires_ms / 1000), ip, ua);
    }

    selectSession(sid_hash: Buffer) {
        return this.db.query(/* sql */ `
            SELECT "s".*, "s"."expires" * 1000 as "expires_ms" FROM "sessions" as "s"
             WHERE "sid_hash" = ?;
        `).get(sid_hash) as SessionData & { expires_ms: number } | undefined;
    }

    revokeSession(key: 'sid_hash' | 'user_id', sid_hash: Buffer) {
        return this.db.query(/* sql */ `
            UPDATE "sessions" SET "revoked" = 1 WHERE ${key} = ?;
        `).run(sid_hash);
    }

    updateSession(sid_hash: Buffer, expires_ms: number) {
        return this.db.query(/* sql */ `
            UPDATE "sessions" SET "expires" = ? WHERE "sid_hash" = ?;
        `).run(Math.floor(expires_ms / 1000), sid_hash);
    }

    selectUserRole(user_id: number) {
        return this.db.query(/* sql */ `
            SELECT "role" FROM "users" WHERE "id" = ?;
        `).get(user_id) as { role: UserRole } | undefined;
    }
}