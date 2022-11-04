var express = require('express');
var router = express.Router();
var { verifyToken } = require('../middlewares/jwt');
var { getCompanyDetail } = require('../controllers/companies');

router.post('/getone', verifyToken, getCompanyDetail);

module.exports = router;
