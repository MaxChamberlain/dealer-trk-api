const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // if( process.env.NODE_ENV === 'development' ) {
    //     req.user_id = 'eGwtgWhVrZqWQfTtgzXT';
    //     next();
    // }
    // else{
        const token = req.cookies['dash-auth-tokenjwtgrab'];
        if (!token) return res.status(403).send('Access Denied');
        try {
            const verified = jwt.verify(token, process.env.TOKEN_SECRET);
            const decodedContetnt = jwt.decode(token, { complete: true });
            req.user = verified;
            req.user_id = decodedContetnt.payload.id;
            next();
        } catch (err) {
            res.setHeader('Set-Cookie', `dash-auth-tokenjwtgrab=; Max-Age=0; HttpOnly; SameSite=None; Secure; Path=/`);
            res.status(400).send('Invalid Token');
        }
    // }
}

const createToken = (user_id) => {
    // sign a new jwt that lasta 12 hours
    const token = jwt.sign({ id: user_id }, process.env.TOKEN_SECRET, { expiresIn: '18h' });
    return token;
}

module.exports = {
    verifyToken,
    createToken
};