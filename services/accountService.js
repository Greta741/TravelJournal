const mongoService = require('./mongoService.js');
const displayService = require('./displayService.js');
const hashService = require('./hashService.js');
const accountDataService = require('../dataService/accountDataService');

const loginView = (request, reply) => {
    const data = accountDataService.loginViewData(request.state.session);
    displayService.sendReplyView(reply, data);
};

const registerView = (request, reply) => {
    const data = accountDataService.registerViewData(request.state.session);
    displayService.sendReplyView(reply, data);
};

const login = (request, reply) => {
    mongoService.getPassword(request.payload.email, (user) => {
        hashService.checkMatch(request.payload.password, user.password, (result) => {
            const data = accountDataService.loginData(user, request.payload.password, request.payload.email, result);
            if (!data.redirectInfo) {
                displayService.sendReplyView(reply, data);
            } else {
                reply().redirect('/').state('session', data.redirectInfo);
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
            isAdmin: false,
            active: true,
            date_registered: new Date(),
        });
    });
    reply().redirect('/');
};

const register = (request, reply) => {
    mongoService.findEmail(request.payload.email, (result) => {
        const data = accountDataService.registerData(
            request.payload.name,
            request.payload.email,
            request.payload.password,
            request.payload.repeatPassword,
            result
        );
        if (data.canRegister) {
            registerUser(request, reply);
        } else {
            displayService.sendReplyView(reply, data);
        }
    });
};

const changePasswordView = (request, reply) => {
    const data = accountDataService.changePasswordViewData(request.state.session);
    if (data.redirect) {
        reply().redirect('/login');
    } else {
        displayService.sendReplyView(reply, data);
    }
};

const changePassword = (request, reply) => {
    let data = accountDataService.changePasswordData(request.payload.password, request.payload.repeatPassword)
    mongoService.getPassword(request.state.session.email, (user) => {
        if (user) {
            hashService.checkMatch(request.payload.oldPassword, user.password, (result) => {
                if (result && data.errorsCount === 0) {
                    hashService.hashString(request.payload.password, (hashedPassword) => {
                        mongoService.saveNewPassword(request.state.session.email, hashedPassword, () => {
                            data.message = '<div class="message">New password saved.</div>';
                            reply.view('saved.html', {htmlData: {
                                head: displayService.htmlHead,
                                navbar: displayService.generateNavBar(request.state.session.email, request.state.session.isAdmin),
                            }, data});
                        });
                    });
                } else {
                    if (!result) {
                        data.errors += 'Wrong password<br>';
                    }
                    data.errors += '</div>';
                    reply.view('changePassword.html', {htmlData: {
                        head: displayService.htmlHead,
                        navbar:  displayService.generateNavBar(request.state.session.email, request.state.session.isAdmin),
                    }, data});
                }
            });
        } else {
            reply().redirect('/login');
        }
    });  
};

const getUserList = (request, reply) => {
    const data = accountDataService.getUsersListData(request.state.session);
    if (data.redirect) {
        reply().redirect('/login');
    } else {
        if (data.isAdmin) {
            mongoService.getAllUsers((users) => {
                const usersList = accountDataService.generateUsersList(users)
                displayService.sendReplyView(reply, data, usersList);
            });
        } else {
            displayService.sendReplyView(reply, data);
        }
    }
};

const logout = (request, reply) => {
    reply().unstate('session').redirect('/');
};

const block = (request, reply) => {
    const data = accountDataService.blockUsersData(request.state.session);
    console.log(data);
    if (data.redirect) {
        reply.redirect('./login');
    }
    if (!request.state.session.isAdmin) {
        displayService.sendReplyView(reply, data);
    }
    mongoService.blockUser(request.payload.email, (result) => {
        console.log(result);
        reply(result);
    });
};

const unblock = (request, reply) => {
    const data = accountDataService.blockUsersData(request.state.session);
    if (data.redirect) {
        reply.redirect('./login');
    }
    if (!request.state.session.isAdmin) {
        displayService.sendReplyView(reply, data);
    }
    mongoService.unblockUser(request.payload.email, (result) => {
        reply(result);
    });
};

module.exports = {
    loginView,
    registerView,
    login,
    register,
    changePasswordView,
    changePassword,
    getUserList,
    logout,
    block,
    unblock,
}