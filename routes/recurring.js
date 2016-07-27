
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




module.exports = router;
