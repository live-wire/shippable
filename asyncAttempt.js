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
  //AutoGenerated Method
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
    //AutoGenerated Method
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {}
      });
    });

    module.exports = app;




  //This method is called after All the issues are fetched from git API (after all the requests)
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


//Multiple requests are to be sent to git API since number of pages required to be fetched is unknown.
function processURL(req,res,page,jsonFormed) {
    var returnBool = false;
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



      var pagesEncountered = page-1;
      var arrayFormed = [];
      var limit = page+10;

    //Ten requests sent at a time
    //Each request fetches 100 issues
    for(var i=page;i<limit;i++){

      var gitAPIlink = "https://api.github.com/repos/"+owner+"/"+repo+"/issues?per_page=100&page="+i+"&access_token=703fcf2e75603279839e2140097791882c55295b";
      console.log("GET   "+ gitAPIlink);
      var options = {
        headers: {'user-agent': 'node.js'}

      };
      request.get(gitAPIlink,options,function(error,response,body){

        pagesEncountered ++;
        if(response.statusCode!=200){
         console.log(error);
         if(returnBool == false){
         res.json(returnValueError);
         returnBool = true;
  }
       }
       else{
        arrayFormed = [];
        arrayFormed = JSON.parse(response.body);
                    //console.log(arrayFormed.length+" elements added!! "+gitAPIlink);
                    jsonFormed = jsonFormed.concat(arrayFormed);
                    //console.log("needed =" +limit+" Encountered="+pagesEncountered);
                    if(pagesEncountered == limit-1)
                    {

                      if(jsonFormed.length % 100 != 0)
                      {
                        returnBool = true;
                        parser(res,returnValue,jsonFormed);
                      }
                      else
                      {
                        //console.log("ArrayLength-"+arrayFormed.length+" pagesEncountered-"+pagesEncountered+" limit-"+limit+" "+gitAPIlink);
                        //console.log(arrayFormed.length);
                        processURL(req,res,limit,jsonFormed);
                      }

                    }
      //res.json(returnValue);
    }
    console.log("GOT  "+response.statusCode);


  });


    }
  }catch(e)
  {
    console.log("error"+e);
    if(returnBool == false){
    res.json(returnValueError);
    returnBool = true;
  }
  }

}




app.post('/processURL', function (req, res) {-
  processURL(req, res,1,[]);
});


app.listen(3000);

