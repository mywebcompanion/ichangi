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
    console.log("All is well");
    var info = JSON.parse(body);
  }
  else{
    console.log("Error");
    console.log(error);
  }
}

app.get('/sendsms', function(req,res){

//require the Twilio module and create a REST client
  var email = req.query.Email;
  console.log("Email");

  var authFormData = {
    grant_type : config.silverpop.grant_type,
    client_id : config.silverpop.clientid,
    client_secret : config.silverpop.secret,
    refresh_token : config.silverpop.refresh
  };
  var client = require('twilio')(accountSid, authToken);
  var numberList = [
      {
        "name": "Arun",
        "number" : '+6594507629'
      },
      {
        "name": "Idir",
        "number" : '+6582681713'
      },
      {
        "name" : "Dan",
        "number" : "+6593885916"
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
      },
      {
          "name" : "Rajesh Iyer",
          "number" : "+6591074733"
      },
      {
        "name" : "Joe",
        "number" : "+6596307235"
      }
  ];

  underscore.each(numberList, function(obj){
    client.messages.create({
      to : obj.number,
      from: "+13156460222",
      body: "Dear " + obj.name + ", complete your pending duty free shopping cart and get a chance to be a changi millionaire : http://ichangi.herokuapp.com/shop-ui-add-to-cart.html .  Share with #iShopiSave and get an extra lucky draw chance"
    }, function(err, message) {
      if(!err)
        console.log(message.sid);
      else
        console.log(err);
    });
  });

  request.post({url:config.silverpop.authurl, formData: authFormData}, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    request({
      url : config.silverpop.dbendpoint,
      formData : {
        Email: email,
        COLUMN7 : 'no'
      },
      headers: {
        'Authorization': body.access_token,
        "Content-Type": "text/xml"
      },
      method : 'POST'
    },function(err, httpResponse, body){
      if (err) {
        console.error('upload failed:', err);
      }
      else{
        console.log("Hey all ok" + body);
      }
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
