
/*
 * GET course page.
 */

var jsdom = require('jsdom')
  , db = require('../mongo').database_connect('departments')
  , semester = process.env.SEMESTER
  , year = process.env.YEAR;

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
      console.log('could not find department ' + id);
      res.redirect('/');
    }
    else {
      res.render('course', { title: title, breadcrumbs: breadcrumbs, id: id, course: course });
    }
  });
};

exports.show = function(req, res) {
  var id = req.params.id;
  var course = req.params.course;
  exports.loadSectionList(id, course, function(result) {
    res.set('Cache-Control','private');
    res.json(result);
  });
}

// queries osoc.berkeley.edu for all course listings for a given course
// returns an array of objects containing course data
exports.loadSectionList = function(id,course,callback) {
  var courses = [];
  var url = "http://osoc.berkeley.edu/OSOC/osoc?p_term=" + semester + "&p_course=" + course + "&p_dept=" + id;

  jsdom.env(
    url,
    ["//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"],
    function(errors, window) {
      if(errors) console.log(errors);
      else {
        var end = window.$('table').length - 1;
        window.$('table').slice(1,end).each(function() {
          var data = {};
          var section = window.$(this).find('tr:nth-of-type(1) td:nth-of-type(3)').text().trim();
          space = section.lastIndexOf(' ');
          for(var i = 0; i < 2; i++) {
            space = section.lastIndexOf(' ', space-1);
          }
          section_id = section.substring(space+1);
          var sectionIndex = section.indexOf(course.toUpperCase());
          if(section.charAt(sectionIndex-1) == ' ' && section.charAt(sectionIndex+course.length) == ' ') {
            data.section = section_id;
            data.instructor = window.$(this).find('tr:nth-of-type(3) td:nth-of-type(2)').text();
            var restrictions = window.$(this).find('tr:nth-of-type(8) td:nth-of-type(2)').text();
            var location = window.$(this).find('tr:nth-of-type(2) td:nth-of-type(2)').text();
            if(location != "CANCELLED" && restrictions != "CURRENTLY NOT OPEN") {
              var locationArray = location.split(", ");
              data.time = locationArray[0];
              data.location = locationArray[1];
              data.ccn = window.$(this).find('input[name="_InField2"]').val();
              courses.push(data);
            }
          }
        });
        callback(courses);
      }
    }
  );
}