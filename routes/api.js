/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const StockHandler = require("../controllers/stockHandler");



module.exports = (app , db) =>  {
  const stockHandler = new StockHandler(db , "test8");
  
  app.route("/api/stock-prices")
    .get((req, res) => {
     
      const stock = req.query.stock;
      const like = req.query.like || false;
      const ip = req.ip; 
     
      //if stock is not an array and no like passed
      if(!Array.isArray(stock))
        {
             
            stockHandler.process(stock , ip , like)
            .then(doc => {
            if (doc === "unknown stock" || doc === "something went wrong")
            {
              res.status(400).json({doc});
              return;
            }
            res.status(200).json({"stockData":doc});   
            })
            .catch(err => console.log(err));
        }
    else{
      const retArray = []; 
      stockHandler.process(stock[0] , ip , like)
      .then(doc => {
        if (doc === "unknown stock" || doc === "something went wrong")
            {
              res.status(400).json(doc);
              return;
            }
        retArray.push(doc);
        stockHandler.process(stock[1] , ip , like)
        .then((doc2) => {
          if (doc2 === "unknown stock" || doc2 === "something went wrong")
            {
              res.status(400).json(doc);
              return;
            }
          retArray.push(doc2);
          res.status(200).json({"stockData":retArray}); 
        })
      })
      .catch(err => console.log(err));
    }
    
    });
    
};
