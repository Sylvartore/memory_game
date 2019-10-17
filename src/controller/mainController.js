const express = require("express");
const db = require("../model/dbWrapper")
const router = express.Router();

router.get("/", (req, res) => {
    req.session.game = {
        tiles: 3,
        score: 10,
        trial: 0,
        cols: 5,
        rows: 5,
        error: 0,
        difficulty: 0,
        answers: [],
        submit: false
    }

    res.render('game', {
        scripts: [{ script: '/js/game.js' }],
        styles: [{ style: '/css/game.css' }],
        helpers: {
            tiles: () => req.session.game.tiles,
            trial: () => req.session.game.trial,
            score: () => req.session.game.score
        }
    });
});

router.get("/summary", (req, res) => {
    if (!req.session.game) {
        res.redirect("/")
    } else {
        res.render('summary', {
            scripts: [{ script: '/js/postGame.js' }],
            styles: [{ style: '/css/postGame.css' }],
            helpers: {
                score: () => req.session.game.score
            }
        });
    }
});

router.get("/leaderboard", (req, res) => {
    if (!req.session.game || req.session.game.submit) {
        res.redirect("/")
    } else {
        req.session.game.submit = true
        db.insertRecord({ name: req.query.playername, score: req.session.game.score }).then((result) => {
            db.getRank().then((rank_list) => {
                let rank = -1;
                rank_list.forEach((value, index) => {
                    if (String(value._id) == String(result.ops[0]._id)) rank = index + 1
                });

                res.render('leaderboard', {
                    scripts: [{ script: '/js/postGame.js' }],
                    styles: [{ style: '/css/postGame.css' }],
                    top5: [rank_list[0], rank_list[1], rank_list[2], rank_list[3], rank_list[4]],
                    helpers: {
                        player_name: () => req.query.playername,
                        score: () => req.session.game.score,
                        rank: () => rank
                    }
                });
            }).catch((err) => console.log("err: ", err))
        }).catch((err) => console.log("err: ", err))
    }
});

exports.router = router;