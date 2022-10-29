const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");
const db_path = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  db = await open({ filename: db_path, driver: sqlite3.Database });
  app.listen(3000, () => {
    try {
      console.log("server running at http://localhost:3000");
    } catch (error) {
      console.log(`DB ERROR ${error.message}`);
      process.exit(1);
    }
  });
};
initializeDbAndServer();

const convertDbResponseObjectToCamelCaseMovieObject = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

const convertDbResponseObjectToCamelCaseDirectorObject = (object) => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
};
//API 1 GET
app.get("/movies/", async (request, response) => {
  try {
    const Query = `
        SELECT 
            *
        FROM 
            movie
        ORDER BY 
            movie_id;`;
    const dbResponse = await db.all(Query);
    let results = [];
    for (let i = 0; i < dbResponse.length; i++) {
      let resObject = convertDbResponseObjectToCamelCaseMovieObject(
        dbResponse[i]
      );
      results.push({ movieName: resObject.movieName });
    }
    response.send(results);
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 2 POST
app.post("/movies/", async (request, response) => {
  try {
    const movieDetails = request.body;
    const { directorId, movieName, leadActor } = movieDetails;
    const Query = `
        INSERT INTO
            movie (director_id,movie_name,lead_actor)
            VALUES 
            (   
                ${directorId},
               "${movieName}",
               "${leadActor}"
                );`;
    const dbResponse = await db.run(Query);
    response.send("Movie Successfully Added");
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 3 GET
app.get("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const Query = `
        SELECT
            *
        FROM
            movie
        WHERE
            movie_id=${movieId};`;
    const dbResponse = await db.all(Query);
    let results = [];
    for (let i = 0; i < dbResponse.length; i++) {
      let resObject = convertDbResponseObjectToCamelCaseMovieObject(
        dbResponse[i]
      );
      results.push(resObject);
    }
    response.send(results[0]);
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 4 PUT
app.put("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const movieDetails = request.body;
    const { directorId, movieName, leadActor } = movieDetails;
    const Query = `
        UPDATE
            movie
        SET
           director_id=${directorId},
           movie_name="${movieName}",
           lead_actor="${leadActor}"
        WHERE
            movie_id=${movieId};`;
    await db.run(Query);
    response.send("Movie Details Updated");
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 5 DELETE
app.delete("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const Query = `
        DELETE FROM
            movie
        WHERE
            movie_id=${movieId};`;
    await db.run(Query);
    response.send("Movie Removed");
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 6 GET
app.get("/directors/", async (request, response) => {
  try {
    const Query = `
        SELECT 
            *
        FROM 
            director
        ORDER BY 
            director_id;`;
    const dbResponse = await db.all(Query);
    let results = [];
    for (let i = 0; i < dbResponse.length; i++) {
      let resObject = convertDbResponseObjectToCamelCaseDirectorObject(
        dbResponse[i]
      );
      results.push(resObject);
    }
    response.send(results);
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 7 GET
app.get("/directors/:directorId/movies", async (request, response) => {
  try {
    const { directorId } = request.params;
    const Query = `
        SELECT
            *
        FROM
            movie
        WHERE
            director_id=${directorId};`;
    const dbResponse = await db.all(Query);
    let results = [];
    for (let i = 0; i < dbResponse.length; i++) {
      let resObject = convertDbResponseObjectToCamelCaseMovieObject(
        dbResponse[i]
      );
      results.push({ movieName: resObject.movieName });
    }
    response.send(results);
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

module.exports = app;
