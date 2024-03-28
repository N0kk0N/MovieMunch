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
  res.render('overview.ejs', {adultArray, backdropPathArray, genreIdsArray, idArray, originalLanguageArray, originalTitleArray, overviewArray, popularityArray, posterPathArray, releaseDateArray, titleArray, videoArray, voteAverageArray, voteCountArray});

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


// HAALT FILMPOSTER OP EN GEEFT DAARBIJ COUNTRY OF ORIGIN

app.get('/movie/:name', (req, res) => {
  const movieName = req.params.name;
  const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${movieName}&language=en-US`;
  const apiKey = process.env.API_KEY;
  const searchOptions = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${apiKey}`
    }
  };

  // Haalt details op van de film (country of origin)
  fetch(searchUrl, searchOptions)
    .then(res => res.json())
    .then(json => {
      if (json.results.length > 0) {
        const movieId = json.results[0].id;
        const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
        const movieDetailsOptions = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${apiKey}`
          }
        };

        // Haalt filmposter op
        fetch(movieDetailsUrl, movieDetailsOptions)
          .then(res => res.json())
          .then(json => {
            const title = json.title;
            const overview = json.overview;
            const imageURL = json.poster_path;
            const posterSrc = `https://image.tmdb.org/t/p/w500${imageURL}`;
            const backdropURL = json.backdrop_path;
            const backdropSrc = `https://image.tmdb.org/t/p/w500${backdropURL}`;
            const originalLanguage = json.original_language;

            // Haal land van herkomst op
            const countryOfOrigin = json.production_countries[0].name; // Neem het eerste land in de lijst
            console.log('Film komt uit:', countryOfOrigin);
            console.log('Film informatie:', { title, overview, posterSrc, backdropSrc });

            // Roep de functie aan om een recept op te halen uit hetzelfde land
            fetchRandomRecipe(countryOfOrigin);

            res.render('shrek.ejs', { title, overview, posterSrc, backdropSrc });
          })
          .catch(err => console.error('Error fetching movie details:', err));
      } else {
        res.status(404).send('Movie not found');
      }
    })
});

