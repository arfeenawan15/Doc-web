import dns from 'dns';
// Force Node.js to bypass local router DNS and use Google Public DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';

const uri = 'mongodb+srv://qaziarfeen8_db_user:kf6QE9GEW63b7WT3@ac-chu7e1i.udhawhz.mongodb.net/drwaqas?retryWrites=true&w=majority';

console.log('Testing mongodb+srv with Google DNS...');
mongoose.connect(uri)
  .then(() => {
    console.log('\n✅ SUCCESS! Connected via SRV using Google DNS!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Failed:', err.message);
    process.exit(1);
  });
