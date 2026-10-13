/* 左侧说明专用的默认模块；不会参与患者页面渲染。 */
const module = (title, description, fields, logic) => ({title, description, fields, logic});
const PAGE_MODULES = {
  home: [
    {"title": "首页滚动 Banner", "description": "首页标题下展示三张眠宝推荐卡片：健康记录、眠宝帮你、服务权益；可自动轮播、左右滑动、点击箭头或指示点切换。", "fields": "homeBanners[]：title、text、action、target、theme；homeBannerIndex、homeBannerPaused：当前会话状态。当前三项为可替换的静态配置。", "logic": "每 5 秒循环切换；点击按钮进入对应页面。离开首页清除计时器，返回重新启动；隐藏页面、焦点在轮播内、用户暂停或系统要求减少动态时不自动切换。切换仅更新轮播，不重绘页面或清空编辑内容。隐藏卡片不可获得焦点。业务活动图片、上线时间及运营配置接口待确认。"},
    module('晨起状态打卡','四档状态选择，选中后在当天保持高亮。','moods[本地日期]：四档状态之一。','同日只能提交一次；已记录时禁用四个选项。'),
    module('眠宝权益卡','根据商保状态与今日用药记录展示对应文案；点击文案进入下一步，点击眠宝切换预览状态。','insuranceStatus、meds[].day、homePreviewState。','未领取或审核中进入商保页；已领取未记录打开用药弹窗；已记录进入服药记录。'),
    module('快捷服务','药房地图、线上购药、随访管家、多元支付、用药提醒、不良反应速记、全部记录和我的专员入口。','各入口对应的目标页面。','点击入口进入对应二级页；服务待接入时展示明确状态。'),
    module('今日任务','显示今日用药与小憩任务的计划或完成情况。','settings.medTime、meds[]、naps[]。','保存记录后重新计算任务摘要；点击任务进入对应页面。')
  ],
  special: [
    module('本月与今日记录','一张卡片展示本月及今日猝倒记录次数、眠宝反馈和快速记录按钮。','events[].day、本月与上月事件数、今日事件数。','月度反馈按已记录次数比较；快速记录保存后同时更新月度和今日统计。'),
    module('猝倒周期趋势','按周展示每日猝倒次数，支持前后切周与查看所选周记录。','weekOffset、events[].day。','周一至周日聚合；查看记录从底部弹出所选周列表。'),
    module('测评记录','在 ESS 与 SRSS 间切换柱状图；支持进入 ESS 测评和上传量表照片。','activeScale、ess[]、scalePhotos[]。','ESS 可答题或拍照；SRSS 仅拍照；只展示已录入的得分。'),
    module('睡眠辅助工具','小憩闹钟、睡眠日志、注意力挑战、科学小贴士及不良反应记录入口。','各入口目标页面。','点击后进入相应工具或记录页。')
  ],
  ai: [
    module('眠宝欢迎区','医生形象眠宝与问候语。','静态形象与欢迎文案。','不采集输入，也不触发问答。'),
    module('智能问答入口','药品使用、猝倒与不良反应、饮食相互作用、常见问题四类主题。','topic：med / adverse / interaction / faq。','按主题进入对应聊天页；不良反应主题可转速记。'),
    module('医患直连服务','复诊预约、随访专员和紧急咨询三个入口。','各入口目标页面。','进入服务说明或意向表单；不得显示虚构服务结果。')
  ],
  rights: [
    module('创新支付状态与眠宝卡','顶部展示眠宝形象、状态说明与办理入口。','insuranceStatus：unclaimed/reviewing/claimed/rejected。','映射未申请/审核中/已通过/已拒绝；点击按钮进入商保直付。当前前三态为本地状态，拒绝态兼容后续数据。'),
    module('商保直付入口','进入用药权益状态和申请流程页。','目标页面 payment。','首页权益卡同步读取该页的状态。'),
    module('商保计算器入口','进入费用与比例的预估计算页。','目标页面 calculator。','入口不直接计算或判断保险资格。'),
    module('特定药品福利入口','进入福利申请流程说明页。','目标页面 welfare。','未接入真实申请服务时不生成审核结果。')
  ],
  mine: [
    module('个人形象与账户状态','顶部显示眠宝形象和当前账户状态。','authStatus：active / signed-out / closed。','退出或注销后展示相应状态及重新进入按钮。'),
    module('我的服务','我的记录、个人资料与消息通知入口。','各入口目标页面与记录数量。','点击进入对应列表或说明页。'),
    module('偏好与账户','任务提醒设置及通用设置入口。','settings、authStatus。','通用设置内处理通知偏好、协议、退出与注销。')
  ],
  med: [
    module('今日服药状态','展示计划时间、今日完成状态和服药记录按钮。','settings.medTime、meds[].day/time。','点击记录写入当前时间；修改提醒进入用药提醒页。'),
    module('最近记录','按时间倒序展示近期服药记录。','meds[]：day、time、note。','无记录时显示空状态。')
  ],
  medReminder: [
    module('提醒时间','设置每日计划用药时间。','settings.medTime：HH:mm，必填。','保存后首页今日用药卡片读取新时间。'),
    module('通知偏好','开关与“我的→设置”共用通知偏好。','settings.notificationEnabled：布尔值。','保存偏好时保留小憩时长；系统通知需独立接入。')
  ],
  nap: [
    module('小憩计时','显示今日次数、计划时长与倒计时；支持开始、暂停和结束。','settings.napMinutes、napRemaining、napStarted。','结束且至少计时 1 秒后写入记录；关闭页面不继续后台计时。'),
    module('小憩记录','展示近期小憩时长与发生时间。','naps[]：day、time、minutes。','保存后即时更新今日次数与记录列表。')
  ],
  eventForm: [
    module('猝倒事件信息','记录发生时间、持续时间、可能诱因和当时情况。','time 必填；duration、trigger、note 可选。','时间需可解析；允许事后补记。'),
    module('提交与返回','保存事件并返回来源页面或记录列表。','events[]：id、time、day、duration、trigger、note。','从底部弹窗提交后关闭弹窗；独立页面提交后进入记录列表。')
  ],
  eventList: [
    module('新增记录入口','跳转猝倒事件表单。','目标页面 eventForm。','新增后返回列表并更新统计。'),
    module('事件列表','倒序展示时间、诱因、时长和备注，支持删除。','events[]、id。','删除需确认；删除后日、周、月统计重新计算。')
  ],
  trend: [
    module('本周趋势','按周一至周日汇总已记录事件并绘图。','events[].day、本周日期范围。','仅统计保存过的记录；空日显示零。'),
    module('本周记录与全部事件','展示近期记录摘要并可跳转全部事件。','events[]：time、trigger、note。','列表按时间倒序；无记录时显示空状态。')
  ],
  essIntro: [
    module('测评说明','告知当前题目与正式 ESS 量表的区别。','说明文案。','当前分数不用于医学判断。'),
    module('开始与历史入口','开始八题答题或查看历史。','essStep、essAnswers、ess[]。','开始时重置进度和答案。')
  ],
  essQuiz: [
    module('题目与选项','展示当前题序、题干和 0–3 级选项。','essStep：0–7；essAnswers[]：0–3。','未选择时不能进入下一题；返回上一题保留已选值。'),
    module('进度与提交','展示八步进度，最后一题提交分数。','ess[]：score、answers、time。','八题完成后求和、保存并进入结果页。')
  ],
  essResult: [
    module('本次结果','展示本次求和分数及用途说明。','route.score。','不提供诊断或分层结论。'),
    module('后续操作','可查看历史或重新答题。','ess[]、essStep、essAnswers。','再做一次时清空当前答题进度。')
  ],
  essHistory: [
    module('历史记录','按时间倒序展示每次测评分数。','ess[]：score、time、answers。','无记录时展示空状态。'),
    module('来源返回','返回发起本页的页面。','页面访问栈。','返回不改变历史分数。')
  ],
  game: [
    module('注意力挑战','30 秒内点击目标得分，误点扣分。','gameState：tiles、score、left。','倒计时结束后锁定本次成绩。'),
    module('最近成绩','展示最近五次挑战分数和时间。','game[]：score、time。','结束时写入记录；游戏分数不作为临床指标。')
  ],
  sleepForm: [
    module('睡眠时间与感受','填写就寝、起床时间、主观感受及备注。','bed、wake 必填；quality、note 可选。','起床时间必须晚于就寝时间。'),
    module('保存日志','保存后返回睡眠日志列表。','sleep[]：bed、wake、day、quality、note。','跨日睡眠按完整日期时间校验。')
  ],
  sleepList: [
    module('新增日志入口','进入睡眠日志表单。','目标页面 sleepForm。','保存后列表即时更新。'),
    module('日志列表','展示就寝至起床时间、感受和备注，支持删除。','sleep[]、id。','按记录倒序；删除前确认。')
  ],
  tip: [
    module('提示卡片','展示当前睡眠小贴士内容。','tips[]、tipIndex。','内容来源与审核版本正式开发时需确定。'),
    module('换一条','点击按钮查看下一条提示。','tipIndex：0–2。','到末尾后循环回第一条。')
  ],
  adverseForm: [
    module('反应信息','填写发生时间、表现与自评严重程度。','time、detail 必填；severity 枚举。','保存为本地速记，不标记为正式 AE 上报。'),
    module('确认与提交','勾选知情确认后保存速记。','agree 必须勾选；adverse[]。','严重情况保留就医提示；保存后进入记录列表。')
  ],
  adverseList: [
    module('新增速记入口','进入不良反应速记表单。','目标页面 adverseForm。','保存后返回列表。'),
    module('速记列表','倒序展示发生时间、程度和描述，支持删除。','adverse[]、id。','删除前确认；记录不代表已经正式上报。')
  ],
  pharmacy: [
    module('定位授权','进入时从底部弹出位置用途说明和授权按钮。','pharmacyLocation：lat、lon。','用户授权后获取位置；拒绝时保留重试入口。'),
    module('当前位置地图','授权后显示 OpenStreetMap 地图。','当前位置坐标。','未授权时显示占位地图；坐标不写入本地持久化数据。'),
    module('附近药店列表','底部弹窗显示 3 公里内开放地图收录的药店。','pharmacyStores[]：name、address、distance。','查询失败和无结果分别显示状态；不推断库存或营业情况。')
  ],
  shop: [
    module('页面状态','页面主体仅展示“待接入”。','无业务字段。','不触发下单或支付。'),
    module('返回导航','通过顶部返回按钮回到来源页面。','页面访问栈。','返回时不生成订单。')
  ],
  follow: [
    module('预约复诊','进入本地预约意向表单。','目标页面 appointment。','不产生医院确认结果。'),
    module('联系随访专员','进入随访服务说明页。','目标页面 contact。','服务人员信息未接入时不展示虚构联系方式。')
  ],
  specialist: [
    module('专员引导','展示眠宝形象、添加专员说明。','专员名称、服务主体待配置。','服务主体与授权告知正式上线前确认。'),
    module('企业微信二维码','展示二维码占位区域。','二维码 URL、有效期待配置。','当前占位不可扫码；正式二维码需可维护和失效处理。')
  ],
  payment: [
    module('权益状态','展示未领取、审核中或已领取，并可切换本地状态。','insuranceStatus：unclaimed / reviewing / claimed。','状态切换后首页权益文案同步重算；不能作为真实资格结论。'),
    module('预计流程','展示资格、保单处方核验和支付渠道三个步骤。','正式资格与渠道字段待接入。','当前不向保险机构提交申请。')
  ],
  chat: [
    module('主题会话','展示眠宝问候、用户问题与回复历史。','chat[]：topic、q、a。','按当前主题过滤并显示历史。'),
    module('提问与辅助入口','输入问题并发送；不良反应主题可进入速记。','question 必填；topic。','保存本地问答后滚动至最新消息；不输出诊断或处方调整。')
  ],
  appointment: [
    module('预约意向表单','填写称呼、期望日期和沟通事项。','name、date 必填；note 可选。','期望日期不早于今天；只保存本地意向。'),
    module('已保存意向','显示已填写的预约意向。','appointments[]：name、date、note、time。','倒序展示；未提交医院时不显示确认状态。')
  ],
  contact: [
    module('随访服务说明','说明服务人员、工作时间和联系方式的待接入信息。','服务主体与专员资料待接入。','不展示虚构的联系方式。'),
    module('接入状态操作','点击查看当前服务接入状态。','无新增业务字段。','服务未接入时给出明确反馈。')
  ],
  emergency: [
    module('紧急情况提示','提示用户联系当地急救或医疗机构。','静态提示内容。','不能暗示存在实时医生响应。'),
    module('发生情况记录','进入不良反应速记页。','目标页面 adverseForm。','记录行为与紧急求助分开。')
  ],
  calculator: [
    module('费用输入','填写预计费用和预估比例。','cost ≥0；ratio 0–100。','空值、负值或超范围比例不得计算。'),
    module('预估结果','展示费用乘比例的金额。','result = cost × ratio / 100。','结果标为预估，实际待遇以保险机构审核为准。')
  ],
  welfare: [
    module('申请步骤','展示条件、材料、进度和领取四步预计流程。','正式福利资格及材料字段待接入。','当前不采集真实申请材料。'),
    module('申请状态入口','点击查看服务状态。','正式申请单和进度待接入。','不生成虚构审核结果。')
  ],
  profile: [
    module('身份与数据位置','展示当前身份、数据保存位置与服务授权说明。','当前账户状态、localStorage。','不展示未经核验的患者资格。'),
    module('清除本地记录','提供清理当前浏览器业务记录的入口。','mianbao-prototype-v1。','执行前确认；写入 index.html 的说明和意见保留。')
  ],
  settings: [
    module('用药计划时间','调整首页任务读取的计划服药时间。','settings.medTime：HH:mm。','保存时不覆盖通知偏好。'),
    module('小憩计划时长','调整小憩计时的计划分钟数。','settings.napMinutes：1–120。','保存后小憩页面使用新时长。')
  ],
  accountSettings: [
    module('通知偏好','切换消息通知提醒设置。','settings.notificationEnabled。','当前只保存偏好，不请求系统通知权限。'),
    module('用户协议','进入只读协议页。','目标页面 agreement。','协议正文待业务方提供。'),
    module('账户操作','退出登录或进入注销页。','authStatus。','退出保留本地记录；注销须单独确认。')
  ],
  agreement: [
    module('协议阅读区','展示用户协议入口和待接入正文说明。','version、effectiveAt、content 待接入。','当前不记录同意状态。'),
    module('返回设置','通过顶部返回按钮回到设置。','页面访问栈。','返回不改变账户状态。')
  ],
  accountDelete: [
    module('注销说明','说明将清除当前浏览器记录与设置。','本地业务数据。','写入项目文件的页面说明与意见不在清除范围。'),
    module('二次确认','点击注销后输入“注销”确认。','确认文字必须精确匹配“注销”。','确认后清除本地业务数据并写入 closed 状态。')
  ],
  records: [
    module('记录分类','服药、猝倒、睡眠、ESS 和不良反应五类入口。','meds、events、sleep、ess、adverse 的记录数。','数量按数组长度实时计算。'),
    module('分类跳转','点击分类进入对应记录列表。','目标页面。','返回时保留当前记录数据。')
  ],
  notice: [
    module('消息空状态','当前显示暂无通知。','当前无消息列表字段。','正式消息类型和订阅授权待定义。'),
    module('返回导航','通过顶部返回按钮返回来源页面。','页面访问栈。','返回不修改通知偏好。')
  ]
};
function moduleSpecFor(route){return PAGE_MODULES[route.name]||[]}

