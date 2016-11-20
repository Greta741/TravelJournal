const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://travelDb:travelDb@ds041566.mlab.com:41566/traveldb?maxPoolSize=200';

let collection;

const mongoConnect = (callback) => {
    MongoClient.connect(url, (err, db) => {
        collection = db.collection('usersCollection');
        callback();
    });
};

const insertUser = (item) => {
    collection.insert(item);
};

const findEmail = (userEmail, callback) => {
    collection.find({email: userEmail}).toArray((err, res) => {
        if (res.length === 0) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

const checkPasswordMatch = (userEmail, hashedPassword, callback) => {
    collection.find({email: userEmail}).toArray((err, res) => {
        if (res.length !== 0) {
            if (res[0].password === hashedPassword) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = {
    mongoConnect,
    insertUser,
    findEmail,
    checkPasswordMatch,
}