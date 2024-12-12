require('dotenv').config()
const fetch = require('node-fetch');

class TheMovieDb {
    url = process.env.TMDB_URL
    // w:'500'|'342'|'185'|'original'
    imageUrl = (w) => {
        switch (w) {
            case 'original':
                return `https://image.tmdb.org/t/p/original`
            default:
                return `https://image.tmdb.org/t/p/w${w}`
        }
    }
    options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.THEMOVIEDB_ACCESS_TOKEN}`
        }
    }
    imageOptions = {
        method: 'GET'
    }
    convertData = (data, info) => ({ ...data, ...info })

    async getTrendingMovies(page) {
        const url = `${this.url}/trending/movie/day?page=${page}`
        const response = await fetch(url, this.options)
            .then(res => res.json())
        const data = { ...response, results: response.results.map(movie => ({ ...movie, poster_path: `${this.imageUrl(342)}/${movie.poster_path}` })) }
        return data
    }
    async getUpcomingMovies(page, region) {
        const url = `${this.url}/movie/upcoming?page=${page}&region=${region}`
        const response = await fetch(url, this.options)
            .then(res => res.json())
        const data = { ...response, results: response.results.map(movie => ({ ...movie, poster_path: `${this.imageUrl(342)}/${movie.poster_path}` })) }
        return data
    }
    async getShowingMovies(page, region) {
        const url = `${this.url}/movie/now_playing?region=${region}&page=${page}`
        const response = await fetch(url, this.options).then(res => res.json())
        const data = { ...response, results: response.results.map(movie => ({ ...movie, poster_path: `${this.imageUrl(342)}/${movie.poster_path}` })) }
        return data
    }

    getImage(path) {
        const url = `${this.imageUrl(500)}/${path}`
        return url
    }
    async getMovieTrailer(id) {
        const url = `${this.url}/movie/${id}/videos`
        const response = await fetch(url, this.options).then(res => res.json())
        const data = response.results.filter(video => video.site === 'YouTube')[0]
        if (!data) return ''
        return `https://www.youtube.com/embed/${data.key}`
    }

    //movie detail
    async getMovieCertification(id, region) {
        const url = `${this.url}/movie/${id}/release_dates`
        try {
            const response = await fetch(url, this.options).then(res => res.json()).then(data => data.results)

            const certificationDefault = response.find(item => item.iso_3166_1 === 'US').release_dates

            //check if the region is true but not have certification
            const certificationRegion = response.find(item => item.iso_3166_1 === region).release_dates
            const certificate = certificationRegion.filter(item => item.certification !== '')
            if (certificate.length === 0) {
                const defaultCertificate = certificationDefault.filter(item => item.certification !== '').map(item => item.certification)
                return defaultCertificate[0]
            }
            return certificate.map(item => item.certification)[0]

        } catch (error) {
            //if region not found => return US as default
            const response = await fetch(url, this.options).then(res => res.json()).then(data => data.results)
            const certificationDefault = response.find(item => item.iso_3166_1 === 'US')
            const defaultCertificate = certificationDefault.release_dates.filter(item => item.certification !== '').map(item => item.certification)
            return defaultCertificate[0]
        }
    }

    async getMovieDetail(id, region) {
        const url = `${this.url}/movie/${id}`
        //get info
        const response = await fetch(url, this.options).then(res => res.json())

        //get trailer
        const trailer = await this.getMovieTrailer(id)

        //get certification
        const certification = await this.getMovieCertification(id, region)

        console.log(response)

        const movieData = {
            ...response,
            backdrop_path: `${this.imageUrl(500)}/${response.backdrop_path}`,
            poster_path: `${this.imageUrl(500)}/${response.poster_path}`,
            certification,
            trailer
        }
        return movieData
    }
    async getMovieCast(id) {
        const url = `${this.url}/movie/${id}/credits`
        const response = await fetch(url, this.options).then(res => res.json())
        const data = {
            results: response.cast.map(item => ({
                ...item,
                profile_path: `${this.imageUrl(342)}/${item.profile_path}`
            }))
        }
        return data
    }

    // person detail
    async getPersonDetail(id) {
        const url = `${this.url}/person/${id}`
        const response = await fetch(url, this.options).then(res => res.json())
        const data = { ...response, profile_path: `${this.imageUrl(500)}/${response.profile_path.slice(1)}` }
        return data
    }

    async getPersonCast(id) {
        const url = `${this.url}/person/${id}/movie_credits`
        const response = await fetch(url, this.options).then(res => res.json()).then(res => res.cast)
        const data = response.map(item => ({
            ...item,
            poster_path: `${this.imageUrl(342)}/${item.poster_path}`
        }))
        return data
    }

    // search
    async searchMovie(query, page) {
        try {
            const movieUrl = `${this.url}/search/movie?query=${query}&page=${page}`
            const movieResponse = await fetch(movieUrl, this.options).then(res => res.json())
            const data = { ...movieResponse, results: movieResponse.results.map(movie => ({ ...movie, poster_path: `${this.imageUrl(342)}/${movie.poster_path}` })) }
            return data
        } catch (error) {
            return null
        }
    }

    async searchPerson(query, page) {
        try {
            const personUrl = `${this.url}/search/person?query=${query}&page=${page}`
            const personResponse = await fetch(personUrl, this.options).then(res => res.json())
            const data = { ...personResponse, results: personResponse.results.map(person => ({ ...person, profile_path: `${this.imageUrl(342)}/${person.profile_path}` })) }
            return data
        } catch (error) {
            return null
        }
    }
    async search(query) {
        try {
            const [movieResult, personResult] = await Promise.all([
                this.searchMovie(query, 1),
                this.searchPerson(query, 1)
            ]);
            return { movie: movieResult, person: personResult }
        } catch (error) {
            return null
        }
    }
}

module.exports = new TheMovieDb() 