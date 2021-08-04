var searchbox = null;
var searchResults = null;
var searchform = null;
var searchHeader = null;
var errorMessage = null;

var prod_cache = [];

function initSearch() {

  searchbox = $('#search_field');
  searchResults = $('#search_results');
  searchform = $("#search_form");
  searchHeader = null;
  errorMessage = "error";


  var searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("q") && searchParams.get("q") !== null) {
    $("body").addClass("searching");
    searchbox.val(searchParams.get("q"));
    search();
  }


  searchform.submit(function(e) {
    if (searchbox.val() == "") {
      unsearch();
      e.preventDefault();
    }
    else {
      search();
      URLSearchParams.set("q", searchbox.val());
      history.replaceState(null, document.title, document. document.URL + "?q=" + encodeURIComponent(searchbox.val()));
      e.preventDefault();
    }
  });
}

//const itemTemplate = ({ id, url, title, type, subtypes, rarity, attunement, requirement, content}) => `
const productTemplate = function(result) {
  var prod = prod_cache[result.ref];
  return `<div>
  <a href="${prod.url}">${prod.title}</a>
  </div>`;
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function search() {

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
      query = query.trimEnd();
      var results = index.search(`${query}^5 ${query}*^2 *${query}^2 ${query}~1 -categories:draft`);
    }
    searchResults.empty();

    var search_ajax;
    if (results.length) {
      search_ajax = $.get("/data/search-index.min.json", null, null, "text")
        .done(function(prod_data) {
          prod_cache = JSON.parse(prod_data).posts;
          stopSearch(results.map(productTemplate).join(''));
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          console.log("error during ajax call to retrieve search index for item cache. This is the data:");
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);

          stopSearch(errorMessage + " 1", "fast");
        })
        .always(function() {
          stopSearch();
        });

    } else {
      stopSearch("no result", "fast");
    }
  } catch (err) {
    console.log(err);

    stopSearch(errorMessage + " 2", "fast");
  }
}

function stopSearch(message, speed){

  if (message)
    searchResults.html(message);

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
  searchbox.val("");
  searchResults.empty();
  searchResults.hide();
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
            boost: 3
          });
          this.field("smushed_contributors", {
            boost: 2
          });
          this.field("tags", {
            boost: 3
          });
          this.field("searchtext");

          JSON.parse(prod_data).posts.forEach(function(doc) {
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

        stopSearch(errorMessage + " 3", "fast");
      })
      .always(function() {
        console.log("always log after trying to get index");
      });

      jQuery.ajaxSetup({async:true});

      return JSON.parse(JSON.stringify(rawIndex)); //I am not 100% sure what part of this line made it work and I dont care to figure it out
  }
}
