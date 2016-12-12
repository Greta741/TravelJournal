const mongoService = require('./mongoService.js');
const displayService = require('./displayService.js');

const newJourneyView = (request, reply) => {
    if (request.state.session) {
        reply.view('./journey/create.html', {htmlData: {
                head: displayService.htmlHead,
                navbar:  displayService.generateNavBar(request.state.session.email, request.state.session.isAdmin)},
            });
    } else {
        reply().redirect('/login');
    }
};

const generateJourneyPoints = (data) => {
    let journeyPoints = [];
    let temp = {};
    if (data['names[]'] instanceof Array) {
        for (var i = 0; i < data['names[]'].length; i++) {
            temp.Location_name = data['names[]'][i];
            temp.description = data['descriptions[]'][i];
            temp.img_url = data['images[]'][i];
            journeyPoints.push(temp);
        }
    } else {
        temp.Location_name = data['names[]'];
        temp.description = data['descriptions[]'];
        temp.img_url = data['images[]'];
        journeyPoints.push(temp);
    }
    return journeyPoints;
};

const create = (data, user, callback) => {
    let journey = {};
    journey.user = user.name;
    journey.userId = user.id;
    journey.name = data.name;
    journey.description = data.description;
    journey.summary = data.summary;
    journey.points = generateJourneyPoints(data);
    journey.date = new Date();
    mongoService.insertJourney(journey);
    callback();
};

const countErrors = (data) => {
    let errorsCount = 0;
    if (data.name === '') {
        errorsCount++;
    }
    if (data.description === '') {
        errorsCount++;
    }
    if (data.summary === '') {
        errorsCount++;
    }
    if (data['names[]'].length  === 0) {
        errorsCount++;
    }
    if (data['descriptions[]'].length === 0) {
        errorsCount++;
    }
    if (data['images[]'].length === 0) {
        errorsCount++;
    }
    if (data['names[]'] instanceof Array && data['descriptions[]'] instanceof Array && data['images[]'] instanceof Array) {
        if (data['names[]'].length !== data['descriptions[]'].length) {
                errorsCount++;
        }
        if (data['names[]'].length !== data['images[]'].length) {
                errorsCount++;
        }
        if (data['descriptions[]'].length !== data['images[]'].length) {
                errorsCount++;
        }
    }
    return errorsCount;
};

const newJourney = (request, reply) => {
    let errorsCount = 0;
    if (request.state.session) {
        if (countErrors(request.payload) === 0) {
            create(request.payload, {name: request.state.session.name, id: request.state.session.id}, () => {
                reply(true);
            });
        } else {
            reply(false);
        }
    } else {
        reply().redirect('/login');
    }
};

module.exports = {
    newJourneyView,
    newJourney,
}