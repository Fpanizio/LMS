import { HOST, PORT } from "./config.mjs";

const response = await fetch(`http://${HOST}:${PORT}/product?color=red`, {
  method: "POST",
  // headers: {
  //   "Content-Type": "application/json",
  // },
  // body: JSON.stringify({
  //   username: "user123",
  //   password: "securepassword",
  // }),
});

console.log(response);
const body = await response.text();
console.log(body);
