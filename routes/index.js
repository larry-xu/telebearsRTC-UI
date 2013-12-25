
/*
 * GET home page/list of academic departments.
 */


var db = require('../mongo').database_connect('departments');

exports.index = function(req, res) {
  db.departments.find().sort({name: 1}, function(err, departments) {
    if(err || !departments) console.log('DB error');
    else {
      var data = [];
      for(var i = 0; i < departments.length; i++) {
        var abb = departments[i].abbreviation;
        data.push({ name: departments[i].name, abbreviation: abb });
      }

      res.render('index', { title: 'telebearsRTC - Berkeley real-time course enrollment data', departments: data });
    }
  });
};