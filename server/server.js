var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var bodyParser = require('body-parser');
var config = require('config');
var underscore = require('underscore');
var request = require('request');


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

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
  }
  else{
    console.log(error);
  }
}

app.get('/sendsms', function(req,res){

//require the Twilio module and create a REST client
  var email = req.query.Email;
  var options = {
    url: config.silverpop.dbendpoint,
    formData : {
      Email: email,
      COLUMN7 : 'no'
    },
    method: 'POST',
    headers : {}
  };
  var authFormData = {
    grant_type : config.silverpop.grant_type,
    client_id : config.silverpop.clientid,
    client_secret : config.silverpop.secret,
    refresh_token : config.silverpop.refresh
  };

  request.post({url:config.silverpop.authurl, formData: authFormData}, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    var access_token = body.access_token;
    options.headers.Authorization = access_token;
    request(options, callback);
  });

  var client = require('twilio')(accountSid, authToken);
  var numberList = [
    /*{
        "name": "Arun",
        "number" : '+6594507629'
    },
    {
        "name": "Idir",
        "number" : '+6582681713'
    },
    {
        "name":"Akshay",
        "number" : '+6598577834'
    },
    {
        "name":"Amit",
        "number" : '+6581390236'
    },
    {
        "name":"Raj",
        "number" : '+6596603146'
    }*/
  ];
  underscore.each(numberList, function(obj){
    client.messages.create({
      to : obj.number,
      from: "+13156460222",
      body: "Dear " + obj.name + ", Great chance to become a changi millionaire. complete your pending duty free shopping cart and participate! . http://ichangi.herokuapp.com/shop-ui-add-to-cart.html"
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
