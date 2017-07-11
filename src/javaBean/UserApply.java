package com.bingbee.yun.beans;

import java.io.Serializable;
import com.bingbee.card.util.paging.Page;
import com.electric.wen.beans.BaseBean;
public class UserApply extends BaseBean implements Serializable {
    private static final long serialVersionUID = 1L;
    private Page paper;
    /**  */
    private Integer applySeq;
    /**  */
    private Date createTime;
    /**  */
    private Integer applyUserSeq;
    /**  */
    private String organizationName;
    /**  */
    private String organizationDescribe;
    /**  */
    private Integer state;
    /**  */
    private String cKey;
    /**  */
    private String cValue;

}
  