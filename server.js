var express = require("express");
var exphbs = require("express-handlebars");
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
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes
app.get("/", function (req, res) {
  db.savedArticles.find({})
    .then(function (dbArticle) {
      res.render("index", { results: dbArticle });
    })
    .catch(function (err) {
      res.json(err);
    })
})
// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  db.newArticles.deleteMany({}, function (err) {
    console.log('c')
  });
  // First, we grab the body of the html with axios
  axios.get("http://www.techcrunch.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".river").children("div").children(".post-block__header").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("h2")
        .text().trim();
      result.link = $(this)
        .children("h2").children("a")
        .attr("href");
      result.summary = $(this)
        .siblings(".post-block__content")
        .text().trim();
      if ((result.summary.substr(-1) != ".") && (result.summary.length > 2)) {
        result.summary += "...";
      }

      // Create a new Article using the `result` object built from scraping
      db.newArticles.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        })
       
    })
    res.send("scrape complete");
  })
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.newArticles.find({})
    .then(function (dbArticle) {
      res.render("index", { results: dbArticle });
    })
    .catch(function (err) {
      res.json(err);
    })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.savedArticles.findOne({ _id: req.params.id })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    })
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.savedArticles.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});
app.delete("/articles/:id", function (req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Note.deleteOne(req.body)
    .then(function (dbNote) {
      return db.savedArticles.deleteOne({ _id: req.params.id }, { $pull: { note: dbNote._id } }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});
app.delete("/savedArticles/:id", function (req, res) {
  db.savedArticles.findByIdAndDelete(req.params.id)
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
})
// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
