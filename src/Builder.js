const fs = require('fs')
let fse = require('fs-extra')
const parser = require('./ScriptParser.js').parser
const stringUtil = require('./Util.js').string

class Builder {
  constructor () {
    parser.parseAll()
    this.fieldList = parser.parseList

    this.packageName = 'com.ichuangye.fwh'
    this.beanPackage = `${this.packageName}.beans`
    this.mapperPackage = `${this.packageName}.mapper`
    this.servicePackage = `${this.packageName}.service`
    this.controllerPackage = `${this.packageName}.controller`

    this.fieldList.forEach((e, i) => {
      this.buildJavaBean(e)
      this.buildMapper(e)
      this.buildMapperJava(e)
      // this.buildService(e)
      // this.buildServiceImpl(e)
      // this.buildController(e)
      // this.buildListPage(e)
      // this.buildAddEditPage(e)
    })
  }

  _javaBean (list) {
    let str = ''
    list.forEach((e, i) => {
      if (e.name === 'createTime' || e.name === 'createrId' || e.name === 'updateTime' || e.name === 'updaterId') {
        return false
      }
      e.comment = e.comment || ''
      if (e.comment) {
        str += `    /** ${e.comment} */\n`
      }
      str += `    private ${e.javaType} ${e.name};`
      str += '\n'
    })
    return str
  }

  _resultMap (list, primaryKey, alias = '') {
    let str = ''
    let prefix = ''
    if (alias) {
      alias += '_'
    }
    list.forEach((e, i) => {
      if (e.fieldName === primaryKey) {
        prefix = 'id'
      } else {
        prefix = 'result'
      }
      str += `    <${prefix} property="${e.name}" column="${alias}${e.fieldName}" />`
      if (i !== list.length - 1) {
        str += '\n'
      }
    })
    return str
  }

  _key (list, primaryKey, alias = '') {
    let str = ''
    let hasAlias = false
    if (alias) {
      hasAlias = true
    }
    list.forEach((e, i) => {
      if (e.fieldName === primaryKey) {
        return false
      }
      if (!hasAlias) {
        str += `    ${e.fieldName}`
      } else {
        str += `    \${alias}${e.fieldName} AS ${alias}_${e.fieldName}`
      }
      if (i !== list.length - 1) {
        str += ','
        str += '\n'
      }
    })
    return str
  }

  _value (list, primaryKey) {
    let str = ''
    list.forEach((e, i) => {
      if (e.fieldName === primaryKey) {
        return false
      }
      str += `    #{${e.name}}`
      if (i !== list.length - 1) {
        str += ','
        str += '\n'
      }
    })
    return str
  }

  _isStringType (e) {
    if (e.javaType === 'String') {
      return `and ${e.name} != ''`
    }
    return ''
  }

  _kv (list) {
    let str = ''
    list.forEach((e, i) => {
      str += `      <if test="${e.name} != null ${this._isStringType(e)}">
        ${e.fieldName} = #{${e.name}},
      </if>`
      if (i !== list.length - 1) {
        str += '\n'
      }
    })
    return str
  }

  _whereCondition (list, alias = '') {
    let str = ''
    if (alias) {
      alias = `\${alias}`
    }
    list.forEach((e, i) => {
      if (e.javaType === 'Integer' || e.javaType === 'Double') {
        str += `    <if test="${e.name} != null ${this._isStringType(e)}">
      AND ${alias}${e.fieldName} = #{${e.name}}
    </if>`
      } else if (e.javaType === 'Date') {
        str += `    <if test="${e.name} != null ${this._isStringType(e)}">
      <![CDATA[
        AND DATE_FORMAT(${alias}${e.fieldName}, '%Y-%m-%d %H:%i:%s') = DATE_FORMAT(#{${e.name}}, '%Y-%m-%d %H:%i:%s');
      ]]>
    </if>`
      } else {
        str += `    <if test="${e.name} != null ${this._isStringType(e)}">
      AND ${alias}${e.fieldName} like CONCAT('%', #{${e.name}}, '%')
    </if>`
      }
      if (i !== list.length - 1) {
        str += '\n'
      }
    })
    return str
  }

