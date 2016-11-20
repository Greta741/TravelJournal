const mongoService = require('./mongoService.js');
const hashService = require('./hashService.js');

const htmlHead = '<head><title>Travel journal</title>' +
    '<link rel="stylesheet" href="./public/css/styles.css">' +
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
                '<li><a href="" onclick="doSomething()">New journey</a></li>' +
            '</ul></li>' +
            '<li class="dropdown">' +
            '<a class="dropdown-toggle" data-toggle="dropdown" href="#" aria-expanded="false">Menu' +
            '<span class="caret"></span></a>' +
            '<ul class="dropdown-menu">' +
                '<li><a href="" onclick="doSomething()">Change password</a></li>';
        if (isAdmin) {
            html += '<li><a href="" onclick="doSomething()">Users list</a></li>';
        }
        html +=  '<li><a href="" onclick="logout()">Log out</a></li>' +
        '</ul></li>';
    }
    html += '</ul></div></nav>';
    return html;
};

const getMainPage = (request, reply) => {
    if (request.state.session) {
        reply.view('index.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(request.state.session.email, request.state.session.isAdmin)},
        });
    } else {
        reply.view('index.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(false, false)},
        });
    }
};

const loginView = (request, reply) => {
    let data = {
        email: '<input type="text" id="email" name="email" class="form-control input-sm" required="true" value="">',
    };
    if (request.state.session) {
        reply.view('login.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(request.state.session.email, request.state.session.isAdmin),
        }, data});
    } else {
        reply.view('login.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(false, false),
        }, data});
    }
};

const registerView = (request, reply) => {
    let data = {
        name: '<input type="text" id="name" name="name" class="form-control input-sm" required="true" value="">',
        email: '<input type="email" id="email" name="email" class="form-control input-sm" required="true" value="">',
    };
    if (request.state.session) {
        reply.view('register.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(request.state.session.email, request.state.session.isAdmin),
        }, data});
    } else {
        reply.view('register.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(false, false),
        }, data});
    }
};

const login = (request, reply) => {
    let data = {
        email: '<input type="text" id="email" name="email" class="form-control input-sm" required="true"' +
         'value="' + request.payload.email + '">',
        errors: '<div class="error">Wrong email or password</div>',
    };
    hashService.hashString(request.payload.password, (hashedPassword) => {
        mongoService.checkPasswordMatch(request.payload.email, hashedPassword, (result) => {
            if (result) {
                reply().redirect('/').state('session', {
                    email: request.payload.email,
                    isAdmin: false,
                });
            } else {
                reply.view('login.html', {htmlData: {
                    head: htmlHead,
                    navbar:  generateNavBar(false, false),
                }, data});
            }
        });
    });   
};

const registerUser = (request, reply) => {
     hashService.hashString(request.payload.password, (hashedPassword) => {
        mongoService.insertUser({
        name: request.payload.name,
        email: request.payload.email,
        password: hashedPassword,
        active: true,
        journeysCount: 0,
        journeys: [],
        });
    });
    reply().redirect('/').state('session', {
        email: request.payload.email,
        isAdmin: false,
    });
};

const register = (request, reply) => {
    let errorsCount = 0;
    let data = {
        name: '<input type="text" id="name" name="name" class="form-control input-sm" required="true" value="' +
            request.payload.name + '">',
        email: '<input type="email" id="email" name="email" class="form-control input-sm" required="true" value="' +
            request.payload.email + '">',
        errors: '',
    };
    data.errors += '<div class="errors">';

    if (request.payload.password !== request.payload.repeatPassword) {
        data.errors += 'Passwords does not match<br>';
        errorsCount++;
    }
    if (request.payload.name.length < 3) {
        data.errors += 'Name is too short<br>';
        errorsCount++;
    }
    if (request.payload.password.length < 5) {
        data.errors += 'Password is too short<br>';
        errorsCount++;
    }
    mongoService.findEmail(request.payload.email, (result) => {
        if (!result) {
            data.errors += 'Email already exists<br>';
            errorsCount++;
        }
        data.errors += '</div>';
        if (errorsCount === 0){
            registerUser(request, reply);
        } else {
            reply.view('register.html', {htmlData: {
                head: htmlHead,
                navbar:  generateNavBar(false, false),
            }, data})
        }
    });   
};

const logout = (request, reply) => {
    reply().unstate('session').redirect('/');
};

module.exports = {
    getMainPage,
    loginView,
    registerView,
    login,
    register,
    logout,
}