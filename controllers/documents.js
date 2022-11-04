const { getDB } = require('../config/db');

const getDocumentTypes = async (req, res) => {
    try {
        const pool = getDB();
        const result = await pool.query(
            `
                SELECT  *
                FROM document_type
            `
        );
        res.status(200).send(result.rows);
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

const getDocumentsByCompanyIds = async (req, res) => {
    const { user_id } = req.body;
    try {
        const pool = getDB();
        const company_ids = await pool.query(
            `
                SELECT  company_id
                FROM company_authorization
                WHERE user_id = $1
            `,
            [user_id]
        );
        const result = await pool.query(
            `
                SELECT *
                FROM document d
                INNER JOIN document_type dt
                ON d.document_type_id = dt.document_type_id
                INNER JOIN trip_pad_document tpd
                ON d.document_id = tpd.document_id
                INNER JOIN company c
                ON d.company_id = c.company_id
                INNER JOIN users u
                ON d.created_by_user_id = u.user_id
                WHERE d.company_id = ANY($1)
            `,
            [company_ids.rows.map(company => company.company_id)]
        );
        res.status(200).send(result.rows);
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

const insertDocument = async (req, res) => {
    const { 
        user_id,
        params,
        document_type_id
    } = req.body;
    try {
        const pool = getDB();
        const res1 = await pool.query(
            `
                INSERT INTO document (
                    document_type_id,
                    company_id,
                    created_by_user_id
                )
                VALUES (
                    $1,
                    $2,
                    $3
                )
                RETURNING document_id
            `,
            [
                document_type_id,
                params.head.company_id,
                user_id
            ]
        );
        const table_type_name = await pool.query(
            `
                SELECT document_type_table_name
                    FROM document_type
                    WHERE document_type_id = $1
            `,
            [document_type_id]
        );
        const doc_id = res1.rows[0].document_id;
        const parsed = Object.keys(params.body).map(key => {
            return [key, params.body[key]]
        })
        const values = parsed.map((value, index) => {
            return `$${index + 1}`
        })
        const columns = parsed.map(value => {
            return value[0]
        })
        const table = table_type_name.rows[0].document_type_table_name;

        console.log((
            `
                INSERT INTO ${table} (
                    ${columns.join(', ')}, 'document_id'
                )
                VALUES (
                    ${values.join(', ')}, $${parsed.map(value => value[1]).length}
                )
            `
        ))

        const res2 = await pool.query(
            `
                INSERT INTO ${table} (
                    ${columns.join(', ')}, document_id
                )
                VALUES (
                    ${values.join(', ')}, $${parsed.map(value => value[1]).length + 1}
                )
            `,
            [...parsed.map(value => value[1]), doc_id]
        );
        res.status(200).send({ message: 'Document created successfully' });
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

module.exports = {
    getDocumentTypes,
    getDocumentsByCompanyIds,
    insertDocument
}