// HAALT RECEPT OP UIT HETZELFDE LAND ALS DE FILM
const fetchRandomRecipe = (countryOfOrigin, retryCount = 0) => {


//Testfunctie
let cuisineFunction = (country) => {
  const cuisines = {
    "Algeria": "african",
    "Angola": "african",
    "Benin": "african",
    "Botswana": "african",
    "Burkina Faso": "african",
    "Burundi": "african",
    "Central African Republic": "african",
    "Comoros": "african",
    "Congo": "african",
    "Djibouti": "african",
    "Equatorial Guinea": "african",
    "Eritrea": "african",
    "Ethiopia": "african",
    "Gabon": "african",
    "Gambia": "african",
    "Ghana": "african",
    "Guinea": "african",
    "Guinea-Bissau": "african",
    "Ivory Coast": "african",
    "Cape Verde": "african",
    "Cameroon": "african",
    "Kenya": "african",
    "Lesotho": "african",
    "Liberia": "african",
    "Madagascar": "african",
    "Malawi": "african",
    "Mali": "african",
    "Mauritania": "african",
    "Mauritius": "african",
    "Mozambique": "african",
    "Namibia": "african",
    "Niger": "african",
    "Nigeria": "african",
    "Uganda": "african",
    "Rwanda": "african",
    "Sao Tome and Principe": "african",
    "Senegal": "african",
    "Seychelles": "african",
    "Sierra Leone": "african",
    "Somalia": "african",
    "Sudan": "african",
    "South Africa": "african",
    "South Sudan": "african",
    "Swaziland": "african",
    "Tanzania": "african",
    "Togo": "african",
    "Chad": "african",
    "Zambia": "african",
    "Zimbabwe": "african",
    "Indonesia": "asian",
    "Pakistan": "asian",
    "Bangladesh": "asian",
    "Philippines": "asian",
    "Afghanistan": "asian",
    "Saudi Arabia": "asian",
    "Uzbekistan": "asian",
    "Malaysia": "asian",
    "Yemen": "asian",
    "Nepal": "asian",
    "Sri Lanka": "asian",
    "Kazakhstan": "asian",
    "Syria": "asian",
    "Cambodia": "asian",
    "Jordan": "asian",
    "Azerbaijan": "asian",
    "United Arab Emirates": "asian",
    "Tajikistan": "asian",
    "Laos": "asian",
    "Kyrgyzstan": "asian",
    "Turkmenistan": "asian",
    "Singapore": "asian",
    "Oman": "asian",
    "State of Palestine": "asian",
    "Kuwait": "asian",
    "Georgia": "asian",
    "Mongolia": "asian",
    "Armenia": "asian",
    "Qatar": "asian",
    "Bahrain": "asian",
    "Timor-Leste": "asian",
    "United States of America": "american",
    "United Kingdom": "british",
    "Antigua and Barbuda": "caribbean",
    "The Bahamas": "caribbean",
    "Barbados": "caribbean",
    "Cuba": "caribbean",
    "Curaçao": "caribbean",
    "Dominica": "caribbean",
    "Dominican Republic": "caribbean",
    "Grenada": "caribbean",
    "Haiti": "caribbean",
    "Jamaica": "caribbean",
    "Saint Kitts and Nevis": "caribbean",
    "Saint Lucia": "caribbean",
    "Saint Vincent and the Grenadines": "caribbean",
    "Trinidad and Tobago": "caribbean",
    "China": "chinese",
    "Belarus": "easternEuropean",
    "Bulgaria": "easternEuropean",
    "Czech Republic": "easternEuropean",
    "Estonia": "easternEuropean",
    "Hungary": "easternEuropean",
    "Latvia": "easternEuropean",
    "Lithuania": "easternEuropean",
    "Moldova": "easternEuropean",
    "Poland": "easternEuropean",
    "Romania": "easternEuropean",
    "Russia": "easternEuropean",
    "Slovakia": "easternEuropean",
    "Ukraine": "easternEuropean",
    "Andorra": "european",
    "Austria": "european",
    "Belgium": "european",
    "Denmark": "european",
    "Finland": "european",
    "Iceland": "european",
    "Luxembourg": "european",
    "Malta": "european",
    "Monaco": "european",
    "Netherlands": "european",
    "Norway": "european",
    "Portugal": "european",
    "San Marino": "european",
    "Sweden": "european",
    "Switzerland": "european",
    "Vatican City": "european",
    "France": "french",
    "Germany": "german",
    "Greece": "greek",
    "India": "indian",
    "Ireland": "irish",
    "Italy": "italian",
    "Japan": "japanese",
    "Israel": "jewish",
    "South Korea": "korean",
    "North Korea": "korean",
    "Argentina": "latinAmerican",
    "Belize": "latinAmerican",
    "Bolivia": "latinAmerican",
    "Brazil": "latinAmerican",
    "Chile": "latinAmerican",
    "Colombia": "latinAmerican",
    "Costa Rica": "latinAmerican",
    "Ecuador": "latinAmerican",
    "El Salvador": "latinAmerican",
    "Guatemala": "latinAmerican",
    "Guyana": "latinAmerican",
    "Honduras": "latinAmerican",
    "Mexico": "latinAmerican",
    "Nicaragua": "latinAmerican",
    "Panama": "latinAmerican",
    "Paraguay": "latinAmerican",
    "Peru": "latinAmerican",
    "Suriname": "latinAmerican",
    "Uruguay": "latinAmerican",
    "Venezuela": "latinAmerican"
  };

  return cuisines[country] || "Country of origin not found";
}

// Voorbeeldgebruik
const cuisineOfOrigin = cuisineFunction(countryOfOrigin) // Output: european dit is 


console.log(`ik ga zoeken naar een recept uit de cuisine ${cuisineOfOrigin}`)
  const apiKey = process.env.FOOD_API_KEY
  const apiUrlFood = `https://api.spoonacular.com/recipes/complexSearch?cuisine=${cuisineOfOrigin}&number=5&apiKey=${apiKey}`

  fetch(apiUrlFood)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {

      console.log(data)})

             
    .catch(error => {
      console.error('Er is een fout opgetreden bij het ophalen van de receptinformatie:', error);
  });
};


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



