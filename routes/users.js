var express = require('express');
var router = express.Router();
var { verifyToken } = require('../middlewares/jwt');
const { registerUser, loginUser, getUserDetails, logout } = require('../controllers/users');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/user', verifyToken, getUserDetails);
router.post('/logout', logout);

module.exports = router;
