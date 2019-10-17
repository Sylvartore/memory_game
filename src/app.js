const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const exphbs = require('express-handlebars');
const mainController = require("./controller/mainController");
const gameController = require("./controller/gameController");
const db = require("./model/dbWrapper")

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use('/', mainController.router);
app.use('/', gameController.router);

db.init().then(app.listen(80, console.log("Server ready")))
