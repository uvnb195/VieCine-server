const tmdbApi = require('../tmdb-api')
const {
    Theatre,
    Room,
    Service,
    Movie,
    MovieSchedule,
    Ticket,
    Schedule
} = require('./schema/index')


class DbRepository {
    constructor(db) {
        this.db = db
    }

    async getTheatres() {
        try {
            const theatres = await Theatre.find()
            return theatres
        } catch (error) {
            console.log(error)
            return error
        }
    }
    async getTheatreDetail(id) {
        try {
            const theatre = await Theatre.findById(id)
            return theatre
        } catch (error) {
            console.log(error)
            return error
        }
    }
    async addTheatre(theatre) {
        try {
            const newTheatre = new Theatre(theatre)
            const result = await newTheatre.save()
            return result._id.toString()
        } catch (error) {
            console.log(error)
            return error
        }
    }

    // room
    async getRooms(theatreId) {
        try {
            const rooms = await Room.find({ theatreId: theatreId })
            return rooms
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async addRoom(room) {
        try {
            const newRoom = new Room(room)
            const result = await newRoom.save()
            return result
        } catch (error) {
            console.log(error)
            return error
        }
    }
    async updateRoom(room) {
        try {
            await Room.findByIdAndUpdate(room._id, room)
            return room
        } catch (error) {
            console.log(error)
            return error
        }
    }
    async getRoomDetail(theatreId, id) {
        try {
            const rooms = await this.getRooms(theatreId)
            const room = rooms.filter(room => room._id == id)[0]
            return room ? room : null
        } catch (error) {
            console.log(error)
            return error
        }
    }

    //service
    async getServices() {
        try {
            const services = await Service.find()
            return services
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async addService(service) {
        try {
            const newService = new Service(service)
            const result = await newService.save()
            return result
        } catch (err) {
            console.log(err)
            return err

        }
    }

    //movie
    async getMovies() {
        try {
            const movies = await Movie.find()
            return movies
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async addMovie(movie) {
        try {
            const newMovie = new Movie(movie)
            const result = await newMovie.save()
            return result
        } catch (err) {
            console.log(err)
            return err
        }
    }

    // schedule
    async getRoomSchedule(roomId) {
        try {
            const schedules = await Schedule.find({ roomId: roomId })
            return schedules
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async checkExistSchedule(roomId, movieId, timeStart, duration, date) {
        const isOverlapping = (a, b, c, d) => {
            return a < d && b > c;
        }

        try {
            endTime = new Date(timeStart.getTime() + duration * 1000)
            const schedules = await Schedule.find({ roomId: roomId }).then(async (data) => {
                const duration = await tmdbApi.getMovieDetail(movieId, 'VN').then(data => data.runtime)
                data.map(item => ({
                    ...item,
                    timeEnd: new Date(item.timeStart.getTime() + duration * 1000)
                }))
            })

            const check = schedules.some(item => isOverlapping(item.timeStart, item.timeEnd, timeStart, endTime) && item.date === date)

            console.log('check overlap', check)

            return false
        } catch (error) {
            console.log(error)
            return error
        }
    }

    //movie schedule
    async getMovieSchedules() {
        try {
            const movieSchedules = await MovieSchedule.find()
            return movieSchedules
        } catch (error) {
            console.log(error)
            return error
        }
    }
    async upsertSchedule(schedules) {
        try {
            const newSchedules = schedules.map(schedule => new Schedule(schedule))
            const result = await Schedule.insertMany(newSchedules)
            return result
        } catch (error) {
            console.log(error)
            return error
        }
    }
    async addMovieSchedule(movieSchedule) {
        try {
            const isNew = await MovieSchedule.findOne({ movieId: movieSchedule.movieId, theatreId: movieSchedule.theatreId, runDate: movieSchedule.runDate }).then(data => data ? false : true)
            if (isNew) {
                const newMovieSchedule = new MovieSchedule({
                    ...movieSchedule,
                    runTimes: [{ time: movieSchedule.runTime, price: movieSchedule.price }]
                })
                const result = await newMovieSchedule.save()
                return result
            }
            const result = await MovieSchedule.updateOne({
                movieId: movieSchedule.movieId,
                theatreId: movieSchedule.theatreId,
                runDate: movieSchedule.runDate
            },
                {
                    $push: {
                        runTimes: {
                            $each: [
                                {
                                    time: movieSchedule.runTime,
                                    price: movieSchedule.price
                                }
                            ],
                            $sort: { time: 1 }
                        },
                    }
                }
            )
            return result

        } catch (err) {
            console.log(err)
            return err
        }
    }

    async getMovieScheduleByMovieId(id) {
        try {
            //get objectId from tmdbId
            const movieId = await Movie.find({ movieId: id }).then(data => data[0]._id)

            //get movie schedule by movieId
            const movieSchedule = await MovieSchedule.find({ movieId: movieId })
            return movieSchedule
        } catch (error) {
            console.log(error)
            return error
        }
    }
    async getTheatreDetail(id) {
        try {
            const theatre = await Theatre.findById(id)
            return theatre
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async addTicket(ticket) {
        try {
            const newTicket = new Ticket(ticket)
            const result = await newTicket.save()
            return result
        } catch (err) {
            console.log(err)
            return err
        }
    }
    async blockSeats(movieScheduleId, time, seats) {
        try {
            const result = await MovieSchedule.findOneAndUpdate(
                {
                    _id: movieScheduleId,
                    'runTimes.time': time
                },
                {
                    $push: {
                        'runTimes.$.unavailableSeats': seats
                    }
                },
                { new: true }
            )
            return result
        } catch (err) {
            console.log(err)
            return err
        }
    }
}

module.exports = DbRepository