// packages
const express = require("express");
const database = require("./database");

const app = express()

database.connect().then(err => {
  if (err) {
    // output error on connection to database failed
    console.error(err);
  } else {
    console.log(`Connected to '${process.env.PG_DATABASE}' database!`);

    // start express server at SERVER_PORT
    app.listen(process.env.SERVER_PORT, () => {
      console.log(`Listening at port: ${process.env.SERVER_PORT}`);
    })
  }
}).catch(error => {
  console.log(error);
});  
