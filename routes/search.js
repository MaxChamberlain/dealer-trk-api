var express = require('express');
var router = express.Router();
const { searchGurusByVin } = require('../controllers/search');

router.get('/gurusvin', searchGurusByVin);

module.exports = router;
