/*
Navicat MySQL Data Transfer

Source Server         : remote
Source Server Version : 50528
Source Host           : 117.78.42.184:3306
Source Database       : yun_data

Target Server Type    : MYSQL
Target Server Version : 50528
File Encoding         : 65001

Date: 2017-07-11 08:57:39
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for yun_user_apply
-- ----------------------------
DROP TABLE IF EXISTS `yun_user_apply`;
CREATE TABLE `yun_user_apply` (
  `apply_seq` int(255) NOT NULL AUTO_INCREMENT,
  `create_time` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `apply_user_seq` int(255) DEFAULT NULL,
  `organization_name` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `organization_describe` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `state` int(255) DEFAULT NULL,
  `key` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `value` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`apply_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
