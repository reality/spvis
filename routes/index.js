var express = require('express');
var app = express()
var router = express.Router();
var _ = require('lodash')._;

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

const profiles = require('../data/data.json')
const stats = {
  diseases: 0,
  associations: 0,
  novel: 0,
  significant: 0,
  unique: 0,
  matched: 0,
};
console.log(stats)
var phens = []
_.each(profiles, (v, k) => {
  stats.diseases++;
  if(Object.keys(v.bldp).length > 0) {
    stats.matched++;
  } 

  _.each(v.smdp, (vv, kk) => {
    stats.associations++;
    phens.push(kk)
    if(vv.significant) {
      stats.significant++;
    }
    if(vv.novel) {
      stats.novel++;
    }
  });
});

stats.unique = [...new Set(phens)].length;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Social Media Digital Phenotype', stats })
});

router.get('/search/:label', function(req, res, next) {
  const result = _.filter(profiles, (p) => {
    return req.params.label == '*' ? true : p.label && p.label.match(req.params.label)
  })

  var picked = []
  _.each(result, (v, k) => {
    picked.push({ 'id': v.id, 'label': v.label })
  })

  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(picked));
})

router.get('/disease/:doid', function(req, res, next) {
  if(!_.has(profiles, req.params.doid)) {
    return res.render('error', { 'message': 'Disease not found', 'status': 404 })
  } 
  const d = profiles[req.params.doid]
  res.render('disease', { title: 'Social Media Digital Phenotype: ' + d.label + ' ('+d.id+')', disease: d })
});

module.exports = router;
