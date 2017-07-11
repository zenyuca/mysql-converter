/*
Navicat MySQL Data Transfer

Source Server         : remote
Source Server Version : 50528
Source Host           : 117.78.42.184:3306
Source Database       : yun_data

Target Server Type    : MYSQL
Target Server Version : 50528
File Encoding         : 65001

Date: 2017-07-11 16:52:46
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for yun_user_index
-- ----------------------------
DROP TABLE IF EXISTS `yun_user_index`;
CREATE TABLE `yun_user_index` (
  `index_seq` int(255) DEFAULT NULL,
  `url` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `create_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
-- Records of yun_user_index
-- ----------------------------
