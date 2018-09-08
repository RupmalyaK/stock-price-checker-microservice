"use strict"

const https = require("https"); 


module.exports = function (db , collectionName)
{

  this.fetchStock = (stockName) => {
  
      const url = "https://api.iextrading.com/1.0/stock/" + stockName + "/quote";

      return new Promise((resolve,reject) => {
          https.get(url , res => {

                const stockObj = {};
                stockObj.stock = stockName; 
                res.setEncoding('utf8');  
                res.on('data', (chunk) => { 
                        if(chunk === "Unknown symbol" || chunk === "Not Found")
                        {
                          resolve(null);
                          return; 
                        }
                        const respBody = JSON.parse(chunk);   
                        stockObj.price = respBody.latestPrice; 
                        resolve(stockObj);  
                    });
                });
            });
      }
  
 this.findAndUpdate = (stockName , ip) => {
 

   return new Promise((resolve,reject) => {
     
   if(!ip)  
   {
     db.collection(collectionName).findOne({"stock":stockName})
     .then(doc => {
      if(!doc)
      {
        resolve(null);
        return;
      }
     resolve(doc);  
     })
     .catch(err => reject(err));
   }
   else {
    
       db.collection(collectionName).findAndModify({"stock":stockName} , [] ,  {"$push":{"likes":ip}} , {"new":true} , {"upsert":true})
       .then(doc => {
         resolve(doc.value); 
         return; 
       })
       .catch(err => reject(err));
   }  
    
 }); 
 }
 
 this.insert = (doc) => {
 return new Promise((resolve , reject) => {
 db.collection(collectionName).insertOne(doc)
  .then(doc => resolve(doc.ops[0]))
  .catch(err => reject(err)); 
 });
 }
 
 this.checkLikesIP = (ip , likesArray) =>
  {
   return new Promise((resolve , reject) => {
   
     let ele = 0; 
     while(ele < likesArray.length)
     {
       if (likesArray[ele] === ip)
       {
         resolve(true);
         return;
       }
       ele++;
     }
     resolve(false); 
   });
  }
 
 this.findOne = (stockName) => {
  return new Promise((resolve , reject) => {
  db.collection(collectionName).findOne({"stock":stockName})
  .then(doc => resolve(doc))
  .catch(err => reject(err)); 
  });
 }
 
 this.process = (stockName , ip , like) => {
        return new Promise ((resolve , reject) => {
            this.fetchStock(stockName)
            .then(doc => {
                //could not find the stock using the external API  
                if (doc === null)
                {
                  resolve("unknown stock");
                  return; 
                }
                //stock found in the external API

                //if like is passed by the user as query
                if (like)
                {
                  //Check to see if this stock exist in our DB
                  this.findOne(stockName)
                    .then(docDB => {
                      //if this stock does not exist in our DB
                      if (!docDB)
                      {  
                        doc.likes = [ip];
                        this.insert(doc);
                        resolve({
                        "stock":doc.stock,
                        "price":doc.price,
                        "likes":1 
                        });
                        return; 
                      } 
                    //if this stock does exist in our DB
                    //To Check if this stock has already been liked with this IP
                    this.checkLikesIP(ip , docDB.likes)
                    .then(isLiked => { 
                    //if this stock has already been liked with this IP
                      if(isLiked)
                      {
                        resolve({
                        "stock":doc.stock,
                        "price":doc.price,
                        "likes":docDB.likes.length  
                        });
                        return; 
                      }
                    //if this stock is not liked with this IP
                     this.findAndUpdate(stockName , ip)
                     .then((ret) => {
                         if (!ret)
                         {
                           resolve("something went wrong");
                           return; 
                         }
                       resolve({
                       "stock":doc.stock,
                       "price":doc.price,
                       "likes":docDB.likes.length+1  
                       });
                       return; 
                     })
                    })
                  }) 
                  return; 
                }  
                //if liked not passed
                this.findOne(stockName)
                .then((docDB) => {
                  //if stock is in DB
                  if(docDB)
                  {  
                    resolve({
                    "stock":doc.stock,
                    "price":doc.price,
                    "likes":docDB.likes.length 
                    });
                    return; 
                  }
                 //if stock is not in DB
                  resolve({
                  "stock":doc.stock,
                  "price":doc.price,
                  "likes":0 
                  });
                  return; 
                })
          })
            .catch(err => reject(err)); 
   
        });   

 }
 
}

