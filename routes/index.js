var express = require('express');
var router = express.Router();

const profiles = require('data/data.json')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Social Media Digital Phenotype' });
});

router.get('/search', function(req, res, next) {

  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(result));
})

router.get('/disease/:doid', function(req, res, next) {
  if(!profiles.containsKey(req.params.doid)) {
    return res.render('error', { 'message': 'Disease not found', 'status': 404 })
  } 
  
  const d = profiles[req.params.doid]
  res.render('disease', { title: 'Social Media Digital Phenotype: ' + d.label, disease: d })
)};

module.exports = router;
