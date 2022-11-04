var express = require('express');
var router = express.Router();
var { verifyToken } = require('../middlewares/jwt');
const { registerUser, loginUser, getUserDetails } = require('../controllers/users');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/user', verifyToken, getUserDetails);

module.exports = router;
