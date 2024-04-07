require('dotenv').config()

// Initialise Express webserver
const express = require('express')
const request = require('request');
const session = require('express-session')
const xss = require('xss')
const bcrypt = require('bcrypt')
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'static/uploads')
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop()
    const date = new Date
    const dateISO = date.toISOString()
    cb(null, `${req.session.users}${dateISO}.${extension}`)
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


  const userIdSession = req.session.users
  const db = client.db(process.env.MONGODB_NAME);
  const collection = db.collection(process.env.MONGODB_COLLECTION);

  const findGenreFunction = async () => {
    try {
      const userMongo = await collection.findOne(
        { "_id": new ObjectId(userIdSession) }
      );
      const genreArray = userMongo.genre
      const userRating = userMongo.rating
      return { genreArray, userRating };
      // Continue with your code logic here
    } catch (error) {
      // Handle the error
      console.error("Failed to retrieve favorites:", error);
    }
  }

  findGenreFunction().then(({ genreArray, userRating }) => {

    const options = {
      method: 'GET',
      url: `https://api.themoviedb.org/3/discover/movie?api_key=process.env.API_KEY&language=en-US&sort_by=popularity.desc&vote_average.gte=${userRating}&with_genres=${genreArray}`,
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

        const voteCount = movie.vote_count
        voteCountArray.push(voteCount)
      });
      res.render('overview.ejs', { adultArray, backdropPathArray, genreIdsArray, idArray, originalLanguageArray, originalTitleArray, overviewArray, popularityArray, posterPathArray, releaseDateArray, titleArray, videoArray, voteAverageArray, voteCountArray });
    });
  });
});

app.get('/overview/all', (req, res) => {
  const request = require('request');
  const { json } = require('express');
  const apiKey = process.env.API_KEY;

  const userIdSession = req.session.users
  const db = client.db(process.env.MONGODB_NAME);
  const collection = db.collection(process.env.MONGODB_COLLECTION);

  const findGenreFunction = async () => {
    try {
      const userMongo = await collection.findOne(
        { "_id": new ObjectId(userIdSession) }
      );
      const genreArray = userMongo.genre
      const userRating = userMongo.rating
      return { genreArray, userRating };
      // Continue with your code logic here
    } catch (error) {
      // Handle the error
      console.error("Failed to retrieve favorites:", error);
    }
  }

  findGenreFunction().then(({ genreArray, userRating }) => {



  // Arrays om gegevens van films op te slaan
  const adultArray = [];
  const backdropPathArray = [];
  const genreIdsArray = [];
  const idArray = [];
  const originalLanguageArray = [];
  const originalTitleArray = [];
  const overviewArray = [];
  const popularityArray = [];
  const posterPathArray = [];
  const releaseDateArray = [];
  const titleArray = [];
  const videoArray = [];
  const voteAverageArray = [];
  const voteCountArray = [];

  let page = 1;

  // Functie om films op te halen en gegevens in arrays op te slaan
  function fetchMovies() {
    const options = {
      method: 'GET',
      url: `https://api.themoviedb.org/3/discover/movie?api_key=process.env.API_KEY&language=en-US&sort_by=popularity.desc&vote_average.gte=${userRating}&with_genres=${genreArray}`,
      qs: {
        language: 'en-US',
        page: page,
      },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      const movies = JSON.parse(body).results;

      // Loop door de films en sla gegevens op in de arrays
      movies.forEach(movie => {
        adultArray.push(movie.adult);
        backdropPathArray.push(movie.backdrop_path);
        genreIdsArray.push(movie.genre_ids);
        idArray.push(movie.id);
        originalLanguageArray.push(movie.original_language);
        originalTitleArray.push(movie.original_title);
        overviewArray.push(movie.overview);
        popularityArray.push(movie.popularity);
        posterPathArray.push(movie.poster_path);
        releaseDateArray.push(movie.release_date);
        titleArray.push(movie.title);
        videoArray.push(movie.video);
        voteAverageArray.push(movie.vote_average);
        voteCountArray.push(movie.vote_count);
      });

      // Verhoog de paginanummer voor de volgende aanvraag
      page++;

      // Als er nog meer pagina's zijn, blijf films ophalen
      if (page <= 10) {
        fetchMovies();
      } else {
        // Als alle pagina's zijn opgehaald, render de pagina met alle gegevens
        renderOverviewPage();
      }
    });
  }
  
  // Functie om de overzichtspagina te renderen
  function renderOverviewPage() {
    // Render de pagina met de verzamelde gegevens
    res.render('overviewAll.ejs', {
      adultArray,
      backdropPathArray,
      genreIdsArray,
      idArray,
      originalLanguageArray,
      originalTitleArray,
      overviewArray,
      popularityArray,
      posterPathArray,
      releaseDateArray,
      titleArray,
      videoArray,
      voteAverageArray,
      voteCountArray
    });
  }

  // Start het ophalen van films
  fetchMovies();
});})


