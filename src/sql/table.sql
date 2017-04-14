/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 50520
Source Host           : 192.168.2.130:3306
Source Database       : wen_data

Target Server Type    : MYSQL
Target Server Version : 50520
File Encoding         : 65001

Date: 2017-04-14 10:28:40
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for m_ladder
-- ----------------------------
DROP TABLE IF EXISTS `m_ladder`;
CREATE TABLE `m_ladder` (
  `ladderId` int(11) NOT NULL AUTO_INCREMENT COMMENT '阶梯id',
  `ladderName` varchar(255) DEFAULT NULL COMMENT '阶梯名称',
  `ladderDesc` varchar(255) DEFAULT NULL COMMENT '阶梯描述',
  `createTime` datetime DEFAULT NULL COMMENT '创建时间',
  `ladderInfo` varchar(2000) DEFAULT NULL COMMENT '阶梯详情, JSON形式',
  PRIMARY KEY (`ladderId`)
) ENGINE=MyISAM AUTO_INCREMENT=139 DEFAULT CHARSET=utf8;
SET FOREIGN_KEY_CHECKS=1;
