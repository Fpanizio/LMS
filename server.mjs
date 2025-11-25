import { createServer } from "http";

const HOST = "localhost";
const PORT = 3000;

const server = createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  const url = new URL(req.url, `http://${HOST}`);
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf-8");
  console.log(JSON.parse(body));

  if (req.method === "GET" && url.pathname === "/") {
    res.statusCode = 200;
    res.end("Home page");
  } else if (req.method === "POST" && url.pathname === "/products") {
    res.statusCode = 201;
    res.end("Product created");
  } else {
    res.statusCode = 404;
    res.end("Page Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
