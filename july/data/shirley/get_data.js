var http = require('http');
var _ = require('lodash');
var fs = require('fs');

var allTitles = [];
var movieDetails = {};

// get movie details for all titles in a year
function getAllMovieDetails(titles, callback) {
  if (_.isEmpty(titles)) {
    callback();
    return;
  }

  var movieId = titles.pop();
  var url = 'http://www.omdbapi.com/?i=' + movieId + '&plot=short&r=json';
  var options = {
    host: 'www.omdbapi.com',
    path: '/?i=' + movieId + '&plot=short&r=json'
  }
  http.request(options, function(response) {
    var details = '';
    response.on('data', function(chunk) {
      details += chunk;
    });
    response.on('end', function() {
      details = JSON.parse(details);
      movieDetails[movieId] = details;
      getAllMovieDetails(titles, callback);
    });
  }).end();
}

// get top summer movie titles for the year
function getSummerMoviesByYear(year) {
  console.log(year);
  if (year > 2018) {
    fs.writeFileSync('./movies_all.json', JSON.stringify(movieDetails), 'utf8');
    return;
  }

  var options = {
    host: 'www.imdb.com',
    path: '/search/title?countries=us&amp;languages=en&amp;' +
      'release_date' + year + '-01-01,' + year + '-12-31&amp;' +
      'sort=boxoffice_gross_us,desc&amp;title_type=feature'
  }

  http.request(options, function(response) {
    var titles = [];
    response.on('data', function (chunk) {
      // make chunk of data into string
      var str = '' + chunk;
      console.log(str)
      // get the title id from the string
      var matched = str.match(/data-tconst="([a-zA-Z0-9]+)"/gi)
      _.each(matched, title => {
        titles.push(title.split('"')[1]);
      });
    });

    response.on('end', function() {
      // take only the top 5 movies
      titles = _.chain(titles)
        .uniq().take(20).value();

      console.log(titles)
      getAllMovieDetails(titles, function() {
        getSummerMoviesByYear(year + 1);
      });
    });
  }).end();
}

getSummerMoviesByYear(2007);
