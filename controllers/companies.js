const { getDB } = require('../config/db');

const getCompanyDetail = async (req, res) => {
    const { user_id } = req;
    try {
        const pool = getDB();
        const result = await pool.query(
            `
                SELECT DISTINCT c.company_id, c.company_name, c.company_street, c.company_city, c.company_state, c.company_zip, c.company_phone
                FROM company_authorization ca
                INNER JOIN company c
                ON c.company_id = ca.company_id
                WHERE ca.user_id = $1
            `,
            [user_id]
        );
        console.log(result.rows)
        res.status(200).send(result.rows);
    }
    catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

const createCompany = async (req, res) => {
    const { user_id } = req;
    const { company_name, company_street, company_city, company_state, company_zip, company_phone } = req.body;
    try {
        const pool = getDB();
        const result = await pool.query(
            `
                INSERT INTO company (
                    company_name,
                    company_street,
                    company_city,
                    company_state,
                    company_zip,
                    company_phone
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING company_id
            `,
            [
                company_name,
                company_street,
                company_city,
                company_state,
                company_zip,
                company_phone
            ]
        );
        const company_id = result.rows[0].company_id;
        const result2 = await pool.query(
            `
                INSERT INTO company_authorization (
                    company_id,
                    user_id,
                    permission_level
                )
                VALUES ($1, $2, $3)
            `,
            [
                company_id,
                user_id,
                777
            ]
        );
        res.status(200).send(result.rows[0]);
    }
    catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

const addCompanyPermission = async (req, res) => {
    const { user_id } = req;
    const { company_id, user_email } = req.body;
    try {
        const pool = getDB();
        const hasPermission = await pool.query(
            `  
                SELECT *
                FROM company_authorization
                WHERE user_id = $1
                AND company_id = $2
            `,
            [
                user_id,
                company_id
            ]
        );
        if (hasPermission.rows.length === 0) {
            res.status(403).send('You do not have permission to add permissions to this company');
        }
        else {
            const userToAdd = await pool.query(
                `
                    SELECT user_id
                    FROM users
                    WHERE user_email = $1
                `,
                [user_email]
            );
            if (userToAdd.rows.length === 0) {
                res.status(404).send('User not found');
            }
            else {
                const userToAddId = userToAdd.rows[0].user_id;
                const result = await pool.query(
                    `
                        INSERT INTO company_authorization (
                            company_id,
                            user_id,
                            permission_level
                        )
                        VALUES ($1, $2, $3)
                    `,
                    [
                        company_id,
                        userToAddId,
                        777
                    ]
                );
                res.status(200).send(result.rows[0]);
            }
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

module.exports = {
    getCompanyDetail,
    createCompany,
    addCompanyPermission
}