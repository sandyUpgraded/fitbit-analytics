var express = require('express'),
    connect = require('connect'),
    app = express.createServer(connect.bodyParser(),
                               connect.cookieParser('session'),
                               connect.session());
var fs = require('fs');
var fitbitClient = require('./fitbit')('1bbd0d3f56e943a4977b5011379ac8d6', '48d4b18747584f9aac6922255390d5d0');
var mongoDB=require('./mongolib');

var token;


app.get('/', function (req, res) {
	    fitbitClient.getAccessToken(req, res, function (error, newToken) {
	        if(newToken) {
	            token = newToken;
	            res.writeHead(200, {'Content-Type':'text/html'});
	            res.write('<html>Now ');
	            res.end('<a href="/getSteps">get steps</a><a href="/getSteps">get steps</a></html>');
        	}
    	});
});
//1/user/-/body/weight/date/2014-04-03/max.json
//user/-/activities/steps/date/2014-04-03/max.json
//1/user/-/sleep/minutesAsleep/date/2014-04-03/max.xml
//1/user/-/body/log/weight/date/2014-04-03/max.xml

app.get('/getOneActivity', function (req, res) {
    fitbitClient.apiCall('GET', '/user/-/activities/steps/date/2014-04-03.json',
        {token: {oauth_token_secret: token.oauth_token_secret, oauth_token: token.oauth_token}},
        function(err, resp) {
            res.writeHead(200, 'application/json');
            res.end(JSON.stringify(resp));
    });
    
});

app.get('/getOneSteps', function (req, res) {
    fitbitClient.apiCall('GET', '/user/-/activities/steps/date/2014-04-03.json',
        {token: {oauth_token_secret: token.oauth_token_secret, oauth_token: token.oauth_token}},
        function(err, resp) {
            res.writeHead(200, 'application/json');
            res.end(JSON.stringify(resp));
    });
    
});

app.get('/getAllSteps', function (req, res) {
    fitbitClient.apiCall('GET', '/user/-/activities/steps/date/2014-04-03/max.json',
        {token: {oauth_token_secret: token.oauth_token_secret, oauth_token: token.oauth_token}},
        function(err, resp) {
        	//activities-steps
            var obj = JSON.parse(resp);
            var step_array=obj['activities-steps'];
            console.log(step_array);
            try{ 
            	mongoDB.insertData(step_array,'step_data',function(){});
       	   		//console.log(obj);
       	   		}
            catch (err){ console.log("error is "+err); }
            res.writeHead(200, 'application/json');
            res.end(JSON.stringify(resp));
            //insertData(obj);
    });
    
});
app.get('/getAllSleep', function (req, res) {
    fitbitClient.apiCall('GET', '/user/-/sleep/minutesAsleep/date/2014-04-03/max.json',
        {token: {oauth_token_secret: token.oauth_token_secret, oauth_token: token.oauth_token}},
        function(err, resp) {
            res.writeHead(200, 'application/json');
            res.end(JSON.stringify(resp));
    });
    
});
app.get('/getOneSleep', function (req, res) {
    fitbitClient.apiCall('GET', '/user/-/sleep/date/2014-04-03.json',
        {token: {oauth_token_secret: token.oauth_token_secret, oauth_token: token.oauth_token}},
        function(err, resp) {
            res.writeHead(200, 'application/json');
            res.end(JSON.stringify(resp));
    });
    
});
app.get('/getWeight', function (req, res) {
    fitbitClient.apiCall('GET', '/user/-/body/weight/date/2014-04-03/max.json',
        {token: {oauth_token_secret: token.oauth_token_secret, oauth_token: token.oauth_token}},
        function(err, resp) {
            res.writeHead(200, 'application/json');
            res.end(JSON.stringify(resp));
    });
    
});

mongoDB.openDB(function(){
	mongoDB.createCollection("step_data", function() {
    });	
});

app.listen(8553);
console.log('listening at http://localhost:8553/');