
/*
 * API calls
 */

var cheerio = require('cheerio')
  , request = require('request')
  , semester = process.env.SEMESTER;



/*
 * GET course section listings.
 * route: /api/sections/:id/:course
 * route example: /api/sections/math/53
 */

exports.sections = function(req, res) {
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

  request.get(url, function(error, res, body) {
    if(!error && res.statusCode == 200) {
      var $ = cheerio.load(body);
      var end = $('table').length - 1;
      var index = 0;

      $('table').slice(1,end).each(function() {
        var data = {};
        data.index = index;
        var section = $(this).find('tr:nth-of-type(1) td:nth-of-type(3)').text().trim();
        space = section.lastIndexOf(' ');
        for(var i = 0; i < 2; i++) {
          space = section.lastIndexOf(' ', space-1);
        }
        section_id = section.substring(space+1);
        var sectionIndex = section.indexOf(course.toUpperCase());
        if(section.charAt(sectionIndex-1) == ' ' && section.charAt(sectionIndex+course.length) == ' ') {
          data.section = section_id;
          data.instructor = $(this).find('tr:nth-of-type(3) td:nth-of-type(2)').text();
          var restrictions = $(this).find('tr:nth-of-type(8) td:nth-of-type(2)').text();
          var location = $(this).find('tr:nth-of-type(2) td:nth-of-type(2)').text();
          if(location != "CANCELLED" && restrictions != "CURRENTLY NOT OPEN") {
            var locationArray = location.split(", ");
            data.time = locationArray[0];
            data.location = locationArray[1];
            data.ccn = $(this).find('input[name="_InField2"]').val();
            courses.push(data);
            index++;
          }
        }
      });
      callback(courses);
    }
    else
      console.log('Error: ' + error);
  });
}

/*
 * GET course section listings.
 * route: /api/enrollment/:ccn
 * route example: /api/enrollment/53802
 */

exports.enrollment = function(req, res) {
  request.get('http://telebearsrtc.hp.af.cm/api/enrollment/'+req.params.ccn, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.set('Cache-Control','private');
      res.json(JSON.parse(body));
    }
    else
      console.log('Error: ' + error);
  });
}