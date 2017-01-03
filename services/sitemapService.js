const mongoService = require('./mongoService.js');
const CronJob = require('cron').CronJob;
const fs = require('fs');

const generateSitemap = () => {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    sitemap += '<url><loc>http:travel5.herokuapp.com/</loc></url>';
    mongoService.getAllJourneysId((result) => {
        result.forEach((item) => {
            sitemap += `<url><loc>http:travel5.herokuapp.com/journey/${item._id}</loc></url>`;
        });
        sitemap += '</urlset>';
        fs.writeFile("sitemap.xml", sitemap); 
    });
};

const updateSitemap = new CronJob('00 00 * * * *', () => {
    generateSitemap();
}, null, true, 'America/Los_Angeles');

module.exports = {
    updateSitemap,
};
