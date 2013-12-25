
/*
 * GET list of courses for an academic department.
 * Example route: /math
 */


var db = require('../mongo').database_connect('departments');

exports.show = function(req, res) {
  var id = req.params.id.toUpperCase();

  db.departments.find({abbreviation: id}, function(err, department) {
    if(err || !department) console.log('DB error');
    else if(department.length < 1) {
      console.log('could not find department ' + id);
      res.redirect('/');
    }
    else {
      res.render('department', { title: department[0].name, id: id, courses: department[0].courses });
    }
  });
};