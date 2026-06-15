import mongoose from 'mongoose';

const uri = 'mongodb://qaziarfeen8_db_user:kf6QE9GEW63b7WT3@ac-chu7e1i-shard-00-00.udhawhz.mongodb.net:27017/drwaqas?tls=true&authSource=admin';

console.log('Testing direct single-node connection...');
mongoose.connect(uri)
  .then(() => {
    console.log('✅ SUCCESS! Connected to the single shard directly!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  });
