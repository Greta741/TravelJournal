const mongoService = require('./mongoService.js');
const hashService = require('./hashService.js');

const htmlHead = '<head><title>Travel journal</title>' +
    '<link rel="stylesheet" href="../public/CSS/styles.css">' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">' +
    '<link rel="stylesheet" href="http://www.w3schools.com/lib/w3.css">' +
    '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>' +
    '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script></head>';

const generateNavBar = (isLoggedIn, isAdmin) => {
    let html = '';
    html += '<nav class="navbar navbar-default">' +
    '<div class="container-fluid">' +
    '<div class="navbar-header">' +
      '<a class="navbar-brand" href="/">Travel</a>' +
    '</div>' +
    '<ul class="nav navbar-nav navbar-right">';
    if (!isLoggedIn) {
        html += '<li><a  href="./register"><span class="glyphicon glyphicon-user"></span> Register</a></li>' +
        '<li><a  href="./login"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>';
    } else {
        html += '<li class="dropdown">' +
        '<a class="dropdown-toggle" data-toggle="dropdown" href="#" aria-expanded="false">Journeys' +
            '<span class="caret"></span></a>' +
            '<ul class="dropdown-menu">' +
                '<li><a href="" onclick="doSomething()">My journeys</a></li>' +
                '<li><a href="./newJourney">New journey</a></li>' +
            '</ul></li>' +
            '<li class="dropdown">' +
            '<a class="dropdown-toggle" data-toggle="dropdown" href="#" aria-expanded="false">Menu' +
            '<span class="caret"></span></a>' +
            '<ul class="dropdown-menu">' +
                '<li><a href="./changePassword">Change password</a></li>';
        if (isAdmin) {
            html += '<li><a href="/users">Users list</a></li>';
        }
        html +=  '<li><a href="/logout">Log out</a></li>' +
        '</ul></li>';
    }
    html += '</ul></div></nav>';
    return html;
};

const getMainPage = (request, reply) => {
    const data = [
        {
            id: '584e8dd6098f560b3c4e5444',
            description: 'This is description',
            image: `<div class="journey-image" style="background-image: url('http://pctech.lt/wp-content/uploads/2015/01/computer_repair_kaunas.jpg')"></div>`,
            user: 'User',
            button: `<button class="journey-read-more" onclick="window.location.href='./journey/584e8dd6098f560b3c4e5444'">Read more</button>`,
        },
        {
            id: '584e8dd6098f560b3c4e5444',
            description: 'This is description',
            image: `<div class="journey-image" style="background-image: url('http://pctech.lt/wp-content/uploads/2015/01/computer_repair_kaunas.jpg')"></div>`,
            user: 'User',
            button: `<button class="journey-read-more" onclick="window.location.href='./journey/584e8dd6098f560b3c4e5444'">Read more</button>`,
        },
        {
            id: '584e8dd6098f560b3c4e5444',
            description: 'This is description',
            image: `<div class="journey-image" style="background-image: url('http://www.kaunas.lt/wp-content/uploads/sites/13/2015/11/VAIZDAS_005-750x750.jpg')"></div>`,
            user: 'User',
            button: `<button class="journey-read-more" onclick="window.location.href='./journey/584e8dd6098f560b3c4e5444'">Read more</button>`,
        },
        {
            id: '584e8dd6098f560b3c4e5444',
            description: 'This is description',
            image: `<div class="journey-image" style="background-image: url('http://www.centrehotel.lt/galery/_centrehotel//15.jpg')"></div>`,
            user: 'User',
            button: `<button class="journey-read-more" onclick="window.location.href='./journey/584e8dd6098f560b3c4e5444'">Read more</button>`,
        },
        {
            id: '584e8dd6098f560b3c4e5444',
            description: 'This is description',
            image: `<div class="journey-image" style="background-image: url('http://pctech.lt/wp-content/uploads/2015/01/computer_repair_kaunas.jpg')"></div>`,
            user: 'User',
            button: `<button class="journey-read-more" onclick="window.location.href='./journey/584e8dd6098f560b3c4e5444'">Read more</button>`,
        },
        {
            id: '584e8dd6098f560b3c4e5444',
            description: 'This is description',
            image: `<div class="journey-image" style="background-image: url('http://pctech.lt/wp-content/uploads/2015/01/computer_repair_kaunas.jpg')"></div>`,
            user: 'User',
            button: `<button class="journey-read-more" onclick="window.location.href='./journey/584e8dd6098f560b3c4e5444'">Read more</button>`,
        },
        {
            id: '584e8dd6098f560b3c4e5444',
            description: 'This is description',
            image: `<div class="journey-image" style="background-image: url('http://pctech.lt/wp-content/uploads/2015/01/computer_repair_kaunas.jpg')"></div>`,
            user: 'User',
            button: `<button class="journey-read-more" onclick="window.location.href='./journey/584e8dd6098f560b3c4e5444'">Read more</button>`,
        },
        {
            id: '584e8dd6098f560b3c4e5444',
            description: 'This is description',
            image: `<div class="journey-image" style="background-image: url('http://pctech.lt/wp-content/uploads/2015/01/computer_repair_kaunas.jpg')"></div>`,
            user: 'User',
            button: `<button class="journey-read-more" onclick="window.location.href='./journey/584e8dd6098f560b3c4e5444'">Read more</button>`,
        },
        {
            id: '584e8dd6098f560b3c4e5444',
            description: 'This is description',
            image: `<div class="journey-image" style="background-image: url('http://pctech.lt/wp-content/uploads/2015/01/computer_repair_kaunas.jpg')"></div>`,
            user: 'User',
            button: `<button class="journey-read-more" onclick="window.location.href='./journey/584e8dd6098f560b3c4e5444'">Read more</button>`,
        },
        {
            id: '584e8dd6098f560b3c4e5444',
            description: 'This is description',
            image: `<div class="journey-image" style="background-image: url('http://pctech.lt/wp-content/uploads/2015/01/computer_repair_kaunas.jpg')"></div>`,
            user: 'User',
            button: `<button class="journey-read-more" onclick="window.location.href='./journey/584e8dd6098f560b3c4e5444'">Read more</button>`,
        },  
    ];
    if (request.state.session) {
        reply.view('index.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(request.state.session.email, request.state.session.isAdmin)}, data
        });
    } else {
        reply.view('index.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(false, false)}, data,
        });
    }
};

module.exports = {
    htmlHead,
    generateNavBar,
    getMainPage,
}
