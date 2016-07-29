var express = require('express');
var shopifyRouter = express.Router();
var shopifyAPI = require('shopify-node-api');
var util = require('util');
var dbCollectionShopDetail = require('../models/dbShopDetail.js');
var dbShopRecurringChargeDetail = require('../models/dbRecurringChargeDetail.js');


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

function getShopToken(shop,callback){
    console.log("shop :"+ shop);
    dbCollectionShopDetail.find({shop:shop},function(err,result){
        if(result.length>0){
            //console.log("found Store" + "shop:"+ result[0].get("shop")+ "token:"+ result[0].get("token"));
            shopifyRouter.shop = result[0].get("shop");
            shopifyRouter.config['access_token'] = result[0].get("token");
            callback(err,"found",result[0].get("token"));
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
        console.log("err : "+ util.inspect(err));
        console.log("status : "+ util.inspect(status));
        console.log("token : "+ util.inspect(token));
        if(err){ res.send("error while deleting resurring charge"); }else{
           if(status == "found"){
                var Shopify = new shopifyAPI(shopifyRouter.config);
                Shopify.delete('/admin/recurring_application_charges/'+req.body.deleteId+'.json',function(err,result,header){
                    if(err){console.log(err)}else{
                        res.send(JSON.stringify(result,undefined,2));
                    }
                });
           }
        }
    });
});

shopifyRouter.get('/createRecurringCharge',function(req, res, next){
    ///// When No REcurring Charge is Available
    //var name = req.body.name,price =req.body.price;

    /////// Assign a Recurring Charge to a Store ///////
        
    getShopToken(shopifyRouter.shop,function(err,status,token){
        if(err){ res.send("error while creating recurring charge"); }else{
            if(status == "found"){
                console.log("found in Charge");
                var name = "Sofizar Plan";
                var price = "100";
                ////// Here We Write the logic that which plan we want to assign this Store /////////////
                var postData ={
                          "recurring_application_charge": {
                            "name": name,
                            "price": price,
                            "return_url": "https://herokushopifyapp.herokuapp.com/shopify/activateRecurringCharge",
                            "test": true
                          }
                    };
                console.log("found token");
                //res.send(shopifyRouter.config);
                var Shopify = new shopifyAPI(shopifyRouter.config);
                Shopify.post('/admin/recurring_application_charges.json',postData,function(err,result,header){
                    /////Insert response into db //////////
                    // var recurringCharge = new dbShopRecurringChargeDetail(result);
                    // recurringCharge.save(function (err) {
                    //   if (err) {console.log(err);}else {console.log("New Recurring Charge Saved");}
                    // });
                    
                    // find Update or Insert
                    //res.send(err);
                    result['shop'] = shopifyRouter.shop;
                    dbShopRecurringChargeDetail.findOneAndUpdate( {shop:shopifyRouter.shop} , result , {upsert:true,new:true},function(err,doc){
                        //res.send(JSON.stringify(doc,undefined,2));
                        var recurringChargeDetail = doc.get("recurring_application_charge");
                        console.log("recDetail :" + util.inspect(recurringChargeDetail));
                        //console.log("doc['recurring_application_charge'].confirmation_url :" + doc['recurring_application_charge'].confirmation_url);
                        //res.send(JSON.stringify(result,undefined,2));
                        res.redirect(recurringChargeDetail.confirmation_url);
                    });
                });
            }
        }
    });
});

shopifyRouter.get('/activateRecurringCharge',function(req, res, next){
    
    //// Here we Activate Recurring Charge for the Shop
    res.send("Call Activate ,If Already Activate than move to Store Page");
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
    
    //var query_params = req.query;
    //var clientStore = query_params['shop'];
    ////// Check Db for Access Token
    getShopToken(shopifyRouter.shop,function(err,status,token){
        if (err) {
            console.log(' error'+err);
        } else {
            if(status == "not found"){
                delete shopifyRouter.config['access_token'];
                
                
//                 var newConfig = {
//     shop: shopifyRouter.shop, // MYSHOP.myshopify.com
//     shopify_api_key: shopifyRouter.shopifyAppKey, // Your API key
//     shopify_shared_secret: shopifyRouter.shopifySecretKey, // Your Shared Secret
//     shopify_scope: shopifyRouter.shopifyScope,
//     redirect_uri:shopifyRouter.redirectUri
// };
                var Shopify = new shopifyAPI(shopifyRouter.config);  
                var query_params = req.query;
                if (!Shopify.is_valid_signature(query_params,true)) {
                    console.log("Signature is not authentic!");
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
                        console.log("new access token :" + data.access_token);
                        ////// Set token
                        shopifyRouter.config['access_token'] = data.access_token;
                        
                        //// insert into Db ///////
                        var doc = new dbCollectionShopDetail ({
                          shop: shopifyRouter.shop,
                          token: data.access_token
                        });
                        // Saving it to the database.
                        doc.save(function (err) {if (err){ console.log ('Error on save!')}else{console.log('record saved')}});
                        res.redirect('./createRecurringCharge');
                        //res.send(util.inspect(data));
                    
                    });
                }else{
                    console.log("App Already Installed,Now we redirect to createRecurringCharge  ");
                    res.redirect('./createRecurringCharge');
                }
            }
    });  

    //var monkey = require('node-monkey');
    //monkey.attachConsole();

    //process.exit();

});

module.exports = shopifyRouter;
