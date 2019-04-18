
const getComments = (that) => {
   // Empty the notes from the note section
   $(".notes").empty();
   // Save the id from the p tag
   var thisId = that;
 
   // Now make an ajax call for the Article
   $.ajax({
     method: "GET",
     url: "/articles/" + thisId
   })
     // With that done, add the note information to the page
     .then(function(data) {
       // The title of the article
       $(`.notes[data-id="${data._id}"]`).append(`<h5>${data.title}</h5>`);
       // An input to enter a new title
       $(`.notes[data-id="${data._id}"]`).append("<input class='titleinput' placeholder='User Name' name='title' >");
       // A textarea to add a new note body
       $(`.notes[data-id="${data._id}"]`).append("<textarea class='bodyinput' placeholder='comments' name='body'></textarea>");
       // A button to submit a new note, with the id of the article saved to it
       $(`.notes[data-id="${data._id}"]`).append("<button data-id='" + data._id + "' class='savenote waves-effect waves-light btn-small grey lighten-2 '>Save Note</button>");

       $(`.comments`).empty();
      //  loads comments
      for (var i = 0; i < data.note.length; i++) {
        $(`.comments[data-id="${data._id}"]`).append(`
        <div id="comment${data.note[i]._id}" class="comments card-content white-text">
        <button data-id="${data.note[i]._id}" id="delete${data.note[i]._id}" class="waves-effect waves-light btn-small red accent-3 delete">X</button>
           <strong>${data.note[i].title}</strong>
           ${data.note[i].body}
           <hr>
        </div>
        `);
      }
 
       // If there's a note in the article
       if (data.body) {
         // Place the title of the note in the title input
         $(".titleinput").val(data.note.title);
         // Place the body of the note in the body textarea
         $(".bodyinput").val(data.note.body);
       }
     });
}


// Grab the articles as a json
  $.getJSON("/articles", function(data) {
      // For each one
      $("#howManyFound").append(`<h3>You found ${data.length} articles!<h3><h5> Click the title to comment.</h5>`)
      for (var i = 0; i < data.length; i++) {
           $(".displayCard").append(`<div class="row">
              
                 <div class="card blue-grey darken-1">
                   <div class="card-content white-text">
                     <span data-id="${data[i]._id}" class="displayTitle card-title">${data[i].title}</span>
                     <p class="displayBody">${data[i].subHead}</p>
                   </div>
                   <div class="card-action">
                     <a href="${data[i].link}" target="_blank" class="displayLink">Read More...</a>
                     <button data-id="${data[i]._id}" id="seeComments" class="waves-effect waves-light btn-small grey lighten-2">See Comments</button>
                  </div>
                  <div data-id="${data[i]._id}" class="notes"></div>
                  <div data-id="${data[i]._id}" class="comments"></div>
                  
                  
                  </div>  
  
  </div>`);
      }
    });


// Whenever someone clicks a p tag
$(document).on("click", "span", function() {
  let id = $(this).attr("data-id")
 getComments(id);
});

// see comments
$(document).on("click","#seeComments", function() {
  
  let id = $(this).attr("data-id");
 getComments(id);
});


// delete button
$(document).on("click", ".delete", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  $.ajax({
    type: "DELETE",
    url: "/delete/" + thisId,
    success: function (data) {

        $("#comment" + thisId).remove();
    },
    error: function (data) {
        console.log('Error:', data);
    }
});

});


// When you click the savenote button
$(document).on("click", ".savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  // console.log(thisId);

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $(".titleinput").val(),
      // Value taken from note textarea
      body: $(".bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      // Empty the notes section
      $(".notes").empty();

        $.ajax({
          method: "GET",
          url: "/comments/" + thisId,
          
        }).then(function(response){
          $(`.comments`).empty();
          // adds comment with a delete button
          for (var i = 0; i < response.length; i++) {
            
            $(`.comments[data-id="${thisId}"]`).append(`
            <div id="comment${response.note[i]}" class="comments card-content white-text">
            <button data-id="${response.note[i]}" id="delete${response.note[i]}" class="waves-effect waves-light btn-small red accent-3 delete">X</button>
              ${response.note[i]}
            </div>
            `);
      }

        })
    });

  // Also, remove the values entered in the input and textarea for note entry
  $(".titleinput").val("");
  $(".bodyinput").val("");
});
