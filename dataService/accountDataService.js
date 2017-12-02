const loginViewData = (session) => {
    let data = {
        email: '<input type="text" id="email" name="email" class="form-control input-sm" required="true" value="">'
    };
    if (session) {
        data.message = '<div class="message">You are already logged in.</div>';
        data.replyView = 'saved.html';
        data.userEmail = session.email;
        data.isAdmin = session.isAdmin;
    } else {
        data.replyView = 'login.html';
        data.userEmail = false
        data.isAdmin = false;
    }
    return data;
};

const registerViewData = (session) => {
    let data = {
        name: '<input type="text" id="name" name="name" class="form-control input-sm" required="true" value="">',
        email: '<input type="email" id="email" name="email" class="form-control input-sm" required="true" value="">',
    };
    if (session) {
        data.message = '<div class="message">You are already logged in.</div>';
        data.replyView = 'saved.html';
        data.userEmail = session.email;
        data.isAdmin = session.isAdmin;
    } else {
        data.replyView = 'register.html';
        data.userEmail = false;
        data.isAdmin = false;
    }
    return data;
};

const loginData = (user, password, email, passwordMatch) => {
    let data = {
        email: '<input type="text" id="email" name="email" class="form-control input-sm" required="true"' +
        'value="' + email + '">',
        errors: '',
    };
    if (!user.active) {
        data.message = '<div class="message">This user is blocked.</div>';
        data.replyView = 'saved.html';
        data.userEmail = false;
        data.isAdmin = false;
        return data;
    }
    if (user && passwordMatch) {
        data.redirectInfo = {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        }
        return data;
    }
    data.errors = '<div class="error">Wrong email or password</div>';
    data.replyView = 'login.html';
    data.userEmail = false;
    data.isAdmin = false;
    return data;
};

const registerData = (name, email, password, repeatPassword, duplicateEmail) => {
    let errorsCount = 0;
    let data = {
        name: '<input type="text" id="name" name="name" class="form-control input-sm" required="true" value="' +
        name + '">',
        email: '<input type="email" id="email" name="email" class="form-control input-sm" required="true" value="' +
        email + '">',
        errors: '',
    };
    data.errors += '<div class="error">';

    if (!name.match(/^[0-9a-zA-Z]+$/)) {
        data.errors += 'Name can only contain letters and numbers<br>';
        errorsCount++;
    }

    if (password !== repeatPassword) {
        data.errors += 'Passwords does not match<br>';
        errorsCount++;
    }
    if (name.length < 3) {
        data.errors += 'Name is too short<br>';
        errorsCount++;
    }
    if (password.length < 5) {
        data.errors += 'Password is too short<br>';
        errorsCount++;
    }
    if (!duplicateEmail) {
        data.errors += 'Email already exists<br>';
        errorsCount++;
    }
    data.errors += '</div>';
    if (errorsCount === 0){
        data.canRegister = true;
    } else {
        data.canRegister = false;
        data.replyView = 'register.html';
        data.userEmail = false;
        data.isAdmin = false;
    }
    return data;
};

const changePasswordViewData = (session) => {
    let data = {};
    if (session) {
        data = {
            replyView: 'changePassword.html',
            userEmail: session.email,
            isAdmin: session.isAdmin,
            redirect: false
        }
    } else {
        data.redirect = true;
    }
    return data;
};

const changePasswordData = (password, repeatPassword) => {
    let data = {
        errors: '<div class="error">',
        errorsCount: 0
    };
    if (password !== repeatPassword) {
        data.errors += 'Passwords does not match<br>';
        data.errorsCount++;
    }
    if (password.length < 5) {
        data.errors += 'Password is too short<br>';
        data.errorsCount++;
    }
    return data
};

const generateUsersList = (users) => {
    let usersList = [];
    let usersCount = 1;
    users.forEach((user) =>{
        let userData = '';
        userData += `<tr><td>${usersCount}</td>` +
            `<td>${user.name}</td>` +
            `<td>${user.email}</td>`;
        if (user.active) {
            userData +=  `<td class="user-table" id="user-${usersCount}" onclick="block('${user.email}', 'user-${usersCount}')">Block</td>`;
        } else {
            userData +=  `<td class="user-table"  id="user-${usersCount}" onclick="unblock('${user.email}', 'user-${usersCount}')">Unblock</td>`;
        }
        userData += '</tr>';
        usersList.push(userData);
        usersCount++;
    });
    return usersList;
};

const getUsersListData = (session) => {
    const data = {};
    if (!session) {
        data.redirect = true;
        return data;
    } else if (!session.isAdmin) {
        data.message  = '<div class="message">Cannot reach this page.</div>';
        data.replyView = 'saved.html';
        data.userEmail = session.email;
        data.isAdmin = session.isAdmin;
        data.redirect = false;
        return data;
    } else {
        data.replyView = 'usersList.html';
        data.userEmail = session.email;
        data.isAdmin = session.isAdmin;
        data.redirect = false;
        return data;
    }
};

const blockUsersData = (session) => {
    const data = {
        redirect: false
    };
    if (!session) {
        data.redirect = true;
        return data;
    }
    if (!session.isAdmin) {
        data.message = `<div class="message">Access denied.</div>`;
        data.replyView = 'saved.html';
        data.userEmail = session.email;
        data.isAdmin = session.isAdmin;
        data.redirect = false;
    }
    return data;
};

module.exports = {
    loginViewData,
    registerViewData,
    loginData,
    registerData,
    changePasswordViewData,
    changePasswordData,
    generateUsersList,
    getUsersListData,
    blockUsersData,
}