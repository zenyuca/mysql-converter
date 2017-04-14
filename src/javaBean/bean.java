package com.electric.wen.beans;
import java.io.Serializable;

import com.bingbee.card.util.paging.Page;
public class ApplyBean extends BaseBean implements Serializable{
    private static final long serialVersionUID = 1L;
    private Page paper;
    /** 主键id */
    private Integer applyId;
    /** undefined */
    private Integer listCheckerId;
    /** 录单员id */
    private Integer listRecorderId;
    /** 1 COMMENT '记录状态，如：1有效，2删除，等等' */
    private Integer recordStatus;
    /** 创建时间，如：2017-03-29 09:42:20 */
    private Date createTime;
    /**  COMMENT '用户编号' */
    private String userNumber;
    /** undefined */
    private String electricType;
    /**  COMMENT '用户名称' */
    private String userName;
    /**  COMMENT '用户地址' */
    private String userAddress;
    /**  COMMENT '联系电话' */
    private String phone;
    /** 0 COMMENT '申请合同容量（单位kw）' */
    private Integer applyAgreementCapacity;
    /** 0 COMMENT '申请运行容量（单位kw）' */
    private Integer applyRunCapacity;
    /**  COMMENT '电压' */
    private String voltage;
    /**  COMMENT '申请原因' */
    private String applyReason;
    /**  COMMENT '申请备注' */
    private String applyRemark;
    /** 0 COMMENT '资料状态（0=未勘察）' */
    private Integer applyStatus;
    /** 0 COMMENT '用电类型（0:居民、1:农业、2:大工业、3:一般工商业）' */
    private Integer useElectricType;
    /** 变电站id */
    private Integer stationId;
    /** 线路id */
    private Integer lineId;
    /** 台区id */
    private Integer zoneId;
    /** 变压器 */
    private Integer transformerId;
    /**  COMMENT '计量点名称' */
    private String calcPointerName;
    /** 0 COMMENT '计量方式' */
    private Integer calcMode;
    /** 0 COMMENT '计量点关系' */
    private Integer calcRelation;
    /**  COMMENT '勘察记录' */
    private String checkRemark;
    /** 0 COMMENT '抄表员id' */
    private Integer eleNumRecorderId;
    /** 计费方式1:按容量,2:按需量 */
    private Integer billing;

}
  