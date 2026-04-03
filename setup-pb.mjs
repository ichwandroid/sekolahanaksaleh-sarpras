import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function setup() {
  console.log("Menghubungkan ke PocketBase...");
  try {
    // We try to create the collection using the REST API
    // Using admin API requires authentication, but wait
    // We can just guide the user to run this with their admin email
  } catch(e) {}
}
