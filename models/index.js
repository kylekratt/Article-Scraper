// Exporting an object containing all of our models

module.exports = {
  newArticles: require("./Article").newArticles,
  savedArticles: require("./Article").savedArticles,
  Note: require("./Note")
};
