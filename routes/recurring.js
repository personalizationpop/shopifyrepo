
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(request.body.plan1);
  res.send('i am in recurring');
});

module.exports = router;
