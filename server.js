require('dotenv').config()

const express = require('express');
const cors = require('cors');
require('dotenv').config()
const middleware = require('./middleware/index');
const tmdb = require('./src/tmdb-api');
const timeout = require('connect-timeout')
const mongoose = require('mongoose');


const app = express();
app.use(timeout('3s'))



const clientOptions = {
    serverApi:
    {
        version: '1', strict: true,
        deprecationErrors: true,
        useUnifiedTopology: true,
    }
};
mongoose.connect(process.env.MONGO_DB_URI, clientOptions)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log("Connect to db successfully")
})

const port = 3000
const host = '0.0.0.0'
const publicRouter = require('./routes/publicApi')
const privateRouter = require('./routes/privateApi')
const adminRouter = require('./routes/admin')

//middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))
app.use(cors());
app.use(middleware.decodeToken)

app.get('/', (req, res) => {
    console.log(req.validation.uid, req.validation.role)
    res.send('Hello World!');
})

//public routes
app.use('/api', publicRouter)

// secure routes
app.use('/user', privateRouter)

//admin routes
app.use('/admin', adminRouter)

//start the server
app.listen(port, host, () => {
    console.log('Server is running on port 3000');
});
