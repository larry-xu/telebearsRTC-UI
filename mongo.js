
/*
 * Load MongoDB database
 */

var mongojs = require('mongojs');
if(process.env.MONGOHQ_URL)
  var mongourl = process.env.MONGOHQ_URL
else
  var mongourl = 'mydb';

exports.database_connect = function(collection) {
  return mongojs(mongourl, [collection]);
}