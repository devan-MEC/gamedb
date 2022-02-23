const express = require("express");

const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));

var path = require("path");
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true }));

const sqlite3 = require("sqlite3").verbose();
const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'apptest.db'");
});

// const sql_create = `CREATE TABLE IF NOT EXISTS Users (
//   Username varchar(30),Password varchar(30)
// );`;

// const sql_insert = `INSERT INTO Users values('admin','admin'),('aroon','linuxftw');`;
// db.run(sql_create, (err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log("Successful creation of the 'Users' table");
// });
// db.run(sql_insert, (err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log("Successful creation of 2 Users");
// });

app.get("/users", (req, res) => {
  const sql_q = `SELECT * FROM Users`;
  db.all(sql_q, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("users", { model: rows });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/", (req, res) => {
  //res.send("hello world!");
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/data", (req, res) => {
  const test = {
    title: "Test",
    items: ["one", "two", "three"],
  };
  res.render("data", { model: test });
});

app.post("/About", (req, res) => {
  console.log("req body is", req.body);
  let username = req.body.username;
  let password = req.body.password;
  console.log("console log for var paramaters", username, password);
  var a = 0;

  if (username && password) {
    const sql_query = `SELECT Username,Password  FROM Users WHERE Username=? AND Password=?;`;
    // try {

    db.get(sql_query, [username, password], (err, row) => {
      if (err) {
        console.log(a);
        console.log("login failed");
        res.render("failure");
        throw err;
      }
      if (row) {
        //req.session.authenticate = true;
        //req.session.username = username;
        console.log(`${row.Username} - ${row.Password}`);
        console.log("dededede");
        console.log("LOGIN SUCCESFULL");
        a = 1;
        res.render("About");
      } else {
        res.render("failure");
      }
    });
    console.log("OP", a);
    // res.render("failure");

    // catch (e) {
    //   console.log("login failed");
    //   res.render("failure");
    //}
  }
});

// app.post("/About", (req, res, next) => {
//   // var errors = [];
//   // if (!req.body.password) {
//   //   errors.push(" No pass specified");
//   // }

//   console.log("req body is", req.body);
//   let username = req.body.username;
//   let password = req.body.password;
//   console.log("console log for var paramaters", username, password);
//   var a = 0;

//   if (username && password) {
//     const sql_query = `SELECT Username,Password  FROM Users WHERE Username=? AND Password=?;`;
//     // try {

//     db.get(sql_query, [username, password], (err, row) => {
//       if (err || !row) {
//         console.log("login failed");
//         res.render("failure");
//       } else if (row) {
//         //req.session.authenticate = true;
//         //req.session.username = username;
//         console.log(`${row.Username} - ${row.Password}`);
//         console.log("dededede");
//         console.log("LOGIN SUCCESFULL");
//         a = 1;
//         res.render("About");
//       }
//     });
//   }
// });

app.listen(3000, () => {
  console.log("SERVER RUNNING ON PORT 3000");
});
