let fs = require('fs')

fs.readFile('./sql/table.sql', 'utf-8', (err, data) => {
  if (err) throw err
  let list = []
  let tableName = ''

  let pattern = /CREATE TABLE `\w+`/g
  let tableNameRow = data.match(pattern)
  tableNameRow.forEach((e) => {
    tableName = e.slice('CREATE TABLE `'.length, -1)
  })
  let reg = /\s{2}.+,/g
  data = data.match(reg)
  let nameReg = /`.+`/g
  let typeReg = /` \w+[\\(\s]/g
  let commentReg = /'.+'/g
  data.forEach((e) => {
    let o = {}
    o.type = e.match(typeReg)
    if (o.type) {
      o.type = o.type[0].replace('` ', '').replace('(', '').replace(' ', '')
      o.name = e.match(nameReg)[0].replace(/`/g, '')
      if (e.match(commentReg)) {
        let comment = e.match(commentReg)[0] || ''
        o.comment = comment.replace('\'', '').replace('\'', '')
      }
      list.push(o)
    }
  })
  // console.log(JSON.stringify(list))

  let mapperContent = generateMapper(list, tableName)
  fs.writeFile('./mapper/mapper.xml', mapperContent, 'utf-8', (err, data) => {
    if (err) throw err
  })
  let beanCotent = generateJavaBean(list, tableName)
  fs.writeFile('./javaBean/bean.java', beanCotent, 'utf-8', (err, data) => {
    if (err) throw err
  })
})

function key (list) {
  let str = ''
  list.forEach((e, i) => {
    str += `        ${e.name}`
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
    str += `        #{${e.name}}`
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
    str += `        <if test="${e.name} != null and ${e.name} != ''">
            ${e.name} = #{${e.name}},
        </if>`
    if (i !== list.length - 1) {
      str += '\n'
    }
  })
  return str
}

function resultMap (list) {
  let str = ''
  list.forEach((e, i) => {
    if (i === 0) {
      str += `        <id column="${e.name}" property="${e.name}" />`
    } else {
      str += `        <result column="${e.name}" property="${e.name}" />`
    }
    if (i !== list.length - 1) {
      str += '\n'
    }
  })
  return str
}

function listPage (list) {
  let str = ''
  list.forEach((e, i) => {
    str += `        <if test="${e.name} != null and ${e.name} != ''">
            AND ${e.name} like CONCAT('%',#{${e.name}},'%')
        </if>`
    if (i !== list.length - 1) {
      str += '\n'
    }
  })
  return str
}

function java (list) {
  let str = ''
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
    str += `    /** ${e.comment} */\n`
    str += `    private ${e.type} ${e.name};`
    str += '\n'
  })
  return str
}

function generateJavaBean (list, tableName) {
  let prefix = tableName.slice(2)
  prefix = prefix.slice(0, 1).toUpperCase() + prefix.slice(1)
  let beanName = prefix + 'Bean'
  let javaBeanProperties = java(list)
  let javaBeanContent = `package com.electric.wen.beans;
import java.io.Serializable;

import com.bingbee.card.util.paging.Page;
public class ${beanName} extends BaseBean implements Serializable{
    private static final long serialVersionUID = 1L;
    private Page paper;
${javaBeanProperties}
}
  `
  return javaBeanContent
}

function generateMapper (list, tableName) {
  let prefix = tableName.slice(2)
  prefix = prefix.slice(0, 1).toUpperCase() + prefix.slice(1)
  let mapperName = prefix + 'Mapper'
  let beanName = prefix + 'Bean'

  let resultMapContent = resultMap(list)
  let pkName = list[0].name
  let whereConditionConent = listPage(list)
  let kvConent = kv(list.slice(1))
  let valueContent = value(list.slice(1))
  let keyContent = key(list.slice(1))

  let mapper = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.electric.wen.mapper.${mapperName}">
  <resultMap id="resMap_${prefix}" type="com.electric.wen.beans.${beanName}">
${resultMapContent}
  </resultMap>

  <sql id="All_Column_List" >
        ${pkName},
        <include refid="Insert_Column_List"></include>
  </sql>
  
  <sql id="Insert_Column_List" >
${keyContent}
  </sql> 

  <sql id="Value_Column_List" >
${valueContent}
  </sql>
  <sql id="whereCondition">
${whereConditionConent}
  </sql>

  <select id="findAll" resultMap="resMap_${prefix}" parameterType="com.electric.wen.beans.${beanName}">
    SELECT
      <include refid="All_Column_List"></include>
    FROM ${tableName}
  </select>
  
  <select id="listPage" resultMap="resMap_${prefix}" parameterType="com.electric.wen.beans.${beanName}">
    SELECT
      <include refid="All_Column_List"></include>
    FROM ${tableName}
    <where>
      <include refid="whereCondition"></include>
    </where>
    ORDER BY ${pkName} DESC
  </select>
  
  <select id="loadByPK" resultMap="resMap_${prefix}" parameterType="java.lang.Integer">
    SELECT
      <include refid="All_Column_List"></include>
    FROM ${tableName}
    WHERE ${pkName} = #{${pkName}}
  </select>
  
  <insert id="insert" parameterType="com.electric.wen.beans.${beanName}" useGeneratedKeys="true" keyProperty="${pkName}">
    INSERT INTO ${tableName} (
      <include refid="Insert_Column_List"></include> 
    )VALUES(
      <include refid="Value_Column_List"></include>
    )
  </insert>

  <update id="update" parameterType="com.electric.wen.beans.${beanName}">
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
  return mapper
}
