require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');

const adminRepository = require('../middleware/firebase/repositories/firebaseAdmin');
const DatabaseRepository = require('../src/mongoDb/repository')
const upload = multer()
const tmdb = require('../src/tmdb-api');


// theatre
router.get('/theatre', async (req, res) => {
    const dbRep = new DatabaseRepository(mongoose.connection)
    const result = await dbRep.getTheatres()
    res.send(result)
})
router.get('/theatre/:id', async (req, res) => {
    const dbRep = new DatabaseRepository(mongoose.connection)
    const { id } = req.params
    const result = await dbRep.getTheatreDetail(id)
    res.send(result)
})
router.post('/theatre', upload.none(), async (req, res) => {
    const { role } = req.validation
    const { uid } = req.params
    try {
        const dbRep = new DatabaseRepository(mongoose.connection)
        const decodedData = {
            name: req.body.name,
            location: JSON.parse(req.body.location)
        }
        const result = await dbRep.addTheatre(decodedData)
        res.status(201).send(result)
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: 'Internal server error' })
    }
})

//room
/**
 * GET ROOM LIST
 */
router.get('/room/:theatreId', async (req, res) => {
    const dbRep = new DatabaseRepository(mongoose.connection)
    const { theatreId } = req.params
    const result = await dbRep.getRooms(theatreId)
    res.send(result)
})
/**
 * GET ROOM DETAIL
 */
router.get('/room/:theatreId/:roomId', async (req, res) => {
    const dbRep = new DatabaseRepository(mongoose.connection)
    const { theatreId, roomId } = req.params
    const result = await dbRep.getRoomDetail(theatreId, roomId)
    res.send(result)
})

router.post('/room/:theatreId', upload.none(), async (req, res) => {
    const dbRep = new DatabaseRepository(mongoose.connection)
    const { theatreId } = req.params
    const decodedData = {
        _id: req.body._id ? req.body._id : undefined,
        roomName: req.body.roomName,
        roomType: req.body.roomType,
        theatreId: theatreId,
        totalSeats: req.body.totalSeats,
        map2d: req.body.map2d,
        prices: JSON.parse(req.body.prices),
        status: req.body.status ? req.body.status : undefined
    }
    if (decodedData._id) {
        const result = await dbRep.updateRoom(decodedData)
        res.status(201).send(result)
    } else {
        const result = await dbRep.addRoom(decodedData)
        res.status(201).send(result)
    }
})


//service
router.get('/service', async (req, res) => {
    const dbRep = new DatabaseRepository(mongoose.connection)
    const result = await dbRep.getServices()
    res.send(result)
})

router.post('/service', upload.none(), async (req, res) => {
    const { role } = req.validation
    const { uid } = req.params
    try {
        const dbRep = new DatabaseRepository(mongoose.connection)
        const decodedData = {
            image: req.body.image,
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            typeId: req.body.typeId || null
        }
        const result = await dbRep.addService(decodedData)
        res.status(201).send(result)
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: 'Internal server error' })
    }
})

//movie
router.get('/movie', async (req, res) => {
    const { role } = req.validation
    const { uid } = req.params
    const dbRep = new DatabaseRepository(mongoose.connection)
    const result = await dbRep.getMovies()
    res.send(result)
})
router.post('/movie', upload.none(), async (req, res) => {
    console.log('add movie')
    const { role } = req.validation
    const { uid } = req.params
    try {
        const dbRep = new DatabaseRepository(mongoose.connection)
        const decodedData = {
            movieId: req.body.movieId,
            movieName: req.body.movieName,
            movieImageUri: req.body.movieImageUri,
            startTime: req.body.startTime,
            endAt: req.body.endAt,
        }
        const result = await dbRep.addMovie(decodedData)
        res.status(201).send(result)
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: 'Internal server error' })
    }
})

// schedule
router.get('/room-schedule/:roomId/', async (req, res) => {
    const dbRep = new DatabaseRepository(mongoose.connection)
    const { roomId } = req.params
    const result = await dbRep.getRoomSchedule(roomId)
    res.send(result)
})
router.get('/room/:roomId/schedule-check', async (req, res) => {
    const dbRep = new DatabaseRepository(mongoose.connection)
    const { roomId, movieId, timeStart, duration, date } = req.query
    const result = await dbRep.checkExistSchedule(roomId, movieId, new Date(timeStart), duration, new Date(date))
    console.log('is overlapping::::', result)
    res.send(result)
})
//movie schedule
router.get('/schedule/:theatreId', async (req, res) => {
    const dbRep = new DatabaseRepository(mongoose.connection)
    const { theatreId } = req.params
    const result = await dbRep.getMovieSchedules(theatreId)
    res.send(result)
})
router.post('/schedule/', upload.none(), async (req, res) => {
    const { role } = req.validation
    const { uid } = req.params
    try {
        const dbRep = new DatabaseRepository(mongoose.connection)
        const decodedData = {
            theatreId: req.body.theatreId,
            movieId: req.body.movieId,
            runDate: req.body.runDate,
            runTime: req.body.runTime,
            price: req.body.price,
            serviceIds: req.body.serviceIds || null
        }
        const result = await dbRep.addMovieSchedule(decodedData)
        res.status(201).send(result)
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: 'Internal server error' })
    }
})
router.post('/room/:roomId/add-schedules', upload.none(), async (req, res) => {
    const { role } = req.validation
    const { uid } = req.params
    try {
        const dbRep = new DatabaseRepository(mongoose.connection)
        const schedules = JSON.parse(req.body.schedules)
        const result = await dbRep.upsertSchedule(schedules)
        console.log('add schedules', result)
        res.status(201).send(result)
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: 'Internal server error' })
    }
})

router.get('/user', (req, res) => {
    const role = req.validation.role
    if (role === 'admin') {
        adminRepository.getUsers()
            .then((users) => {
                res.status(200).send(users)
            })
            .catch(err => res.send(err))
    } else {
        res.status(401).send({ message: 'Unauthorized' })
    }
})

router.get('/user/:uid', (req, res) => {
    const { role } = req.validation
    const { uid } = req.params
    if (role === 'admin') {
        adminRepository.getUserDetail(uid)
            .then((user) => {
                res.status(200).send(user)
            })
            .catch(err => res.send(err))
    }
    else {
        res.status(401).send({ message: 'Unauthorized' })
    }
})
router.delete('/user/:uid', (req, res) => {
    const { role } = req.validation
    const { uid } = req.params
    if (role === 'admin') {
        adminRepository.deleteUser(uid)
            .then(() => {
                res.status(200).send({ message: 'User deleted' })
            })
            .catch(err => res.send(err))
    } else {
        res.status(401).send({ message: 'Unauthorized' })
    }
})

module.exports = router


