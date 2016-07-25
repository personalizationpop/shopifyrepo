var express = require('express');
var shopifyRouter = express.Router();
var shopifyAPI = require('shopify-node-api');
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

    //res.send('Shopiy Page');
});


shopifyRouter.get('/finish_auth',function (req,res,next) {


    //var Shopify = new shopifyAPI(config); // You need to pass in your config here
    var query_params = req.query;
    console.log(query_params);
    console.log(req.query.code);
    Shopify.exchange_temporary_token(query_params, function(err, data){
        // This will return successful if the request was authentic from Shopify
        // Otherwise err will be non-null.
        // The module will automatically update your config with the new access token
        // It is also available here as data['access_token']
        res.send("Everything Good"+data['access_token']);
    });


});

module.exports = shopifyRouter;