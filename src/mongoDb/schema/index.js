const mongoose = require('mongoose');

const STATUS_ENUM = ['AVAILABLE', 'SUSPEND', 'REMOVED']
const ROOM_TYPE_ENUM = ['2D', '3D', 'IMAX']
const SEAT_TYPE_ENUM = ['STANDARD', 'VIP', 'SWEET-BOX']

const theatreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: {
        province: {
            name: { type: String, required: true },
            code: { type: String, required: true }
        },
        district: {
            name: { type: String, required: true },
            code: { type: String, required: true }
        },
        street: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    // status: {
    //     type: String,
    //     enum: ['available', 'suspend', 'removed'],
    //     default: 'available'
    // }
})

const roomSchema = new mongoose.Schema({
    roomName: { type: String, required: true },
    roomType: {
        type: String,
        enum: ROOM_TYPE_ENUM,
        required: true
    },
    theatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre',
        required: true
    },
    totalSeats: { type: Number, required: true },
    map2d: { type: String, required: true },
    prices: {
        type: [{
            seatType: {
                type: String,
                enum: SEAT_TYPE_ENUM,
                required: true
            },
            price: { type: Number, required: true }
        }],
        required: true
    },
    status: {
        type: String,
        enum: STATUS_ENUM,
        default: STATUS_ENUM[0]
    }
})

const serviceSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    typeId: String,
})

const movieSchema = new mongoose.Schema({
    movieId: { type: Number, required: true },
    movieName: { type: String, required: true },
    movieImageUri: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    endAt: { type: Date, required: true },
    status: {
        type: String,
        enum: STATUS_ENUM,
        default: STATUS_ENUM[0]
    }
})

const scheduleSchema = new mongoose.Schema({
    theatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    timeStart: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: STATUS_ENUM,
        default: STATUS_ENUM[0]
    }
})

const movieScheduleSchema = new mongoose.Schema({
    theatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre',
        required: true
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    runDate: {
        type: Date,
        required: true
    },
    runTimes: {
        type: [{
            time: Date,
            price: Number,
            unavailableSeats: [String]   // seatCode
        }],
        required: true
    },
    serviceIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
})

const ticketSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    movieScheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie_Schedule',
        required: true
    },
    selectedTime: {
        type: Date,
        required: true
    },
    seats: [{
        type: String,
        required: true
    }],
    price: { type: Number, required: true },
    serviceIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
})




const Theatre = mongoose.model('Theatre', theatreSchema)
const Room = mongoose.model('Room', roomSchema)
const Service = mongoose.model('Service', serviceSchema)
const Movie = mongoose.model('Movie', movieSchema)
const Schedule = mongoose.model('Schedule', scheduleSchema)
const MovieSchedule = mongoose.model('Movie_Schedule', movieScheduleSchema)
const Ticket = mongoose.model('Ticket', ticketSchema)

module.exports = {
    Theatre,
    Room,
    Service,
    Movie,
    Schedule,
    MovieSchedule,
    Ticket
}