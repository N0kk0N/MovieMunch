require('dotenv').config() 

// Initialise Express webserver
const express = require('express')
const session = require('express-session')
const app = express()

app
  .use(express.urlencoded({extended: true})) // middleware to parse form data from incoming HTTP request and add form fields to req.body
  .use(express.static('static'))             // Allow server to serve static content such as images, stylesheets, fonts or frontend js from the directory named static
  .use(session({
    secret: 'secret-key',
    resave: 'false',
    saveUninitialized: 'false',
  }))
  .set('view engine', 'ejs')                 // Set EJS to be our templating engine
  .set('views', 'view')                      // And tell it the views can be found in the directory named view
  .listen(3000, () => console.log('Server is running on port 3000'));
  
// Use MongoDB
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
// Construct URL used to connect to database from info in the .env file
const uri = `${process.env.MONGODB_URL}`
// Create a MongoClient
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
})

// Try to open a database connection
client.connect()
  .then(() => {
    console.log('Database connection established')
  })
  .catch((err) => {
    console.log(`Database connection error - ${err}`)
    console.log(`For uri - ${uri}`)
  })

  // A sample route, replace this with your own routes
app.get('/', (req, res) => {
  res.render('test.ejs')
  console.log(req.session.users)
})

app.post('/new-user', async (req, res) => {
  const db = client.db(process.env.MONGODB_NAME)
  const collection = db.collection(process.env.MONGODB_COLLECTION)
  try {
    const checkAvailable = await collection.findOne({ username: req.body.username });
    if (!checkAvailable) {
      // User doesn't exist, so we can insert a new user
      const result = await collection.insertOne({
        username: req.body.username,
        password: req.body.password,
        color: req.body.color,
        creationDate: new Date()
      });

      res.send(`Signed up with ${req.body.username} and ${req.body.password} 🗿`);
    } else {
      // User already exists
      res.send('User with this username already exists.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
})

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Session destroy failed');
    } else {
      // Stuur de gebruiker naar de uitlogpagina of een andere gewenste bestemming
      res.redirect('/login');
    }
  });
})

app.get('/login', (req, res) => {
  res.render('login.ejs')
  console.log(req.session.users)
})

app.post('/login-test', async (req, res) => {
  try {
    const db = client.db(process.env.MONGODB_NAME);
    const collection = db.collection(process.env.MONGODB_COLLECTION);

    const existingUser = await collection.findOne({ username: req.body.username });

    if (existingUser) {
      if (existingUser.password === req.body.password) {
        req.session.users = existingUser._id
        res.send('Login successful!');
        console.log(req.session.users)
      } else {
        res.send('Invalid password.');
      }
    } else {
      res.send('User does not exist.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

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
  console.log(`I did not change this message and now my webserver is listening at port ${process.env.PORT}`)
})



  // HAALT LIJST MET DISNEY FILMS OP
const request = require('request');

const apiKey = process.env.API_KEY;

const options = {
  method: 'GET',
  url: 'https://api.themoviedb.org/3/discover/movie',
  qs: {
    language: 'en-US',
    page: 1,
    with_companies: '2' // TheMovieDB ID for Disney
  },
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${apiKey}`
  }
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});