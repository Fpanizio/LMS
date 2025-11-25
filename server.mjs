import { createServer } from "http";
import { Router } from "./router.mjs";
import { customRequest } from "./custom-request.mjs";
import { HOST, PORT } from "./config.mjs";
import { customResponse } from "./custom-response.mjs";

const router = new Router();

function postProduto(req, res) {
  const color = req.query.get("color");
  res.status(201).json({ name: "example", color });
}

router.get("/", (req, res) => {
  res.status(200).end("Home page via Router class");
});

router.get("/product/laptop", (req, res) => {
  res.status(200).end("Product Laptop page via router object");
});

router.post("/product", postProduto);

const server = createServer(async (request, response) => {
  const req = await customRequest(request);
  const res = customResponse(response);
  const handler = router.find(req.method, req.pathname);
  if (handler) {
    return handler(req, res);
  } else {
    res.status(404).end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
