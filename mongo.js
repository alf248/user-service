"use strict";

const { MongoClient } = require("mongodb");
// Connection URI
const uri = "mongodb://localhost:27017";
// Create a new MongoClient
const client = new MongoClient(uri);



module.exports.getUser =  async function (query) {
  try {
    await client.connect();
    const database = client.db("gotrade");
    const users = database.collection("users");
    // Query for a movie that has the title 'The Room'
    const options = {
      // sort matched documents in descending order by rating
      //sort: { "imdb.rating": -1 },
      // Include only the `title` and `imdb` fields in the returned document
      //projection: { _id: 0, title: 1, imdb: 1 },
    };
    const user = await users.findOne(query, options);
    // since this method returns the matched document, not a cursor, print it directly
    //console.log(user);
    return user
  } finally {
    await client.close();
  }
}

//run().catch(console.dir);