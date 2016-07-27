var express = require('express');
var shopifyRouter = express.Router();
var shopifyAPI = require('shopify-node-api');
var util = require('util');
var dbCollectionShopDetail = require('../models/dbShopDetail.js'); 


shopifyRouter.shop = "sofizarstore.myshopify.com";
shopifyRouter.shopifyAppKey = "ff0c02ef99d9efe2f480e2e375a9b0c3";
shopifyRouter.shopifySecretKey = "544c5073917ec58c840ab62f69e377fd";
shopifyRouter.shopifyScope = "write_products,read_orders,write_orders,read_products";
shopifyRouter.redirectUri = "https://herokushopifyapp.herokuapp.com/shopify/finish_auth";


shopifyRouter.config = {
    shop: shopifyRouter.shop, // MYSHOP.myshopify.com
    shopify_api_key: shopifyRouter.shopifyAppKey, // Your API key
    shopify_shared_secret: shopifyRouter.shopifySecretKey, // Your Shared Secret
    shopify_scope: shopifyRouter.shopifyScope,
    redirect_uri:shopifyRouter.redirectUri

};




/* GET users listing. */
shopifyRouter.get('/', function(req, res, next) {
    var Shopify = new shopifyAPI(shopifyRouter.config);
    var auth_url = Shopify.buildAuthURL();

// Assuming you are using the express framework
// you can redirect the user automatically like so
    res.redirect(auth_url);

});

shopifyRouter.get('/getProducts', function(req, res, next) {
    
    dbCollectionShopDetail.find({shop:shopifyRouter.shop},function(err, result) {
        
        var config = {};
        config['shop'] = shopifyRouter.config.shop;
        config['shopify_api_key'] = shopifyRouter.config.shopify_api_key;
        config['shopify_shared_secret'] = shopifyRouter.config.shopify_shared_secret;
        config['redirect_uri'] = shopifyRouter.config.redirect_uri;
        config['access_token'] = result[0].get("token");
        
        shopifyRouter.config['access_token'] = result[0].get("token"); 
    
        console.log('this.config.token :' + shopifyRouter.config['access_token']);
        var Shopify = new shopifyAPI(config);
        Shopify.get('/admin/products.json',function(err,result,header){
            res.send(JSON.stringify(result,undefined,2));
        });
    });

});


shopifyRouter.get('/finish_auth',function (req,res,next) {


    var Shopify = new shopifyAPI(shopifyRouter.config);
    var query_params = req.query;
    var clientStore = query_params['shop'];

 
    ////// Check Db for Access Token
dbCollectionShopDetail.find({shop:clientStore},function(err, result) {
        if (err) {
      console.log(err+ ' error');
    } else {
       console.log('result '+ result.length);
       
       
       if(result.length >0 && clientStore==result[0].get("shop")){
           try{
               
                console.log(" resultt[0]"+result[0].get("shop"));
                res.send(JSON.stringify(result,undefined,2));
           }catch(err){
               console.log(err);
           }
           
       }else{
           
            
            if (!Shopify.is_valid_signature(query_params,true)) {
                return callback(new Error("Signature is not authentic!"));
            }
        
            var postDate =
            {
                "client_id":shopifyRouter.shopifyAppKey,
                "client_secret":shopifyRouter.shopifySecretKey,
                "code":query_params["code"]
            };
        
            Shopify.post('/admin/oauth/access_token', postDate, function(err, data) {
                if(err) {
                    return console.log(err);
                }
                
                ////// Get token
                shopifyRouter.access_token = data.access_token;
                
                var doc = new dbCollectionShopDetail ({
                  shop: shopifyRouter.shop,
                  token: data.access_token
                });
                // Saving it to the database.
                doc.save(function (err) {if (err){ console.log ('Error on save!')}else{console.log('record saved')}});
                res.send(util.inspect(data));
                
            });
                   
            }

   
    }
    });  




    //var monkey = require('node-monkey');
    //monkey.attachConsole();

    //process.exit();

});

module.exports = shopifyRouter;
