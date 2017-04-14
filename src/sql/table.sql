/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 50520
Source Host           : 192.168.2.130:3306
Source Database       : wen_data

Target Server Type    : MYSQL
Target Server Version : 50520
File Encoding         : 65001

Date: 2017-04-14 10:09:52
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for m_apply
-- ----------------------------
DROP TABLE IF EXISTS `m_apply`;
CREATE TABLE `m_apply` (
  `applyId` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `listCheckerId` int(11) DEFAULT NULL,
  `listRecorderId` int(11) DEFAULT NULL COMMENT '录单员id',
  `recordStatus` int(11) DEFAULT '1' COMMENT '记录状态，如：1有效，2删除，等等',
  `createTime` datetime DEFAULT NULL COMMENT '创建时间，如：2017-03-29 09:42:20',
  `userNumber` varchar(255) DEFAULT '' COMMENT '用户编号',
  `electricType` varchar(200) DEFAULT NULL,
  `userName` varchar(255) DEFAULT '' COMMENT '用户名称',
  `userAddress` varchar(255) DEFAULT '' COMMENT '用户地址',
  `phone` varchar(255) DEFAULT '' COMMENT '联系电话',
  `applyAgreementCapacity` int(11) DEFAULT '0' COMMENT '申请合同容量（单位kw）',
  `applyRunCapacity` int(11) DEFAULT '0' COMMENT '申请运行容量（单位kw）',
  `voltage` varchar(255) DEFAULT '' COMMENT '电压',
  `applyReason` varchar(1000) DEFAULT '' COMMENT '申请原因',
  `applyRemark` varchar(1000) DEFAULT '' COMMENT '申请备注',
  `applyStatus` int(11) DEFAULT '0' COMMENT '资料状态（0=未勘察）',
  `useElectricType` int(11) DEFAULT '0' COMMENT '用电类型（0:居民、1:农业、2:大工业、3:一般工商业）',
  `stationId` int(11) DEFAULT NULL COMMENT '变电站id',
  `lineId` int(11) DEFAULT NULL COMMENT '线路id',
  `zoneId` int(11) DEFAULT NULL COMMENT '台区id',
  `transformerId` int(11) DEFAULT NULL COMMENT '变压器',
  `calcPointerName` varchar(255) DEFAULT '' COMMENT '计量点名称',
  `calcMode` int(11) DEFAULT '0' COMMENT '计量方式',
  `calcRelation` int(11) DEFAULT '0' COMMENT '计量点关系',
  `checkRemark` varchar(100) DEFAULT '' COMMENT '勘察记录',
  `eleNumRecorderId` int(11) DEFAULT '0' COMMENT '抄表员id',
  `billing` int(11) DEFAULT NULL COMMENT '计费方式1:按容量,2:按需量',
  PRIMARY KEY (`applyId`)
) ENGINE=MyISAM AUTO_INCREMENT=61 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
SET FOREIGN_KEY_CHECKS=1;
