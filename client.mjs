const base = 'http://localhost:3000';

setTimeout(async () => {
  const response1 = await fetch(base + '/course/1231');
  console.log(response1.ok, response1.status);
  const body = await response1.json();
  console.log(body);
}, 200);
