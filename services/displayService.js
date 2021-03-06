const mongoService = require('./mongoService.js');

const max = 12;

const htmlHead = '<!DOCTYPE html lang="en"><html><head><title>Travel journal</title>' +
    '<link rel="stylesheet" href="../public/css/styles.css">' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<link rel="stylesheet" href="../public/libs/bootstrap.min.css">' +
    '<script src="../public/libs/jquery.min.js"></script>' +
    '<script src="../public/libs/bootstrap.min.js"></script></head>';

const generateNavBar = (isLoggedIn, isAdmin) => {
    let html = '';
    html += '<nav class="navbar navbar-default">' +
    '<div class="container-fluid">' +
    '<div class="navbar-header">' +
      '<a class="navbar-brand" href="/">Travel</a>' +
    '</div>' +
    '<ul class="nav navbar-nav navbar-right">';
    if (!isLoggedIn) {
        html += '<li><a  href="../register"><span class="glyphicon glyphicon-user"></span> Register</a></li>' +
        '<li><a  href="../login"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>';
    } else {
        html += '<li class="dropdown">' +
        '<a class="dropdown-toggle" data-toggle="dropdown" href="#" aria-expanded="false">Journeys' +
            '<span class="caret"></span></a>' +
            '<ul class="dropdown-menu">' +
                '<li><a href="../myJourneys">My journeys</a></li>' +
                '<li><a href="../newJourney">New journey</a></li>' +
            '</ul></li>' +
            '<li class="dropdown">' +
            '<a class="dropdown-toggle" data-toggle="dropdown" href="#" aria-expanded="false">Menu' +
            '<span class="caret"></span></a>' +
            '<ul class="dropdown-menu">' +
                '<li><a href="../changePassword">Change password</a></li>';
        if (isAdmin) {
            html += '<li><a href="../users">Users list</a></li>';
        }
        html +=  '<li><a href="../logout">Log out</a></li>' +
        '</ul></li>';
    }
    html += '</ul></div></nav>';
    return html;
};

const formatJourneys = (data, edit) => {
    if (!data) {
        return false;
    }
    data.forEach((journey) => {
        if (journey.image !== false && journey.image !== 'false') {
            journey.image = `<div class="journey-image" style="background-image: url('${journey.image}')"></div>`;
        } else {
            journey.image = '<div class="journey-image" style="background-image: url(\'../public/noimg.png\')"></div>';
        }
        journey.button = `<button class="journey-read-more" onclick="window.location.href='../journey/${journey._id}'">Read more</button>`;
        if (edit) {
            journey.editButton = `<button class="journey-edit" onclick="window.location.href='../editJourney/${journey._id}'">Edit</button>`;
        }
    });
    return data;
};

const getMainPage = (request, reply) => {
    mongoService.getAllJourneys(new Date(), (data) => {
        let loadMore = false;
        if (data.lengt > max) {
            loadMore = true;
        }
        data = formatJourneys(data, false);
        let time = new Date(data[data.length -1].date);
        time = `var time = new Date("${time.toISOString()}")`;
        if (request.state.session) {
            reply.view('index.html', {htmlData: {
                head: htmlHead,
                navbar:  generateNavBar(request.state.session.email, request.state.session.isAdmin)}, data, time, loadMore
            });
        } else {
            reply.view('index.html', {htmlData: {
                head: htmlHead,
                navbar:  generateNavBar(false, false)}, data, time
            });
        }
    });   
};

const getNextPage = (request, reply) => {
    const time = new Date(request.query.time);
    mongoService.getAllJourneys(time, (data) => {
        reply(data);
    });   
};

const myJourneysView = (request, reply) => {
    if (!request.state.session) {
        reply.redirect('./login');
        return;
    }
    mongoService.getAllUserJourneys(request.state.session.id, new Date(), (data) => {
        let loadMore = false;
        if (data.lengt > max) {
            loadMore = true;
        }
        data = formatJourneys(data, true);
        let time = '';
        try {
            time = new Date(data[data.length -1].date);
            time = `var time = new Date("${time.toISOString()}")`;
        } catch (e) {
            console.warn(e);
        }
        reply.view('./journey/myJourneys.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(request.state.session.email, request.state.session.isAdmin)}, data, time, loadMore
        });
    });
};

const getMyJourneysNextPage = (request, reply) => {
    const time = new Date(request.query.time);
    mongoService.getAllUserJourneys(request.state.session.id, time, (data) => {
        reply(data);
    });   
};

const search = (request, reply) => {
    if (request.query.to !== '') {
        mongoService.searchFromTo(request.query['from'], request.query['to'], new Date(), (data) => {
            reply(data);
        });
    } else {
        mongoService.searchFrom(request.query['from'], new Date(), (data) => {
            reply(data);
        });
    }
};

const getNextSearchPage = (request, reply) => {
    let time;
    if (request.query.time === 'false') {
        time = new Date();
    } else {
        time = new Date(request.query.time);
    }
    if (request.query.to !== '') {
        mongoService.searchFromTo(request.query['from'], request.query['to'], time, (data) => {
            reply(data);
        });
    } else {
        mongoService.searchFrom(request.query['from'], time, (data) => {
            reply(data);
        });
    }  
};

module.exports = {
    htmlHead,
    generateNavBar,
    getMainPage,
    getNextPage,
    myJourneysView,
    search,
    getNextSearchPage,
    getMyJourneysNextPage,
    formatJourneys
};
