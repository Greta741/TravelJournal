const mongoService = require('./mongoService.js');
const displayService = require('./displayService.js');
const request = require('request');
const async = require('async');

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

const getLocation = (data, callback) => {
    const url = `http://maps.googleapis.com/maps/api/geocode/json?latlng=${data.coordinates.lat},${data.coordinates.lng}&sensor=true`;
    request({
        url,
        json: true,
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            data.location = body.results[0].formatted_address;
            callback();
        } else {
            data.location = '';
            callback();
        }
    });
};

const getLocations = (data, callback) => {
    async.each(data.points, (point, callback) => {
        getLocation(point, () => callback());
    },
    (error) => {
        callback();
    });
};

const generateJourneyPoints = (data) => {
    let journeyPoints = [];
    if (data['names[]'] instanceof Array) {
        for (var i = 0; i < data['names[]'].length; i++) {
            let temp = {};
            temp.location_name = data['names[]'][i];
            temp.description = data['descriptions[]'][i];
            temp.img_url = data['images[]'][i];
            temp.coordinates = {
                lat: data['lat[]'][i],
                lng: data['lng[]'][i],
            }
            journeyPoints.push(temp);
        }
    } else {
        let temp = {};
        temp.location_name = data['names[]'];
        temp.description = data['descriptions[]'];
        temp.img_url = data['images[]'];
        temp.coordinates = {
                lat: data['lat[]'],
                lng: data['lng[]'],
            }
        journeyPoints.push(temp);
    }
    return journeyPoints;
};

const getFirstImage = (data) => {
    if (data['images[]'] instanceof Array) {
         for (var i = 0; i < data['images[]'].length; i++) {
             if (data['images[]'][i] !== 'false') {
                 return data['images[]'][i];
             }
        }
    } else if (data['images[]']) {
        return data['images[]'];
    }
    return false;
}