app.get('/favourites', (req, res) => {

  /// VIND DE ARRAY MET FAVORITE ID's

  const userIdSession = req.session.users
  const db = client.db(process.env.MONGODB_NAME);
  const collection = db.collection(process.env.MONGODB_COLLECTION);

  const findFavoriteGenresFunction = async () => {
    try {
      const userMongo = await collection.findOne(
        { "_id": new ObjectId(userIdSession) }
      );
      const favoritesArray = userMongo.favorites
      return { favoritesArray };
      // Continue with your code logic here
    } catch (error) {
      // Handle the error
      console.error("Failed to retrieve favorites:", error);
    }
  }

  // ARRAY MET FAVORITES = favoritesArray


  // const genreIdsArray = []


  findFavoriteGenresFunction().then(({ favoritesArray }) => {
    const idArray = [];
    const posterPathArray = [];
    const titleArray = [];
  
    let completedRequests = 0;
    const totalRequests = favoritesArray.length;
  
    favoritesArray.forEach(favoriteId => {
      const apiKey = process.env.API_KEY;
      const options = {
        method: 'GET',
        url: `https://api.themoviedb.org/3/movie/${favoriteId}?language=en-US`,
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
        if (error) {
          console.error('Error fetching movie data:', error);
          // Handle error appropriately
          return;
        }
        const favMovie = JSON.parse(body);
  
        const id = favMovie.id;
        idArray.push(id);
  
        const posterPath = favMovie.poster_path;
        posterPathArray.push(posterPath);
  
        const title = favMovie.title;
        titleArray.push(title);
  
        completedRequests++;
  
        // Controleer of alle verzoeken zijn voltooid
        if (completedRequests === totalRequests) {

          res.render('favourites.ejs', { idArray, posterPathArray, titleArray });
        }
      })
    })
  })
})
  

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

app.get('/profile', (req, res) => {
  const userIdSession = req.session.users
  const db = client.db(process.env.MONGODB_NAME);
  const collection = db.collection(process.env.MONGODB_COLLECTION);

  const getAccountDetails = async () => {
    try {
      const userMongo = await collection.findOne(
        { "_id": new ObjectId(userIdSession) }

      );
      const pictureFilename = userMongo.fileName
      const username = userMongo.username
      const genres = userMongo.genre
      const genresCleanArray = []
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
      }
      genres.forEach(genreNumber => {
        genresCleanArray.push(genreMap[genreNumber]);
      });

      const rating = userMongo.rating
      
      return { pictureFilename, username, genresCleanArray, rating };
      
      // Continue with your code logic here
    } catch (error) {
      // Handle the error
      console.error("Failed to retrieve favorites:", error);
    }
  }


  getAccountDetails().then(({ pictureFilename, username, genresCleanArray, rating }) => {
    res.render('profile.ejs', { pictureFilename, username, genresCleanArray, rating });
  }
  )

  console.log(req.session.users);
});

