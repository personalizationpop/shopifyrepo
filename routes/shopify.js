var express = require('express');
var shopifyRouter = express.Router();
var shopifyAPI = require('shopify-node-api');
var util = require('util');
var dbCollectionShopDetail = require('../models/dbShopDetail.js'); 


var shop = "sofizarstore.myshopify.com";
var shopifyAppKey = "ff0c02ef99d9efe2f480e2e375a9b0c3";
var shopifySecretKey = "544c5073917ec58c840ab62f69e377fd";
var shopifyScope = "write_products,read_orders,write_orders,read_products";
var redirectUri = "https://herokushopifyapp.herokuapp.com/shopify/finish_auth";

var config = {
    shop: shop, // MYSHOP.myshopify.com
    shopify_api_key: shopifyAppKey, // Your API key
    shopify_shared_secret: shopifySecretKey, // Your Shared Secret
    shopify_scope: shopifyScope,
    redirect_uri:redirectUri

};

var Shopify = new shopifyAPI(config);

/* GET users listing. */
shopifyRouter.get('/', function(req, res, next) {

    var auth_url = Shopify.buildAuthURL();

// Assuming you are using the express framework
// you can redirect the user automatically like so
    res.redirect(auth_url);

});


shopifyRouter.get('/finish_auth',function (req,res,next) {

console.log('Hello');
    //var Shopify = new shopifyAPI(config), // You need to pass in your config here
    
    var query_params = req.query;
    var sh = query_params['shop'];

 
    
dbCollectionShopDetail.find({shop:shop},function(err, result) {
        if (err) {
      console.log(err+ ' error');
    } else {
       console.log('result '+ result.length);
       
       var resString = JSON.parse(result);
       
        console.log('resString : '+ resString[0]);
   
       //res.send(resString[0]);
   
    }
    });  



    ////// Check Db for Access Token


    //res.send("Hello India");


    //var monkey = require('node-monkey');
    //monkey.attachConsole();

    //process.exit();

    /*
    if (!Shopify.is_valid_signature(query_params,true)) {
        return callback(new Error("Signature is not authentic!"));
    }

    var postDate =
    {
        "client_id":shopifyAppKey,
        "client_secret":shopifySecretKey,
        "code":query_params["code"]
    };

    Shopify.post('/admin/oauth/access_token', postDate, function(err, data) {
        if(err) {
            return console.log(err);
        }
        
        var doc = new dbCollectionShopDetail ({
          shop: shop,
          token: data.access_token
        });
        // Saving it to the database.
        doc.save(function (err) {if (err){ console.log ('Error on save!')}else{console.log('record saved')}});
        res.send(util.inspect(data));
        
    });*/


});

module.exports = shopifyRouter;
