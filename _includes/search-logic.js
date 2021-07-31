var searchbox = null;
var searchResults = null;
var searchform = null;
var searchHeader = null;
var errorMessage = null;

var prod_cache = [];

function initSearch() {

  var searchbox = $('#search_field');
  var searchResults = $('#search_results');
  var searchform = $("#search_form");
  var searchHeader = null;
  var errorMessage = "error";


  var searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("q") && searchParams.get("q") !== null) {
    $("body").addClass("searching");
    search();
  }


  searchform.submit(function(e) {
    if (searchbox.val() == "") {
      unsearch();
      e.preventDefault();
    }
    else {
      search();
      e.preventDefault();
    }
  });




  // async function getDocument(endpoint, key) {
  //   let data = sessionStorage.getItem(key); // First check if there's data in SessionStorage
  //   if (data) {
  //     return JSON.parse(data); // If there's something in the sessionStorage with our key, return it
  //   }
  //   data = await fetch(endpoint).then(r => r.json()); //If there's nothing in the storage, make the AJAX request
  //   sessionStorage.setItem(key, JSON.stringify(data)); //Then save it into the storage to avoid more requests later on
  //
  //   return data;
  // }


}

//const itemTemplate = ({ id, url, title, type, subtypes, rarity, attunement, requirement, content}) => `
const productTemplate = function(result) {
  var prod = prod_cache[result.ref];
  return `<div>
  <a href="${prod.url}">${prod.title}</a>
  </div>`;
}

function search() {
  $('#main').hide();
  searchResults.show();

  searchbox.val(searchParams.get("q"));
  searchform.css("width", "100%");
  if ($(window).width() <= 768) { //minimize header if it is a tablet or smaller
    searchHeader.css("transform", "translateX(-350px)");
  }

  try {
    var query = searchbox.val();
    var rawIndex = getIndex();
    var index = lunr.Index.load(rawIndex);

    var advanced = false;
    var symbols = [":", "*", "^", "~", "+", "-"];
    symbols.forEach(function(symbol) {
      if (query.includes(symbol)) {
        advanced = true;
      }
    })

    if (advanced) { //if its an advanced query search how the user wants
      var results = index.search(query);
    } else { //else use the default query
      var results = index.search(`${query}^10 ${query}*^3 *${query}^3 ${query}~1`);
    }
    searchResults.empty();

    var search_ajax;
    if (results.length) {
      search_ajax = $.get("/data/search-index.min.json", null, null, "text")
        .done(function(prod_data) {
          prod_cache = JSON.parse(prod_data).items;
          stopSearch(results.map(productTemplate).join(''));
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          console.log("error during ajax call to retrieve search index for item cache. This is the data:");
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);

          stopSearch(errorMessage, "fast");
        })
        .always(function() {
          stopSearch();
        });

    } else {
      stopSearch("no result", "fast");
    }
  } catch (err) {
    console.log(err);

    stopSearch(errorMessage, "fast");
  }
}

function stopSearch(message, speed){

  if (message)
    searchResults.html(errorMessage);

  if (speed) {
    if (speed == "fast"){
      setTimeout(function() {
        document.body.classList.remove('searching')
      }, getRandom(250, 550));
    } else {
      setTimeout(function() {
        document.body.classList.remove('searching')
      }, getRandom(450, 850));
    }
  }
  else {
    document.body.classList.remove('searching')
  }
}

function unsearch() {
  // $('#main').show();
  // searchbox.val("");
  // searchResults.empty();
  // searchResults.hide();
  $(".width-wrapper.border-top").addClass("hidden");
  $("#navbar hr").addClass('hidden');
  fixTippyTopMargin();

  searchform.addClass("no-transition");
  searchform.css("width", "0px");
  searchform[0].offsetHeight; // Trigger a reflow, flushing the CSS changes
  searchform.removeClass("no-transition");

  if ($(window).width() <= 768) { //minimize header if it is a tablet or smaller
    searchHeader.addClass("no-transition");
    searchHeader.css("transform", "translateX(0px)");
    searchHeader[0].offsetHeight; // Trigger a reflow, flushing the CSS changes
    searchHeader.removeClass("no-transition");
  }

  // setupScroll($('section#main'), $('section#main').data('masonry'));
}

function getIndex() {
  const endpoint = "/data/search-index.min.json";
  const key = "search-index";

  var rawIndex = sessionStorage.getItem(key);
  if (rawIndex) { //if the index has already been saved.
    return JSON.parse(rawIndex);
  }
  else {
    jQuery.ajaxSetup({async:false});

    var ajaxRequest = $.get(endpoint, null, null, "text")
      .done(function(prod_data) {
        rawIndex = lunr(function() {
          this.ref('ord');
          this.field('title', {
            boost: 5
          });
          this.field("tagline");
          this.field("categories");
          this.field("contributors", {
            boost: 2
          });
          this.field("tags", {
            boost: 3
          });
          this.field("searchtext");

          JSON.parse(prod_data).items.forEach(function(doc) {
            this.add(doc);
          }, this);
        });
        sessionStorage.setItem(key, JSON.stringify(rawIndex));
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log("error during ajax call to retrieve search index. This is the data:");
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);

        searchResults.html(errorMessage);
        setTimeout(function() {
          document.body.classList.remove('searching')
        }, getRandom(300, 700));
      })
      .always(function() {
        console.log("always log after trying to get index");
      });

      jQuery.ajaxSetup({async:true});

      return JSON.parse(JSON.stringify(rawIndex)); //I am not 100% sure what part of this line made it work and I dont care to figure it out
  }

}