PAGE_MODULES.ai = [{"title": "眠宝关怀与咨询", "description": "显示小绵羊欢迎、四档今日感受、热门问题和自由咨询；支持本地关键词匹配、多意图合并与超范围回复。", "fields": "服务独立状态 mianbao-integrated-service-v1；sessions[]、messages[]、dailyCheckins[date]：mood、askedAt、answeredAt、deferred 等源模块字段。", "logic": "采用指定链接中的完整服务流程；会话超过 3 天未互动新建，历史保留近 12 个月；AI 为本地规则匹配，医学与政策内容待正式审核。该模块数据不改写首页、专病管理、权益中心与我的现有记录。"}, {"title": "创新支付、入组与援助申请", "description": "展示入组、福利订单和直付/后报销进度；在会话中逐步完善资料、上传材料、核对提交，支持暂停、恢复、重新填写及驳回补件。", "fields": "enrollment、type、code、patient、orders[]、aidDrafts 与会话 careFlows；材料图片本地保存。", "logic": "保留源模块的状态字典与订单过滤：20 区分药房审核阶段、21 过滤；后报销需处方与发票，直付含用药数量。申请提交为本地流程，未接保险/审核/理赔接口；不改变原权益中心的状态。"}, {"title": "病历夹与用药记录", "description": "聊天中记录病程文字、录制语音、上传图片；支持时间线、类型筛选、音频回放、图片放大和用药记录。", "fields": "IndexedDB mianbao-integrated-care-records-v1 的 records、media；记录时间、文字、媒体、药品、用药状态、备注。", "logic": "语音为录音与回放，不含语音转文字；每段最长 2 分钟，图片每条最多 4 张，单文件最多 10 MB，图片压缩后保存。记录时间不能在未来，保存前需停止录音；用药状态含已服用/漏服/暂停，新增记录不提供医学建议。"}, {"title": "健康科普", "description": "先在聊天中展示三篇推荐文章；查看更多展开六篇文章及分类，支持全文阅读、收起与展开。", "fields": "源模块 articles[]、articleFilter、articleId 与消息 kind=articles/appPanel。", "logic": "所有文章操作保持在眠宝会话内；内容为记录与资料整理说明，正式医学内容和发布审核接口待接入。"}, {"title": "客服、不良事件与我的服务", "description": "真人客服入口、疑似不良事件识别与确认记录；头像展开患者资料、历史会话和福利关爱记录。", "fields": "reports[]、patient、sessions[]、orders[]；历史会话分页；申请人姓名打码。", "logic": "客服为源模块模拟服务，不实际拨号；不良事件仅本地记录，不能称为正式上报。历史会话、订单详情和材料查看均在当前会话中展开。"}, {"title": "会话快捷操作与状态设置", "description": "发起会话后，输入区上方展示可横向滑动的创新支付、记录病程、用药记录、真人客服；状态按钮保留源模块场景切换和数据重置。", "fields": "activeSession、view、conversationActions；入组/支付/订单状态控件。", "logic": "首屏与空会话不显示快捷按钮；状态设置只更新本服务模块。清空聊天保留说明、病历、用药与订单；重置仅清理本服务模块数据。宿主左侧说明及右侧修改意见沿用原保存机制。"}];

