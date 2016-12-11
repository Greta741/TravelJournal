const displayService = require('./services/displayService.js');
const journeyService = require('./services/journeyService.js');
const mongoDb = require('./services/mongoService.js');
const Hapi = require('hapi');
const Vision = require('vision');
const Inert = require('inert');

const server = new Hapi.Server();

server.connection({
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 3000,
});

server.register(Vision, () => {});
server.register(Inert, () => {});

server.views({
    path: './templates',
    engines: {
        html: require('handlebars'),
    },
});

server.state('session', {
    ttl: 24 * 60 * 60 * 1000,
    isSecure: false,
    path: '/',
    encoding: 'base64json'
});

server.route({
    method: 'GET',
    path: '/public/{path*}',
    handler: {
        directory: {
            path: './public',
            listing: false,
            index: false,
        },
    },
});

server.route({
    method: 'GET',
    path: '/',
    handler: displayService.getMainPage,
});

server.route({
    method: 'GET',
    path: '/login',
    handler: displayService.loginView,
});

server.route({
    method: 'GET',
    path: '/register',
    handler: displayService.registerView,
});

server.route({
    method: 'POST',
    path: '/login',
    handler: displayService.login,
});

server.route({
    method: 'GET',
    path: '/logout',
    handler: displayService.logout,
});

server.route({
    method: 'POST',
    path: '/register',
    handler: displayService.register,
});

server.route({
    method: 'GET',
    path: '/changePassword',
    handler: displayService.changePasswordView,
});

server.route({
    method: 'POST',
    path: '/changePassword',
    handler: displayService.changePassword,
});

server.route({
    method: 'GET',
    path: '/users',
    handler: displayService.getUserList,
});




server.route({
    method: 'GET',
    path: '/newJourney',
    handler: journeyService.newJourneyView,
});

server.route({
    method: 'POST',
    path: '/newJourney',
    handler: journeyService.newJourney,
});


mongoDb.mongoConnect(() => {});
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
