console.clear()
const base = 'http://localhost:3000';

const functions = {
  async getProducts() {
    const response = await fetch(base + '/products/notebook');
    const body = await response.json();
    console.table(body);
    console.log("------------END------------");
  }
}

functions[process.argv[2]]();