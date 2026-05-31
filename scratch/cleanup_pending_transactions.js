const { MongoClient } = require('mongodb');

async function cleanupPendingTransactions() {
  const client = new MongoClient('mongodb://127.0.0.1:27017/speakai');
  try {
    await client.connect();
    const db = client.db('speakai');
    const result = await db.collection('transactions').deleteMany({
      status: { $in: ['pending', 'cancelled'] }
    });
    console.log(`✅ Deleted ${result.deletedCount} pending/cancelled transactions from DB.`);
    
    const remaining = await db.collection('transactions').countDocuments();
    console.log(`📊 Remaining transactions (completed only): ${remaining}`);
  } finally {
    await client.close();
  }
}

cleanupPendingTransactions().catch(console.error);
