const express = require('express');
require('dotenv').config()
const middleware = require('./middleware/index');
const tmdb = require('./src/tmdb-api');

const app = express();

const port = 3000;

//middleware
app.use(express.json());
app.use(middleware.decodeToken)


//public routes
app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/trending', (req, res) => {
    tmdb.getTrendingMovies().then((result) => {
        res.send(result)
    })
})

app.get('/upcoming', (req, res) => {
    tmdb.getUpcomingMovies().then((result) => {
        res.send(result)
    })
})

app.get('/showing', (req, res) => {
    tmdb.getShowingMovies().then((result) => {
        console.log(result)
        res.send(result)
    })
})

app.get('/movie/:id', (req, res) => {
    tmdb.getMovieDetail(req.params.id).then((result) => {
        res.send(result)
    })
})

app.get('/movie/:id/credits', (req, res) => {
    console.log(req.path)
    tmdb.getMoVieCredit(req.params.id).then((result) => {
        res.send(result)
    })
})

// secure routes

//start the server
app.listen(port, () => {
    console.log('Server is running on port: localhost:3000');
});
