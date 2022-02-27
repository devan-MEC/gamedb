const express = require("express");

const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));

var path = require("path");
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true }));
var session = require("express-session");
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

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

app.post("/signup", (req, res) => {
  console.log(req.body);
  let username = app.locals.u;
  let password = app.locals.p;
  let email = req.body.email;

  const sql_q = `INSERT INTO Account (username, password, email) VALUES (?, ?, ?)`;
  db.run(sql_q, [username, password, email], (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      res.render("login", { model: rows });
    }
  });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/users", (req, res) => {
  const sql_q = `SELECT * FROM Account`;
  db.all(sql_q, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("users", { model: rows });
  });
});

app.get("/home", (req, res) => {
  const sql_q = `SELECT * FROM game`;
  db.all(sql_q, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("home", { model: rows });
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
app.get("/library", (req, res) => {
  console.log("inside sess", app.locals.u, app.locals.p);
  // console.log(` ${row.username} - ${row.password}`);
  let u_id = undefined;
  const sql_query2 = `SELECT acc_id from account where username="${app.locals.u}";`;
  const sql_query3 = `SELECT * from game where game_id in (SELECT game_id from plays where acc_id=?)`;
  db.get(sql_query2, [], (err, tup) => {
    if (err) {
      throw err;
    }
    u_id = tup.acc_id;
    console.log(`u_id is ${u_id}`);
    db.all(sql_query3, [u_id], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("library", { model: rows });
    });
  });
});

app.get("/data", (req, res) => {
  const test = {
    title: "Test",
    items: ["one", "two", "three"],
  };
  res.render("data", { model: test });
});

app.post("/library", (req, res) => {
  console.log("req body is", req.body);
  let username = req.body.username;
  let password = req.body.password;
  app.locals.u = username;
  app.locals.p = password;
  req.session.authenticate = true;
  req.session.username = username;
  req.session.password = password;
  console.log("req sess username is ", app.locals.u);
  console.log("console log for var paramaters", username, password);
  var a = 0;

  if (username && password) {
    const sql_query = `SELECT Username,Password  FROM account WHERE Username=? AND Password=?;`;
    // try {

    db.get(sql_query, [username, password], (err, row) => {
      if (err) {
        console.log(a);
        console.log("login failed");
        res.render("failure");
        throw err;
      }
      if (row) {
        req.session.authenticate = true;
        req.session.username = username;
        req.session.password = password;
        console.log(` ${row.username} - ${row.password}`);
        let u_id = undefined;
        const sql_query2 = `SELECT acc_id from account where username="${row.username}";`;
        const sql_query3 = `SELECT * from game where game_id in (SELECT game_id from plays where acc_id=?)`;
        db.get(sql_query2, [], (err, tup) => {
          if (err) {
            throw err;
          }
          u_id = tup.acc_id;
          console.log(`u_id is ${u_id}`);
          db.all(sql_query3, [u_id], (err, rows) => {
            if (err) {
              return console.error(err.message);
            }
            res.render("library", { model: rows });
          });
        });

        // console.log("dededede");
        // console.log("LOGIN SUCCESFULL");
        // console.log(`u_id OUTSIDE LOOP is ${u_id}`);
        // a = 1;
        // app.get("/library", (req, res) => {
        //const u_id = 2;

        // });
      } else {
        res.render("failure");
      }
    });
    // console.log("OP", a);
    // res.render("failure");

    // catch (e) {
    //   console.log("login failed");
    //   res.render("failure");
    //}
  }
});

// app.get("/library", (req, res) => {
//   const u_id = 3;
//   const sql_query = `SELECT game_id  FROM plays WHERE acc_id=?;`;
//   db.all(sql_query, [u_id], (err, rows) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     if (rows) {
//       game_id = rows.game_id;
//       const sql_query_2 = `SELECT game_name  FROM game WHERE game_id=?;`;
//       db.all(sql_query_2, [game_id], (err, rows2) => {
//         if (err) {
//           return console.error(err.message);
//         }
//         res.render("library", {
//           model: rows2,
//         });
//       });
//     }
//     //res.render("library", { model: rows });
//   });
// });

// app.get("/library", (req, res) => {
//   const u_id = 2;
//   const sql_query = `SELECT game_name from game where game_id in (SELECT game_id from plays where acc_id=?)`;
//   db.all(sql_query, [u_id], (err, rows) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     res.render("library", { model: rows });
//   });
// });

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
