require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const MOVIES = require('./movies-data-small.json')

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
  
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
      return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
})

app.get('/', (req, res) => {
    res.send('go to /movie to see the movies!');
})

app.get('/movie', function handleGetMovie(req, res) {
    let response = MOVIES;
    //The search options for genre, country, and/or average 
    //vote are provided in query string parameters.
    const {genre, country, avg_vote} = req.query;

    //When searching by genre, users are searching for 
    //whether the Movie's genre includes a specified string. 
    //The search should be case insensitive.
    if (genre) {
        response = response.filter(movie =>
            movie.genre.toLowerCase().includes(genre.toLowerCase()))
    }
    //When searching by country, users are searching for whether 
    //the Movie's country includes a specified string. The search 
    //should be case insensitive.
    if (country) {
        response = response.filter(movie => 
            movie.country.toLowerCase().includes(country.toLowerCase()))
    }
    //When searching by average vote, users are searching 
    //for Movies with an avg_vote that is greater than or equal 
    //to the supplied number.
    if (avg_vote) {
        const numAvgVote = parseFloat(avg_vote);
        if(Number.isNaN(numAvgVote)) {
            return res.status(400).send('avg_vote must be a #');
        }
        response = response.filter(movie => 
            movie.avg_vote >= numAvgVote)
    }


    res.json(response)
})

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
})
