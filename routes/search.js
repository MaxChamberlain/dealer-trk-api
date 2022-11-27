var express = require('express');
var router = express.Router();
const { searchGurusByVin, getVDetails } = require('../controllers/search');

router.get('/gurusvin', searchGurusByVin);
router.get('/nhtsa', getVDetails);

module.exports = router;
