const admin = require('./firebase/config');

class Middleware {
    decodeToken = async (req, res, next) => {
        const path = req.path
        try {
            // no need to check token for these paths
            const passedList = [
                '/trending',
                '/upcoming',
                '/showing',
                '/movie']

            if (passedList.filter((item) => path.includes(item)).length > 0) {
                return next();
            }

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