PAGE_MODULES.ai[0] = {"title": "眠宝欢迎与咨询", "description": "显示小绵羊欢迎、热门问题和自由咨询；支持本地关键词匹配、多意图合并与超范围回复。", "fields": "服务独立状态 mianbao-integrated-service-v1；sessions[]、messages[]。", "logic": "欢迎区仅展示眠宝形象与介绍，点击问问眠宝进入咨询；不展示或写入每日状态记录。会话超过 3 天未互动新建，历史保留近 12 个月；AI 为本地规则匹配，医学与政策内容待正式审核。该模块数据不改写首页、专病管理、权益中心与我的现有记录。"};

PAGE_MODULES.home = [{"title": "首页滚动 Banner", "description": "首页标题下展示三张眠宝推荐卡片：健康记录、眠宝帮你、服务权益；可自动轮播、左右滑动、点击箭头或指示点切换。", "fields": "homeBanners[]：title、text、action、target、theme；homeBannerIndex、homeBannerPaused：当前会话状态。当前三项为可替换的静态配置。", "logic": "每 5 秒循环切换；点击按钮进入对应页面。离开首页清除计时器，返回重新启动；隐藏页面、焦点在轮播内、用户暂停或系统要求减少动态时不自动切换。切换仅更新轮播，不重绘页面或清空编辑内容。隐藏卡片不可获得焦点。业务活动图片、上线时间及运营配置接口待确认。"}, {"title": "状态打卡", "description": "四档状态选择：精神饱满/有些疲惫/需要小睡/状态不佳；\n选择后下方对应文案变更；", "fields": "moods[本地日期]：四档状态之一。\n建议正式字段（待确认）：userId、recordDate、moodCode、createdAt、updatedAt；recordDate 按选定业务时区生成。", "logic": "同日只能提交一次；已记录时禁用四个选项。\n\n【B02/B03｜现状】四档仅更新“今天的感受”文字；权益主文案由支付和服药记录决定。当前同日一次，不可修改。\n【建议规则（待确认）】晨起记录按 userId + recordDate 唯一；误选通过“修改当日状态”覆盖原记录而非新增，保留修改时间；未选择时显示引导，已选择时显示选中项。跨日重新计算日期及可选状态。\n【待确认】是否开放修改；四档对应反馈文案与形象配置；晨起反馈与权益信息的排列关系；日期统一北京时间还是用户时区。未确认前不把晨起状态当作疾病判断。"}, {"title": "眠宝权益卡", "description": "根据商保状态与今日用药记录展示对应文案；点击文案进入下一步，点击眠宝切换预览状态。", "fields": "当前字段补齐：insuranceStatus、meds[].day、homePreviewState。\n建议申请字段（待确认）：applicationId、applicationStatus、benefitStatus、updatedAt、rejectReason。", "logic": "未领取或审核中进入商保页；已领取未记录打开用药弹窗；已记录进入服药记录。\n\n【A02/D01｜现状】未领取/审核中进入 payment；已领取且今日无记录打开服药弹窗；已记录进入 med。点击眠宝可覆盖展示状态，不改变申请数据。\n【建议规则（待确认）】申请状态与权益可用状态分别保存；approved 只有经权益接口确认可用后才映射“已领取”。审核拒绝显示拒绝原因及重申入口，不能映射已领取。状态成功刷新后统一重算首页与权益中心。\n【待确认】未申请/审核中/已通过/已拒绝分别对应的首页文案、按钮、跳转；通过后是否需激活；多个申请取哪一份；申请服务、失效规则。临时展示状态不作为真实办理依据，正式版是否保留点击切换需确认。"}, {"title": "快捷服务", "description": "六个入口：药房地图、线上购药、多元支付、用药提醒、不良反应速记和我的专员。", "fields": "pharmacy、shop、payment、medReminder、adverseForm、specialist。", "logic": "点击进入相应二级页面；首页不再展示随访管家和全部记录入口，我的页面的记录入口保持可用。"}, {"title": "今日用药与眠宝引导弹窗", "description": "点击今日用药或首页权益卡的记录按钮，居中弹出眠宝 GIF 引导；确认已按医嘱服药后保存，已记录时显示完成状态与查看入口。", "fields": "settings.medTime；meds[]：id、time、day、note；动效 assets/mianbao-med-guide.gif。", "logic": "点击任务不再直接跳详情；确认后保存当前时间与日期并关闭弹窗，同日该弹窗只保存一次，刷新任务及首页权益文案。已记录点击查看进入服药详情；开启减少动态时以静态眠宝替代 GIF。"}, {"title": "小憩引导弹窗与首页倒计时", "description": "点击日常小憩时钟居中弹出与今日用药同样的眠宝 GIF 卡片，填写时长并添加，随后关闭弹窗并在首页显示倒计时。进行中再次点击可暂停、继续或结束并记录。", "fields": "napSession：id、day、startedAt、totalSeconds、remainingSeconds、endsAt、status(running/paused/finished)；时长 1—120 整数分钟；naps[]：id、day、time、minutes；动效 assets/mianbao-nap-guide.gif。", "logic": "添加时建立计时会话，不计入已完成次数。倒计时每秒按 endsAt 和当前时间计算，不改写整页或左侧编辑内容；切换页面继续，刷新恢复。暂停保存剩余秒数，继续重建 endsAt。到时自动保存一条小憩记录，id 去重，归属开始日期；提前结束至少计时 1 秒才保存，分钟向上取整。保存失败保留会话可重试，不显示虚假完成；取消本次小憩不新增记录；未接入关闭页面后的通知。"}];
PAGE_MODULES.rights = [{"title": "创新支付状态与眠宝卡", "description": "顶部标题下展示眠宝形象、当前创新支付状态、状态说明和操作按钮；按钮进入商保直付页。", "fields": "当前读取 insuranceStatus：unclaimed → 未申请，reviewing → 审核中，claimed → 已通过，rejected → 已拒绝。当前本地流程只生成前三态，rejected 为兼容后续状态数据。\n正式申请来源、申请维度及审核接口仍待业务确认。", "logic": "【当前实现】进入权益中心实时读取状态；申请或权益状态变更后返回本页重算。未申请→了解申请流程；审核中→查看申请进度；已通过→查看用药权益；已拒绝→查看申请详情，均进入 payment。未知值回退为未申请。未接入真实审核，不生成虚构审核结果。\n【待确认】创新支付是否仅对应商保、通过与权益激活的关系、多份申请/拒绝原因/补件/撤回/重新申请/到期规则；正式状态以真实接口为准。"}, {"title": "商保直付入口", "description": "进入用药权益状态和申请流程页。", "fields": "目标页面 payment。\n建议 serviceCode、applicationId、currentApplication；权益卡与首页读取同一申请数据。", "logic": "首页权益卡同步读取该页的状态。\n\n【A02/D01｜建议规则（待确认）】进入商保直付查看本用户对应服务的当前申请；提交/状态更新后返回本页刷新卡片；无资格/服务不可用显示原因，不默认可申请。\n【待确认】资格核验、服务地区、创新支付卡是否汇总该入口、多个申请排序。"}, {"title": "商保计算器入口", "description": "进入费用与比例的预估计算页。", "fields": "目标页面 calculator。\n目标 calculator；预估规则包含 calculationVersion、serviceCode（若接入正式方案）。", "logic": "入口不直接计算或判断保险资格。\n\n【D02｜建议规则（待确认）】仅跳计算器；输入和结果不改变申请资格或审核状态；计算器明确金额性质和估算口径。\n【待确认】用户手填比例还是按方案计算、地区/保单数据来源。"}, {"title": "权益轮播 Banner（待实现）", "description": "最新意见要求自动滚动 Banner；本模块只补需求，当前中间页面不增加轮播。", "fields": "建议 bannerId、imageUrl、title、sortOrder、enabled、startAt、endAt、targetType、target、audienceRule。", "logic": "【A03｜建议规则（待确认）】仅展示已启用且在有效时间内的 Banner；按 sortOrder 排序；0 张隐藏区域，1 张不轮播，多张默认每 5 秒循环；支持手动切换，离开页面停止。点击按配置跳内部页面或受支持外链；无目标则不可点；图片失败使用占位，失效目标给出提示。\n【待确认】轮播间隔、尺寸/数量/指示器、配置来源、地区或状态定向、外链规则。"}];
PAGE_MODULES.nap = [{"title": "小憩计时与会话", "description": "点击日常小憩时钟居中弹出与今日用药同样的眠宝 GIF 卡片，填写时长并添加，随后关闭弹窗并在首页显示倒计时。进行中再次点击可暂停、继续或结束并记录。", "fields": "napSession：id、day、startedAt、totalSeconds、remainingSeconds、endsAt、status(running/paused/finished)；时长 1—120 整数分钟；naps[]：id、day、time、minutes；动效 assets/mianbao-nap-guide.gif。", "logic": "添加时建立计时会话，不计入已完成次数。倒计时每秒按 endsAt 和当前时间计算，不改写整页或左侧编辑内容；切换页面继续，刷新恢复。暂停保存剩余秒数，继续重建 endsAt。到时自动保存一条小憩记录，id 去重，归属开始日期；提前结束至少计时 1 秒才保存，分钟向上取整。保存失败保留会话可重试，不显示虚假完成；取消本次小憩不新增记录；未接入关闭页面后的通知。"}, {"title": "小憩记录", "description": "展示已完成的小憩时长和时间。", "fields": "naps[]：id、day、time、minutes。", "logic": "到时或提前结束成功保存后刷新列表；同一会话最多一条记录，未完成计时不计入次数。"}];
PAGE_MODULES.profile = [{"title": "身份与服务授权", "description": "展示当前身份与服务授权说明。", "fields": "当前账户状态、localStorage。\n建议 userId、nickname、contact、role、authorizationRecords、dataSyncStatus；仅按确认范围收集。", "logic": "不展示未经核验的患者资格。\n\n【E01｜建议规则（待确认）】展示真实账号身份和授权状态；健康资料按账号隔离，云端同步失败可见；登录过期不展示旧账号私有资料。\n【待确认】实名/处方/确诊是否必需、家属访问、资料编辑、授权拒绝后功能范围。"}, {"title": "清除本地记录", "description": "提供清理当前浏览器业务记录的入口。", "fields": "mianbao-prototype-v1。\n建议 clearScope: localCache；正式云端删除另有 deleteRequestId/status。", "logic": "执行前确认；写入 index.html 的说明和意见保留。\n\n【E01/E02｜现状】只清本地业务记录，页面说明/意见留在项目文件。\n【建议规则（待确认）】确认中明确清理范围；清缓存不删除云端账号数据；清理失败保留原状态并提示；正式数据删除须走单独身份验证流程。\n【待确认】本期是否仍只清本地、哪些缓存保留、云端删除/数据保留。\n\n【E02/E03｜通用建议（待确认）】存在保存/删除/查询时，加载、成功、失败和空数据分别显示；失败保留输入或原数据，不伪造完成。重复请求使用记录级标识去重；未保存离开提示；新增/修改/删除成功刷新依赖统计。只读页面无额外数据写入。\n【E06｜说明版本】“现状”描述当前界面；“建议规则（待确认）”是开发方案供业务确认；“待实现”只指说明中的新模块。旧页面通用规则与本模块建议冲突时先确认再实现，不能视为中间页面已经变更。\n【已确认｜二级导航】本页面隐藏底部五项一级导航栏，内容区占用释放的底部空间；使用顶部返回按钮回到来源页。仅首页、专病管理、眠宝帮你、权益中心、我的显示底部导航。"}];
delete PAGE_MODULES.welfare;

