var unirest = require('unirest');
var express = require('express');
var events = require('events');

var getFromApi = function(endpoint, args) {
    var emitter = new events.EventEmitter();
    unirest.get('https://api.spotify.com/v1/' + endpoint)
           .qs(args)
           .end(function(response) {
                if (response.ok) {
                    emitter.emit('end', response.body);
                }
                else {
                    emitter.emit('error', response.code);
                }
            });
    return emitter;
};

var app = express();
app.use(express.static('public'));

app.get('/search/:name', function(req, res) {
    var searchReq = getFromApi('search', {
        q: req.params.name,
        limit: 1,
        type: 'artist'
    });

    searchReq.on('end', function(item) {
        //console.log("Artist is " + artist.name + " id is " + item.artists.items[0].id);
        var a = getRelated(item.artists.items[0].id);
        var artist = a;
        res.json(a);
    });

    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });
});

function getRelated(id) {
  console.log("Get related called with " + id);
  function rsearch(id) {
    unirest.get('https://api.spotify.com/v1/artists/' + id + '/related-artists')
    .end(function(response){
      console.log(response.body.artists);
      return response.body.artists;
    });
  }
  rsearch(id);
  //console.log(Request);
  console.log("Get related artists complete");
}
app.listen(process.env.PORT || 8080);
