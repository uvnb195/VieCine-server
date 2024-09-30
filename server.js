const express = require('express');
const middleware = require('./middleware/index');

const app = express();

const port = 3000;

//middleware
app.use(express.json());
app.use(middleware.decodeToken)


//app routes
app.get('/', (req, res) => {
    res.send('Hello World!');
})


//start the server
app.listen(port, () => {
    console.log('Server is running on port: http://localhost:3000');
});
