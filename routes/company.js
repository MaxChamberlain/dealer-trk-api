var express = require('express');
var router = express.Router();
var { verifyToken } = require('../middlewares/jwt');
var { getCompanyDetail, createCompany, addCompanyPermission, updateCompany, getUsersInCompany } = require('../controllers/companies');

router.get('/getone', verifyToken, getCompanyDetail);
router.post('/add', verifyToken, createCompany);
router.post('/addpermission', verifyToken, addCompanyPermission);
router.post('/update', verifyToken, updateCompany);
router.post('/getusers', verifyToken, getUsersInCompany);

module.exports = router;
