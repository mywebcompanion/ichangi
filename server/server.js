var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var bodyParser = require('body-parser');
var config = require('config');
var underscore = require('underscore');


var app = module.exports = loopback();
// Twilio Credentials
var accountSid = config.get('twilio.accountSid');
var authToken = config.get('twilio.authToken');

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.get('/',function(req,res){
  res.sendFile(path.resolve(__dirname + '/../client/index.html'));
});

app.get('/sendsms', function(req,res){

//require the Twilio module and create a REST client
  var client = require('twilio')(accountSid, authToken);
  var numberList = [
    {
        "name": "Arun",
        "number" : '+6594507629'
    },
    {
        "name": "Idir",
        "number" : '+6582681713'
    }
  ];
  underscore.each(numberList, function(obj){
    client.messages.create({
      to : obj.number,
      from: "+13156460222",
      body: "Dear " + obj.name + ", Great change to become a changi millionaire. complete your pending duty free shopping cart and participate ! . http://ichangi.herokuapp.com/shop-ui-add-to-cart.html"
    }, function(err, message) {
    if(!err)
      console.log(message.sid);
    else
      console.log(err);
    });
  });

});

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
