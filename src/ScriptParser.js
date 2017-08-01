/*
 *  解析 navicat 导出 sql 脚本
 *  日期：2017-7-14
 */

const fs = require('fs')
const stringUtil = require('./Util.js').string

class ScriptParser {
  constructor () {
    this.tableName = ''
    this.beanName = ''
    this.varBeanName = ''

    this.fieldList = []
    this.primaryKey = ''

    this.parseList = []
  }

  parse (scriptName) {
    const data = fs.readFileSync('./sql/' + scriptName, 'utf-8')
    // 解析 tableName
    this.tableName = data.match(/CREATE TABLE `\w+`/)[0].match(/`\w+`/)[0].replace(/`/g, '')
    this.varBeanName = stringUtil.toCamelCase(this.tableName.slice(this.tableName.indexOf('_') + 1))
    this.beanName = stringUtil.headToUpperCase(this.varBeanName)

    // 解析字段列表
    let list = data.match(/\s{2}`.+,/g)
    list.forEach((e, i) => {
      let field = {}

      // 获得字段名称
      let fieldName = e.match(/\s{2}`\w+/)[0].replace(/\s{2}`/, '')
      field.fieldName = fieldName
      if (stringUtil.isUpperCase(fieldName)) {
        fieldName = fieldName.toLowerCase()
      }
      field.name = stringUtil.toCamelCase(fieldName)

      let split = e.split(' ')
      // 获得数据库类型
      field.dbType = split[3].replace(/\(.+\)/, (value) => {
        return ''
      }).replace(',', '')
      field.javaType = this.toJavaType(field.dbType)

      // 获取注释内容
      let hasComment = false
      split.forEach((e, i) => {
        if (hasComment) {
          field.comment = e.replace(/[',]/g, value => {
            return ''
          })
        }
        if (e === 'COMMENT') {
          hasComment = true
        }
      })

      this.fieldList.push(field)
    })

    // 获取主键字段名称
    this.primaryKey = data.match(/PRIMARY KEY \(`\w+`\)/)[0].match(/`\w+`/)[0].replace(/`/g, '')
  }

  parseAll () {
    let list = fs.readdirSync('./sql/')
    list.forEach((e, i) => {
      this.parse(e)
      let parseObj = {}
      parseObj.tableName = this.tableName
      parseObj.beanName = this.beanName
      parseObj.varBeanName = this.varBeanName
      parseObj.fieldList = this.fieldList
      parseObj.primaryKey = this.primaryKey

      this.parseList.push(parseObj)
      this.fieldList = []
    })
  }

  toJavaType (type) {
    if (type === 'text' || type === 'char' || type === 'varchar' || type === 'longtext') {
      return 'String'
    } else if (type === 'int' || type === 'smallint') {
      return 'Integer'
    } else if (type === 'datetime' || type === 'date') {
      return 'Date'
    } else if (type === 'double') {
      return 'Double'
    } else {
      return ''
    }
  }
}

module.exports = {
  parser: new ScriptParser()
}