const create = (data, user, callback) => {
    let journey = {};
    journey.user = user.name;
    journey.userId = user.id;
    journey.name = data.name;
    journey.description = data.description;
    journey.summary = data.summary;
    journey.image = getFirstImage(data);
    journey.points = generateJourneyPoints(data);
    journey.date = new Date();
    getLocations(journey, () => {
        mongoService.insertJourney(journey);
        callback();
    });
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
    if (data['images[]']) {
        if (data['images[]'].length === 0) {
            errorsCount++;
        }
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
    if (data['lat[]'] instanceof Array && data['lng[]'] instanceof Array) {
        if (data['lat[]'].length !==  data['lng[]'].length) {
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

const generateEditDivs = (data) => {
    data.name = `<input type="text" id="name" name="name" class="form-control input-sm" required="true" value="${data.name}">`;
    data.id = `<input type="hidden" id="id" name="id" value="${data._id}">`;
    let id = 0;
    let tempPoints = [];
    data.points.forEach((point) => {
        let temp = `<div id="point-${id}" class="point">` +
            `<label class="field">Name</label><input class="point-name" type="hidden" name="pointName" value="${point.location_name}">` +
            `<div clas="point-div">${point.location_name}</div><label class="field">Description</label>` +
            `<input class="point-description" type="hidden" name="pointDescription" value="${point.description}">` +
            `<div clas="point-div">${point.description}</div>`;
        temp += `<input type="hidden" name="lat" class="point-lat" value="${point.coordinates.lat}">`;
        temp += `<input type="hidden" name="lng" class="point-lng" value="${point.coordinates.lng}">`;
        if (point.img_url !== "false") {
            temp += `<label class="field">Image</label>` +
            `<input class="point-image" type="hidden" name="image" value="${point.img_url}">` +
            `<img class="point-img" src="${point.img_url}" alt="image">`;
        } else {
            temp +=  `<input class="point-image" type="hidden" name="image" value="${point.img_url}">`;
        }
        temp += `<button type="button" class="btn btn-default" onclick="edit('point-${id}', '${point.location_name}',` +
            `'${point.description}', '${point.img_url}', ${point.coordinates.lat}, ${point.coordinates.lng})">Edit</button>` +
            `<button type="button" class="btn btn-default" onclick="remove('point-${id}')">Remove</button></div>`
        id++;
        tempPoints.push(temp);
    });
    data.points = tempPoints;
    data.script = `var id = ${id}; var pointsCount = ${id};`;
    return data;
};

const errorMessage = (reply, request, message) => {
    const data = {message: `<div class="message">${message}</div>`}
    reply.view('saved.html', {htmlData: {
        head: displayService.htmlHead,
        navbar:  displayService.generateNavBar(request.state.session.email, request.state.session.isAdmin),
    }, data});
}

const editJourneyView = (request, reply) => {
    const id =  request.params.id;
    if (!request.state.session) {
        reply().redirect('/login');
        return;
    }
    mongoService.getJourney(id, (journey) => {
        if (journey) {
            if (journey.userId === request.state.session.id) {
                journey = generateEditDivs(journey);
                reply.view('./journey/edit.html', {htmlData: {
                    head: displayService.htmlHead,
                    navbar:  displayService.generateNavBar(request.state.session.email, request.state.session.isAdmin),
                }, data: journey});
            } else {
                errorMessage(reply, request, 'Sorry, cannot find.');
            }
        } else {
            errorMessage(reply, request, 'Sorry, cannot find.');
        }
    });

};

const update = (data, user, callback) => {
    let journey = {};
    journey.user = user.name;
    journey.userId = user.id;
    journey.name = data.name;
    journey.description = data.description;
    journey.summary = data.summary;
    journey.image = getFirstImage(data);
    journey.points = generateJourneyPoints(data);
    journey.date = new Date();
     getLocations(journey, () => {
        mongoService.updateJourney(journey, data.id);
        callback();
    });
};

const editJourney = (request, reply) => {
    const id =  request.payload.id;
    if (!request.state.session) {
        reply(false);
        return;
    }
    mongoService.getJourney(id, (journey) => {
        if (journey) {
            if (journey.userId === request.state.session.id) {
                if (countErrors(request.payload) === 0) {
                    update(request.payload, {name: request.state.session.name, id: request.state.session.id}, () => {
                        reply(true);
                    });
                } else {
                    reply(false);
                }
            } else {
                reply(false);
            }
        } else {
            reply(false);
        }
    })
};

const generateCoordinatesArray = (data) => {
    let coordinatesArray = [];
    for (var i = 0; i < data.points.length; i++) {
        coordinatesArray.push({
            lat: data.points[i].coordinates.lat,
            lng: data.points[i].coordinates.lng,
            title: `"${data.points[i].location_name}"`,
        });
    }
    return coordinatesArray;
};

const generatePointsImageDivs = (data) => {
    data.points.forEach((point) => {
        if (point.img_url !== 'false') {
            point.image = `<div class="point-img"><img src="${point.img_url}" alt="${point.location_name}"></img></div>`;
        } else {
            point.image = '';
        }
    });
    return data;
};

const journeyView = (request, reply) => {
    const id = request.params.id;
     mongoService.getJourney(id, (journey) => {
        if (journey) {
            journey = generatePointsImageDivs(journey);
            journey.coordinates = generateCoordinatesArray(journey);
            if (request.state.session) {
                reply.view('./journey/view.html', {htmlData: {
                    head: displayService.htmlHead,
                    navbar:  displayService.generateNavBar(request.state.session.email, request.state.session.isAdmin),
                }, data: journey});
            } else {
                reply.view('./journey/view.html', {htmlData: {
                    head: displayService.htmlHead,
                    navbar:  displayService.generateNavBar(false, false),
                }, data: journey});
            }
        } else {
             errorMessage(reply, request, 'Sorry, cannot find.');
        }
     });
};

module.exports = {
    newJourneyView,
    newJourney,
    editJourneyView,
    editJourney,
    journeyView,
}