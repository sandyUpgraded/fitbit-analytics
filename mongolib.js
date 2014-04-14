var mongo = require('mongodb');
var Db = mongo.Db;
var Server = mongo.Server;
var client = new Db('test', new Server('127.0.0.1', 27017, {}));

var openDB = function(callback) {
        try {
            client.open(function(err, pClient) {console.log("openDB");callback();});
        }
        catch(err){console.log(err);callback();}
        return;
};

var createCollection=function(collectionID) {
    client.createCollection(collectionID,function() {
	    collection=client.collection(collectionID);
	    collection.ensureIndex({ "dateTime" : -1 },{ "name" : "dateTime", "unique" : true, "dropDups" : true });   	
    });
};	



var insertData = function(documentData,collectionID) {
     collection=client.collection(collectionID);
     collection.insert(documentData);
};

var removeData = function(documentID,collectionID) {
     collection=client.collection(collectionID);
     collection.remove({id: documentID});
};

var updateData = function(documentData,collectionID) {
    collection=client.collection(collectionID);
    collection.update({id: documentID}, documentData);
};

var updateTimeSeriesData = function(documentData,collectionID) {
    collection=client.collection(collectionID);
    collection.update({dateTime: documentData.dateTime}, documentData, { upsert: true });
};

var getCollection = function(collectionID) {
    collection=client.collection(collectionID);
    return collection;
};

var getCount = function(collectionID) {
    //return getCollection(collectionID).find({});//.length;
    getCollection(collectionID).count(function(err, count) {
    	console.log("There are " + count + " records.");
    });
};

var listAllData = function(collectionID,callback) {
	var returnData=[];
	getCollection(collectionID).find({}, 
		function(err, cursor) {           
        cursor.toArray(function(err, docs) { 
        	callback(docs);
        });
	});
};

var listSomeData = function(collectionID,val,ascdes,limit,callback) {
	var returnData=[];
	getCollection(collectionID).find({}, {'sort':[[val,ascdes]],'limit': limit}, 
		function(err, cursor) {           
        cursor.toArray(function(err, docs) { 
        	callback(docs);
        });
	});
};

var queryData = function(collectionID,criteria, val,ascdes,limit,callback) {
	var returnData=[];
	getCollection(collectionID).find(criteria, {'sort':[[val,ascdes]],'limit': limit}, 
		function(err, cursor) {           
        cursor.toArray(function(err, docs) { 
        	callback(docs);
        });
	});
};

var findDoc = function(condition,collectionID) {
	//var coll = getCollection(collectionID);
	//return getCollection(collectionID);
	
	getCollection(collectionID).find(condition,function(err, cursor) {           
    	/*cursor.each(function(err, doc) {              
    		if(doc != null) 
        		console.dir(doc);            
		});  */ 
        cursor.toArray(function(err, docs) { 
        	console.log("Returned #" + docs.length + " documents");
        	console.log(docs);
        	return docs;
        });
	});
};

exports.insertData=insertData;
exports.removeData=removeData;
exports.updateData=updateData;
exports.listAllData=listAllData;
exports.listSomeData=listSomeData;
exports.queryData=queryData;
exports.updateTimeSeriesData=updateTimeSeriesData;
exports.createCollection=createCollection;
exports.getCollection=getCollection;
exports.getCount=getCount;
exports.findDoc=findDoc;
exports.client=client;
exports.openDB=openDB;

/*client.open(function(err, pClient) {
     //monitorTwitter('lebron');
     console.log("Open Sesame");
});*/