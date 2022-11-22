var express = require('express');
var router = express.Router();
var { verifyToken } = require('../middlewares/jwt');
var { getDocumentsByCompanyIds, getDocumentsByCompanyId, insertDocument, addNotes } = require('../controllers/documents');

router.post('/getbycompanyids', getDocumentsByCompanyIds);
router.post('/getbycompanyid', getDocumentsByCompanyId);
router.post('/insert', insertDocument);
router.post('/addnotes', addNotes);

module.exports = router;
