const expect = require('chai').expect;
const accountDataService = require('../dataService/accountDataService');

describe('accountDataService.ts', () => {
    it('Should generate html data for login view', () => {
        const data = {
            email: 'test@mail.com',
            isAdmin: false
        };
        const actual = accountDataService.loginViewData(data);
        expect(actual).to.have.all.keys(['message', 'replyView', 'userEmail', 'isAdmin', 'email']);
    });

    it('Should generate html data for login view', () => {
        const actual = accountDataService.loginViewData(null);
        expect(actual).to.have.all.keys(['replyView', 'userEmail', 'isAdmin', 'email']);
    });

    it('Should generate html data for register view', () => {
        const data = {
            email: 'test@mail.com',
            isAdmin: false
        };
        const actual = accountDataService.registerViewData(data);
        expect(actual).to.have.all.keys(['message', 'replyView', 'userEmail', 'isAdmin', 'email', 'name']);
    });

    it('Should generate html data for register view', () => {
        const actual = accountDataService.registerViewData(null);
        expect(actual).to.have.all.keys(['replyView', 'userEmail', 'isAdmin', 'email', 'name']);
    });

    it('Should generate html data for successful login', () => {
        const user = {
            _id: 1,
            name: 'test',
            email: 'test@mail.com',
            isAdmin: false,
            active: true
        };
        const actual = accountDataService.loginData(user, 'testPassword', 'test@mail.com', true);
        expect(actual).to.have.all.keys(['email', 'errors', 'redirectInfo']);
    });

    it('Should generate html data for blocked user login', () => {
        const user = {
            _id: 1,
            name: 'test',
            email: 'test@mail.com',
            isAdmin: false,
            active: false
        };
        const actual = accountDataService.loginData(user, 'testPassword', 'test@mail.com', true);
        expect(actual).to.have.all.keys(['email', 'errors', 'message', 'replyView', 'userEmail', 'isAdmin']);
    });

    it('Should generate html data for failed login', () => {
        const user = {
            _id: 1,
            name: 'test',
            email: 'test@mail.com',
            isAdmin: false,
            active: true
        };
        const actual = accountDataService.loginData(user, 'testPassword', 'test@mail.com', false);
        expect(actual).to.have.all.keys(['email', 'errors', 'replyView', 'userEmail', 'isAdmin']);
    });

    it('Should generate html data for successful register', () => {
        const actual = accountDataService.registerData('test', 'test@mail.com', 'password', 'password', true);
        expect(actual).to.have.all.keys(['name', 'email', 'errors', 'canRegister']);
    });

    it('Should generate html data for failed register', () => {
        const actual = accountDataService.registerData('t*', 'test@mail.com', 'pass', 'password1', false);
        expect(actual).to.have.all.keys(['name', 'email', 'errors', 'canRegister', 'replyView', 'userEmail', 'isAdmin']);
    });

    it('Should generate html data for change password view', () => {
        const data = {
            email: 'test@mail.com',
            isAdmin: false
        };
        const expected = {
            replyView: 'changePassword.html',
            userEmail: 'test@mail.com',
            isAdmin: false,
            redirect: false
        };
        const actual = accountDataService.changePasswordViewData(data);
        expect(actual).to.deep.equal(expected)
    });

    it('Should generate html data for change password view', () => {
        const expected = {
            redirect: true
        };
        const actual = accountDataService.changePasswordViewData(null);
        expect(actual).to.deep.equal(expected)
    });

    it('Should generate html data for successful change password', () => {
        const expected = {
            errors: '<div class="error">',
            errorsCount: 0
        };
        const actual = accountDataService.changePasswordData('password', 'password');
        expect(actual).to.deep.equal(expected)
    });

    it('Should generate html data for failed change password', () => {
        const actual = accountDataService.changePasswordData('pass', 'password');
        expect(actual).to.have.all.keys(['errors', 'errorsCount']);
    });

    it('Should generate html data for users list', () => {
        const data = [
            {
                name: 'test1',
                email: 'test1@mail.com',
                active: true
            },
            {
                name: 'test2',
                email: 'test2@mail.com',
                active: false
            }
        ];
        const actual = accountDataService.generateUsersList(data);
        expect(actual).to.be.an('array');
    });

    it('Should generate html data for users list view admin', () => {
        const data = {
            email: 'test@mail.com',
            isAdmin: true
        };
        const expected = {
            replyView: 'usersList.html',
            userEmail: 'test@mail.com',
            isAdmin: true,
            redirect: false
        };
        const actual = accountDataService.getUsersListData(data);
        expect(actual).to.deep.equal(expected);
    });

    it('Should generate html data for users list view not admin', () => {
        const data = {
            email: 'test@mail.com',
            isAdmin: false
        };
        const expected = {
            message: '<div class="message">Cannot reach this page.</div>',
            replyView: 'saved.html',
            userEmail: 'test@mail.com',
            isAdmin: false,
            redirect: false
        };
        const actual = accountDataService.getUsersListData(data);
        expect(actual).to.deep.equal(expected);
    });

    it('Should generate html data for users list view when not logged in', () => {
        const expected = {
            redirect: true
        };
        const actual = accountDataService.getUsersListData(null);
        expect(actual).to.deep.equal(expected);
    });

    it('Should generate html data for block users not admin ', () => {
        const data = {
            email: 'test@mail.com',
            isAdmin: false
        };
        const expected = {
            message: '<div class="message">Access denied.</div>',
            replyView: 'saved.html',
            userEmail: 'test@mail.com',
            isAdmin: false,
            redirect: false
        };
        const actual = accountDataService.blockUsersData(data);
        expect(actual).to.deep.equal(expected);
    });

    it('Should generate html data for block users not logged in ', () => {
        const expected = {
            redirect: true
        };
        const actual = accountDataService.blockUsersData(null);
        expect(actual).to.deep.equal(expected);
    });
});