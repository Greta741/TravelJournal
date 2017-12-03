const displayService = require('./services/displayService.js');
const accountService = require('./services/accountService.js');
const journeyService = require('./services/journeyService.js');
const sitemapService = require('./services/sitemapService.js');
const mongoDb = require('./services/mongoService.js');
const Hapi = require('hapi');
const Vision = require('vision');
const Inert = require('inert');

const someInvalidVar1 = 5;

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
    path: '/nextPage',
    handler: displayService.getNextPage,
});

server.route({
    method: 'GET',
    path: '/login',
    handler: accountService.loginView,
});

server.route({
    method: 'GET',
    path: '/register',
    handler: accountService.registerView,
});

server.route({
    method: 'POST',
    path: '/login',
    handler: accountService.login,
});

server.route({
    method: 'GET',
    path: '/logout',
    handler: accountService.logout,
});

server.route({
    method: 'POST',
    path: '/register',
    handler: accountService.register,
});

server.route({
    method: 'GET',
    path: '/changePassword',
    handler: accountService.changePasswordView,
});

server.route({
    method: 'POST',
    path: '/changePassword',
    handler: accountService.changePassword,
});

server.route({
    method: 'GET',
    path: '/users',
    handler: accountService.getUserList,
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

server.route({
    method: 'GET',
    path: '/remove/{id}',
    handler: journeyService.deleteJourney,
});

server.route({
    method: 'GET',
    path: '/editJourney/{id}',
    handler: journeyService.editJourneyView,
});

server.route({
    method: 'POST',
    path: '/editJourney',
    handler: journeyService.editJourney,
});

server.route({
    method: 'GET',
    path: '/journey/{id}',
    handler: journeyService.journeyView,
});

server.route({
    method: 'POST',
    path: '/block',
    handler: accountService.block,
});

server.route({
    method: 'POST',
    path: '/unblock',
    handler: accountService.unblock,
});

server.route({
    method: 'GET',
    path: '/myJourneys',
    handler: displayService.myJourneysView,
});

server.route({
    method: 'GET',
    path: '/userJourneysNextPage',
    handler: displayService.getMyJourneysNextPage,
});

server.route({
    method: 'GET',
    path: '/search',
    handler: displayService.search,
});

server.route({
    method: 'GET',
    path: '/nextSearchPage',
    handler: displayService.getNextSearchPage,
});

server.route({
    method: 'GET',
    path: '/sitemap.xml',
    handler: (request, reply) => {
        reply.file('sitemap.xml');
    },
});

mongoDb.mongoConnect(() => {});
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
