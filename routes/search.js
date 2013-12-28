
/*
 * GET proper url for a given search query
 */

var db = require('../mongo').database_connect('departments');

// query database with given search parameters
// render course page if found, else render search page
exports.index = function(req, res) {
  var query = req.query.q.trim().toUpperCase();
  var separator = query.lastIndexOf(' ');
  var department = query.substring(0, separator);
  var course = query.substring(separator+1);
  var course_num = parseInt(course);
  if(separator < 0 || isNaN(course_num))
    department = query;
  var aliases = { 'BIOE': 'BIO ENG',
                  'CHEME': 'CHM ENG',
                  'CEE': 'CIV ENG',
                  'CS': 'COMPSCI',
                  'EE': 'EL ENG',
                  'E': 'ENGIN',
                  'IEOR': 'IND ENG',
                  'IB': 'INTEGBI',
                  'MSE': 'MAT SCI',
                  'ME': 'MEC ENG',
                  'MCB': 'MCELLBI',
                  'CNM': 'NWMEDIA',
                  'NUCE': 'NUC ENG',
                  'NST': 'NUSCTX',
                  'STATS': 'STAT' }
  if(department in aliases)
    department = aliases[department];

  if(separator < 0 || isNaN(course_num)) {
    db.departments.find(
      {
        $or: [
          { name: department },
          { abbreviation: department }
        ]
      },
      function(err, data) {
        if(err || !data) console.log('DB error');
        else if (data.length == 0) {
          res.render('search', { title: 'Search results for \''+query+'\'', q: query });
        }
        else
          res.redirect('/'+encodeURIComponent(data[0].abbreviation.toLowerCase()));
      }
    );
  }
  else {
    db.departments.find(
      {
        $or: [
          { name: department },
          { abbreviation: department }
        ],
        'courses.course': course
      },
      function(err, data) {
        if(err || !data) console.log('DB error');
        else if (data.length == 0) {
          res.render('search', { title: 'Search results for \''+query+'\'', q: query });
        }
        else
          res.redirect('/'+encodeURIComponent(data[0].abbreviation.toLowerCase())+'/'+course.toLowerCase());
      }
    );
  }
};