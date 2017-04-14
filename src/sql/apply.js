var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '117.78.42.184',
  user     : 'root',
  password : 'txkj123456',
  database : 'wen_data'
});
 
connection.connect();
 
connection.query('SELECT * from m_apply', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0]);
});
 
connection.end();