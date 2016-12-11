const mongoService = require('./mongoService.js');
const displayService = require('./displayService.js');

const newJourneyView = (request, reply) => {
    // ar prisijungęs
    reply.view('./journey/create.html', {htmlData: {
            head: displayService.htmlHead,
            navbar:  displayService.generateNavBar(false, false)},
        });

};

const newJourney = (request, reply) => {
    // ar prisijungęs
    console.log(request.payload);
    reply(true);
};

module.exports = {
    newJourneyView,
    newJourney,
}