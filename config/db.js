const fs = require('firebase-admin');

let db = null

const connectDB = async () => {
    const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT)
    fs.initializeApp({
        credential: fs.credential.cert(serviceAccount)
    });
    db = fs.firestore();
    console.log('Loaded database instance.');
}

const getDB = () => {
    return db;
}

module.exports = { connectDB, getDB }