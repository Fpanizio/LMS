import { createServer } from "http";

const PORT = 3000;

const server = createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/html");

  if (request.method === "GET" && request.url === "/") {
    response.statusCode = 200;
    response.end("Home page");
  } else if (request.method === "POST" && request.url === "/products") {
    response.statusCode = 201;
    response.end("Product created");
  } else {
    response.statusCode = 404;
    response.end("Page Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