app.get('/profile/settings', (req, res) => {
  const userIdSession = req.session.users
  const db = client.db(process.env.MONGODB_NAME);
  const collection = db.collection(process.env.MONGODB_COLLECTION);

  const getAccountDetails = async () => {
    try {
      const userMongo = await collection.findOne(
        { "_id": new ObjectId(userIdSession) }
        
      );
      const pictureFilename = userMongo.fileName
      const username = userMongo.username
      const genres = userMongo.genre
      const rating = userMongo.rating

      return { pictureFilename, username, genres, rating };

      // Continue with your code logic here
    } catch (error) {
      // Handle the error
      console.error("Failed to retrieve favorites:", error);
    }
  }

  getAccountDetails().then(({ pictureFilename, username, genres, rating }) => {
    res.render('profile-settings.ejs', { pictureFilename, username, genres, rating });
  }
  )

  console.log(req.session.users);
});

app.post('/profile-picture', upload.single('avatar'), async function (req, res, next) {
  const db = client.db(process.env.MONGODB_NAME);
  const collection = db.collection(process.env.MONGODB_COLLECTION);
  const rating = req.body.rating;
  const username = xss(req.body.username);
  const genre = req.body.genre; // Let op: verandering van genres naar genre

  try {
    // Retrieve existing profile data
    const existingProfile = await collection.findOne({ "_id": new ObjectId(req.session.users) });


    // Update profile data
    const updateData = {
      "rating": rating,
      // Retain the existing username if not updated
      "username": username ? username : existingProfile.username,
      // Retain the existing genre if not updated
      "genre": genre ? (Array.isArray(genre) ? genre : [genre]) : existingProfile.genre
    };

    // Check if a new avatar has been uploaded
    let picture = req.file ? req.file.filename : null;
    if (picture) {
      updateData.fileName = picture;
    } else {
      // If no new picture is uploaded, retain the existing picture
      updateData.fileName = existingProfile.fileName;
    }

    // Only perform username check if the username has been updated
    if (username && username !== existingProfile.username) {
      const checkAvailable = await collection.findOne({ username: xss(req.body.username) });
      if (checkAvailable) {
        return res.send('User with this username already exists.');
      }
    }

    // Update the profile in the database
    await collection.findOneAndUpdate(
      { "_id": new ObjectId(req.session.users) },
      { $set: updateData }
    );
    res.send("Profile updated");
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


app.get('/movie/:name', async (req, res) => {

  movieName = req.params.name
  const url = `https://api.themoviedb.org/3/search/movie?query=${movieName}&language=en-US`;
  const apiKey = process.env.API_KEY;
  const options = {method: 'GET', headers: {accept: 'application/json', Authorization: `Bearer ${apiKey}`}};


  fetch(url, options)
    .then(res => res.json())
    .then(movies => {
      const requestedMovie = movies.results[0]
      const movieGenres = requestedMovie.genre_ids
      const movieGenresClean = []
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
      }
      movieGenres.forEach(genreNumber => {
        movieGenresClean.push(genreMap[genreNumber]);
      });
  

      const movieId = requestedMovie.id
      const movieOverview = requestedMovie.overview
      const moviePosterPath = requestedMovie.poster_path
      const movieReleaseDate = requestedMovie.release_date
      const movieTitle = requestedMovie.title

      const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      };
      
      fetch(url, options)
        .then(res => res.json())
        .then(movieDetails => {
          const movieRuntime = movieDetails.runtime
          const originCountry = movieDetails.production_countries[0].name

            // MAAK HIER DAT DE ORIGIN COUNTRY WORDT OMGEZET IN CUISINE


            const cuisines = {
              "Algeria": "African",
              "Angola": "African",
              "Benin": "African",
              "Botswana": "African",
              "Burkina Faso": "African",
              "Burundi": "African",
              "Central African Republic": "African",
              "Comoros": "African",
              "Congo": "African",
              "Djibouti": "African",
              "Equatorial Guinea": "African",
              "Eritrea": "African",
              "Ethiopia": "African",
              "Gabon": "African",
              "Gambia": "African",
              "Ghana": "African",
              "Guinea": "African",
              "Guinea-Bissau": "African",
              "Ivory Coast": "African",
              "Cape Verde": "African",
              "Cameroon": "African",
              "Kenya": "African",
              "Lesotho": "African",
              "Liberia": "African",
              "Madagascar": "African",
              "Malawi": "African",
              "Mali": "African",
              "Mauritania": "African",
              "Mauritius": "African",
              "Mozambique": "African",
              "Namibia": "African",
              "Niger": "African",
              "Nigeria": "African",
              "Uganda": "African",
              "Rwanda": "African",
              "Sao Tome and Principe": "African",
              "Senegal": "African",
              "Seychelles": "African",
              "Sierra Leone": "African",
              "Somalia": "African",
              "Sudan": "African",
              "South Africa": "African",
              "South Sudan": "African",
              "Swaziland": "African",
              "Tanzania": "African",
              "Togo": "African",
              "Chad": "African",
              "Zambia": "African",
              "Zimbabwe": "African",
              "Indonesia": "Asian",
              "Pakistan": "Asian",
              "Bangladesh": "Asian",
              "Philippines": "Asian",
              "Afghanistan": "Asian",
              "Saudi Arabia": "Asian",
              "Uzbekistan": "Asian",
              "Malaysia": "Asian",
              "Yemen": "Asian",
              "Nepal": "Asian",
              "Sri Lanka": "Asian",
              "Kazakhstan": "Asian",
              "Syria": "Asian",
              "Cambodia": "Asian",
              "Jordan": "Asian",
              "Azerbaijan": "Asian",
              "United Arab Emirates": "Asian",
              "Tajikistan": "Asian",
              "Laos": "Asian",
              "Kyrgyzstan": "Asian",
              "Turkmenistan": "Asian",
              "Singapore": "Asian",
              "Oman": "Asian",
              "State of Palestine": "Asian",
              "Kuwait": "Asian",
              "Georgia": "Asian",
              "Mongolia": "Asian",
              "Armenia": "Asian",
              "Qatar": "Asian",
              "Bahrain": "Asian",
              "Timor-Leste": "Asian",
              "United States of America": "American",
              "United Kingdom": "British",
              "Antigua and Barbuda": "Caribbean",
              "The Bahamas": "Caribbean",
              "Barbados": "caribbean",
              "Cuba": "caribbean",
              "Curaçao": "caribbean",
              "Dominica": "caribbean",
              "Dominican Republic": "caribbean",
              "Grenada": "Caribbean",
              "Haiti": "caribbean",
              "Jamaica": "Caribbean",
              "Saint Kitts and Nevis": "Caribbean",
              "Saint Lucia": "Caribbean",
              "Saint Vincent and the Grenadines": "Caribbean",
              "Trinidad and Tobago": "Caribbean",
              "China": "CHinese",
              "Belarus": "Eastern European",
              "Bulgaria": "Eastern European",
              "Czech Republic": "Eastern European",
              "Estonia": "Eastern European",
              "Hungary": "Eastern European",
              "Latvia": "Eastern European",
              "Lithuania": "Eastern European",
              "Moldova": "Eastern European",
              "Poland": "Eastern European",
              "Romania": "Eastern European",
              "Russia": "Eastern European",
              "Slovakia": "Eastern European",
              "Ukraine": "Eastern European",
              "Andorra": "European",
              "Austria": "European",
              "Belgium": "European",
              "Denmark": "European",
              "Finland": "European",
              "Iceland": "European",
              "Luxembourg": "European",
              "Malta": "European",
              "Monaco": "European",
              "Netherlands": "European",
              "Norway": "European",
              "Portugal": "European",
              "San Marino": "European",
              "Sweden": "European",
              "Switzerland": "European",
              "Vatican City": "European",
              "France": "French",
              "Germany": "German",
              "Greece": "Greek",
              "India": "Indian",
              "Ireland": "Irish",
              "Italy": "Italian",
              "Japan": "Japanese",
              "Israel": "Jewish",
              "South Korea": "Korean",
              "North Korea": "Korean",
              "Argentina": "Latin American",
              "Belize": "Latin American",
              "Bolivia": "Latin American",
              "Brazil": "Latin American",
              "Chile": "Latin American",
              "Colombia": "Latin American",
              "Costa Rica": "Latin American",
              "Ecuador": "Latin American",
              "El Salvador": "Latin American",
              "Guatemala": "Latin American",
              "Guyana": "Latin American",
              "Honduras": "Latin American",
              "Mexico": "Latin American",
              "Nicaragua": "Latin American",
              "Panama": "Latin American",
              "Paraguay": "Latin American",
              "Peru": "Latin American",
              "Suriname": "Latin American",
              "Uruguay": "Latin American",
              "Venezuela": "Latin American"
            }
            if (cuisines.hasOwnProperty(originCountry)) {
              const cuisine = cuisines[originCountry];
              const apiKeyFood = process.env.FOOD_API_KEY
              const randomOffset = Math.floor(Math.random() * 100)
              // Moeten we de cuisine koppelen aan de request voor spoonacular
              const apiUrlFood = `https://api.spoonacular.com/recipes/complexSearch?cuisine=${cuisine}&number=1&offset=${randomOffset}&apiKey=${apiKeyFood}`

              fetch(apiUrlFood)
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status}`);
                  }
                  return response.json();
                })
                .then(data => {
                  const recipeId = data.results[0].id
                  const recipeTitle = data.results[0].title

                  const apiKeyFood2 = process.env.FOOD_API_KEY
                  const instructionUrl  = `https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions?apiKey=${apiKeyFood}`
                  
                  fetch(instructionUrl)
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(`Network response was not ok: ${response.status}`);
                    }
                    return response.json();
                  })
                  .then(data => {
                    const stepNumberArray = []
                    const stepOverviewArray = [] 
                    const resultsOfRecipeArray = data[0].steps
                    resultsOfRecipeArray.forEach(step => {
                      stepNumberArray.push(step.number)
                      stepOverviewArray.push(step.step)
                    })
                

                    const ingredientURL = `https://api.spoonacular.com/recipes/${recipeId}/ingredientWidget.json?apiKey=${apiKeyFood2}`
                    fetch(ingredientURL)
                    .then(response => {
                      if (!response.ok) {
                        throw new Error(`Network response was not ok: ${response.status}`);
                      }
                      return response.json();
                    })
                    .then(data => { 
                      const ingredientsArray = data.ingredients
                      const ingredientNameArray = []
                      const ingredientValueArray = []
                      const ingredientUnitArray = []
                      ingredientsArray.forEach(ingredient => {
                        ingredientNameArray.push(ingredient.name)
                        ingredientValueArray.push(ingredient.amount.metric.value)
                        ingredientUnitArray.push(ingredient.amount.metric.unit)
                      })

                     const favFunction = async () => {   
                        const userIdSession = req.session.users
                        const db = client.db(process.env.MONGODB_NAME);
                        const collection = db.collection(process.env.MONGODB_COLLECTION);
                        try {
                          const userMongo = await collection.findOne(
                            { "_id": new ObjectId(userIdSession) }
                          );
                          const favoritesArray = userMongo.favorites;
                          const cleanArray = favoritesArray.map(str => parseInt(str, 10));
                          let inList
                          if (cleanArray.includes(movieId)) {
                            inList = true
                            res.render('filmdescription.ejs', { movieGenres, movieId, movieOverview, moviePosterPath, movieReleaseDate, movieTitle, inList, recipeTitle, stepNumberArray, stepOverviewArray, ingredientNameArray, ingredientValueArray, ingredientUnitArray, movieGenresClean, movieRuntime});
                          }
                          else{
                            inList = false
                            res.render('filmdescription.ejs', { movieGenres, movieId, movieOverview, moviePosterPath, movieReleaseDate, movieTitle, inList, recipeTitle, stepNumberArray, stepOverviewArray, ingredientNameArray, ingredientValueArray, ingredientUnitArray, movieGenresClean, movieRuntime});
                          }
                        } catch (error) {
                          // Handle the error
                          console.error("Failed to retrieve favorites:", error);
                        }
                      }
                      
                      favFunction()
                    }
                    )

                  })
                }
              )}
            else {
              console.log(`Er is geen keukeninformatie beschikbaar voor ${originCountry}.`);
            }

        })
        .catch(err => console.error('error:' + err));

        
    }  
      )
    .catch(err => console.error('error:' + err));
    
})

