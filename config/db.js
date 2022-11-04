const { Pool } = require('pg');

let pool = null

const connectDB = async () => {
    pool = new Pool({
        user: 'MaxChamberlain',
        host: 'db.bit.io',
        database: 'MaxChamberlain/cars-consult-test', // public database 
        password: 'v2_3v4K3_98TTCGjNigSZavEpdGhdmFM', // key from bit.io database page connect menu
        port: 5432,
        ssl: true,
    });
    console.log('Loaded database instance.');
}

const getDB = () => {
    return pool;
}

module.exports = { connectDB, getDB }