var express = require('express');
var app = express()
var router = express.Router();
var _ = require('lodash')._;
var fs = require('fs');
const path = require('path');

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

const DATA_PATH = '../data/'
const RESPONSE_PATH = 'data/responses/'
const KEYS_PATH = DATA_PATH + 'keys.json'

const responses = {};
//try {
fs.readdirSync(RESPONSE_PATH).forEach(filename => {
  if(filename.endsWith('.json')) {
    const filePath = path.join(RESPONSE_PATH, filename);
    const rawData = fs.readFileSync(filePath);
    const data = JSON.parse(rawData);
    const key = filename.slice(0, -5); // Remove the ".json" extension
    responses[key] = data;
  }
});
//} catch(e) { console.log('nothing in responses'); }

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
    return res.render('error', { 'message': 'Disease not found', error: {'status': 404} })
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
    return res.render('error', { 'message': 'Disease not found', error: {'status': 404} })
  } 

  const id = req.params.key + '_' + req.params.doid;
  var resp = {}
  console.log(responses)
  if(_.has(responses, id)) {
    resp = responses[id];
  }

  const d = profiles[req.params.doid]
  res.render('review', { title: 'Digital Phenotype Review: ' + d.label + ' ('+d.id+')', disease: d, progress: resp })
});

router.post('/review/:doid/:key/update', function(req, res, next) {
  if(!_.has(keys, req.params.key)) {
    return res.render('error', { 'message': 'Disease not found', error: {'status': 403} })
  }

  const id = req.params.key + '_' + req.params.doid;

  var version = 0
  if(_.has(responses[id])) {
    version = responses[id].version 
  }

  responses[id] = req.body
  responses[id].version = version + 1

  fs.writeFile('data/responses/' + req.params.key + '_' + req.params.doid + '.json', JSON.stringify(req.body), (err) => {
    if(err) throw err;
  });
  if((version % 25) === 0) {
    fs.writeFile('data/responses/backups/' + req.params.key + '_' + req.params.doid + '_' + version + '.json', JSON.stringify(responses[id]), (err) => {
      if(err) throw err;
    });
  }

  res.status(200).send('OK');
})


module.exports = router;
