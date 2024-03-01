const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const dotenv = require('dotenv');
dotenv.config();

const app = express();
app
  .use(express.urlencoded({extended: true})) // middleware to parse form data from incoming HTTP request and add form fields to req.body
  .use(express.static('static'))             // Allow server to serve static content such as images, stylesheets, fonts or frontend js from the directory named static
  .set('view engine', 'ejs')                 // Set EJS to be our templating engine
  .set('views', 'view')                      // And tell it the views can be found in the directory named view

MongoClient.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('MongoDB connected...');
    const db = client.db('Tech');
    // use the db object for CRUD operations
  })
  .catch(err => console.log(err));

app.listen(3000, () => console.log('Server is running on port 3000'));

// A sample route, replace this with your own routes
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Middleware to handle not found errors - error 404
app.use((req, res) => {
  // log error to console
  console.error('404 error at URL: ' + req.url)
  // send back a HTTP response with status code 404
  res.status(404).send('404 error at URL: ' + req.url)
})

// Middleware to handle server errors - error 500
app.use((err, req, res) => {
  // log error to console
  console.error(err.stack)
  // send back a HTTP response with status code 500
  res.status(500).send('500: server error')
})

// Start the webserver and listen for HTTP requests at specified port
app.listen(process.env.PORT, () => {
  console.log(`I did change this message and now my webserver is listening at port ${process.env.PORT}`)
})