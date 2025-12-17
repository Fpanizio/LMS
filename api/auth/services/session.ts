import { CoreProvider } from "../../../core/utils/abstract.ts";
import { AuthQuery } from "../query.ts";
import { randomBytesAsync, sha256 } from "../utils/utils.ts";

const ttlSec = 60 * 60 * 24 * 15;
const ttlSec5Days = 60 * 60 * 24 * 5;

export const COOKIE_SID_KEY = "__Secure-sid";

function sidCookie(sid: string, expires: number) {
  return `${COOKIE_SID_KEY}=${sid}; Path=/; Max-Age=${expires}; HttpOnly; Secure; SameSite=Lax`;
}
export class SessionService extends CoreProvider {
  query = new AuthQuery(this.db);
  async create({ userId, ip, ua }: { userId: number; ip: string; ua: string }) {
    const sid = (await randomBytesAsync(32)).toString("base64url");
    const sid_hash = sha256(sid);
    const expires_ms = Date.now() + ttlSec * 1000;
    this.query.insertSession({ user_id: userId, ip, ua, sid_hash, expires_ms });

    const cookie = sidCookie(sid, expires_ms);

    return { cookie };
  }

  validate(sid: string) {
    const dateNow = Date.now();
    const sid_hash = sha256(sid);
    const session = this.query.selectSession(sid_hash);
    if (!session || session.revoked === 1) {
      return {
        valid: false,
        cookie: sidCookie("", 0),
      };
    }
    let expires_ms = session.expires_ms;
    if (dateNow >= expires_ms) {
      this.query.revokeSession(sid_hash);
      return {
        valid: false,
        cookie: sidCookie("", 0),
      };
    }
    if (dateNow > expires_ms - 1000 * ttlSec5Days) {
      const expires_msUpdate = dateNow + ttlSec * 1000;
      this.query.updateSession(sid_hash, expires_msUpdate);
      expires_ms = expires_msUpdate;
    }
    const user = this.query.selectUserRole(session.user_id);
    if (!user) {
      this.query.revokeSession(sid_hash);
      return {
        valid: false,
        cookie: sidCookie("", 0),
      };
    }

    return {
      valid: true,
      cookie: sidCookie(sid, Math.floor((expires_ms - dateNow) / 1000)),
      session: {
        user_id: session.user_id,
        role: user.role,
        expires_ms,
      },
    };
  }

  invalidate(sid: string | undefined) {
    const cookie = sidCookie("", 0);
    try {
      if (sid) {
        const sid_hash = sha256(sid);
        this.query.revokeSession(sid_hash);
      }
    } catch {}
    return { cookie };
  }

  invalidateAll(user_id: number) {
    this.query.revokeAllSessions(user_id);
  }
}
