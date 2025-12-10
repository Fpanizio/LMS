const base = 'http://localhost:3000';

setTimeout(async () => {
  const reponse = await fetch(base + '/');
  console.log(reponse.ok, reponse.status);
}, 200);
