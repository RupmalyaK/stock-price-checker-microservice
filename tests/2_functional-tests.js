/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.likes , 0 , "goog should have 0 like");  
          
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog',
               like:true})
        .end(function(err, res){
          
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.likes , 1 , "goog should have 1 like");  
          
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog',
               like:true})
        .end(function(err, res){
          
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.likes , 1 , "good should still have 1 like");  
          
          done();
        });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['infy','msft']})
        .end(function(err, res){
          
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].likes , 0 , "infy should have 0 like");  
          assert.equal(res.body.stockData[0].likes , 0 , "msft should have 0 like"); 
          
          done();
        });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['infy','msft'] , "like":true})
        .end(function(err, res){
          
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].likes , 1 ,  "infy should have 1 like");  
          assert.equal(res.body.stockData[0].likes , 1 ,"msft should have 1 like"); 
          
          done();
        });
      });
      
    });

});
