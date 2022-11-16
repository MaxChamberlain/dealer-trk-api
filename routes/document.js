var express = require('express');
var router = express.Router();
var { verifyToken } = require('../middlewares/jwt');
var { getDocumentsByCompanyIds, insertDocument } = require('../controllers/documents');

router.post('/getbycompanyids', getDocumentsByCompanyIds);
router.post('/insert', insertDocument);

module.exports = router;
