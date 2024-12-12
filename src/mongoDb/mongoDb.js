const {
    Theatre,
    Service,
    Movie,
    MovieSchedule,
    Ticket
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