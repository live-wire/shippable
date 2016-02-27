var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var bodyParser = require('body-parser');
var request = require('request');
var util = require('util');
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

//sendMail("test","Hello Swaroop");
// app.use(bodyParser.json(), function (req, res, next) {

//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);

//   // Pass to next layer of middleware
  
// });
function parser(res,returnValue,responseBody)
{
    var i=0;
    var open = 0;
    var seven = 0;
    var twenty = 0;
    var d = new Date();
    var n = d.getTime();
    
    for(i in responseBody)
    {
      
      if(responseBody[i].state == "open")
        {open++;}

      var updatedAt = responseBody[i].updated_at;
      var updatedAtDate = new Date(updatedAt);
      var millis = updatedAtDate.getTime();
      //console.log(" current-"+n+" issue-"+millis);
      if(n-millis <= 86400000)
        twenty++;
      else if(n-millis > 86400000 && n-millis < 604800000)
        seven++;

      //console.log(util.inspect(responseBody[i],false,null)+" "+open);
      
      
    }
    
    returnValue.open = open;
    returnValue.twenty = twenty;
    returnValue.seven = seven;
    res.json(returnValue);

}


function processURL(req,res,page,jsonFormed) {
  //console.log(alert_interval);
  //console.log(util.inspect(req, false, null));
  var returnValueError = {
    open : "---",
    seven : "---",
    twenty : "---"
  };
  var returnValue = {
                      open : 0,
                      seven : 0,
                      twenty : 0
                  };
var returnBool = false;
  try{
  var str = req.body.link;
  var n = str.search(/github.com/i);
  n = n+11;
  var ownerRepo = str.substring(n);
  n = ownerRepo.search(/\//i);
  var owner = ownerRepo.substring(0,n);
  ownerRepo = ownerRepo.substring(n+1);
  n = ownerRepo.search(/\//i);
  var repo = ownerRepo.substring(0,n);
  var arrayJson = [];

  var gitAPIlink = "https://api.github.com/repos/"+owner+"/"+repo+"/issues?per_page=100&page="+page+"&access_token=703fcf2e75603279839e2140097791882c55295b";

  var options = {
  headers: {'user-agent': 'node.js'}
};

  console.log("GET   "+ gitAPIlink);

  
  

  request.get(gitAPIlink,options,function(error,response,body){
           if(error){
                               if(returnBool == false){
                              res.json(returnValueError);
                              returnBool = true;
                  }
           }else{
                  
                  var arrayFormed = JSON.parse(response.body);
                  if(arrayFormed.length>0)
                  {
                    jsonFormed = jsonFormed.concat(arrayFormed);
                    processURL(req,res,page+1,jsonFormed);

                  }
                  else
                  {
                      returnBool = true;
                      parser(res,returnValue,jsonFormed);
                  }
                  //
                  //res.json(returnValue);
         }
         



         console.log("GOT  "+response.statusCode);
});
}catch(e)
  {
    console.log("error"+e);
    if(returnBool == false){
    res.json(returnValueError);
    returnBool = true;
  }}

}


app.post('/processURL', function (req, res) {-
  processURL(req, res,1,[]);
});


app.listen(3000);


