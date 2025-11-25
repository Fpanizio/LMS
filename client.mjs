const response = await fetch("http://localhost:3000/product/laptop", {
  method: "GET",
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
