import { createServer } from "http";
import { Router } from "./router.mjs";

const HOST = "localhost";
const PORT = 3000;

const router = new Router();

router.get("/", (req, res) => {
  res.end("Home page via Router class");
});

router.get("/product/laptop", (req, res) => {
  res.end("Product Laptop page via router object");
});

router.post("/product", (req, res) => {
  res.end(`Product created`);
});

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}`);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf-8");
  const handler = router.find(req.method, url.pathname);
  if (handler) {
    return handler(req, res);
  } else {
    res.statusCode = 404;
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
