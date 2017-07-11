let fs = require('fs')


let tableName = ''
let beanName = ''
let mapperName = ''

fs.readFile('./sql/table.sql', 'utf-8', (err, data) => {
  if (err) throw err
  let list = []

  let pattern = /CREATE TABLE `\w+`/g
  let tableNameRow = data.match(pattern)
  tableNameRow.forEach((e) => {
    tableName = e.slice('CREATE TABLE `'.length, -1)
  })
  let reg = /\s{2}.+,/g
  data = data.match(reg)
  let nameReg = /`.+`/g
  let typeReg = /` \w+[\\(\s]/g
  let commentReg = /COMMENT '.+'/g
  data.forEach((e) => {
    let o = {}
    o.type = e.match(typeReg)
    if (o.type) {
      o.type = o.type[0].replace('` ', '').replace('(', '').replace(' ', '')
      o.fieldName = e.match(nameReg)[0].replace(/`/g, '')
      o.name = toCamelCase(o.fieldName)
      if (e.match(commentReg)) {
        let comment = e.match(commentReg)[0] || ''
        comment = comment.slice('COMMENT '.length)
        o.comment = comment.replace('\'', '').replace('\'', '')
      }
      list.push(o)
    }
  })
  list.forEach((e, i) => {
    if (e.type === 'text' || e.type === 'char' || e.type === 'varchar') {
      e.type = 'String'
    } else if (e.type === 'int' || e.type === 'smallint') {
      e.type = 'Integer'
    } else if (e.type === 'datetime' || e.type === 'date') {
      e.type = 'Date'
    } else if (e.type === 'double') {
      e.type = 'Double'
    }
  })
  // console.log(JSON.stringify(list, null, 2))

  let content = generateMapper(list, tableName)
  fs.writeFile('./mapper/' + content.mapperName + '.xml', content.mapper, 'utf-8', (err, data) => {
    if (err) throw err
  })
  let beanCotent = generateJavaBean(list, tableName)
  fs.writeFile('./javaBean/' + content.beanName + '.java', beanCotent, 'utf-8', (err, data) => {
    if (err) throw err
  })
})

// ÅäÖÃÎÄ¼þ´¦
let beanPackage = 'com.bingbee.yun.beans'
let mapperPackage = 'com.bingbee.yun.mapper'

function toCamelCase (name) {
  let newName = name.replace(/_\w/g, (value) => {
    return value.slice(-1).toUpperCase()
  })
  return newName
}

function key (list, alias) {
  let str = ''
  list.forEach((e, i) => {
    if (alias) {
      str += `    \${alias}.${e.fieldName} AS ${tableName}_${e.fieldName}`
    } else {
      str += `    ${e.fieldName}`
    }
    if (i !== list.length - 1) {
      str += ','
      str += '\n'
    }
  })
  return str
}

function value (list) {
  let str = ''
  list.forEach((e, i) => {
    str += `    #{${e.name}}`
    if (i !== list.length - 1) {
      str += ','
      str += '\n'
    }
  })
  return str
}

function kv (list) {
  let str = ''
  list.forEach((e, i) => {
    str += `      <if test="${e.name} != null and ${e.name} != ''">
        ${e.fieldName} = #{${e.name}},
      </if>`
    if (i !== list.length - 1) {
      str += '\n'
    }
  })
  return str
}

function resultMap (list, alias) {
  let str = ''
  list.forEach((e, i) => {
    if (alias) {
      if (i === 0) {
        str += `    <id column="${tableName}_${e.fieldName}" property="${e.name}" />`
      } else {
        str += `    <result column="${tableName}_${e.fieldName}" property="${e.name}" />`
      }
    } else {
      if (i === 0) {
        str += `    <id column="${e.fieldName}" property="${e.name}" />`
      } else {
        str += `    <result column="${e.fieldName}" property="${e.name}" />`
      }
    }
    if (i !== list.length - 1) {
      str += '\n'
    }
  })
  return str
}

function whereCondition (list, prefix) {
  let str = ''
  list.forEach((e, i) => {
    if (e.type === 'Integer' || e.type === 'Double') {
      str += `    <if test="${e.name} != null and ${e.name} != ''">
      AND ${prefix}${e.fieldName} = #{${e.name}}
    </if>`
    } else {
      str += `    <if test="${e.name} != null and ${e.name} != ''">
      AND ${prefix}${e.fieldName} like CONCAT('%',#{${e.name}},'%')
    </if>`
    }
    if (i !== list.length - 1) {
      str += '\n'
    }
  })
  return str
}

function java (list) {
  let str = ''
  list.forEach((e, i) => {
    e.comment = e.comment || ''
    str += `    /** ${e.comment} */\n`
    str += `    private ${e.type} ${e.name};`
    str += '\n'
  })
  return str
}

function generateName (tableName) {
  let prefix = tableName
  prefix = prefix.replace(/_\w/g, function (word) {
    return word.slice(-1).toUpperCase()
  })
  prefix = prefix.indexOf('m') == 0 ? prefix.slice(1) : prefix
  prefix = prefix.replace(/^\w/, (value) => {
    return value.toUpperCase()
  })
  let beanName = prefix + ''
  let mapperName = prefix + 'Mapper'
  // console.log(prefix, beanName, mapperName)
  return {
    beanName,
    mapperName,
    prefix: tableName
  }
}

function generateJavaBean (list, tableName) {
  let names = generateName(tableName)
  let beanName = names.beanName

  let javaBeanProperties = java(list)
  let javaBeanContent = `package ${beanPackage};

import java.io.Serializable;
import com.bingbee.card.util.paging.Page;
import com.electric.wen.beans.BaseBean;
public class ${beanName} extends BaseBean implements Serializable {
    private static final long serialVersionUID = 1L;
    private Page paper;
${javaBeanProperties}
}
  `
  return javaBeanContent
}

function generateMapper (list, tableName) {
  let names = generateName(tableName)
  let prefix = names.prefix
  let beanName = names.beanName
  let mapperName = names.mapperName
  beanName = names.beanName
  mapperName = names.mapperName

  let resultMapContent = resultMap(list)
  let resultMapContentAlias = resultMap(list, true)
  let pkName = list[0].fieldName
  let whereConditionConent = whereCondition(list, '')
  let kvConent = kv(list.slice(1))
  let valueContent = value(list.slice(1))
  let keyContent = key(list.slice(1))
  let keyContentAlias = key(list.slice(1), true)

  let mapper = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="${mapperPackage}.${mapperName}">

  <resultMap id="resultmap_${prefix}" type="${beanPackage}.${beanName}">
${resultMapContent}
  </resultMap>

  <sql id="all_column_list" >
    ${pkName},
    <include refid="insert_column_list"></include>
  </sql>
  
  <sql id="insert_column_list" >
${keyContent}
  </sql> 

  <sql id="value_column_list" >
${valueContent}
  </sql>

  <sql id="where_condition">
${whereConditionConent}
  </sql>

  <select id="findAll" resultMap="resultmap_${prefix}" parameterType="${beanPackage}.${beanName}">
    SELECT
      <include refid="all_column_list"></include>
    FROM ${tableName}
  </select>

  <select id="listPage" resultMap="resultmap_${prefix}" parameterType="${beanPackage}.${beanName}">
    SELECT
      <include refid="all_column_list"></include>
    FROM ${tableName}
    <where>
      <include refid="where_condition"></include>
    </where>
    ORDER BY ${pkName} DESC
  </select>

  <select id="load" resultMap="resultmap_${prefix}" parameterType="${beanPackage}.${beanName}">
    SELECT
      <include refid="all_column_list"></include>
    FROM ${tableName}
    <where>
      <include refid="where_condition"></include>
    </where>
  </select>
  
  <select id="loadByPK" resultMap="resultmap_${prefix}" parameterType="java.lang.Integer">
    SELECT
      <include refid="all_column_list"></include>
    FROM ${tableName}
    WHERE ${pkName} = #{${pkName}}
  </select>

  <select id="findByPKs" resultMap="resultmap_${prefix}" parameterType="java.lang.Integer">
    SELECT
      <include refid="all_column_list"></include> 
    FROM ${tableName}
    WHERE ${pkName} IN
    <foreach collection="array" item="${pkName}" open="(" separator="," close=")">
      #{${pkName}}
    </foreach>
  </select>
  
  <insert id="insert" parameterType="${beanPackage}.${beanName}" useGeneratedKeys="true" keyProperty="${pkName}">
    INSERT INTO ${tableName} (
      <include refid="insert_column_list"></include> 
    )VALUES(
      <include refid="value_column_list"></include>
    )
  </insert>

  <update id="update" parameterType="${beanPackage}.${beanName}">
    UPDATE ${tableName} SET 
${kvConent} 
      ${pkName} = #{${pkName}}
    WHERE ${pkName} = #{${pkName}}
  </update>

  <delete id="delete" parameterType="Integer">
    DELETE FROM ${tableName} WHERE ${pkName} = #{${pkName}}
  </delete>
  
</mapper>
  `
  // console.log(mapper)
  return {
    mapper,
    mapperName,
    beanName
  }
}
