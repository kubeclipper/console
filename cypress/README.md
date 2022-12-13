# Cypress Command Introduction

## Common

- clickMenu 点击菜单
- setLanguage 设置语言
- visitPage 前往 url
- createClusterQuick 快速创建集群
- deleteCluster 删除集群
- loginByKeycloak oauth2 外部用户登录(keycloak)
- selectComponentTab 插件页选择 tab
- enableComponent 启用插件

## Table

- tableSearchText 表格搜索
- waitTableLoading 等待表格 loading 消失
- clickFirstActionButton 操作栏 first action 按钮
- clickActionButtonByTitle 点击指定 title 按钮
- clearSearchInput 清空搜索框
- clickLinkInColumn 点击表格中跳转列链接
- goToDetail 前往详情
- goBackToList 详情页返回列表页
- clickActionInMore 点击更多按钮
- hoverMore 光标 hover 更多
- clickTab 点击 tab
- waitStatusSuccess 等待状态成功
- waitStatusGreen 等待状态 green
- freshTable 刷新表格
- checkTableColVal 校验表格 col 列 存在 val 值
- clickByDetailTabs 点击详情页 tab
- selectAll 列表勾选所有
- selectByName 按名称勾选

## Form

- formInput input 框
- formSelect 选择框
- formCheckboxClick checkbox 类型表单
- formTextarea Textarea 类型输入框
- formRadioChoose Radio 类型选择框
- formRadioButtonChoose RadioButton 类型选择框
- formInputIp ip 输入框
- formInputPort port 输入框
- waitFormLoading 表单 loading
- closeNotice 关闭页面右上角 notification
- clickModalActionSubmitButton modal 框确认按钮
- clickConfirmActionSubmitButton confirm 框确认按钮
- clickStepActionNextButton 分步表单下一步按钮
- clickStepActionCancelButton 分步表单取消按钮
- clickStepActionConfirmButton 分步表单确认按钮
- formMultiTransfer 多穿梭框
- formArrayInputAdd ArrayInput 类型表单 添加 按钮
- formArrayInputRemove ArrayInput 类型表单 移除 按钮， index 表示移除第几个
- clickLeftTab 点击左侧 tab 按钮(比如：角色权限)

## Check commands

- waitTransferList 校验多穿梭框非空
- checkFormValue 校验表单值存在
- checkFormSelectorExist 检验选择框值存在
- checkFormSelectorNotExist 检验选择框值不存在
- checkConfirmStepItemContent 检验分步创建确认页表单值
- checkDetailName 校验详情页 name 存在
- checkActionNotExistInMore 校验指定 action 不存在更多中
- checkActionExistInMore 校验更多中应该存在 指定操作
- checkActionDisabled 校验指定操作是 disabled
- checkActionEnable 校验 firstAction 操作是 xxx,并且没有 disabled
- checkEmptyTable 校验表格为空
- checkTableRowLength 校验表格非空，且应该存在 rowLength 条数据
- waitStatusNoError 等待表格状态 no error
- waitStatusProcessing 等待表格 Processing 状态消失
- checkBaseDetailValue 校验详情页 BaseDetail 字段值
- checkDetailValueByKey 表单详情页 key 对应 value 值
- checkActionError 校验右上角弹窗是否是错误
- selectTableListByIndex 选择指定列表行
