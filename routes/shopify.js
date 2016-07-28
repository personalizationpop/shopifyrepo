var express = require('express');
var shopifyRouter = express.Router();
var shopifyAPI = require('shopify-node-api');
var util = require('util');
var dbCollectionShopDetail = require('../models/dbShopDetail.js');
var dbRecurringChargeDetail = require('../models/dbRecurringChargeDetail.js');


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

//dbRecurringChargeDetail.findOneAndUpdate( {shop:shop} , {shop:shop,token:shopifyRouter.config['access_token']} , {upsert:true,new:true},function(err,result){
    
function getShopToken(shop,callback){
    dbRecurringChargeDetail.findOne( {shop:shop},function(err,result){
        if(result.length>0){
            console.log("find/create");
            shopifyRouter.config['shop'] = result.get("shop");
            shopifyRouter.config['access_token'] = result.get("token");
            callback(err,"found",shopifyRouter.config['access_token']);
        }else{
            console.log("nothing");
            callback(err,"not found","");
        }
    });
}

/* Auth Process. */
shopifyRouter.get('/', function(req, res, next) {
    var Shopify = new shopifyAPI(shopifyRouter.config);
    var auth_url = Shopify.buildAuthURL();

// Assuming you are using the express framework
// you can redirect the user automatically like so
    res.redirect(auth_url);

});

shopifyRouter.post('/deleteRecurringCharge',function(req, res, next){
        getShopToken(shopifyRouter.shop,function(err,status,token){
            if(err){ res.send("error while deleting resurring charge"); }else{
               if(status == "found"){
                    var Shopify = new shopifyAPI(shopifyRouter.config);
                    Shopify.delete('/admin/recurring_application_charges/'+req.body.deleteId+'.json',function(err,result,header){
                        //res.send(JSON.stringify(result,undefined,2));
                        res.redirect('./getProducts');
                    }
               }
            }
        });
    });
});

shopifyRouter.post('/createRecurringCharge',function(req, res, next){
    var postData ={
              "recurring_application_charge": {
                "name": req.body.name,
                "price": req.body.price,
                "return_url": "https://herokushopifyapp.herokuapp.com",
                "test": true
              }
        };
        
    getShopToken(shopifyRouter.shop,function(err,status,token){
        if(err){ res.send("error while creating recurring charge"); }else{
            if(status == "found"){
                var Shopify = new shopifyAPI(shopifyRouter.config);
                Shopify.post('/admin/recurring_application_charges.json',postData,function(err,result,header){
                    /////Insert response into db //////////
                    var recurringCharge = new dbRecurringChargeDetail(result);
                    //save model to MongoDB
                    recurringCharge.save(function (err) {
                      if (err) {
                    		console.log(err);
                      }
                      else {
                      	console.log("New Recurring Charge Saved");
                      }
                    });
                    console.log("result['recurring_application_charge'].id :" + result['recurring_application_charge'].id);
                    res.send(JSON.stringify(result,undefined,2));
                    //res.redirect('./getProducts');
                });
            }
        }
    });
});

shopifyRouter.post('/deleteProduct',function(req,res,next){
    getShopToken(shopifyRouter.shop,function(err,status,token){
        if(err){ res.send("error while deleting product"); }else{
            if(status == "found"){
                var Shopify = new shopifyAPI(shopifyRouter.config);
                Shopify.delete('/admin/products/'+req.body.deleteId+'.json',function(err,result,header){
                    console.log('deletResult :' + result);
                    //res.send(JSON.stringify(result,undefined,2));
                    res.redirect('./getProducts');
                });
            }
        }
    });
});

shopifyRouter.post('/createProduct',function(req,res,next){
    
    var postData = {
        product: {
            title: req.body.title
        }
    };
    getShopToken(shopifyRouter.shop,function(err,status,token){
        if(err){ res.send("error while creating product"); }else{
            if(status == "found"){
                var Shopify = new shopifyAPI(shopifyRouter.config);
                Shopify.post('/admin/products.json',postData,function(err,result,header){
                    res.send(JSON.stringify(result,undefined,2));
                });
            }
        }
    });
});

shopifyRouter.get('/getProducts', function(req, res, next) {
    getShopToken(shopifyRouter.shop,function(err,status,token){
        if(err){ res.send("error while get Products"); }else{
            if(status == "found"){
                var Shopify = new shopifyAPI(shopifyRouter.config);
                Shopify.get('/admin/products.json',function(err,result,header){
                    res.send(JSON.stringify(result,undefined,2));
                });
            }
        }
    });
});

shopifyRouter.get('/getOrders', function(req, res, next) {
    getShopToken(shopifyRouter.shop,function(err,token){
        if(err){ res.send("error while getting Orders"); }else{
            if(status == "found"){
                var Shopify = new shopifyAPI(shopifyRouter.config);
                Shopify.get('/admin/orders.json',function(err,result,header){
                    res.send(JSON.stringify(result,undefined,2));
                });
            }
        }
    });
});

shopifyRouter.get('/finish_auth',function (req,res,next) {
    
    var query_params = req.query;
    var clientStore = query_params['shop'];
    ////// Check Db for Access Token
    getShopToken(shopifyRouter.shop,function(err,status,token){
        var Shopify = new shopifyAPI(shopifyRouter.config);  /// Now token is set in shopifyRouter.config['token']
        if (err) {
            console.log(' error'+err);
        } else {
            if(status == "not found"){
                if (!Shopify.is_valid_signature(query_params,true)) {
                    callback("Signature is not authentic!","");
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
                    
                        ////// Set token
                        shopifyRouter.config['access_token'] = data.access_token;
                        
                        //// insert into Db ///////
                        var doc = new dbCollectionShopDetail ({
                          shop: shopifyRouter.shop,
                          token: data.access_token
                        });
                        // Saving it to the database.
                        doc.save(function (err) {if (err){ console.log ('Error on save!')}else{console.log('record saved')}});
                        //res.send(util.inspect(data));
                    
                    });
                }
            }
    });  

    //var monkey = require('node-monkey');
    //monkey.attachConsole();

    //process.exit();

});

module.exports = shopifyRouter;