PAGE_MODULES.login = [{"title": "眠宝形象与登录入口", "description": "登录页展示眠宝形象，只有微信手机号登录按钮和两项协议查看/确认入口；不展示主导航。", "fields": "authStatus：signed-out/active/closed；loginSession.phoneAuthorized、authorizedAt。", "logic": "首次访问及没有手机号授权的旧记录进入登录；保存的授权且 authStatus=active 时直接进入首页。退出登录回到登录页，保留已有业务记录。当前只实现授权样式与本地登录状态，不获取真实手机号或调用微信 API。"}, {"title": "两个协议确认弹窗", "description": "分别打开用户协议和隐私政策弹窗；可同意或暂不同意。点击登录后按用户协议→隐私政策顺序确认。", "fields": "protocolConsents.terms/privacy：version、confirmedAt；当前 version=preview-20261013。", "logic": "两项都确认后才能打开手机号授权；拒绝或关闭中断本次登录，已确认项保留。版本变化需重新确认。当前正文仅为流程说明，正式协议及隐私政策文本、主体与法务审核待提供。"}, {"title": "微信手机号授权样式弹窗", "description": "底部展示应用标识、获取手机号说明、打码号码与拒绝/允许两个按钮。", "fields": "静态样式号码 138 **** 0000；不采集或保存该号码。", "logic": "拒绝返回登录页；允许保存登录状态并进入首页，无档案时立即显示眠宝建档引导。保存失败保留弹窗，不伪造登录成功。真实微信 getPhoneNumber 及服务端换取手机号、用户会话、登录失效机制待接入。"}];
PAGE_MODULES.patientArchive = [{"title": "眠宝引导与两项档案字段", "description": "建档页显示眠宝引导；仅填写 NT1阵发性睡病确诊时间、当前使用药物两个业务字段。", "fields": "patientArchive.diagnosisDate：YYYY-MM-DD，必填；currentDrugs：1—500 字，必填，可填写暂无用药；createdAt、updatedAt 为保存元数据。", "logic": "校验日期真实有效且不晚于当前业务日期；药物去除首尾空白后不得为空。不自动推断药品、剂量或治疗方案，其他疾病/身份信息不在本页采集。"}, {"title": "保存、返回与档案回顾", "description": "保存完成后进入首页；稍后建档或返回后，可从我的→个人资料继续建立或修改。", "fields": "onboardingPending：首次登录缺档案时为 true；archiveFormDraft：当前填写草稿。", "logic": "首次授权后首页弹出眠宝建档提示；已有完整档案不提示。稍后再说关闭引导，不创建空档案；保存成功更新档案并清除待建档状态；失败保留输入和旧档案。页面隐藏主导航，返回不保存输入。实际档案数据接口、权限、隐私合规与业务日期时区待确认。"}];
PAGE_MODULES.profile = [{"title": "健康档案摘要", "description": "显示是否已建档，以及确诊时间和当前使用药物；可进入建立或修改档案。", "fields": "patientArchive.diagnosisDate、currentDrugs。", "logic": "未建档显示建立档案，已建档显示摘要和修改档案。"}, {"title": "清除记录", "description": "保留原清除记录入口。", "fields": "父应用 mianbao-prototype-v1。", "logic": "操作前二次确认；清理父应用记录后重新进入登录，不修改独立眠宝服务的数据。"}];

PAGE_MODULES.home.unshift({"title": "首次登录建档引导", "description": "手机号授权后到达首页，无健康档案时展示带眠宝的建档提示弹窗。", "fields": "onboardingPending、patientArchive；目标 patientArchive。", "logic": "点击建立档案进入两字段表单，稍后再说关闭提示；已有档案不展示。刷新时未处理的提示保留；不影响首页原任务与服务。"});
