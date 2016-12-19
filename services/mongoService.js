const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://travelDb:travelDb@ds041566.mlab.com:41566/traveldb?maxPoolSize=200';

let usersCollection;
let journeysCollection;
const ObjectId = require('mongodb').ObjectID;

const mongoConnect = (callback) => {
    MongoClient.connect(url, (err, db) => {
        usersCollection = db.collection('usersCollection');
        journeysCollection = db.collection('journeysCollection')
        callback();
    });
};

const insertUser = (item) => {
    usersCollection.insert(item);
};

const findEmail = (userEmail, callback) => {
    usersCollection.find({email: userEmail}).toArray((err, res) => {
        if (res.length === 0) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

const getPassword = (userEmail, callback) => {
    usersCollection.find({email: userEmail}).toArray((err, res) => {
        if (res.length !== 0) {
            callback(res[0]);
        } else {
            callback(false);
        }
    });
};

const saveNewPassword = (userEmail, hashedPassword, callback) => {
    let user;
    usersCollection.find({email: userEmail}).toArray((err, res) => {
        user = res[0];
        user.password = hashedPassword;
        usersCollection.update({email: userEmail}, user, callback);
    });
};

const getAllUsers = (callback) => {
    usersCollection.find({isAdmin: {$ne: true}}, {name: 1,
                        email: 1,
                        active: 1,
                        journeysCount: 1}).toArray((err, res) => {
        callback(res);
    });
};

const insertJourney = (journey) => {
    journeysCollection.insert(journey);
};

const getJourney = (id, callback) => {
    if (id.length !== 24 || id === undefined) {
        callback(false);
        return;
    }
    journeysCollection.find({_id: ObjectId(id)}).toArray((err, res) => {
        if (res.length === 0) {
            callback(false);
        } else {
            callback(res[0]);
        }
    });
}

const updateJourney = (journey, id) => {
    journeysCollection.update({_id: ObjectId(id)}, journey);
};

const blockUser = (email, callback) => {
    getPassword(email, (data) => {
        if (data) {
            data.active = false;
            usersCollection.update({_id: ObjectId(data._id)}, data);
            callback(true);
        } else {
            callback(false);
        }
    });
};

const unblockUser = (email, callback) => {
    getPassword(email, (data) => {
        if (data) {
            data.active = true;
            usersCollection.update({_id: ObjectId(data._id)}, data);
            callback(true);
        } else {
            callback(false);
        }
    });
};

const getAllUserJourneys = (id, callback) => {
    journeysCollection.find({userId: id}).sort({date: -1}).toArray((err, res) => {;
        if (res.length !== 0) {
            callback(res);
        } else {
            callback(false);
        }
    });
};

const getAllJourneys = (callback) => {
    journeysCollection.find({}).sort({date: -1}).toArray((err, res) => {;
        if (res.length !== 0) {
            callback(res);
        } else {
            callback(false);
        }
    });
};

const searchFrom = (fromLocation, callback) => {
    journeysCollection.find({ $text: { $search: fromLocation  } }).sort({date: -1}).toArray((err, res) => {
        callback(res);
    });
};

const searchFromTo = (fromLocation, toLocation, callback) => {
    journeysCollection.find({ $text: { $search: `\"${fromLocation}\" \"${toLocation}\"`  } }).sort({date: -1}).toArray((err, res) => {
        callback(res);
    });
};

const getAllJourneysId = (callback) => {
    journeysCollection.find({}, {"_id": 1}).toArray((err, res) => {
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
    insertJourney,
    getJourney,
    updateJourney,
    blockUser,
    unblockUser,
    getAllUserJourneys,
    getAllJourneys,
    searchFrom,
    searchFromTo,
    getAllJourneysId,
}