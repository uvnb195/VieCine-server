const { admin, auth } = require('../../firebase/config');

const userRepository = require('./firebaseAuth')
const middleware = require('../../../middleware/index')

class FirebaseAdminRepository {
    constructor() {
        this.auth = auth
        this.admin = admin
    }

    async getUsers() {
        try {
            const { users } = await this.auth.listUsers()
            const convertUsers = users.map(user => {
                return userRepository.userResponseFormat(user.toJSON())
            })
            return convertUsers
        } catch (err) {
            throw err
        }
    }

    async getUserDetail(uid) {
        try {
            const role = await middleware.checkRole(uid)
            const userRecord = await this.auth.getUser(uid)
                .then((user) => user.toJSON())
            return userRepository.userResponseFormat(userRecord, role)
        } catch (err) {
            throw err
        }
    }

    async deleteUser(uid) {
        try {
            await this.auth.deleteUser(uid)
        } catch (err) {
            throw err
        }
    }
}

module.exports = new FirebaseAdminRepository()