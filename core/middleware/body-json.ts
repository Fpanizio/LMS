import type { Middleware } from "../router.ts";
import { RouteError } from "../utils/route-error.ts";

const MAX_SIZE = 1_000_000;

export const bodyJson: Middleware = async (req, res) => {
  if (
    req.headers["content-type"] !== "application/json" &&
    req.headers["content-type"] !== "application/json; charset=utf-8"
  ) {
    return;
  }

  const contentLength = Number(req.headers["content-length"]);
  if (!Number.isInteger(contentLength)) {
    throw new RouteError("Invalid content length", 400);
  }
  if (contentLength > MAX_SIZE) {
    throw new RouteError("Payload too large", 413);
  }

  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buf.length;
      if (size > MAX_SIZE) {
        throw new RouteError("Payload too large", 413);
      }
      chunks.push(buf);
    }
  } catch (error) {
    throw new RouteError("Invalid request body", 400);
  }
  try {
    const body = Buffer.concat(chunks).toString("utf-8");
    if (body === "") {
      req.body = {};
      return;
    }
    req.body = JSON.parse(body);
  } catch (error) {
    throw new RouteError("Invalid JSON", 400);
  }
};
