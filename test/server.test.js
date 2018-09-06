'use strict';

const chai = require('chai');
const chaiHTTP = require('chai-http');

const { app, runServer } = require('../server');

const expect = chai.expect;

chai.use(chaiHTTP);

// describe('Reality Check', () => {
//   it('true should be true', () => {
//     expect(true).to.be.true;
//   });

//   it('2 + 2 should equal 4', () => {
//     expect(2 + 2).to.equal(4);
//   });

// });

// describe('Environment', () => {

//   it('NODE_ENV should be "test"', () => {
//     expect(process.env.NODE_ENV).to.equal('test');
//   });

// });

describe('ExpressJS', () => {

  it('GET request "/" should work', () => {
    runServer();
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

});