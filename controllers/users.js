const { getDB } = require('../config/db');
const bcrypt = require('bcryptjs');
const { createToken, verifyToken } = require('../middlewares/jwt');

const registerUser = async (req, res) => {
    const { 
        user_fname,
        user_lname,
        user_initial,
        user_phone,
        user_email,
        user_password,
    } = req.body;
    let password = await bcrypt.hash(user_password, 10);
    try {
        const pool = getDB();
        const result = await pool.query(
            
            `
                INSERT INTO users 
                (
                    user_fname,
                    user_lname,
                    user_initial,
                    user_phone,
                    user_email,
                    user_password
                ) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING   user_fname,
                            user_lname,
                            user_initial,
                            user_phone,
                            user_email,
                            user_id
            `,
            [
                user_fname,
                user_lname,
                user_initial,
                user_phone,
                user_email,
                password,
            ]
        );
        const jwt = createToken(result.rows[0].user_id)
        // create a cookie that expires in 1 hour
        res.cookie('dash-auth-tokenjwtgrab', jwt, { maxAge: 3600000, httpOnly: true });
        res.status(200).send(result.rows[0]);
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

const loginUser = async (req, res) => {
    const { user_email, user_password } = req.body;
    try {
        const pool = getDB();
        const result = await pool.query(
            `
                SELECT *
                FROM users 
                WHERE user_email = $1
            `,
            [user_email]
        );
        if (result.rows.length === 0) {
            res.status(400).send('Credentials don\'t match any user');
        } else {
            const user = result.rows[0];
            const validPassword = await bcrypt.compare(user_password, user.user_password);
            if (!validPassword) {
                res.status(400).send('Credentials don\'t match any user');
            } else {
                delete user.user_password
                const jwt = createToken(result.rows[0].user_id)
                // create a cookie that expires in 10 hours
                res.cookie('dash-auth-tokenjwtgrab', jwt, { maxAge: 36000000, httpOnly: true });
                res.status(200).send(user);
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

const getUserDetails = async (req, res) => {
    const { user_id } = req;
    try {
        const pool = getDB();
        const result = await pool.query(
            `
                SELECT *
                FROM users
                WHERE user_id = $1
            `,
            [user_id]
        );
        if (result.rows.length === 0) {
            res.status(400).send('User not found');
        } else {
            const user = result.rows[0];
            delete user.user_password
            res.status(200).send(user);
        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserDetails
}