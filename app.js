const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require('express-session');
const exphbs = require('express-handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(session({ secret: "Shh, its a secret!" }));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// exphbs.registerHelper('times', function (n, block) {
//     var accum = '';
//     for (var i = 0; i < n; ++i)
//         accum += block.fn(i);
//     return accum;
// });

app.get("/", (req, res) => {
    //if (req.session.game) {

    // } else {
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
    //}

    res.render('index', {
        helpers: {
            tiles: () => req.session.game.tiles,
            trial: () => req.session.game.trial,
            score: () => req.session.game.score
        }
    });
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
        newGameRound: newGameRound,
        tiles: req.session.game.tiles,
        score: req.session.game.score,
        trial: req.session.game.trial,
        cols: req.session.game.cols,
        rows: req.session.game.rows,
    })
});

app.listen(80, () => console.log("Server ready"));