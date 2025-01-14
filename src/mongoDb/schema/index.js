const mongoose = require('mongoose');

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
        enum: ['2D', '3D', 'IMAX'],
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
                enum: ['STANDARD', 'VIP', 'SWEET-BOX'],
                required: true
            },
            price: { type: Number, required: true }
        }],
        required: true
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'SUSPEND', 'REMOVED'],
        default: 'AVAILABLE'
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
const MovieSchedule = mongoose.model('Movie_Schedule', movieScheduleSchema)
const Ticket = mongoose.model('Ticket', ticketSchema)

module.exports = {
    Theatre,
    Room,
    Service,
    Movie,
    MovieSchedule,
    Ticket
}