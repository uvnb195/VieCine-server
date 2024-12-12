require("dotenv").config();
const admin = require("firebase-admin");
const { getAuth } = require('firebase-admin/auth')

const serviceAccount = require("./secret-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const auth = getAuth()

module.exports = { admin, auth };