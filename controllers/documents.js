const { getDB } = require('../config/db');

const getDocumentsByCompanyIds = async (req, res) => {
    const { user_id, startDate, endDate} = req.body;
    try {
        const db = getDB();
        const companiesRef = db.collection('companies')
        const companies = await companiesRef.get();
        const company_ids = companies.docs
            .filter(e => e.data().authorized_users.find(x => x.user_id === user_id))
            .map(company => company.id);
        const documentsRef = db.collection('documents').where('company_id', 'in', company_ids);
        const documents = await documentsRef.get();
        const user_ids = [...new Set(documents.docs.map(e => e.data().metadata.created_by_user_id))]
        const users = await db.collection('users').where('__name__', 'in', user_ids).get();
        res.status(200).send({data: documents.docs
            .filter(e => {
                let date = e.data().metadata.created_at
                date = new Date(date)
                return date >= new Date(startDate).setHours(0,0,0,0) && date <= new Date(endDate).setHours(23,59,59,999)
            })
            .map(doc => { return {...doc.data(), document_id: doc.id} }), 
            users: users.docs.map(doc => {return {user_id: doc.id, ...doc.data()}})});
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

const insertDocument = async (req, res) => {
    const { 
        params,
    } = req.body;
    try {
        const db = getDB();
        const documentRef = db.collection('documents')
        const document = await documentRef.add(params);
        res.status(200).send(document.id);
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

const addNotes = async (req, res) => {
    const {
        document_id,
        notes,
    } = req.body;
    try {
        const db = getDB();
        const documentRef = db.collection('documents').doc(document_id);
        // update the document
        await documentRef.update({
            notes,
        });
        res.status(200).send('success');
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send(err);
    }
};

const getDocumentsByCompanyId = async (req, res) => {
    const { company_id, user_id, startDate, endDate } = req.body;
    try {
        const db = getDB();
        const companiesRef = await  db.collection('companies').doc(company_id).get();
        if (!companiesRef) {
            return res.status(304).send('Company not found');
        }
        if(!companiesRef.data().authorized_users.find(x => x.user_id === user_id)) {
            return res.status(403).send('User not authorized');
        }
        const documentsRef = db.collection('documents').where('company_id', '==', company_id);
        const documents = await documentsRef.get();
        const user_ids = [...new Set(documents.docs.map(e => e.data().metadata.created_by_user_id))]
        if(!user_ids.includes(user_id)) {
            return res.status(401).send('Unauthorized');
        }
        res.status(200).send(documents.docs.map(doc => { return {...doc.data(), document_id: doc.id} }));
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send(err);
    }
};

module.exports = {
    getDocumentsByCompanyIds,
    insertDocument, 
    addNotes,
    getDocumentsByCompanyId
}