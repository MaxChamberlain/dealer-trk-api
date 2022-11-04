var express = require('express');
var router = express.Router();
var { verifyToken } = require('../middlewares/jwt');
var { getDocumentTypes, getDocumentsByCompanyIds, insertDocument } = require('../controllers/documents');

router.get('/types', getDocumentTypes);
router.post('/getbycompanyids', getDocumentsByCompanyIds);
router.post('/insert', insertDocument);

module.exports = router;
