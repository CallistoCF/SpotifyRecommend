var unirest = require('unirest');
var express = require('express');
var events = require('events');
async = require("async");

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
        //var a = getRelated(item.artists.items[0].id);
        var artist = item.artists.items[0];
        var artistn = item.artists.items[0].name;
        var artistid = item.artists.items[0].id;
        console.log("artist is " + artistn + " id is " + artistid);
        //res.json(artist);
        var s = 'https://api.spotify.com/v1/artists/' + artistid + '/related-artists';
        console.log("s is " + s);
        artist.related = unirest.get(s)
               .end(function(response) {
                    if (response.ok) {
                        for (var i = 0; i < 20; i++) {
                          console.log(i + ") " + response.body.artists[i].name + " " + response.body.artists[i].id);
                          console.log("prior to calling top tracks");
                          response.body.artists[i].tracks = top_tracks(response.body.artists[i]);
                          console.log("prior to returning artist");
                          artist.related = response.body.artists;
                          //
                        }

                        //console.log("main artist related track name " + artist.related[0].tracks[0].name);
                        setTimeout(function(){
                          console.log("Timeout done!");
                          artist = res.json(artist);
                        }, 4000);


                        //console.log("artist 0 tracks" + artist.related);
                      }
                    else {
                        console.log("error " + response.code);}
              });
    });

    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });
});

function top_tracks(item) {
  console.log("top tracks called with " + item.name + " id: " + item.id);
  var z = 'https://api.spotify.com/v1/artists/' + item.id + '/top-tracks?country=US';
  unirest.get(z)
    .end(function(re) {
        if (re.ok) {
          //console.log("Top track for " + artist.related[o].name + " is " + re.body.tracks[0].name);
          //console.log("Top track is " + re.body.tracks[0].name);
          //artist.related[o].tracks += re.body.tracks;
          console.log("tracks " + re.body.tracks[0].name);
          item.tracks = re.body.tracks;
          //artist.related[o].tracks = re.body.tracks;
          //re.send(re.body.tracks[0]);
        }
      else{
        console.log("error " + re.code);
      }
    });
console.log("Top tracks done!");
return item;
}

/*
app.get('/search/:name', function(req, res) {
  console.log("id get called");
  var searcho = getFromApi('artists', {
    q: req.params.name,
    type: 'related-artists'
  });

  searcho.on('end', function(item) {
    console.log("Searcho: end");
    var artists = item.artists;
    res.json(artists);
  });

  searcho.on('error', function(code) {
    console.log("Searcho: error");
    console.log(code);
    res.sendStatus(code);
  });
});
*/
function getRelated(id) {

}
app.listen(process.env.PORT || 8080);
