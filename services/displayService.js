const mongoService = require('./mongoService.js');
const hashService = require('./hashService.js');

const htmlHead = '<head><title>Travel journal</title>' +
    '<link rel="stylesheet" href="./public/CSS/styles.css">' +
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
        data.message = '<div class="message">You are already logged in.</div>';
        reply.view('saved.html', {htmlData: {
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
        data.message = '<div class="message">You are already logged in.</div>';
        reply.view('saved.html', {htmlData: {
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
        errors: '',
    };
    mongoService.getPassword(request.payload.email, (user) => {
        if (user) {
            hashService.checkMatch(request.payload.password, user.password, (result) => {
                if (result) {
                    reply().redirect('/').state('session', {
                        email: request.payload.email,
                        isAdmin: user.isAdmin,
                    });
                } else {
                    data.errors = '<div class="error">Wrong email or password</div>';
                    reply.view('login.html', {htmlData: {
                        head: htmlHead,
                        navbar:  generateNavBar(false, false),
                    }, data});
                }
            });
        } else {
            data.errors = '<div class="error">Wrong email or password</div>';
            reply.view('login.html', {htmlData: {
                head: htmlHead,
                navbar:  generateNavBar(false, false),
            }, data});
        }
    });  
};

const registerUser = (request, reply) => {
     hashService.hashString(request.payload.password, (hashedPassword) => {
        mongoService.insertUser({
        name: request.payload.name,
        email: request.payload.email,
        password: hashedPassword,
        isAdmin: false,
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

    if (!request.payload.name.match(/^[0-9a-zA-Z]+$/)) {
        data.errors += 'Name can only contain letters and numbers<br>';
        errorsCount++;
    }

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

const changePasswordView = (request, reply) => {
    if (request.state.session) {
        reply.view('changePassword.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(request.state.session.email, request.state.session.isAdmin),
        }
    });
    } else {
        reply().redirect('/login');
    }
};

const changePassword = (request, reply) => {
    let data = {
        errors: '<div class="errors">',
    };
    let errorsCount = 0;
    if (request.payload.password !== request.payload.repeatPassword) {
        data.errors += 'Passwords does not match<br>';
        errorsCount++;
    }
    if (request.payload.password.length < 5) {
        data.errors += 'Password is too short<br>';
        errorsCount++;
    }

    mongoService.getPassword(request.state.session.email, (user) => {
        if (user) {
            hashService.checkMatch(request.payload.oldPassword, user.password, (result) => {
                if (result && errorsCount === 0) {
                    hashService.hashString(request.payload.password, (hashedPassword) => {
                        mongoService.saveNewPassword(request.state.session.email, hashedPassword, () => {
                            data.message = '<div class="message">New password saved.</div>';
                            reply.view('saved.html', {htmlData: {
                                head: htmlHead,
                                navbar: generateNavBar(request.state.session.email, request.state.session.isAdmin),
                            }, data});
                        });
                    });
                } else {
                    if (!result) {
                        data.errors += 'Wrong password<br>';
                    }
                    data.errors += '</div>';
                    reply.view('changePassword.html', {htmlData: {
                        head: htmlHead,
                        navbar:  generateNavBar(request.state.session.email, request.state.session.isAdmin),
                    }, data});
                }
            });
        } else {
            reply().redorect('/login');
        }
    });  
};

const generateUsersList = (users) => {
    let usersList = [];
    let usersCount = 1;
    users.forEach((user) =>{
        let userData = '';
        userData += `<tr><td>${usersCount}</td>` +
        `<td>${user.name}</td>` +
        `<td>${user.email}</td>` +
        `<td>${user.journeysCount}</td>`;
        if (user.active) {
            userData +=  `<td id="user-${usersCount}" onclick="Block("${user.email}", ${usersCount})">Block</td>`;
        } else {
            userData +=  `<td id="user-${usersCount}" onclick="Unblock("${user.email}", ${usersCount})">Unblock</td>`;
        }
        userData += '</tr>';
        usersList.push(userData);
        usersCount++;
    });
    return usersList;
}

const getUserList = (request, reply) => {
    if (!request.state.session) {
        reply().redirect('/login');
    } else if (!request.state.session.isAdmin) {
        const data = {
            message: '<div class="message">Cannot reach this page.</div>'
        }
        reply.view('saved.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(request.state.session.email, request.state.session.isAdmin),
        }, data});
    } else {
        mongoService.getAllUsers((users) => {
            const usersList = generateUsersList(users);
            reply.view('usersList.html', {htmlData: {
            head: htmlHead,
            navbar:  generateNavBar(request.state.session.email, request.state.session.isAdmin),
        }, usersList});
        });
    }

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
    changePasswordView,
    changePassword,
    getUserList,
    logout,
}