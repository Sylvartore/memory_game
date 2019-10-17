const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'memory_game';
const client = new MongoClient(url, { useUnifiedTopology: true });

const init = async () => new Promise((res, rej) => {
    client.connect((err) => {
        if (err) rej(err);
        res()
    })
})

const insertRecord = async (record) => new Promise((res, rej) => {
    const collection = client.db(dbName).collection('leaderboard');
    collection.insertOne(record, (err, result) => {
        if (err) rej(err);
        res(result);
    });
})

const getRank = async () => new Promise((res, rej) => {
    const collection = client.db(dbName).collection('leaderboard');
    collection.find().sort({ score: -1 }).toArray((err, result) => {
        if (err) rej(err);
        res(result)
    });
})

const clear = async () => new Promise((res, rej) => {
    const collection = client.db(dbName).collection('leaderboard');
    collection.drop((err, result) => {
        if (err) rej(err);
        res(result)
    });
})

exports.init = init
exports.insertRecord = insertRecord
exports.getRank = getRank
exports.clear = clear

