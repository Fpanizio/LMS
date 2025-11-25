const response = await fetch("http://localhost:3000/asdasd", {
  method: "POST",
});
const data = await response.text();
console.log(data);
