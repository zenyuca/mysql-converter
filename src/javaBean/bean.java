package com.electric.wen.beans;
import java.io.Serializable;

import com.bingbee.card.util.paging.Page;
public class LadderBean extends BaseBean implements Serializable{
    private static final long serialVersionUID = 1L;
    private Page paper;
    /** 阶梯id */
    private Integer ladderId;
    /** 阶梯名称 */
    private String ladderName;
    /** 阶梯描述 */
    private String ladderDesc;
    /** 创建时间 */
    private Date createTime;
    /** 阶梯详情, JSON形式 */
    private String ladderInfo;

}
  