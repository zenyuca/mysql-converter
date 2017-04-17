let mysql = require('mysql')
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'yuca'
})

function findById (id, callback) {
  connection.connect()
  connection.query({
    sql: `
      SELECT
        *
      FROM
        users
      WHERE
        id = ?
    `,
    values: [id]
  }, (error, results, fields) => {
    callback(results)
  })
  connection.end()
}

findById(2, (data) => {
  console.log(data)
})
