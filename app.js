
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , config = require('./config/config.js');

var app = express();
var RedisStore = require('connect-redis')(express);
var MongoStore = require('connect-mongo')(express);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.cookieParser());
 // app.use(express.session({
 //     secret: '1234567890QWERTY',
 // cookie: { path: '/', httpOnly: true, maxAge: 10000 }
 // }));
// app.use(express.session({
//   secret: "keyboard cat",
//     store: new RedisStore
//     ({
//     host: 'localhost',
//     port: 16379
//   }),
//   cookie: { path: '/', httpOnly: true, maxAge: 10000 }
// }));
app.use(express.session({
  store: new MongoStore({
   // url: 'mongodb://root:myPassword@mongo.onmodulus.net:27017/3xam9l3'
     db : "sessions",
 collection : "express_sessions",
  host : "localhost",
  port : config.mongo.port
  }),
  secret: '1234567890QWERTY'
}));


app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/session', function(req, res) {
    var sess = req.session;
    if (sess.views) {
        res.setHeader('Content-Type', 'text/html');
        res.write('<p>views: ' + sess.views + '</p>');
        res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>');
        sess.views++;
        res.end();
        //sess.save();
      } else {
        sess.views = 1;
        res.end('welcome to the session demo. refresh!');
      }

});

app.get('/awesome', function(req, res) {
  if(req.session.lastPage) {
    res.write('Last page was: ' + req.session.lastPage + '. ');
  }

  req.session.lastPage = '/awesome';
  res.send('Your Awesome.');
});

app.get('/radical', function(req, res) {
  if(req.session.lastPage) {
    res.write('Last page was: ' + req.session.lastPage + '. ');
  }

  req.session.lastPage = '/radical';
  res.send('What a radical visit!');
});

app.get('/tubular', function(req, res) {
  res.send('Are you a surfer?');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
