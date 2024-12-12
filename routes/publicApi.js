const express = require('express');
const router = express.Router();
const tmdb = require('../src/tmdb-api');
const province = require('../src/province-open-api')

router.get('/', (req, res) => {
    res.send('Hello World!');
})


//public routes

// movie list
router.get('/', (req, res) => {
    res.send('Hello World!');
})

router.get('/trending', (req, res) => {
    const page = req.query.page
    tmdb.getTrendingMovies(page || 1).then((result) => {
        res.send(result)
    })
})

router.get('/upcoming', (req, res) => {
    const page = req.query.page
    const region = req.query.region
    tmdb.getUpcomingMovies(page || 1, region || "").then((result) => {
        if (result === null) {
            res.send([])
        }
        else res.send(result)
    })
})

router.get('/now-showing', (req, res) => {
    const page = req.query.page
    const region = req.query.region
    tmdb.getShowingMovies(page || 1, region || "").then((result) => {
        if (result === null) {
            res.send([])
        }
        else res.send(result)
    })
})

//movie detail
// return_type MovieType {
//     backdrop_path: string;
//     id: string;
//     title: string;
//     original_title: string;
//     overview: string;
//     poster_path: string;
//     media_type: string;
//     adult: boolean;
//     original_language: string;
//     genre_ids?: (number)[] | null;
//     popularity: number;
//     release_date: string;
//     video: boolean;
//     vote_average: number;
//     vote_count: number;
//     trailer: 'https://www.youtube.com/embed/{key}';
// }
router.get('/movie/:id', (req, res) => {
    let region = req.query.region
    if (!region) region = 'VN'
    tmdb.getMovieDetail(req.params.id, region).then((result) => {
        res.send(result)
    })
})

router.get('/movie/:id/cast', (req, res) => {
    tmdb.getMovieCast(req.params.id).then((result) => {
        res.send(result)
    })
})

//person detail
router.get('/person/:id', (req, res) => {
    tmdb.getPersonDetail(req.params.id).then((result) => {
        res.send(result)
    })
})
router.get('/person/:id/cast', (req, res) => {
    tmdb.getPersonCast(req.params.id).then((result) => {
        res.send(result)
    })
})

//search movies-persons
router.post('/search/:search_query', (req, res) => {
    const search_query = req.params.search_query
    console.log(search_query)
    tmdb.search(search_query).then((result) => {
        res.send(result)
    })
})
router.get('/search/:search_query/movie', (req, res) => {
    const search_query = req.params.search_query
    const page = req.query.page || 1
    tmdb.searchMovie(search_query, page).then((result) => {
        res.send(result)
    })
})
router.get('/search/:search_query/person', (req, res) => {
    const search_query = req.params.search_query
    const page = req.query.page || 1
    tmdb.searchMovie(search_query, page).then((result) => {
        res.send(result)
    })
})

// location
// return-type [
//     { name:string,
//     code:number },
// ]
router.get('/p', async (_, res) => {
    try {
        const response = await province.getAllProvince()
        res.send(response)

    } catch (error) {
        res.status(500).send([])
    }
})
//get province detail
router.get('/p/:code', (req, res) => {
    try {

        province.getDistricts(req.params.code).then((result) => {
            res.send(result)
        })
    } catch (err) {
        res.status(500).send([])
    }
})
//get district detail
router.get('/d/:code', (req, res) => {
    try {
        province.getWards(req.params.code).then((result) => {
            res.send(result)
        })
    } catch (error) {
        res.status(500).send([])
    }
})

module.exports = router;