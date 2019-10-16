const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require('express-session');
const exphbs = require('express-handlebars');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get("/", (req, res) => {
    req.session.game = {
        tiles: 3,
        score: 0,
        trial: 0,
        cols: 5,
        rows: 5,
        error: 0,
        difficulty: 0,
        answers: []
    }

    res.render('index', {
        title: 'Memory Game',
        scripts: [{ script: '/js/index.js' }],
        styles: [{ style: '/css/index.css' }],
        helpers: {
            tiles: () => req.session.game.tiles,
            trial: () => req.session.game.trial,
            score: () => req.session.game.score
        }
    });
});

app.get("/summary", (req, res) => {
    if (!req.session.game) {
        res.redirect("/")
    } else {
        res.render('summary', {
            scripts: [{ script: '/js/summary.js' }],
            styles: [{ style: '/css/summary.css' }],
            helpers: {
                score: () => req.session.game.score
            }
        });
    }
});

app.get("/leaderboard", (req, res) => {
    if (!req.session.game) {
        res.redirect("/")
    } else {
        res.render('leaderboard', {
            scripts: [{ script: '/js/summary.js' }],
            styles: [{ style: '/css/summary.css' }],
            helpers: {
                player_name: () => req.query.playername,
                score: () => req.session.game.score
            }
        });
    }
});

app.get("/info", (req, res) => {
    res.json({
        tiles: req.session.game.tiles,
        score: req.session.game.score,
        trial: req.session.game.trial,
        cols: req.session.game.cols,
        rows: req.session.game.rows
    })
});

app.get("/newRound", (req, res) => {
    if (!req.session.game) return
    req.session.game.answers = [];
    const num_of_squres = req.session.game.rows * req.session.game.cols;
    for (let i = 0; i < req.session.game.tiles; i++) {
        let random_index = Math.floor(Math.random() * num_of_squres);
        while (req.session.game.answers.includes(random_index)) {
            random_index = Math.floor(Math.random() * num_of_squres);
        }
        req.session.game.answers.push(random_index);
    }
    res.json(req.session.game.answers)
});

app.get("/click", (req, res) => {
    if (req.session.game.answers.includes(parseInt(req.query.id))) {
        req.session.game.score++;
        req.session.game.answers = req.session.game.answers.filter(value => value != req.query.id);
    } else {
        req.session.game.score--;
        req.session.game.error++;
    }
    const newGameRound = req.session.game.answers.length <= 0
    if (newGameRound) {
        if (req.session.game.error == 0) {
            switch (req.session.game.difficulty % 3) {
                case 0:
                    req.session.game.cols++;
                    break;
                case 1:
                    req.session.game.rows++;
                    break;
                case 2:
                    req.session.game.tiles++;
            }
            req.session.game.difficulty++;
        } else {
            req.session.game.error = 0;
            if (req.session.game.difficulty != 0) {
                switch (req.session.game.difficulty % 3) {
                    case 0:
                        req.session.game.tiles--;
                        break;
                    case 1:
                        req.session.game.cols--;
                        break;
                    case 2:
                        req.session.game.rows--;
                }
                req.session.game.difficulty--;
            }
        }
    }
    res.json({
        terminated: req.session.game.score <= 0,
        newGameRound: newGameRound,
        tiles: req.session.game.tiles,
        score: req.session.game.score,
        trial: req.session.game.trial,
    })
});




app.listen(80, () => console.log("Server ready"));