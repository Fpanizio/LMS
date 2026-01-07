import { authTables } from "./tables.ts";
import { AuthQuery } from "./query.ts";
import { RouteError } from "../../core/utils/route-error.ts";
import { Api } from "../../core/utils/abstract.ts";
import { COOKIE_SID_KEY, SessionService } from "./services/session.ts";
import { AuthMiddleware } from "./middleware/auth.ts";
import { Password } from "./utils/password.ts";
import { v } from "../../core/utils/validate.ts";

export class AuthApi extends Api {
  query = new AuthQuery(this.db);
  session = new SessionService(this.core);
  auth = new AuthMiddleware(this.core);
  password = new Password("segredo");

  handlers = {
    postUser: async (req, res) => {
      const { name, username, email, password } = {
        name: v.string(req.body.name),
        username: v.username(req.body.username),
        email: v.email(req.body.email),
        password: v.password(req.body.password),
      };
      const emailExists = this.query.selectUser("email", email);
      if (emailExists) {
        throw new RouteError("Email already exists", 409);
      }
      const usernameExists = this.query.selectUser("username", username);
      if (usernameExists) {
        throw new RouteError("Username already exists", 409);
      }

      const password_hash = await this.password.hash(password);
      const writeResult = this.query.insertUser({
        name,
        username,
        email,
        role: "user",
        password_hash,
      });
      if (writeResult.changes === 0) {
        throw new RouteError("User already exists", 400);
      }
      res.status(201).json({ title: "Created user" });
    },
    postLogin: async (req, res) => {
      const { email, password } = {
        email: v.email(req.body.email),
        password: String(req.body.password),
      };
      const user = this.query.selectUser("email", email);
      if (!user) {
        throw new RouteError(
          "User not found, please check your email and password",
          401
        );
      }

      const validPassword = await this.password.verify(
        password,
        user.password_hash
      );
      if (!validPassword) {
        throw new RouteError(
          "User not found, please check your email and password",
          401
        );
      }

      const { cookie } = await this.session.create({
        userId: user.id,
        ip: req.ip,
        ua: req.headers["user-agent"] ?? "",
      });

      res.setCookie(cookie);
      res.status(200).json({ title: "Login successful" });
    },

    getSession: (req, res) => {
      if (!req.session) {
        throw new RouteError("Unauthorized", 401);
      }
      res.status(200).json({ title: "valid session" });
    },

    deleteSession: (req, res) => {
      const sid = req.cookies[COOKIE_SID_KEY];
      if (!sid) {
        throw new RouteError("Unauthorized", 401);
      }
      const { cookie } = this.session.invalidate(sid);
      res.setCookie(cookie);

      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("Vary", "Cookie");

      res.status(200).json({ title: "Logout successful" });
    },

    //Ajustar essa parte
    passwordUpdate: async (req, res) => {
      const { currentPassword, newPassword } = {
        currentPassword: v.string(req.body.currentPassword),
        newPassword: v.password(req.body.newPassword),
      };

      if (!req.session) {
        throw new RouteError("Unauthorized", 401);
      }

      const user = this.query.selectUser("id", req.session.user_id);
      if (!user) {
        throw new RouteError("User not found", 404);
      }

      const isEqual = await this.password.verify(
        currentPassword,
        user.password_hash
      );

      if (!isEqual) {
        throw new RouteError("Your current password is incorrect", 400);
      }

      const newPasswordHash = await this.password.hash(newPassword);
      const updatePassword = this.query.updateUser(
        user.id,
        "password_hash",
        newPasswordHash
      );

      if (updatePassword.changes === 0) {
        throw new RouteError("Failed to update password", 500);
      }

      this.session.invalidateAll(user.id);
      const { cookie } = await this.session.create({
        userId: user.id,
        ip: req.ip,
        ua: req.headers["user-agent"] ?? "",
      });

      res.setCookie(cookie);
      res.status(200).json({ title: "Password updated" });
    },

    passwordForgot: async (req, res) => {
      const { email } = {
        email: v.email(req.body.email),
      };
      const user = this.query.selectUser("email", email);
      if (!user) {
        return res.status(200).json({ title: "verification email sent" });
      }
      const { token } = await this.session.resetToken({
        userId: user.id,
        ip: req.ip,
        ua: req.headers["user-agent"] ?? "",
      });

      const resetLink = `${req.baseUrl}/password/reset/?token=${token}`;
      const mailContent = {
        to: user.email,
        subject: "Reset your password",
        body: `Click <a href="${resetLink}">here</a> to reset your password`,
      };

      console.log(mailContent);
      res.status(200).json({ title: "verification email sent" });
    },
    passwordReset: async (req, res) => {
      const { token, newPassword } = {
        token: v.string(req.body.token),
        newPassword: v.password(req.body.newPassword),
      };
      const reset = this.session.validateToken(token);
      if (!reset) {
        throw new RouteError("Invalid token", 400);
      }
      const newPasswordHash = await this.password.hash(newPassword);
      const updatePassword = this.query.updateUser(
        reset.userId,
        "password_hash",
        newPasswordHash
      );
      if (updatePassword.changes === 0) {
        throw new RouteError("Failed to update password", 500);
      }
      res.status(200).json({ title: "Password reset successful" });
    },
  } satisfies Api["handlers"];
  table(): void {
    this.db.exec(authTables);
  }

  routes(): void {
    this.router.post("/auth/user", this.handlers.postUser);
    this.router.post("/auth/login", this.handlers.postLogin);
    this.router.get("/auth/session", this.handlers.getSession, [
      this.auth.guard("user"),
    ]);
    this.router.delete("/auth/logout", this.handlers.deleteSession);
    this.router.put("/auth/password/update", this.handlers.passwordUpdate, [
      this.auth.guard("user"),
    ]);
    this.router.post("/auth/password/reset", this.handlers.passwordReset);
    this.router.put("/auth/password/forgot", this.handlers.passwordForgot);
  }
}
