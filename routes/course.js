
/*
 * GET course page.
 */

var db = require('../mongo').database_connect('departments');

// show section list
// route: /:id/:course
// route example: /math/53
exports.index = function(req, res) {
  var id = req.params.id;
  var hrefID = encodeURIComponent(id.toLowerCase());
  var course = req.params.course;
  var courseName = id + ' ' + course;
  var title = courseName.toUpperCase() + ' Enrollment Data';
  var breadcrumbs = [{href: hrefID, val: id}, {href: hrefID+'/'+course, val: course}];

  db.departments.find({
    abbreviation: id.toUpperCase(),
    courses: {
      $elemMatch: {course: course.toUpperCase()}
    }
  }, function(err, department) {
    if(err || !department) console.log('DB error');
    else if(department.length < 1) {
      res.render('404', { title: 'Errorrrrrrrr'});
    }
    else {
      res.render('course', { title: title, breadcrumbs: breadcrumbs, id: id, course: course });
    }
  });
};