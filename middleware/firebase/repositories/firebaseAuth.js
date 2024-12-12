const { admin, auth } = require('../../firebase/config');

class AuthUserRepository {
    constructor() {
        this.auth = auth
        this.admin = admin
    }

    userResponseFormat(user, role) {
        const userData = {
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName || null,
            photoURL: user.customClaims.photoURL || null,
            phoneNumber: user.phoneNumber && user.phoneNumber.replace('+84', '0') || null,
            address: user.customClaims && user.customClaims.address || null,
            birthday: user.customClaims && user.customClaims.birthday || null,
            gender: user.customClaims && user.customClaims.gender || null,
            role: role || undefined
        }
        return userData
    }

    convertPhoneNumber(num) {
        if (num && num.startsWith('+84')) {
            return num
        }
        return `+84${num.slice(1)}`
    }

    async getUser(uid) {
        try {
            const user = await this.auth.getUser(uid)
            return user
        } catch (err) {
            throw err
        }
    }

    async updateUser(uid, customClaims, data) {
        try {
            const user = await this.getUser(uid)
            if (customClaims) {
                const url = customClaims.photoURL
                    ? await this.saveAvatar(uid, customClaims.photoURL)
                    : null
                await this.auth.setCustomUserClaims(
                    uid,
                    {
                        ...user.customClaims,
                        ...customClaims,
                        photoURL: url
                    })
            }
            if (data)
                await this.auth.updateUser(uid, data)

        } catch (err) {
            throw err
        }
    }

    async saveAvatar(uid, imageBase64) {
        const type = imageBase64.split(';')[0].split('/')[1]
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const bucket = this.admin.storage().bucket()
        const imageFile = bucket.file(`users/${uid}.jpg`)
        try {
            await imageFile.save(buffer, {
                metadata: {
                    contentType: `image/${type}`
                }
            })
            const url = await this.getAvatarUrl(uid)
            return url
        } catch (error) {
            throw error
        }
    }

    async getAvatarUrl(uid) {
        const bucket = this.admin.storage().bucket()
        const imageFile = bucket.file(`users/${uid}.jpg`)
        const now = new Date()
        const expires = new Date(now.getFullYear() + 1000, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds())

        try {
            const [url] = await imageFile.getSignedUrl({
                action: 'read',
                expires: expires,
            });
            return url

            // if (url) {
            //     const response = await fetch(url);
            //     const arrayBuffer = await response.arrayBuffer();
            //     const buffer = Buffer.from(arrayBuffer);
            //     const base64Image = buffer.toString('base64');
            //     return `data:image/jpeg;base64,${base64Image}`;
            // } else {
            //     return null;
            // }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async getAvatarBase64(uid) {
        const bucket = this.admin.storage().bucket()
        const imageFile = bucket.file(`users/${uid}.jpg`)

        try {
            const [url] = await imageFile.getSignedUrl({
                action: 'read',
                expires: '03-09-2500',
            });

            if (url) {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64Image = buffer.toString('base64');
                return `data:image/jpeg;base64,${base64Image}`;
            } else {
                return null;
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

module.exports = new AuthUserRepository()