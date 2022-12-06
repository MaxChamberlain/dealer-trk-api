var express = require('express');
var router = express.Router();
var { verifyToken } = require('../middlewares/jwt');
var { getDocumentsByCompanyIds, getDocumentsByCompanyId, insertDocument, addNotes, changeDocument, deleteDocument } = require('../controllers/documents');

router.post('/getbycompanyids', verifyToken, getDocumentsByCompanyIds);
router.post('/getbycompanyid', verifyToken, getDocumentsByCompanyId);
router.post('/insert', verifyToken, insertDocument);
router.post('/addnotes', verifyToken, addNotes);
router.post('/change', verifyToken, changeDocument);
router.post('/delete', verifyToken, deleteDocument);

module.exports = router;