  _loadWhereCondition (list, primaryKey, alias = '') {
    let str = ''
    list.forEach((e, i) => {
      if (e.fieldName === primaryKey) {
        return false
      }
      if (alias) {
        alias = `\${alias}`
      }
      if (e.javaType === 'Date') {
        str += `    <if test="${e.name} != null ${this._isStringType(e)}">
      <![CDATA[
        AND DATE_FORMAT(${alias}${e.fieldName}, '%Y-%m-%d %H:%i:%s') = DATE_FORMAT(#{${e.name}}, '%Y-%m-%d %H:%i:%s');
      ]]>
    </if>`
      } else {
        str += `    <if test="${e.name} != null ${this._isStringType(e)}">
      AND ${alias}${e.fieldName} = #{${e.name}}
    </if>`
      }
      if (i !== list.length - 1) {
        str += '\n'
      }
    })
    return str
  }

  buildMapper (field) {
    let mapper = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="${this.mapperPackage}.${field.beanName}Mapper">

  <resultMap id="result_${field.varBeanName}" type="${this.beanPackage}.${field.beanName}">
${this._resultMap(field.fieldList, field.primaryKey, field.varBeanName)}
  </resultMap>

  <sql id="all_column_list" >
    \${alias}${field.primaryKey} AS ${field.varBeanName}_${field.primaryKey},
${this._key(field.fieldList, field.primaryKey, field.varBeanName)}    
  </sql>

  <sql id="where_condition">
${this._whereCondition(field.fieldList, true)}
  </sql>
</mapper>`
    fs.writeFileSync('./build/mapper/' + field.beanName + 'Mapper.xml', mapper, 'utf-8')
  }

  buildMapperJava (field) {
    let context = `package ${this.mapperPackage};

import ${this.beanPackage}.${field.beanName};
import com.ichuangye.fwh.core.util.MyMapper;
import org.springframework.stereotype.Component;

@Component
public interface ${field.beanName}Mapper extends MyMapper<${field.beanName}> {

}`
    fs.writeFileSync('./build/mapper/' + field.beanName + 'Mapper.java', context, 'utf-8')
  }

  buildService (field) {
    let context = `package ${this.servicePackage};

import com.ichuangye.fwh.core.template.BaseService;
import ${this.beanPackage}.${field.beanName};

public interface ${field.beanName}Service extends BaseService<${field.beanName}, Integer> {
  
}`
    fs.writeFileSync('./build/service/' + field.beanName + 'Service.java', context, 'utf-8')
  }

  buildServiceImpl (field) {
    let primaryKey = stringUtil.headToUpperCase(stringUtil.toCamelCase(field.primaryKey))
    let context = `package ${this.servicePackage}.impl;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ${this.beanPackage}.${field.beanName};
import ${this.mapperPackage}.${field.beanName}Mapper;
import ${this.servicePackage}.${field.beanName}Service;

@Service
public class ${field.beanName}ServiceImpl implements ${field.beanName}Service {
  @Autowired
  private ${field.beanName}Mapper ${field.varBeanName}Mapper;

  @Override
  public Integer insert(${field.beanName} model) {
    model.setCreateTime(new Date());
    return this.${field.varBeanName}Mapper.insert(model);
  }

  @Override
  public boolean delete(Integer modelPK) {
    return this.${field.varBeanName}Mapper.delete(modelPK) == 1;
  }

  @Override
  public ${field.beanName} load(${field.beanName} model) {
    return this.${field.varBeanName}Mapper.load(model);
  }

  @Override
  public boolean update(${field.beanName} model) {
    return this.${field.varBeanName}Mapper.update(model) == 1;
  }

  @Override
  public int countAll() {
    return 0;
  }

  @Override
  public List<${field.beanName}> findAll(${field.beanName} model) {
    return this.${field.varBeanName}Mapper.findAll(model);
  }

  @Override
  public List<${field.beanName}> listPage(${field.beanName} model) {
    return this.${field.varBeanName}Mapper.listPage(model);
  }

  @Override
  public ${field.beanName} loadByPK(Integer modelPK) {
    return this.${field.varBeanName}Mapper.loadByPK(modelPK);
  }

  @Override
  public boolean insertORupdate(${field.beanName} model) {
    ${field.beanName} dbBean = this.loadByPK(model.get${primaryKey}());
    if (dbBean == null) {
      return this.insert(model) == 1;
    } else {
      return this.update(model);
    }
  }

}`
    fs.writeFileSync('./build/service/impl/' + field.beanName + 'ServiceImpl.java', context, 'utf-8')
  }

  buildController (field) {
    let urlprefix = 'yun'
    let prefix = 'yun'
    let primaryKey = stringUtil.headToUpperCase(stringUtil.toCamelCase(field.primaryKey))
    let context = `package ${this.controllerPackage};

  import java.util.List;

  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.stereotype.Controller;
  import org.springframework.web.bind.annotation.RequestMapping;
  import org.springframework.web.bind.annotation.RequestMethod;
  import org.springframework.web.servlet.ModelAndView;

  import com.alibaba.fastjson.JSON;
  import com.yunman.common.config.Config;
  import com.yunman.common.interceptor.CheckToken;
  import com.yunman.common.template.BaseController;
  import com.yunman.common.util.fastjsonx.JSONData;
  import ${this.packageName}.beans.${field.beanName};
  import ${this.packageName}.service.${field.beanName}Service;

  @Controller
  @RequestMapping(value = "admin/${urlprefix}/${field.varBeanName}")
  public class ${field.beanName}Controller extends BaseController {
    @Autowired
    private ${field.beanName}Service ${field.varBeanName}Service;
    
    public static final String RESPONSE_URL = "${urlprefix}/${field.varBeanName}/listpage.html";
    
    @RequestMapping(value = "/listpage")
    public ModelAndView listpage(${field.beanName} ${field.varBeanName}) {
      ${field.varBeanName}.setPaper(paper);
      
      List<${field.beanName}> list = this.${field.varBeanName}Service.listPage(${field.varBeanName});
      mv.addObject("list", list);
      mv.addObject(Config.RESPONSE_URL, RESPONSE_URL);
      mv.addObject("toolbar", this.toolbar(RESPONSE_URL));
      mv.setViewName("/${prefix}/${field.varBeanName}/list");
      return mv;
    }
    
    @RequestMapping(value = "/add_editpage")
    @CheckToken(generate = true)
    public ModelAndView add_editpage(${field.beanName} ${field.varBeanName}) {
      if (${field.varBeanName}.get${primaryKey}() != null) {
        ${field.varBeanName} = this.${field.varBeanName}Service.loadByPK(${field.varBeanName}.get${primaryKey}());
      }
      mv.addObject("${field.varBeanName}", ${field.varBeanName});
      mv.addObject(Config.RESPONSE_URL, RESPONSE_URL);
      mv.addObject("toolbar", this.toolbar(RESPONSE_URL));
      mv.setViewName("/${prefix}/${field.varBeanName}/add_edit");
      return mv;
    }
    
    @RequestMapping(value = "/add_edit", method = RequestMethod.POST)
    @CheckToken(check = true)
    public ModelAndView add_edit(${field.beanName} ${field.varBeanName}) {
      boolean flag = this.${field.varBeanName}Service.insertORupdate(${field.varBeanName});
      if (flag) {
        mv.addObject("msg", "success");
      } else {
        mv.addObject("msg", "failed");
      }
      mv.setViewName("/common/_result");
      return mv;
    }
    
    @RequestMapping(value = "/del", method = RequestMethod.POST)
    public void del(${field.beanName} ${field.varBeanName}) {
      JSONData<String> jsonData = new JSONData<String>();
      boolean flag = this.${field.varBeanName}Service.delete(${field.varBeanName}.get${primaryKey}());
      if (flag) { 
        jsonData.setMessage("删除成功");
      } else {
        jsonData.setMessage("删除失败");
      }
      jsonData.setState(flag);
      this.render(JSON.toJSONString(jsonData));
    }
  }
  `
    fs.writeFileSync('./build/controller/' + field.beanName + 'Controller.java', context, 'utf-8')
  }

  buildJavaBean (field) {
    let context = `package ${this.beanPackage};

import java.io.Serializable;
public class ${field.beanName} implements Serializable {
    private static final long serialVersionUID = 1L;
${this._javaBean(field.fieldList)}
}`
    fs.writeFileSync('./build/beans/' + field.beanName + '.java', context, 'utf-8')
  }

  _listPageSearch (field) {
    let context = ''
    field.fieldList.forEach((e, i) => {
      if (e.fieldName === field.primaryKey) {
        return false
      }
      let label = e.comment || stringUtil.headToUpperCase(e.name)
      context += `<div class="form-group">
                      <label class="col-xs-3 control-label text-right" for="${e.name}">${label}</label>
                      <div class="col-xs-9">
                        <input type="text" class="form-control" id="${e.name}" name="${e.name}" value="\${${field.varBeanName}.${e.name}}" placeHolder="${label}" >
                      </div>    
                    </div>
                    `
    })
    return context
  }

  _listPageTabTH (field) {
    let context = ''
    field.fieldList.forEach((e, i) => {
      if (e.fieldName === field.primaryKey) {
        return false
      }
      let label = e.comment || stringUtil.headToUpperCase(e.name)
      context += `                          <th>${label}</th>`
      if (field.fieldList.length - 1 !== i) {
        context += '\n'
      }
    })
    return context
  }

  _listPageTabTD (field) {
    let context = ''
    field.fieldList.forEach((e, i) => {
      if (e.fieldName === field.primaryKey) {
        context += `                        <td class="center"><label><input type="radio" class="ace" name="checks" value="\${${field.varBeanName}.${stringUtil.toCamelCase(field.primaryKey)}}" /> <span class="lbl"></span> </label></td>`
      } else {
        if (e.javaType === 'Date') {
          context += `                        <td><fmt:formatDate value="\${${field.varBeanName}.${e.name} }" pattern="yyyy-MM-dd HH:mm:ss"/></td>`
        } else {
          context += `                        <td>\${${field.varBeanName}.${e.name} }</td>`
        }
      }
      if (field.fieldList.length - 1 !== i) {
        context += '\n'
      }
    })
    return context
  }

  buildListPage (field) {
    let primaryKey = stringUtil.toCamelCase(field.primaryKey)
    let context = `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@include file="../../common/_header.jsp"%>
<style>
</style>
<div class="main-container" id="main-container">
  <div class="main-container-inner">
    <%@include file="../../common/_left.jsp"%>
    <div class="main-content">
      <div class="breadcrumbs" id="breadcrumbs">
        <ul class="breadcrumb">
          <li><i class="icon-home home-icon"></i><a href="#">一级菜单</a></li>
          <li class="active">二级菜单</li>
        </ul>
      </div>
      <div class="page-content">
        <div class="row">
          <!-- 查询 -->
          <div id="modal-search" class="modal fade">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                  <h3>查询</h3>
                </div>
                <form class="form-horizontal" method="post" action="listpage.html" id="form1" style="overflow-y: auto; overflow-x: hidden; height: 100%;">
                  <div class="modal-body">
                    <input type="hidden" name="page" id="page" value="1" />
                    <input type="hidden" id="pageNumber" name="pageNumber" />
                    ${this._listPageSearch(field)}
                  </div>
                  <div class="modal-footer">
                    <input type="submit" class="btn btn-success" value="查询" />
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <!-- 添加或编辑 -->
          <div id="modal-add_edit" class="modal fade">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                  <h3>添加\\编辑</h3>
                </div>
                <div class="modal-body">
                  <iframe id="iframe-add_edit" width="100%" scrolling="no" frameborder="0" height="400" src=""></iframe>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 删除 -->
          <div id="modal-del" class="modal fade">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                  <h3>删除</h3>
                </div>
                <div class="modal-body">
                  <p>确定要删除选中记录吗？</p>
                </div>
                <div class="modal-footer">
                  <a data-dismiss="modal" class="btn btn-danger" href="#" onclick="deldata()">删除</a>
                  <a data-dismiss="modal" class="btn btn-primary" href="#">取消</a>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xs-12">
            <p>\${toolbar }</p>
            <div class="widget-box">
              <div class="widget-header header-color-blue">
                <h5 class="bigger lighter">
                  <i class="icon-table"></i>${stringUtil.headToUpperCase(field.beanName)}列表
                </h5>
              </div>
            </div>
            <div class="widget-body">
              <div class="widget-main no-padding">
                <table id="dataTable" class="table table-striped table-bordered table-hover">
                  <thead>
                    <tr>
                      <th class="center"></th>
${this._listPageTabTH(field)}
                    </tr>
                  </thead>

                  <tbody>
                    <c:forEach items="\${list}" var="${field.varBeanName}">
                      <tr>
${this._listPageTabTD(field)}
                      </tr>
                    </c:forEach>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="page_and_btn">\${${field.varBeanName}.paper.pageStr}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<%@include file="../../common/_footer.jsp"%>
<script>
  function getId() {
    var id = $("#dataTable input[name=checks]:checked:eq(0)").val();
    return id;
  }

  function search() {
    $("#modal-search").modal();
  }

  function add() {
    $("#iframe-add_edit").attr("src", "add_editpage.html");
    $("#modal-add_edit").modal();
  }

  function edit() {
    var id = getId();
    if (id) {
      $("#iframe-add_edit").attr("src", "add_editpage.html?${primaryKey}=" + id);
      $("#modal-add_edit").modal();
    } else {
      bootbox.alert("请选择要编辑的行数据");
    }
  }

  function del() {
    var id = getId();
    if (id) {
      $("#modal-del").modal();
    } else {
      bootbox.alert("请选择要删除的行数据");
    }
  }
  
  function deldata() {
    var id = getId();
    $.ajax({
      type : "post",
      url : "del.html",
      data: {${primaryKey}: id},
      dataType : "json",
      success : function(data) {
        if (!data.state) {
          bootbox.alert(data.message);
        } else {
          location.href = location.href;
        }
      }
    });
  }
</script>`
    let dir = './page/' + field.varBeanName
    if (!fs.existsSync(dir)) {
      fse.ensureDir(dir, err => {
        if (err) {
          return err
        }
      })
    }
    fs.writeFileSync('./page/' + field.varBeanName + '/list.jsp', context, 'utf-8')
  }

  _addEditPageItems (field) {
    let context = ''
    field.fieldList.forEach((e, i) => {
      if (e.fieldName === field.primaryKey || e.javaType === 'Date') {
        return false
      }
      let label = e.comment || stringUtil.headToUpperCase(e.name)
      context += `    <div class="form-group">
      <label class="col-xs-3 control-label text-right" for="${e.name}">${label}</label>
      <div class="col-xs-9">
        <input type="text" class="form-control" id="${e.name}" name="${e.name}" required value="\${${field.varBeanName}.${e.name}}" placeHolder="${label}" >
      </div>    
    </div>
`
    })
    return context
  }

  buildAddEditPage (field) {
    let primaryKey = stringUtil.toCamelCase(field.primaryKey)
    let context = `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>
<c:set var="ctx" value="\${pageContext.request.contextPath}"></c:set>

<html>
<head>
<link rel="stylesheet" href="\${statics }/css/bootstrap.min.css" />
<link rel="stylesheet" href="\${statics }/css/font-awesome.min.css" />
<link rel="stylesheet" href="\${statics }/css/chosen.css" />
<link rel="stylesheet" href="\${statics }/css/main.css" />
<link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:400,500" />
<%@ page trimDirectiveWhitespaces="true"%>
<title>电力营销系统</title>
</head>
<body>
  <form class="form-horizontal" method="post" action="add_edit.html" target="result" id="dataForm" style="overflow-y: auto; overflow-x: hidden; height: 100%;">
    <input type="hidden" name="token" value="\${token }">
    <input type="hidden" name="${primaryKey}" value="\${userApply.${primaryKey} }">
${this._addEditPageItems(field)}
        
    <div class="modal-footer">
      <input type="submit" class="btn btn-success" value="确定" />
    </div>
  </form>
  <iframe name="result" id="result" src="about:blank" frameborder="0" width="0" height="0"></iframe>
  
<%@include file="../../common/_footer.jsp"%>
<script type="text/javascript">

function success(){
  parent.location.href="\${ctx}/admin/yun/${field.varBeanName}/listpage.html";
}

function failed(){
  bootbox.alert("保存失败!");
}
//表单验证
$(function() {
  $("#dataForm").html5Validate(function() {
    $("input[type=submit]").prop("disabled", true);
    this.submit();
  });
});
</script>
`
    let dir = './page/' + field.varBeanName
    if (!fs.existsSync(dir)) {
      fse.ensureDir(dir, err => {
        if (err) {
          return err
        }
      })
    }
    fs.writeFileSync('./page/' + field.varBeanName + '/add_edit.jsp', context, 'utf-8')
  }
}

/* eslint-disable no-new */
new Builder()
