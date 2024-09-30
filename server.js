const express = require('express');
const app = express();

const port = 3000;

//middleware
app.use(express.json());


//app routes
app.get('/', (req, res) => {
    res.send('Hello World!');
})


//start the server
app.listen(port, () => {
    console.log('Server is running on port: http://localhost:3000');
});
