var express = require('express');
var app = express()
var router = express.Router();
var _ = require('lodash')._;
var fs = require('fs');


app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

const DATA_PATH = '../data/'
const RESPONSE_PATH = DATA_PATH + '/responses/'
const KEYS_PATH = DATA_PATH + 'keys.json'

const { profiles, versionString } = require(DATA_PATH + 'data.json')
const keys = require(KEYS_PATH)
const stats = {
  diseases: 0,
  associations: 0,
  novel: 0,
  significant: 0,
  unique: 0,
  matched: 0,
};
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

console.log(versionString)

stats.unique = [...new Set(phens)].length;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Digital Phenotype Explorer', stats, versionString })
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
  res.render('disease', { title: 'Digital Phenotype Explorer: ' + d.label + ' ('+d.id+')', disease: d })
});
router.get('/review/:doid/:key', function(req, res, next) {
  if(!req.params.key) {
    return res.redirect('/disease/'+req.params.doid)
  }
  if(!_.has(keys, req.params.key)) {
    return res.render('error', { 'message': 'Key not recognised. If you believe this to be an error then contact us.', error: { 'status': 403, stack: '' }})
  }
  if(!_.has(profiles, req.params.doid)) {
    return res.render('error', { 'message': 'Disease not found', 'status': 404 })
  } 
  const d = profiles[req.params.doid]
  res.render('review', { title: 'Digital Phenotype Review: ' + d.label + ' ('+d.id+')', disease: d })
});

router.post('review/:doid/:key/save', function(req, res, next) {
  if(!_.has(keys, req.params.key)) {
    return res.render('error', { 'message': 'Disease not found', 'status': 403 })
  }
  fs.writeFile(RESPONSE_PATH + req.params.doid + '.json', JSON.stringify(req.body), (err) => {
      if(err) throw err;
    });
req.body
})


module.exports = router;
