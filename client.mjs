const base = 'http://localhost:3000';

setTimeout(async () => {
  const reponse = await fetch(base + '/curso/javascript');
  console.log(reponse.ok, reponse.status);
}, 200);
