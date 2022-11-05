var express = require('express');
var router = express.Router();
var { verifyToken } = require('../middlewares/jwt');
var { getCompanyDetail, createCompany } = require('../controllers/companies');

router.post('/getone', verifyToken, getCompanyDetail);
router.post('/create', verifyToken, createCompany);

module.exports = router;
