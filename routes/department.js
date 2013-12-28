
/*
 * GET list of courses for an academic department.
 * Example route: /math
 */


var db = require('../mongo').database_connect('departments');

exports.show = function(req, res) {
  var id = req.params.id.toUpperCase();
  var breadcrumbs = [{href: id, val: id}];

  db.departments.find({abbreviation: id}, function(err, department) {
    if(err || !department) console.log('DB error');
    else if(department.length < 1) {
      res.render('404', { title: 'Errorrrrrrrr'});
    }
    else {
      res.render('department', { title: department[0].name, breadcrumbs: breadcrumbs, id: id, courses: department[0].courses });
    }
  });
};