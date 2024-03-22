
require('dotenv').config() 

// Initialise Express webserver
const express = require('express')
const session = require('express-session')
const xss = require('xss')
const bcrypt = require('bcrypt')
const multer  = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'static/uploads')
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop()
    const date = new Date
    const dateISO = date.toISOString()
    cb(null, `${req.session.users}${dateISO}.${extension}` )
  }
})

const upload = multer({ storage: storage })
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
  res.render('homepage.ejs');
  console.log(req.session.users);
});

app.get('/signup', (req, res) => {
  res.render('signup.ejs');
  console.log(req.session.users);
});

app.get('/signup/preferences', (req, res) => {
  res.render('signup-preferences.ejs');
  console.log(req.session.users);
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
  console.log(req.session.users);
});

app.get('/movies', (req, res) => {
  res.render('movies.ejs');
  console.log(req.session.users);
});

app.get('/profile', (req, res) => {
  res.render('profile.ejs');
  console.log(req.session.users);
});

app.get('/profile/settings', (req, res) => {
  res.render('profile-settings.ejs');
  console.log(req.session.users);
});

app.post('/profile/settingsnew', upload.single('avatar'), async function (req, res, next) {
  const db = client.db(process.env.MONGODB_NAME);
  const collection = db.collection(process.env.MONGODB_COLLECTION);
  const picture = req.file.filename
  try {
    collection.findOneAndUpdate( { "_id" : new ObjectId(req.session.users) },
    { $set: { "fileName" : picture } });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
  res.send(`<img src="../static/uploads/${req.file.filename}" alt="Profile picture">`)
})

app.get('/movie/:name', (req, res) => {
res.send(req.params.name)
}
);

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

// MOETEN DEZE VERWIJDEREN ZODRA HET AF IS!
app.get('/filmdetail', (req, res) => {
  res.render('filmdescription.ejs');
});

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
        creationDate: new Date(),
        fileName: ""
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


app.post('/login-confirmation', async (req, res) => {
  try {
    const db = client.db(process.env.MONGODB_NAME);
    const collection = db.collection(process.env.MONGODB_COLLECTION);

    const existingUser = await collection.findOne({ username: xss(req.body.username) });

    if (existingUser) {
      const passwordMatch = await bcrypt.compare(req.body.password, existingUser.password);

      if (passwordMatch) {
        req.session.users = existingUser._id;
        res.render('movies.ejs');
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
const { parse } = require('dotenv')
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