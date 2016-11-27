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

const getPassword = (userEmail, callback) => {
    collection.find({email: userEmail}).toArray((err, res) => {
        if (res.length !== 0) {
            callback(res[0]);
        } else {
            callback(false);
        }
    });
};

const saveNewPassword = (userEmail, hashedPassword, callback) => {
    let user;
    collection.find({email: userEmail}).toArray((err, res) => {
        user = res[0];
        user.password = hashedPassword;
        collection.update({email: userEmail}, user, callback);
    });
};

const getAllUsers = (callback) => {
    collection.find({}, {name: 1,
                        email: 1,
                        active: 1,
                        journeysCount: 1}).toArray((err, res) => {
        callback(res);
    });
};

module.exports = {
    mongoConnect,
    insertUser,
    findEmail,
    getPassword,
    saveNewPassword,
    getAllUsers,
}