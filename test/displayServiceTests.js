const expect = require('chai').expect;
const displayService = require('../services/displayService');

describe('displayService.ts', () => {
    it('Should generate nav bar', () => {
        const actual = displayService.generateNavBar(true, true);
        expect(actual).to.be.a('string');
    });

    it('Should generate nav bar', () => {
        const actual = displayService.generateNavBar(false, false);
        expect(actual).to.be.a('string');
    });

    it('Should not format journeys', () => {
        const actual = displayService.formatJourneys(null, false);
        expect(actual).to.equal(false);
    });

    it('Should format journeys', () => {
        const data = [
            {
                image: 'false',
                _id: '1',
            },
            {
                image: 'test image',
                _id: '2'
            }
        ];
        const actual = displayService.formatJourneys(data, false);
        expect(actual).to.be.an('array');
    });

    it('Should format journeys for edit', () => {
        const data = [
            {
                image: 'false',
                _id: '1',
            },
            {
                image: 'test image',
                _id: '2'
            }
        ];
        const actual = displayService.formatJourneys(data, true);
        expect(actual).to.be.an('array');
    });
});