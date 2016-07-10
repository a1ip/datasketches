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
  if (year > 2016) {
    fs.writeFile('./movies.json', JSON.stringify(movieDetails), 'utf8');
    return;
  }

  var options = {
    host: 'www.imdb.com',
    path: '/search/title?countries=us&languages=en&' +
      'release_date=' + year + '-06-01,' + year + '-08-30&' +
      'sort=boxoffice_gross_us,desc&title_type=feature'
  }

  http.request(options, function(response) {
    var titles = [];
    response.on('data', function (chunk) {
      // make chunk of data into string
      var str = '' + chunk;
      // get the title id from the string
      var matched = str.match(/\<a href="\/title\/([a-zA-Z0-9]+\/")/gi)
      _.each(matched, title => {
        titles.push(title.split('/')[2]);
      });
    });

    response.on('end', function() {
      // take only the top 5 movies
      titles = _.chain(titles)
        .uniq().take(5).value();

      getAllMovieDetails(titles, function() {
        getSummerMoviesByYear(year + 1);
      });
    });
  }).end();
}

getSummerMoviesByYear(1989);
