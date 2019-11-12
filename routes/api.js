/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function (app) {

//MongoDb connection pooling
  var db;
  MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, database) {
    if (err) throw err;
    db = database;
  });
    
  app.route('/api/books')
    .get(async function (req, res){
      try{
        var result = await db.collection("books")
                             .aggregate([{$match: {}}, {$project: {_id: 1, title: 1, commentcount: {$size: "$comments"}}}])
                             .toArray();
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    })
    
    .post(async function (req, res){
      var title = req.body.title;
      try{
        if (!title) {
          res.send("Book should have a name");
          return;
        }
        var result = await db.collection("books").insertOne({title: title, comments: []});
        res.json(result.ops[0]);
      } catch (err){
        console.log(err);
      }
    })
    
    .delete(async function(req, res){
      try {
        await db.collection("books").deleteMany({});
        res.send("complete delete successful");
      } catch (err) {
        console.log(err);
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res){
      var bookid = req.params.id;
      try {
        var result = await db.collection("books").findOne({_id: ObjectId(bookid)}, {_id:1, title:1, comments:1});
        res.send(result);
      } catch (err) {
        res.send("no such book found")
      }
    })
    
    .post(async function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      try {
        var result = await db.collection("books").findOneAndUpdate({_id: ObjectId(bookid)}, {$push: {comments: comment}}, {returnOriginal: false});
        res.send(result.value);
      } catch (err) {
        console.log(err);
      }
    })
    
    .delete(async function(req, res){
      var bookid = req.params.id;
      try {
        await db.collection("books").deleteOne({_id: ObjectId(bookid)});
        res.send("delete successful");
      } catch (err) {
        console.log(err);
      }
    });
  
};