app.post('/favorite-deleted', (req, res) => {
  const userIdSession = req.session.users
  const movieIdDetail = req.body.favoriteBtn

  const db = client.db(process.env.MONGODB_NAME);
  const collection = db.collection(process.env.MONGODB_COLLECTION);

  const favDeleteFunction = async () => {
    try {
      const userMongo = await collection.findOne(
        { "_id": new ObjectId(userIdSession) }
      );
      const favoritesArray = userMongo.favorites;
      const newArray = favoritesArray.filter(str => String(str) !== String(movieIdDetail));
      await collection.updateOne(
        { "_id": new ObjectId(userIdSession) },
        { $set: { "favorites": newArray } }
      );

    } catch (error) {
      // Handle the error
      console.error("Failed to retrieve favorites:", error);
    }
  }

  favDeleteFunction()

  res.render('delete-confirmation.ejs', { initialDetailPageURL: req.headers.referer })
}
)

app.post('/favorite-added', (req, res) => {
  const userIdSession = req.session.users
  const movieIdDetail = req.body.favoriteBtn

  const db = client.db(process.env.MONGODB_NAME);
  const collection = db.collection(process.env.MONGODB_COLLECTION);

  const favAddFunction = async () => {
    try {
      const userMongo = await collection.findOneAndUpdate(
        { "_id": new ObjectId(userIdSession) },
        { $push: { "favorites": movieIdDetail } },
        { returnOriginal: false } // Ensure to return the updated document
      );
      // Continue with your code logic here
    } catch (error) {
      // Handle the error
      console.error("Failed to retrieve favorites:", error);
    }
  }

  favAddFunction()

  res.render('add-confirmation.ejs', { initialDetailPageURL: req.headers.referer })
})


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

        // adult, genres, release date, average vote count 
        genre: req.body.genre,
        rating: req.body.rating,

        creationDate: new Date(),
        fileName: "",
        favorites: []
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
        res.render('overview.ejs');
        console.log(req.session.users);
      } else {
        res.send('Invalid password.');
      }
    } else {
      res.send('User does not exist.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error')
  }
})

