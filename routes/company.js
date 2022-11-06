var express = require('express');
var router = express.Router();
var { verifyToken } = require('../middlewares/jwt');
var { getCompanyDetail, createCompany, addCompanyPermission } = require('../controllers/companies');

router.post('/getone', verifyToken, getCompanyDetail);
router.post('/add', verifyToken, createCompany);
router.post('/addpermission', verifyToken, addCompanyPermission);

module.exports = router;
