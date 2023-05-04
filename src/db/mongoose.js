const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
}

run()
  .then(console.log('Connected to Database'))
  .catch(e => console.error(e));