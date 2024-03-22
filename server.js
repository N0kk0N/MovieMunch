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
  res.render('homepage.ejs');
  console.log(req.session.users);
});

app.get('/overview', (req, res) => {
  const request = require('request');
  const { json } = require('express')
  const apiKey = process.env.API_KEY;
  const genreMap = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };

  const options = {
    method: 'GET',
    url: 'https://api.themoviedb.org/3/movie/popular',
    qs: {
      language: 'en-US',
      page: 1,
    },
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    const movies = JSON.parse(body).results;
    const adultArray = []
    const backdropPathArray = []
    const genreIdsArray = []
    const idArray = []
    const originalLanguageArray = []
    const originalTitleArray = []
    const overviewArray = []
    const popularityArray = []
    const posterPathArray = []
    const releaseDateArray = []
    const titleArray = []
    const videoArray = []
    const voteAverageArray = []
    const voteCountArray = []

    movies.forEach(movie => {
      const adult = movie.adult
      adultArray.push(adult)

      const backdropPath = movie.backdrop_path
      backdropPathArray.push(backdropPath)

      const genreIds = movie.genre_ids.map(id => genreMap[id]);
      genreIdsArray.push(genreIds)

      const id = movie.id
      idArray.push(id)

      const originalLanguage = movie.original_language
      originalLanguageArray.push(originalLanguage)

      const originalTitle = movie.original_title
      originalTitleArray.push(originalTitle)

      const overview = movie.overview
      overviewArray.push(overview)
      
      const popularity = movie.popularity
      popularityArray.push(popularity)

      const posterPath = movie.poster_path
      posterPathArray.push(posterPath)
      
      const releaseDate = movie.release_date
      releaseDateArray.push(releaseDate)

      const title = movie.title
      titleArray.push(title)

      const video = movie.video
      videoArray.push(video)
      
      const voteAverage = movie.vote_average
      voteAverageArray.push(voteAverage)

      const voteCount  = movie.vote_count
      voteCountArray.push(voteCount)
    });
    res.render('overview.ejs', {adultArray, backdropPathArray, genreIdsArray, idArray, originalLanguageArray, originalTitleArray, overviewArray, popularityArray, posterPathArray, releaseDateArray, titleArray, videoArray, voteAverageArray, voteCountArray});
  });
});

app.get('/favourites', (req, res) => {
  const request = require('request');
  const { json } = require('express')
  const apiKey = process.env.API_KEY;
  const options = {
    method: 'GET',
    url: 'https://api.themoviedb.org/3/movie/popular',
    qs: {
      language: 'en-US',
      page: 1,
    },
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  };
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    const movies = JSON.parse(body).results;
    const adultArray = []
    const backdropPathArray = []
    const genreIdsArray = []
    const idArray = []
    const originalLanguageArray = []
    const originalTitleArray = []
    const overviewArray = []
    const popularityArray = []
    const posterPathArray = []
    const releaseDateArray = []
    const titleArray = []
    const videoArray = []
    const voteAverageArray = []
    const voteCountArray = []
  
    movies.forEach(movie => {
  
      const adult = movie.adult
      adultArray.push(adult)
  
      const backdropPath = movie.backdrop_path
      backdropPathArray.push(backdropPath)
  
      const genreIds = movie.genre_ids
      genreIdsArray.push(genreIds)
  
      const id = movie.id
      idArray.push(id)
  
      const originalLanguage = movie.original_language
      originalLanguageArray.push(originalLanguage)
  
      const originalTitle = movie.original_title
      originalTitleArray.push(originalTitle)
  
      const overview = movie.overview
      overviewArray.push(overview)
      
      const popularity = movie.popularity
      popularityArray.push(popularity)
  
      const posterPath = movie.poster_path
      posterPathArray.push(posterPath)
      
      const releaseDate = movie.release_date
      releaseDateArray.push(releaseDate)
  
      const title = movie.title
      titleArray.push(title)
  
      const video = movie.video
      videoArray.push(video)
      
      const voteAverage = movie.vote_average
      voteAverageArray.push(voteAverage)
  
      const voteCount  = movie.vote_count
      voteCountArray.push(voteCount)
  
    });
  
    res.render('favourites.ejs', {adultArray, backdropPathArray, genreIdsArray, idArray, originalLanguageArray, originalTitleArray, overviewArray, popularityArray, posterPathArray, releaseDateArray, titleArray, videoArray, voteAverageArray, voteCountArray});
  });
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

app.get('/movie/:name', (req, res) => {
  // HIER MOETEN WE ZORGEN DAT WE UIT DE URL DE FILM KRIJGEN
  const movieName = req.params.name
  // DAARNA MOETEN WE ZORGEN DAT WE GEGEVENS UIT DE API KRIJGEN
  const url = `https://api.themoviedb.org/3/search/movie?query=${movieName}&api_key=${process.env.API_KEY}`
  
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', Authorization: `Bearer ${process.env.API_KEY}`}
  };
  
  fetch(url, options)
  .then(res => res.json())
  .then(json => {
    const title = json.results[0].title
    const overview = json.results[0].overview
    const imageURL = json.results[0].poster_path
    const posterSrc = `https://image.tmdb.org/t/p/w500${imageURL}`
    const backdropURL = json.results[0].backdrop_path
    const backdropSrc = `https://image.tmdb.org/t/p/w500${backdropURL}`
    console.log(json.results[0])
    res.render('shrek.ejs', {title, overview, posterSrc, backdropSrc})
  })
  .catch(err => console.error('error:' + err));
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

app.get('/filmlijst', (req, res) => {
  res.send('test');
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
