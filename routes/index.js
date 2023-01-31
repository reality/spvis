var express = require('express');
var app = express()
var router = express.Router();
var _ = require('lodash')._;

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

const profiles = require('../data/data.json')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Social Media Digital Phenotype' });
});

router.get('/search/:label', function(req, res, next) {
  const result = _.filter(profiles, (p) => {
    return p.label.match(req.params.label);
  });

  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(result));
})

router.get('/disease/:doid', function(req, res, next) {
  if(!_.has(profiles, req.params.doid)) {
    return res.render('error', { 'message': 'Disease not found', 'status': 404 })
  } 
  const d = profiles[req.params.doid]
  res.render('disease', { title: 'Social Media Digital Phenotype: ' + d.label + '('+d.id+')', disease: d })
});

module.exports = router;
