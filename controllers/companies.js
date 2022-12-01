const { getDB } = require('../config/db');

const getCompanyDetail = async (req, res) => {
    const { user_id } = req;
    try {
        const db = getDB();
        const companiesRef = db.collection('companies')
        const companies = await companiesRef.get();
        const company_ids = companies.docs
            .filter(e => e.data().authorized_users.find(x => x.user_id === user_id))
            .map(company => {return {...company.data(), company_id: company.id}});
        res.status(200).send(company_ids);
    }catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

const createCompany = async (req, res) => {
    const { user_id } = req;
    const { company_name, company_street, company_city, company_state, company_zip, company_phone, company_carg_preference } = req.body;
    try {
        const db = getDB();
        const companiesRef = db.collection('companies');
        const newCompany = await companiesRef.add({
            company_name,
            company_street,
            company_city,
            company_state,
            company_zip,
            company_phone,
            company_carg_preference,
            authorized_users: [{user_id}]
        });
        res.status(200).send(newCompany.id);
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
        const db = getDB();
        const companiesRef = db.collection('companies');
        const usersRef = db.collection('users');
        const company = await companiesRef.doc(company_id).get();
        const companyData = company.data();
        const user = await usersRef.where('user_email', '==', user_email).get();
        const userData = user.docs[0].id;
        const newAuthorizedUsers = companyData.authorized_users;
        if(!newAuthorizedUsers.find(e => e.user_id === userData)) {
            await companiesRef.doc(company_id).update({authorized_users: [...newAuthorizedUsers, {user_id: userData}]});
        }
        res.status(200).send('User added to company');
    }
    catch (err) {
        console.log(err)
        res
            .status(500)
            .send(err);
    }
};

const updateCompany = async (req, res) => {
    const { user_id } = req;
    const { company_id, company_name, company_street, company_city, company_state, company_zip, company_phone, company_carg_preference } = req.body;
    try {
        const db = getDB();
        const companiesRef = db.collection('companies');
        const company = await companiesRef.doc(company_id)
        company.update({
            company_name,
            company_street,
            company_city,
            company_state,
            company_zip,
            company_phone,
            company_carg_preference
        });
        res.status(200).send('Company updated');
    }
    catch (err) {
        console.log(err)
        res
            .status(500)
            .send(err);
    }
};

const getUsersInCompany = async (req, res) => {
    const { user_id } = req;
    const { company_id } = req.body;
    try {
        const db = getDB();
        const companiesRef = db.collection('companies');
        const usersRef = db.collection('users');
        const company = await companiesRef.doc(company_id).get();
        const companyData = company.data();
        const users = await usersRef.get();
        const usersInCompany = users.docs
            .filter(e => companyData.authorized_users.find(x => x.user_id === e.id))
            .map(user => {return {...user.data(), user_id: user.id}});
        usersInCompany.forEach(user => {
            delete user.user_password;
        });
        res.status(200).send(usersInCompany);
    }
    catch (err) {
        console.log(err)
        res
            .status(500)
            .send(err);
    }
};

module.exports = {
    getCompanyDetail,
    createCompany,
    addCompanyPermission,
    updateCompany,
    getUsersInCompany
}