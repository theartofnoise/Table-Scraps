var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/tableScraps", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.mtv.com/news/genre/rock/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    console.log(response.data);
    // Now, we grab every h2 within an article tag, and do the following:
    $(".post-header").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("h1")
        .text();
      result.subHead = $(this)
        .children("p") 
        .text();
      result.link = $(this)
        .find(".post")
        .attr("href"); 

      // Create a new Article using the `result` object built from scraping
      db.News.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          // console.log(dbArticle);
          res.send(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.News.find({})
  .then(function(dbArticle) {
    // If all Users are successfully found, send them back to the client
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occurs, send the error back to the client
    res.json(err);
  });
});

// delete a comment
app.delete("/delete/:id", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Comments.findByIdAndRemove(req.params.id, (err, todo) => {
    // As always, handle any potential errors:
    if (err) return res.status(500).send(err);
    // We'll create a simple object to send back with a message and the id of the document that was removed
    // You can really do this however you want, though.
    const response = {
      message: "Comment successfully deleted",
      id: todo._id
    };
    return res.status(200).send(response);
  })
//   .then(function(){
//     console.log("next delete");
//   db.News.deleteOne({note:ObjectId(req.params.id)}, (err, todo) => {
//     // As always, handle any potential errors:
//     if (err) return res.status(500).send(err);
//     // We'll create a simple object to send back with a message and the id of the document that was removed
//     // You can really do this however you want, though.
//     const response = {
//         message: "News note successfully deleted",
//         id: todo._id
//     };
//     return res.status(200).send(response);
// })
// });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.News.findOne({ _id: req.params.id})
  .populate('note')
  .then(function(dbArticle) {
    // If all Users are successfully found, send them back to the client
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occurs, send the error back to the client
    res.json(err);
  });
});


app.get("/comments/:id", function(req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    db.News.findOne({ _id: req.params.id})
    .then(function(dbArticle) {
      console.log("db"+dbArticle);
      // res.json(dbArticle);
      // If all Users are successfully found, send them back to the client
      db.Comments.find({_id: dbArticle})
        .then(function(data){
          res.json(data);
        });
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
  });



// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Comments.create(req.body)
    .then(function(dbNote) {
      // console.log("myNote"+dbNote);
      // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the querydb.User.findOneAndUpdate({}, { $push: { notes: dbNote._id } }, { new: true })
      db.News.findOneAndUpdate({_id: req.params.id}, { $push: { note: dbNote._id }}, { new: true })
        .then(function(data){
          res.json(data);
        });
    })
    // .then(function(dbArticle) {
    //   // If the User was updated successfully, send it back to the client
    //   res.json(dbArticle);
    // })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
