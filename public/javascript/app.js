// Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   console.log(data);
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<h3 data-id='" + data[i]._id + "'>" + data[i].title + "</h3><p>" + data[i].summary + "...</p><p>" + data[i].link + "</p>");
//   }
// });

// Whenever someone clicks a p tag
$(".noteIt").on("click", function() {
  // Save the id from the p tag
  $("#noteBody").empty();
  var thisId = $(this).attr("data-id");
$("#saveNote").attr("data-id", thisId);
  // Now make an ajax call for the Article
  $.get("/articles/"+thisId)
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      if (data.note) {
      data.note.forEach(function(element){
        $("#noteBody").append("<li class='list-group-item'>" + element.body + "<button class='btn btn-danger float-right' onclick='deleteNote(\""+thisId +"\",\""+element._id+"\")'>X</button>");
      })
    }
$("#noteModal").modal();
    });
});
$(".saveIt").on("click", function() {
  console.log("You clicked me!");
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/saveArticle/" + thisId
  })
  .then(function (data) {
    console.log(data);
    window.location.replace("/articles");
  })
})
// When you click the savenote button
$("#saveNote").on("click", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
if($("#newNote").val().length>1){
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      body: $("#newNote").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      $("#noteModal").modal('hide');
      // Empty the notes section
      $("#noteBody").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#newNote").val("");
  }
});

function deleteNote(artId, noteId) {
  $.ajax({
    method: "DELETE",
    url: "/articles/" + artId,
    data: {
      _id: noteId
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      $("#noteModal").modal('hide');
      // Empty the notes section
      $("#noteBody").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#newNote").val("");
  
}

$(".scrape-new").on("click", function(){
  $.get("/scrape").then(function(data){
    console.log(data);
   window.location.replace("/articles");
  })
})
$(".deleteIt").on("click", function(){
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "DELETE",
    url: "/savedArticles/" + thisId
  }).then(function(data){
    console.log(data);
    window.location.reload();
  })
})