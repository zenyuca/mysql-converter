/*
Navicat MySQL Data Transfer

Source Server         : remote
Source Server Version : 50528
Source Host           : 117.78.42.184:3306
Source Database       : yun_data

Target Server Type    : MYSQL
Target Server Version : 50528
File Encoding         : 65001

Date: 2017-07-14 15:54:11
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for h_user_info
-- ----------------------------
DROP TABLE IF EXISTS `h_user_info`;
CREATE TABLE `h_user_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT '用户名',
  `user_age` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT '年龄',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `userPhone` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT '用户电话',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of h_user_info
-- ----------------------------
