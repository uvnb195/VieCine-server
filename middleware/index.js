const { admin } = require('./firebase/config');
const db = admin.firestore()

class Middleware {
    checkRole = async (id) => {
        try {
            const collectionRef = db.collection('admins')
            const data = await collectionRef.get()
            const convertData = data.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            if (convertData.filter(item => item.id === id).length !== 0) {
                return 'admin'
            }
            return null
        } catch (err) {
            return ({ message: err.message })
        }
    }

    decodeToken = async (req, res, next) => {
        const path = req.path
        try {
            // no need to check token for these paths
            const passedList = [
                '/api'
            ]

            if (passedList.filter((item) => path.startsWith(item)).length > 0) {
                return next();
            }

            const { authorization } = req.headers;
            if (
                !authorization
                || authorization.length < 7
                || !authorization.startsWith('Bearer ')
                || authorization.split(' ').length < 2
            ) {
                return res.status(401).send({ message: 'Unauthorized' });
            }
            const tokenDecoded = authorization.split(' ')[1];

            // check token valid
            let errorMsg = ''
            const valid = await admin.auth().verifyIdToken(tokenDecoded)
            if (valid) {
                const checkRole = await this.checkRole(valid.uid)
                req.validation = {
                    'uid': valid.user_id,
                    'role': checkRole || undefined
                }
                return next();
            }

            return res.status(401).send({ "message": errorMsg })
        } catch (err) {
            if (err.message.includes('Firebase ID'))
                return res.status(401)
                    .send({ "message": 'Invalid token' })
            else
                return res.status(500)
                    .send({ "message": err.message })
        }
    }
}

module.exports = new Middleware()