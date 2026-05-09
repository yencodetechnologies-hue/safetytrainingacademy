const mongoose = require('mongoose');

async function test() {
  // Testing connection to a single shard directly
  const uri = "mongodb://safetytraining:safetytraining@ac-pcrb6dk-shard-00-00.3l46rnz.mongodb.net:27017/trainingacademy?ssl=true&authSource=admin";
  try {
    console.log('Connecting to single shard:', uri);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Successfully connected to shard!');
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

test();
