import { createServer } from "http";

const HOST = "localhost";
const PORT = 3000;

const server = createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  const url = new URL(req.url, `http://${HOST}`);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf-8");

  if (req.method === "GET" && url.pathname === "/") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`
      <html>
        <head>
          <title>My Server</title>
        </head>
        <body>
          <h1>Welcome to My Server</h1>
        </body>
      </html>
      `);
  } else if (req.method === "POST" && url.pathname === "/products") {
    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end("Product created");
  } else {
    res.statusCode = 404;
    res.end("Page Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
