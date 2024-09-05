
const { MongoClient } = require('mongodb');

async function connectToDatabase() {
    const uri = 'mongodb+srv://tomatix234:tomatix@tomatix.mgvot.mongodb.net/?retryWrites=true&w=majority&appName=Tomatix';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client;
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

module.exports = connectToDatabase;
