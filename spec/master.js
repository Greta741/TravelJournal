var path = require('path');
var expect = require('chai').expect;

var master = require(path.join(__dirname, '..', './master.js'));

describe('master()', function () {
  'use strict';

  it('exists', function () {
    expect(master).to.be.a('function');

  });

  it('does something', function () {
    expect(true).to.equal(false);
  });

  it('does something else', function () {
    expect(true).to.equal(false);
  });

  // Add more assertions here
});