app.get('/filmlijst', (req, res) => {
  res.send('test');
})


// WORKING ON SEARCH BAR

app.get('/search', (req, res) => {
  const query = req.query.q;
  const apiKey = process.env.API_KEY;

  const url = `https://api.themoviedb.org/3/search/movie?query=${query}`
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${apiKey}`
    }
  };

  fetch(url, options)
    .then(response => response.json())
    .then(json => {

      console.log(json.results)

      const movies = json.results;
      const adultArray = []
      const backdropPathArray = []
      const movieGenreIds = []
      const idArray = []
      const originalTitleArray = []
      const posterPathArray = []

      movies.forEach(movie => {
        const movieAdult = movie.adult
        adultArray.push(movieAdult)

        const movieBackdropPath = movie.backdrop_path
        backdropPathArray.push(movieBackdropPath)

        const movieGenreId = movie.genre_ids
        movieGenreIds.push(movieGenreId)

        const movieId = movie.id
        idArray.push(movieId)

        const originalTitle = movie.original_title
        originalTitleArray.push(originalTitle)

        const moviePosterPath = movie.poster_path
        posterPathArray.push(moviePosterPath)


      });
      res.render('searchresults.ejs', { adultArray, backdropPathArray, movieGenreIds, idArray, originalTitleArray, posterPathArray })

    })
    .catch(err => {
      console.error('error:', err);
      res.status(500).send('Er is een fout opgetreden bij het verwerken van uw verzoek.');
    });
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