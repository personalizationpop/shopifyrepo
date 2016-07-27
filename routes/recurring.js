
var express = require('express');
var shopify = require('./shopify');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.body.plan1);
  res.send('i am in recurring');
});

router.post('/createPlan', function(req, res, next) {
  console.log('req: '+ req.body.plan1);
  res.send('Form Submitted');
});

router.post('/createProduct', function(req, res, next) {
  var shopifyApi = shopify.createApiCall();
  res.send('Form Submitted');
});

router.get('/getProducts', function(req, res, next) {
  var shopifyApi = shopify.createApiCall();
  
  shopifyApi.get('/admin/products.json',function(err,data,header){
    if(err){
      console.log(err);
    }else{
      res.send(JSON.stringify(data));
    }
  });
  
});


module.exports = router;
