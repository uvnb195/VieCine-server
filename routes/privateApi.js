const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');

const userRepository = require('../middleware/firebase/repositories/firebaseAuth')
const DatabaseRepository = require('../src/mongoDb/mongoDb')
const upload = multer()

router.get('/', (req, res) => {
    const uid = req.validation.uid
    const role = req.validation.role
    userRepository.getUser(uid)
        .then((user) => user.toJSON())
        .then((responseUser) => {
            res.status(200).send(userRepository.userResponseFormat(responseUser, role))
        })
        .catch(err => res.send(err))
});

router.get('/avatar', (req, res) => {
    const uid = req.validation.uid
    userRepository.getAvatarBase64(uid)
        .then((base64) => {
            res.status(200).send({ data: base64 })
        })
        .catch(err => res.send(err))
})
router.patch('/update-avatar', upload.none(), (req, res) => {
    const uid = req.validation.uid
    const role = req.validation.role
    const imageBase64 = req.body.image
    userRepository.updateUser(uid, { photoURL: imageBase64 }, null)
        .then(() => {
            userRepository.getUser(uid)
                .then((user) => user.toJSON())
                .then((responseUser) => {
                    res.status(201).send(userRepository.userResponseFormat(responseUser, role))
                })
        })
        .catch(err => res.send(err))
})

router.post('/update-profile', upload.none(), (req, res) => {
    const {
        imageBase64,
        displayName,
        phoneNumber,
        address,
        birthday,
        gender } = req.body
    const uid = req.validation.uid
    const role = req.validation.role
    try {
        const phone = phoneNumber ? userRepository.convertPhoneNumber(phoneNumber) : null
        const addressJSON = address ? JSON.parse(address) : null
        const splitDay = birthday.split('/')
        const dob = birthday ? new Date(
            parseInt(splitDay[2]), //year
            parseInt(splitDay[1]) - 1,//month from 0
            parseInt(splitDay[0]) //day
        ) : null

        //update user data
        userRepository.updateUser(
            uid,
            //custom claims
            {
                address: addressJSON,
                birthday: dob,
                gender: parseInt(gender),
                photoURL: imageBase64 || undefined
            },
            //user base data
            {
                displayName: displayName,
                phoneNumber: phone == null ? undefined : phone
            },).then(() => {
                userRepository.getUser(uid)
                    .then((user) => user.toJSON())
                    .then((responseUser) => {
                        res.status(201).send(userRepository.userResponseFormat(responseUser, role))
                    })
            }
            )

    } catch (error) {
        console.log(error)
        res.status(500).send('Error updating profile')
    }
}
)

router.get('/schedule/:movieId', async (req, res) => {
    const uid = req.validation.uid
    const role = req.validation.role
    const { movieId } = req.params
    const dbRep = new DatabaseRepository(mongoose.connection)
    const movieSchedule = await dbRep.getMovieScheduleByMovieId(movieId)
    if (movieSchedule.length === 0) {
        res.status(404).send('This movie has no schedule')
        return
    }
    res.send(movieSchedule)
})
router.get('/theatre/:theatreId', async (req, res) => {
    const uid = req.validation.uid
    const role = req.validation.role
    const { theatreId } = req.params
    const dbRep = new DatabaseRepository(mongoose.connection)
    const theatre = await dbRep.getTheatreDetail(theatreId)
    if (!theatre) {
        res.status(404).send('Theatre not found')
        return
    }
    res.send(theatre)
})
router.get('/service', async (req, res) => {
    const uid = req.validation.uid
    const role = req.validation.role
    const dbRep = new DatabaseRepository(mongoose.connection)
    const result = await dbRep.getServices()
    res.send(result)
})

router.post('/booking', upload.none(), async (req, res) => {
    const uid = req.validation.uid
    try {
        const dbRep = new DatabaseRepository(mongoose.connection)
        const decodedData = {
            userId: uid,
            movieScheduleId: req.body.movieScheduleId,
            seats: JSON.parse(req.body.seats),
            price: req.body.price,
            serviceIds: req.body.serviceIds ? JSON.parse(req.body.serviceIds) : [],
            selectedTime: req.body.selectedTime
        }
        console.log(decodedData)
        await dbRep.blockSeats(decodedData.movieScheduleId, decodedData.selectedTime, decodedData.seats)
        const result = await dbRep.addTicket(decodedData)
        res.status(201).send(result)
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: 'Internal server error' })
    }
})

module.exports = router