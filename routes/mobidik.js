// var MongoClient = require('mongodb').MongoClient,
//     Server = require('mongodb').Server,
//     db;

// var mongoClient = new MongoClient(new Server('localhost', 27017));
// mongoClient.open(function(err, mongoClient) {
//     db = mongoClient.db("Mobidik");
//     db.collection('words', {strict:true}, function(err, collection) {
//         if (err) {
//             console.log("words collection doesn't exist.");
//         }
//     });
// });


var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert'),
    dbInst;

// Connect using the connection string
  MongoClient.connect("mongodb://sa:19179143Bjk@ds039960.mongolab.com:39960/mobidik", {native_parser:true}, function(err, db) {
    dbInst = db;
    db.collection('user', {strict:true}, function(err, collection) {
            if (err) {
                console.log("words collection doesn't exist.");
            }
         });
  });


var async = require('async');

exports.addNewWord = function(req, res){

    dbInst.collection('words', function(err, collection) {
        var newWord = {
            wordName:req.body.wordName, 
            shortExp:req.body.shortExp,
            longExp:req.body.longExp,
            nativeExp:req.body.nativeExp,
            userId: req.body.userId
            };
        insertDocument(newWord, collection, function(result){
            console.log("Result: " + JSON.stringify(result))
            res.json(result);
        });
    });
}

exports.findRandom = function(req, res){

    var userId = parseInt(req.params.userId);
    var recordCount = req.params.count;

    var maxId = 0;
    var minId = 0;
    var foundWords = [];
    var doneList = [];
    dbInst.collection('words', function(err, collection) {
        try{
                collection.count({userId: userId}, function(err, count){
                        if(count <= recordCount){
                            collection.find({userId: userId}, function(err, result){
                                    res.json(result);
                            });
                        }
    
                        var randomList = getRandomList(recordCount, 0, count - 1);
                        async.each(randomList, function(random, callback){
                            collection.findOne( {userId: userId}, {sort:{ _id: 1}, limit: (1), skip: (random)}, function(err, result){
                                    foundWords.push(result);
                                    callback();
                            });        
                            // call the `callback` with a error if one occured, or 
                            // empty params if everything was OK. 
                        }, function(err) {
                            // all are complete (or an error occurred)
                            res.json(foundWords);
                        });   

                    });

        }
        catch(ex){
            console.log(ex);
        }
     });
}

function getRandomList(count, min, max){
    var randomList = [];
    while(randomList.length < count){
        var random = getRandomInt(min, max);
        if(randomList.indexOf(random) < 0){
            randomList.push(random);
        }
    }
    return randomList;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.performLogon = function(req, res){

    var userName = req.body.userName;//req.params.userName;
    var password = req.body.password;//req.params.password;
    var deviceOS = req.body.deviceOS;
    var deviceModel = req.body.deviceModel;
    var deviceToken = req.body.deviceToken;

    var logonResult = {
        resultCode : 0,
        userName: '',
        name : '',
        surname: '',
        errorMessage: ''
    }

    dbInst.collection('user', function(err, collection) {
        collection.findOne({userName:userName, password: password}, 
            function(err, results){
                 console.log(err);
                    console.log(results);
                if(results == null)
                {
                    logonResult.resultCode = 401
                    logonResult.errorMessage = "Kullanıcı adı veya şifre hatalı! Lütfen kontrol ederek tekrar giriş yapınız."
                    res.json(logonResult);
                }
                else
                {
                    logonResult.userName = results.userName;
                    logonResult.name = results.name;
                    logonResult.surname = results.surname;
                    logonResult.resultCode = 200;

                    collection.update({_id:results._id}, {$set: {deviceModel: deviceModel, deviceOS: deviceOS, 
                        deviceToken: deviceToken, lastUpdatedDate: new Date()}}, function(err, results){

                    });
                    res.json(logonResult);
                }
            })

    });
}


function insertDocument(doc, targetCollection, callback) {
            try
            {
                var insertDocResult = {
                    insertedId : 0,
                    errorMessage : ''
                }

                targetCollection.findOne( {}, {fields: { _id: 1 }, sort:{ _id: -1}, limit: (1)}, function(err, result){
                        doc._id = result == null ? 1 : result._id + 1;
                        console.log(doc._id)
                        targetCollection.insert(doc, function(err, results){
                            if(err != null) {
                                 if(err.code == 11000 )
                                    insertDocument(doc, targetCollection);
                                 else
                                 {
                                    insertDocResult.errorMessage = "unexpected error inserting data: " + JSON.stringify(err);
                                    print( "unexpected error inserting data: " + JSON.stringify(err) ); 
                                 }
                             }     

                            insertDocResult.insertedId = results[0]._id;
                             console.log("insertDocument result" + JSON.stringify(results))
                             callback(insertDocResult);
                             });
                });
            }
            catch(ex){
                console.log("insertDocument Error : " + ex);
            }
}





