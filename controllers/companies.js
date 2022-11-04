const { getDB } = require('../config/db');

const getCompanyDetail = async (req, res) => {
    const { user_id } = req;
    try {
        const pool = getDB();
        const result = await pool.query(
            `
                SELECT *
                FROM company_authorization ca
                INNER JOIN company c
                ON c.company_id = ca.company_id
                WHERE ca.user_id = $1
            `,
            [user_id]
        );
        res.status(200).send(result.rows);
    }
    catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

module.exports = {
    getCompanyDetail,
}