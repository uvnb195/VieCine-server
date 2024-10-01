require('dotenv').config()
const fetch = require('node-fetch');

class TheMovieDb {
    url = 'https://api.themoviedb.org/3'
    options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.THEMOVIEDB_ACCESS_TOKEN}`
        }
    };
    async getTrendingMovies() {
        const url = `${this.url}/trending/movie/week`
        const response = await fetch(url, this.options).then(res => res.json())
        return response
    }
    async getUpcomingMovies() {
        const url = `${this.url}/movie/upcoming`
        const response = await fetch(url, this.options).then(res => res.json())
        return response
    }
    async getShowingMovies() {
        const url = `${this.url}/movie/now_playing`
        const response = await fetch(url, this.options).then(res => res.json())
        return response
    }

    async getMovieDetail(id) {
        const url = `${this.url}/movie/${id}`
        const response = await fetch(url, this.options).then(res => res.json())
        return response
    }

    async getMoVieCredit(id) {
        const url = `${this.url}/movie/${id}/credits`
        const response = await fetch(url, this.options).then(res => res.json())
        return response
    }
}

module.exports = new TheMovieDb() 