let fs = require('fs')

let list = []
fs.readFile('./sql/table.sql', 'utf-8', (err, data) => {
  if (err) throw err
  let reg = /\s{2}.+,/g
  data = data.match(reg)
  let nameReg = /`.+`/g
  let typeReg = /` \w+[\\(\s]/g
  data.forEach((e) => {
    let o = {}
    o.type = e.match(typeReg)
    if (o.type) {
      o.type = o.type[0].replace('` ', '').replace('(', '').replace(' ', '')
      o.name = e.match(nameReg)[0].replace(/`/g, '')
      list.push(o)
    }
  })
  key(list)
  value(list)
  kv(list)
  resultMap(list)
  listPage(list)
  java(list)
})

function key (list) {
  console.log('=key-list=======================================================\n')
  let str = ''
  list.forEach((e, i) => {
    str += e.name
    if (i !== list.length - 1) {
      str += ','
    }
    str += '\n'
  })
  console.log(str)
}

function value (list) {
  console.log('=value-list=====================================================\n')
  let str = ''
  list.forEach((e, i) => {
    str += '#{' + e.name + '}'
    if (i !== list.length - 1) {
      str += ','
    }
    str += '\n'
  })
  console.log(str)
}

function kv (list) {
  console.log('=kv-list========================================================\n')
  let str = ''
  list.forEach((e, i) => {
    str += e.name + ' = #{' + e.name + '}'
    if (i !== list.length - 1) {
      str += ','
    }
    str += '\n'
  })
  console.log(str)
}

function resultMap (list) {
  console.log('=resultMap-list=================================================\n')
  let str = ''
  list.forEach((e, i) => {
    if (i === 0) {
      str += `<id column="${e.name}" property="${e.name}" />`
    } else {
      str += `<result column="${e.name}" property="${e.name}" />`
    }
    str += '\n'
  })
  console.log(str)
}

function listPage (list) {
  console.log('=listPage-list==================================================\n')
  let str = ''
  list.forEach((e, i) => {
    str += `<if test="${e.name}!=null and ${e.name}!=''">
  AND NAME like '%'||#{${e.name}}||'%'
</if>`
    str += '\n'
  })
  console.log(str)
}

function java (list) {
  console.log('=java===========================================================\n')
  let str = ''
  list.forEach((e, i) => {
    if (e.type === 'text' || e.type === 'char' || e.type === 'varchar') {
      e.type = 'String'
    } else if (e.type === 'int' || e.type === 'smallint') {
      e.type = 'Integer'
    }
    str += `private ${e.type} ${e.name};`
    str += '\n'
  })
  console.log(str)
}
