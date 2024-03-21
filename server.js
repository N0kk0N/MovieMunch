
require('dotenv').config() 

// Initialise Express webserver
const express = require('express')
const session = require('express-session')
const xss = require('xss')
const bcrypt = require('bcrypt')
const app = express()

app
  .use(express.urlencoded({ extended: true }))
  .use('/static', express.static('static'))
  .use(
    session({
      secret: process.env.SESSION_KEY,
      resave: false,
      saveUninitialized: false,
    })
  )
  .set('view engine', 'ejs')
  .set('views', 'view')
  .listen(3000, () => console.log('Server is running on port 3000'));

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `${process.env.MONGODB_URL}`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

client
  .connect()
  .then(() => {
    console.log('Database connection established');
  })
  .catch((err) => {
    console.log(`Database connection error - ${err}`);
    console.log(`For uri - ${uri}`);
  });

app.get('/', (req, res) => {
  res.render('test.ejs');
  console.log(req.session.users);
});

app.get('/movie/:name', (req, res) => {
res.send(req.params.name)
}
)


// CREATE NEW USER
app.post('/new-user', async (req, res) => {
  const db = client.db(process.env.MONGODB_NAME);
  const collection = db.collection(process.env.MONGODB_COLLECTION);
  try {
    const checkAvailable = await collection.findOne({ username: xss(req.body.username) });
    if (!checkAvailable) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

      const result = await collection.insertOne({

        username: xss(req.body.username),
        password: xss(hashedPassword),
        color: xss(req.body.color),
        creationDate: new Date()
      });

      res.send(`Signed up with ${xss(req.body.username)} and ${xss(req.body.password)} 🗿`);

    } else {
      res.send('User with this username already exists.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


// LOGOUT FUNCTION
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Session destroy failed');
    } else {
      res.redirect('/login');
    }
  });
});


app.get('/overview', (req, res) => {
  res.render('overview.ejs');
});

app.get('/favourites', (req, res) => {
  res.render('favourites.ejs');
});



// LOGIN FUNCTION
app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/login-test', async (req, res) => {
  try {
    const db = client.db(process.env.MONGODB_NAME);
    const collection = db.collection(process.env.MONGODB_COLLECTION);

    const existingUser = await collection.findOne({ username: xss(req.body.username) });

    if (existingUser) {
      const passwordMatch = await bcrypt.compare(req.body.password, existingUser.password);

      if (passwordMatch) {
        req.session.users = existingUser._id;
        res.send('Login successful!');
        console.log(req.session.users);
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

app.use((req, res) => {
  console.error('404 error at URL: ' + req.url);
  res.status(404).send('404 error at URL: ' + req.url);
});

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send('500: server error');
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening at port ${process.env.PORT}`);
});


// HAALT LIJST MET DISNEY FILMS OP (API)
const request = require('request');
const { application } = require('express')
const apiKey = process.env.API_KEY;
const options = {
  method: 'GET',
  url: 'https://api.themoviedb.org/3/discover/movie',
  qs: {
    language: 'en-US',
    page: 1,
    with_companies: '2',
  },
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  // console.log(body);
});