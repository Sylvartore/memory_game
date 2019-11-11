const express = require("express");

const router = express.Router();

router.get("/newRound", (req, res) => {
    if (!req.session.game) return
    req.session.game.answers = [];
    req.session.game.error = 0;
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

router.get("/click", (req, res) => {
    if (req.session.game.answers.includes(parseInt(req.query.id))) {
        req.session.game.score++;
        req.session.game.answers = req.session.game.answers.filter(value => value != req.query.id);
    } else {
        req.session.game.score--;
        req.session.game.error++;
    }
    const newGameRound = (req.session.game.answers.length <= 0 || req.session.game.error == req.session.game.answers.length)
    if (newGameRound) {
        if (req.session.game.error == 0) {
            req.session.game.score += req.session.game.tiles;
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
        error: req.session.game.error,
        newGameRound: newGameRound,
        tiles: req.session.game.tiles,
        score: req.session.game.score,
        trial: req.session.game.trial,
    })
});

router.get("/info", (req, res) => {
    res.json({
        cols: req.session.game.cols,
        rows: req.session.game.rows
    })
});

exports.router = router;