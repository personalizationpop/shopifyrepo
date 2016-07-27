
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.body.plan1);
  res.send('i am in recurring');
});

router.post('/', function(req, res, next) {
  console.log(req.body.plan1);
  res.send('Form Submitted');
});

module.exports = router;
