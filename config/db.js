const fs = require('firebase-admin');
const serviceAccount = require('../config/dealertrk-4623d880e149.json');

let db = null

const connectDB = async () => {
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