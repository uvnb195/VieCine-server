const admin = require('./firebase/config');

class Middleware {
    decodeToken = async (req, res, next) => {
        try {
            const tokenDecoded = req.headers.authorization.split(' ')[1];

            // check token valid
            const valid = admin.auth().verifyIdToken(tokenDecoded)
            if (valid) {
                return next();
            }
            return res.json({ "message": "Invalid token" })
        } catch (error) {
            return res.json({ "message": "Internal Error" })
        }
    }
}

module.exports = new Middleware()