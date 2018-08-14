// tests/part1/cart-summary-test.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var route = require('../server/routes/content.js').Route;
var httpMocks = require('node-mocks-http');
const _ = require('ramda');
describe('Content Route', function () {
  //Route.latestItems);
  //app.route("/content/websearch").get(Route.websearch);
  it('testing content routes against the db', function () {
    var request = httpMocks.createRequest({
      method: 'GET',
      url: '/content/latestItems/1',
      params: {
        index: 1
      }
    });
    var response = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter
    });
    response.on('end', function () {
      let result   =   JSON.parse(response._getData());     
      expect(result.history).to.n;
    });
    route.latestItems(request, response);
  });
});