var express = require('express'),
    connect = require('connect'),
    app = express.createServer(connect.bodyParser(),
                               connect.cookieParser('session'),
                               connect.session());
var fs = require('fs');
var creds = require('./creds');
console.log(creds.PASS11);
var fitbitClient = require('./fitbit')(creds.PASS11, creds.PASS2);
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

app.get('/getActiveDays', function (req, res) {
	mongoDB.queryData("step_data",{intValue: { $gt: 0 }},"intValue",-1, 1000,
		function(docs){
	   		res.send(JSON.stringify(docs));
	 }); 
});

app.get('/get10KSteps', function (req, res) {
	mongoDB.queryData("step_data",{intValue: { $gt: 10000 }},"intValue",-1, 1000,
		function(docs){
	   		res.send(JSON.stringify(docs));
	 }); 
});

app.get('/get20KSteps', function (req, res) {
	mongoDB.queryData("step_data",{intValue: { $gt: 20000 }},"intValue",-1, 1000,
		function(docs){
	   		res.send(JSON.stringify(docs));
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
            for (i=0;i<step_array.length;i++)
            	step_array[i].intValue=parseInt(step_array[i].value);
            try{ 
            	mongoDB.insertData(step_array,'step_data',function(){  	});
       	   	}
            catch (err){ console.log("error is "+err); }
            res.writeHead(200, 'application/json');
            res.end(JSON.stringify(resp));
    });
    
});

app.get('/update', function (req, res) {
    fitbitClient.apiCall('GET', '/user/-/activities/steps/date/2014-04-03/max.json',
        {token: {oauth_token_secret: token.oauth_token_secret, oauth_token: token.oauth_token}},
        function(err, resp) {
        	var d = new Date()
        	console.log("Start Update: "+d.getTime());
            var obj = JSON.parse(resp);
            var step_array=obj['activities-steps'];
            for (var i=0;i<step_array.length;i++){
            	step_array[i].intValue=parseInt(step_array[i].value);
	            try{ 
	            	mongoDB.updateTimeSeriesData(step_array[i],'step_data',function(){  	});
	       	   	}
	            catch (err){ console.log("error is "+err); }
	            }
        	console.log("Stop Update: "+d.getTime());
            res.writeHead(200, 'application/json');
            res.end(JSON.stringify(resp));
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
	console.log("ready to set unique field");
	//Steps, Sleep, Weight
	
	mongoDB.createCollection("step_data", function() {    });	
});

app.listen(8553);
console.log('listening at http://localhost:8553/');
