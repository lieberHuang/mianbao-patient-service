/* 左侧需求面板：每个可进入的页面都有对应说明。 */
const REQUIREMENTS = {
  home: {
    title:'患者首页', group:'首页', origin:'图示页面',
    goal:'让患者在首页的一张卡片中记录晨起状态、看到眠宝反馈，并快速找到今日任务与快捷服务。',
    interactions:['选择晨起状态：写入 moods[当日]，同日禁止再次提交。','首页眠宝文案由商保领取状态和今日用药记录共同计算；点击文案区进入商保或底部服药记录，点击眠宝切换四种预览状态。','快捷服务包含“我的专员”和“用药提醒”；今日任务读取用药与小憩记录。'],
    data:'晨起状态、今日服药与小憩记录、计划时间。',
    pending:'正式药品名、任务计划、消息提醒和外部服务入口需业务方确认。'
  },
  special: {
    title:'发作性睡病专区', group:'专病管理', origin:'图示页面',
    goal:'集中记录猝倒、睡眠和自测信息，帮助患者回顾一段时间内的变化。',
    interactions:['同一张顶部卡片展示本月与今日猝倒记录：月度文案根据与上月的比较生成；点击眠宝循环切换三种预览状态。','今日区域点击快速记录打开底部弹窗，保存后同步刷新两项统计；周趋势切换只更新所选周数据。','测评记录在 ESS/SRSS 间切换；ESS 可进入测评或拍照，SRSS 仅拍照；注意力挑战位于睡眠辅助工具。'],
    data:'猝倒事件、所选周、ESS 测评记录、ESS/SRSS 本地照片与手填分数、小憩和睡眠日志。',
    pending:'正式量表题目、授权、计分规则及拍照识别需确认；照片仅保存在当前浏览器。'
  },
  ai: {
    title:'眠宝帮你', group:'眠宝帮你', origin:'图示页面',
    goal:'按主题承接药品与疾病相关问题，并引导到合适的人工服务入口。',
    interactions:['医生形象眠宝在顶部欢迎患者；点击四类问答主题进入对话。','从医患直连区进入复诊预约、随访专员或紧急咨询。','疑似不良反应问题可转至速记页面。'],
    data:'主题、问题、固定回复与本地会话历史。',
    pending:'真实 AI 引擎、审核知识库、引用来源和人工转接服务尚未接入。'
  },
  rights: {
    title:'权益中心', group:'权益中心', origin:'图示页面',
    goal:'集中展示多元支付与保障服务。',
    interactions:['顶部展示眠宝创新支付状态卡，其后展示商保直付、商保计算器与特定药品福利申请三个入口。','商保直付状态变更后，返回首页应重新计算眠宝权益文案。'],
    data:'各保障服务的输入与本地状态。',
    pending:'保险资格、福利项目与正式服务渠道需接入真实规则。'
  },
  mine: {
    title:'我的', group:'我的', origin:'导航图示，内容补充',
    goal:'集中管理个人记录和页面设置。',
    interactions:['我的首页展示眠宝形象、记录与个人资料入口，以及任务提醒设置和通用设置入口。','设置页可保存消息通知偏好，进入用户协议、退出登录和注销账号。','退出登录保留本地记录；注销经二次输入确认后清除本地记录，页面修改意见仍保留在项目文件。'],
    data:'当前浏览器保存的记录与设置。',
    pending:'正式账户、患者身份、授权管理和云端同步未设计。'
  },
  med: {
    title:'服药打卡', group:'首页 · 今日任务', origin:'交互补充',
    goal:'记录患者是否已按自己的医嘱完成用药，并回看近期记录。',
    interactions:['点击“记录已按医嘱服药”生成一条时间记录。','点击“修改提醒”进入计划设置。','同日可补充记录；首页底部弹窗则仅在今日未记录时新增一条。'],
    data:'计划时间、实际记录时间、当日完成状态。',
    pending:'漏服与补服指导必须依据获批资料和个体医嘱审核。'
  },
  medReminder: {
    title:'用药提醒', group:'首页 · 快捷服务', origin:'页面意见补充',
    goal:'让用户维护每日用药提醒时间与通知偏好。',
    interactions:['从首页快捷服务进入；调整提醒时间和通知开关。','保存后返回首页，今日用药卡片显示新的计划时间。'],
    data:'settings.medTime：HH:mm；settings.notificationEnabled：布尔值。',
    pending:'系统级通知、订阅授权和实际送达服务待接入。'
  },
  nap: {
    title:'小憩时钟', group:'首页 / 专病管理', origin:'交互补充',
    goal:'帮助患者按照自己的计划进行短暂休息，并留下时长记录。',
    interactions:['开始、暂停或继续倒计时。','点击“结束并记录”保存本次小憩。','返回时查看当日次数和最近记录。'],
    data:'计划时长、实际计时时长、记录时间和次数。',
    pending:'网页关闭后不会后台计时；正式提醒需系统通知能力。'
  },
  eventForm: {
    title:'新增猝倒记录', group:'专病管理 · 猝倒', origin:'交互补充',
    goal:'快速保留一次事件的发生时间，再补充关键场景。',
    interactions:['发生时间必填，可填写持续时间、诱因和现场情况。','表单不显示“有跌倒或受伤”选项。','从专病首页弹窗保存后留在当前页，独立表单保存后进入记录列表；趋势同步更新。'],
    data:'时间、持续分钟数、诱因和备注。',
    pending:'图片提出语音病历；录音、转写、分享权限尚未接入。'
  },
  eventList: {
    title:'猝倒记录列表', group:'专病管理 · 猝倒', origin:'交互补充',
    goal:'按时间回顾已记录的猝倒事件。',
    interactions:['查看事件摘要。','新增记录或删除本地记录。','删除后趋势统计随之更新。'],
    data:'已保存事件与记录时间。',
    pending:'正式版本应补充编辑、撤销删除及复诊摘要导出。'
  },
  trend: {
    title:'猝倒趋势', group:'专病管理 · 趋势', origin:'图示趋势，交互补充',
    goal:'以一周为单位查看已经记录的事件数量。',
    interactions:['查看周内每日次数。','查看最近事件摘要并进入全部事件列表。'],
    data:'本周每天的已记录事件数。',
    pending:'“未记录”不能解释为“未发生”；月视图与诱发情绪分析待定义。'
  },
  essIntro: {
    title:'ESS 测评说明', group:'专病管理 · ESS', origin:'图示入口，交互补充',
    goal:'在答题前说明当前题目与正式量表的区别。',
    interactions:['阅读说明后开始八题答题流程。','进入历史测评列表。'],
    data:'答题记录。',
    pending:'当前不是正式 ESS；正式题目、授权、计分及解读需医学审核。'
  },
  essQuiz: {
    title:'ESS 答题', group:'专病管理 · ESS', origin:'交互补充',
    goal:'验证逐题选择、进度和提交的页面交互。',
    interactions:['每题选择 0–3 的选项等级。','点击下一题；可返回上一题修改选择。','八题完成后提交结果。'],
    data:'八题选择值和进度。',
    pending:'题干是占位文案，不能用于医学判断。'
  },
  essResult: {
    title:'ESS 结果', group:'专病管理 · ESS', origin:'交互补充',
    goal:'展示交互测试得分，并让患者进入历史或重新体验。',
    interactions:['查看本次测评分数。','进入历史列表或再做一次。'],
    data:'本次测评分数与时间。',
    pending:'不提供分层、诊断或治疗效果结论。'
  },
  essHistory: {
    title:'ESS 测评历史', group:'专病管理 · ESS', origin:'交互补充',
    goal:'按时间回顾测评记录。',
    interactions:['查看历史分数和测评时间。','通过返回按钮回到来源页面。'],
    data:'测评分数及时间。',
    pending:'正式趋势应区分量表版本并明确缺测日期。'
  },
  game: {
    title:'注意力挑战', group:'专病管理 · D2', origin:'图示入口，交互补充',
    goal:'用轻量互动体验“捕捉清醒精灵”的玩法。',
    interactions:['开始 30 秒挑战。','点击目标符号得分，误点扣分。','结束后保存挑战成绩并可重玩。'],
    data:'游戏得分和时间。',
    pending:'游戏不是临床测试；复诊指标用途需独立验证。'
  },
  sleepForm: {
    title:'新增睡眠日志', group:'专病管理 · 睡眠日志', origin:'交互补充',
    goal:'记录一次夜间睡眠的基本时间与主观感受。',
    interactions:['填写就寝和起床时间。','选择主观感受并可添加备注。','起床时间需晚于就寝时间才能保存。'],
    data:'就寝、起床、感受和备注。',
    pending:'正式字段需按疾病管理目标确认。'
  },
  sleepList: {
    title:'睡眠日志列表', group:'专病管理 · 睡眠日志', origin:'交互补充',
    goal:'回看已保存的睡眠记录。',
    interactions:['新增日志。','查看摘要或删除本地记录。'],
    data:'睡眠起止时间、感受和备注。',
    pending:'正式版本可补充编辑和睡眠趋势，但不应自行推断疗效。'
  },
  tip: {
    title:'科学小贴士', group:'专病管理 / 权益中心', origin:'图示入口，交互补充',
    goal:'用翻牌互动展示易读的患者教育内容。',
    interactions:['点击“再看一条”切换示例文案。'],
    data:'当前显示的示例贴士。',
    pending:'正式内容必须注明来源、版本和审核信息。'
  },
  adverseForm: {
    title:'不良反应速记', group:'首页 / 专病管理', origin:'图示入口，交互补充',
    goal:'先保存疑似不良反应的时间和表现，避免信息遗失。',
    interactions:['填写发生时间、表现和自评程度。','确认了解“仅本地速记”后保存。','保存后进入记录列表。'],
    data:'发生时间、文字描述、自评程度。',
    pending:'当前没有正式 AE/PV 上报接口；紧急情况应及时就医。'
  },
  adverseList: {
    title:'不良反应记录', group:'专病管理 · 安全反馈', origin:'交互补充',
    goal:'回顾本地保存的疑似不良反应速记。',
    interactions:['新增速记。','查看或删除已有记录。'],
    data:'速记内容及时间。',
    pending:'正式上报责任、时限、核实和状态反馈需药物警戒团队确定。'
  },
  pharmacy: {
    title:'药房地图', group:'首页 · 快捷服务', origin:'图示入口，交互补充',
    goal:'获得位置授权后查看当前位置地图与附近药店。',
    interactions:['进入页面即从底部弹出定位授权说明，当前页不显示底部 Tab 栏。','点击授权后由浏览器请求定位；上方显示当前位置地图，下方弹窗列出 3 公里内开放地图收录的药店。','定位被拒、药店数据不可用或附近无结果时展示明确状态，可重新定位。'],
    data:'会话内的经授权坐标、开放地图药店名称与距离；不保存位置到浏览器存储。',
    pending:'地图与药店查询依赖 OpenStreetMap/Overpass；营业状态、药品库存、合作资格和导航仍需正式接口。'
  },
  shop: {
    title:'线上购药', group:'首页 · 快捷服务', origin:'图示入口，交互补充',
    goal:'明确标记线上购药功能当前状态。',
    interactions:['进入页面后仅展示“待接入”。'],
    data:'无交易数据。',
    pending:'当前不下单、不支付；正式流程需确认渠道与处方核验。'
  },
  follow: {
    title:'随访管家', group:'首页 · 快捷服务', origin:'图示入口，交互补充',
    goal:'把复诊和随访两个常见需求集中到一个入口。',
    interactions:['进入复诊预约意向表单。','查看随访专员服务说明。'],
    data:'本地预约意向。',
    pending:'服务人员、时段、响应承诺及企微接入待确认。'
  },
  specialist: {
    title:'我的专员', group:'首页 · 快捷服务', origin:'页面意见补充',
    goal:'展示添加企业微信专员的引导卡片。',
    interactions:['从首页“我的专员”进入卡片页。','正式二维码配置后，用户可长按识别并添加专员；当前只展示不可扫码的占位框。'],
    data:'企微二维码素材、专员名称与服务说明待接入。',
    pending:'企业微信主体、二维码、有效期、服务范围和隐私告知需业务方提供。'
  },
  payment: {
    title:'商保直付', group:'权益中心 · 支付保障', origin:'图示入口，交互补充',
    goal:'说明直付服务的预计资格与流程。',
    interactions:['未领取时点击切换为审核中，状态变为审核中。','审核中点击切换为已领取，状态变为已领取；已领取可切换为未领取。','状态变化写入本地存储，返回首页同步更新权益文案。'],
    data:'insuranceStatus：unclaimed / reviewing / claimed。',
    pending:'支付、保险核验和合作机构均未接入。'
  },
  chat: {
    title:'智能问答', group:'眠宝帮你 · 问答', origin:'图示入口，交互补充',
    goal:'承接患者的主题问题，并展示清楚的答复来源边界。',
    interactions:['输入问题并发送。','展示本地固定回复与对话历史。','不良反应主题可进入速记。'],
    data:'主题、问题与固定固定回复。',
    pending:'未接入真实 AI 或经审核知识库；不提供诊断或处方建议。'
  },
  appointment: {
    title:'复诊预约意向', group:'眠宝帮你 · 医患服务', origin:'图示入口，交互补充',
    goal:'收集患者希望复诊的时间和需要沟通的事项。',
    interactions:['填写称呼、日期和事项。','保存后在本页查看意向列表。'],
    data:'称呼、期望日期、备注。',
    pending:'当前不会向医院发送预约请求。'
  },
  contact: {
    title:'随访专员', group:'眠宝帮你 · 医患服务', origin:'图示入口，交互补充',
    goal:'展示人工随访服务的预计入口。',
    interactions:['阅读服务说明。','查询当前接入状态。'],
    data:'无真实联系人数据。',
    pending:'服务主体、工作时间、企业微信及授权文案待确认。'
  },
  emergency: {
    title:'紧急咨询', group:'眠宝帮你 · 医患服务', origin:'图示入口，交互补充',
    goal:'在紧急问题页面明确提示实际可用的求助路径。',
    interactions:['阅读紧急情况提示。','可转至本地不良反应速记。'],
    data:'无实时会话。',
    pending:'当前无医生在线响应；正式服务时段与转诊规则待定。'
  },
  calculator: {
    title:'商保计算器', group:'权益中心 · 支付保障', origin:'旁注功能，交互补充',
    goal:'预估费用与比例输入后的即时计算。',
    interactions:['输入预计费用和预估比例。','点击计算，在本页显示示例金额。'],
    data:'输入金额、比例和结果。',
    pending:'计算结果不代表真实报销待遇。'
  },
  welfare: {
    title:'药品福利申请', group:'权益中心 · 支付保障', origin:'图示入口，交互补充',
    goal:'说明申请所需的资格、材料和审核步骤。',
    interactions:['阅读四步预计流程。','查看当前接入状态。'],
    data:'当前不采集申请材料。',
    pending:'实际福利项目、资格、审批与报销服务均未接入。'
  },
  profile: {
    title:'个人资料', group:'我的', origin:'交互补充',
    goal:'让体验者了解本地数据保存位置，并能自行清理。',
    interactions:['查看当前身份和存储说明。','经确认后清除当前浏览器的本地数据。'],
    data:'本地存储内容。',
    pending:'正式身份认证、授权记录和数据删除流程待设计。'
  },
  settings: {
    title:'提醒设置', group:'我的', origin:'交互补充',
    goal:'调整首页显示的用药计划时间和小憩时长。',
    interactions:['填写时间与时长。','保存后返回上一页，任务卡片同步显示新值。'],
    data:'计划服药时间、小憩分钟数。',
    pending:'当前不会发系统通知；正式提醒需授权和服务端能力。'
  },
  accountSettings: {
    title:'设置', group:'我的 · 账户', origin:'页面意见补充',
    goal:'集中放置通知偏好、协议与账户操作。',
    interactions:['切换消息通知提醒：仅保存通知偏好。','点击用户协议进入只读占位页。','退出登录保留本地记录；注销进入二次确认页。'],
    data:'settings.notificationEnabled、authStatus。',
    pending:'真实系统通知、协议文本、登录态和账号注销接口待接入。'
  },
  agreement: {
    title:'用户协议', group:'我的 · 账户', origin:'页面意见补充',
    goal:'承接正式用户协议的查看入口。',
    interactions:['从设置页进入只读页面；当前不提供同意按钮。'],
    data:'正式协议版本号、生效日期和正文待接入。',
    pending:'正式法律文本须由业务与法务提供。'
  },
  accountDelete: {
    title:'注销账号', group:'我的 · 账户', origin:'页面意见补充',
    goal:'注销前的说明与二次确认。',
    interactions:['点击注销按钮后输入“注销”确认。','确认后仅清除当前浏览器的记录与设置，保留写入 index.html 的页面意见。'],
    data:'authStatus=closed；本地记录清除。',
    pending:'正式注销需身份校验、服务端删除与保留规则、处理反馈。'
  },
  records: {
    title:'我的记录', group:'我的', origin:'交互补充',
    goal:'集中访问不同类型的本地记录。',
    interactions:['查看每类记录数量。','点击分类进入对应列表。'],
    data:'服药、猝倒、睡眠、测评、不良反应记录。',
    pending:'正式版本需账户同步和权限控制。'
  },
  notice: {
    title:'消息通知', group:'首页 / 我的', origin:'图示入口，交互补充',
    goal:'为任务提醒、预约结果和权益进度预留消息中心。',
    interactions:['查看当前空状态。'],
    data:'当前没有推送消息。',
    pending:'正式通知类型、频率和订阅授权待定义。'
  }
};

/* 左侧开发说明：字段、状态与计算口径。可通过左侧编辑覆盖。 */
const DEV_SPECS = {
  home:{fields:[
    'moods[YYYY-MM-DD]：精神饱满 / 有些疲惫 / 需要小睡 / 状态不佳；按本地日期唯一。',
    'insuranceStatus：unclaimed / reviewing / claimed；由商保直付页维护。',
    'meds[]：day、time、note；hasToday 以 day 判断今日是否记录。',
    'homePreviewState：仅当前页面会话使用，不写入持久化数据。'
  ],rules:[
    '若 moods[今日] 已存在，四个状态按钮全部禁用；不得覆盖当天值。',
    '首页四态优先级：未领取→unclaimed；审核中→reviewing；已领取且今日无服药→claimed-unrecorded；已领取且今日有服药→claimed-recorded。',
    '点击眠宝只切换四态预览视图；点击文案区按当前展示态跳转商保页、打开服药底部弹窗或进入服药记录。',
    '底部弹窗确认用药时仅在今日尚无记录时新增；保存后清除预览覆盖态并重算首页。'
  ]},
  medReminder:{fields:['settings.medTime：HH:mm，必填。','settings.notificationEnabled：布尔值，与“我的→设置”共用。'],rules:['保存时合并 settings，不覆盖小憩时长。','首页今日用药卡片读取 medTime；通知开关仅记录偏好，实际通知须接入授权与发送服务。']},
  special:{fields:[
    'events[]：id、day、time、duration、trigger、note；day 为本地 YYYY-MM-DD。',
    'monthCount(0/-1)：本月与上月已记录事件数量；weekOffset：当前周相对偏移。',
    'specialPreviewState：下降 / 上升 / 上月无记录的会话预览覆盖态。',
    'scalePhotos[]：scale、image、score、day、time；ESS/SRSS 图表按周显示分数。'
  ],rules:[
    '上月记录数=0 时显示无上月记录文案；本月<上月显示下降；本月>上月显示上升；相等显示持平。',
    '点击眠宝只循环三种预览态；不修改 events。新增猝倒记录后清除预览态并重新计算。',
    '本月与今日记录同卡片展示；事件保存后同时重算月度和今日统计。',
    '快速记录与所选周记录列表使用底部弹窗；周切换改变 weekOffset，不改变源记录。',
    '月度文案仅基于“已记录次数”；不得解释为实际病情或治疗效果。'
  ]},
  ai:{fields:['chat[]：topic、q、a；topic 为 med / adverse / interaction / faq。'],rules:['点击主题进入对应 chat 路由；回复使用本地固定文案。','疑似不良反应只引导速记与人工咨询，不输出诊断或用药调整。']},
  rights:{fields:['insuranceStatus：用于顶部卡片映射未申请/审核中/已通过/已拒绝；入口 payment、calculator、welfare。'],rules:['顶部状态卡复用 insuranceStatus，其下渲染三个入口，不渲染惠民保、积分商城、眠宝乐园。','入口标题下不输出副标题；商保直付状态在 payment 页面维护。']},
  mine:{fields:['authStatus：active / signed-out / closed；保存在当前浏览器。','settings：medTime、napMinutes、notificationEnabled。'],rules:['active 显示资料、记录与设置入口；signed-out / closed 显示重新进入状态卡片。','退出保留本地记录；注销清除记录与设置，保留写入 index.html 的修改意见。']},
  med:{fields:['meds[]：id、day、time、note；settings.medTime：HH:mm。'],rules:['点击记录追加一条本地记录；首页 hasToday 由任一当日记录决定。','漏服补服指引不由当前页面生成。']},
  nap:{fields:['settings.napMinutes：1–120；naps[]：id、day、time、minutes。','napRemaining / napStarted：页面内计时状态。'],rules:['开始或继续以秒递减；暂停保留剩余秒数。','结束且已计时至少 1 秒时写入记录；关闭页面不继续后台计时。']},
  eventForm:{fields:['time：必填 datetime-local；duration：0–120 分钟可选；trigger、note：可选。'],rules:['提交时校验 time 可解析；写入 events[] 后刷新日、周、月统计。','从专病首页弹窗提交后留在本页；独立表单提交后进入记录列表。']},
  eventList:{fields:['events[]：按 time 倒序展示；删除按 id 定位。'],rules:['删除前二次确认；删除后所有基于 events 的统计即时重算。']},
  trend:{fields:['weekOffset：周偏移；events[].day：日维度聚合键。'],rules:['一周从周一到周日；未记录按 0 显示，不等于事件未发生。']},
  essIntro:{fields:['ess[]：答题历史。'],rules:['开始前说明当前题目并非正式量表；开始时重置 8 题答案与进度。']},
  essQuiz:{fields:['essAnswers：8 个 0–3 整数；essStep：0–7。'],rules:['未选择当前题时禁用下一题；上一题保留已选值。','第 8 题提交后求和并写入 ess[]；分数不用于医学判断。']},
  essResult:{fields:['route.score：本次测评分数。'],rules:['仅展示本次求和结果；历史已在提交时持久化。']},
  essHistory:{fields:['ess[]：id、day、time、score、answers。'],rules:['按 time 倒序展示；无记录时显示空状态。']},
  game:{fields:['gameState：score、left、tiles；game[]：历史分数与时间。'],rules:['命中目标 +1，误点 -1；30 秒结束写入记录。','游戏成绩不得作为临床注意力评估。']},
  sleepForm:{fields:['bed / wake：必填 datetime-local；quality、note：可选。'],rules:['wake 必须晚于 bed；保存后以 wake 的本地日期作为 day。']},
  sleepList:{fields:['sleep[]：id、bed、wake、day、quality、note。'],rules:['按记录时间倒序；删除按 id 且需二次确认。']},
  tip:{fields:['tipIndex：会话内 0–2。'],rules:['点击“再看一条”循环到下一条示例内容；正式内容需审核与版本管理。']},
  adverseForm:{fields:['time、detail：必填；severity：枚举；agree：必须勾选。'],rules:['保存到 adverse[]，仅为本地速记；不能标记为正式 AE 上报。']},
  adverseList:{fields:['adverse[]：id、day、time、detail、severity。'],rules:['按时间倒序展示；删除需二次确认。']},
  pharmacy:{fields:['pharmacyLocation：lat、lon；仅当前会话内存。','pharmacyStores[]：开放地图名称、地址、距离；最多 12 条。'],rules:['进入时先显示授权底部弹窗；拒绝授权则保持占位地图并允许重试。','用户主动授权后加载 OSM 地图并按 3 公里半径查询 Overpass；失败与空结果须分别展示。','不得把坐标存入 localStorage；营业与药品库存不得由开放地图结果推断。']},
  shop:{fields:['无业务字段。'],rules:['仅渲染“待接入”；无下单、支付或跳转动作。']},
  follow:{fields:['appointments[]：本地预约意向。'],rules:['复诊与专员按钮进入对应页面；未向外部服务发送数据。']},
  specialist:{fields:['企微二维码 URL、专员名称、服务主体：待接入。'],rules:['当前占位框不可扫码；正式素材接入后才能提示长按识别。','二维码到期与专员身份需服务端维护。']},
  payment:{fields:['insuranceStatus：unclaimed / reviewing / claimed；本地枚举。'],rules:['未领取→点击模拟申请进入审核中；审核中→模拟通过进入已领取；已领取→可重置。','状态更新后清除首页预览覆盖态，首页依据该值与今日服药记录重算。','本地状态不能作为真实商保资格或审核结果。']},
  chat:{fields:['chat[]：topic、q、a；问题为必填文本。'],rules:['提交后追加本地固定回复并滚动到最新消息；无真实 AI 请求。']},
  appointment:{fields:['name：必填 ≤30 字；date：不早于今日；note：可选。'],rules:['保存到 appointments[]；无医院预约接口与确认状态。']},
  contact:{fields:['真实专员信息尚未接入。'],rules:['仅显示服务说明与接入状态；不提供虚构联系方式。']},
  emergency:{fields:['无实时会话字段。'],rules:['展示紧急求助说明；不保证在线响应；可进入不良反应速记。']},
  calculator:{fields:['cost：≥0；ratio：0–100；结果=cost×ratio/100。'],rules:['空值、负值与超范围比例不得计算；结果必须标记为预估值。']},
  welfare:{fields:['正式申请资格、材料、进度字段待接入。'],rules:['仅展示预计流程；不采集或提交真实申请材料。']},
  profile:{fields:['本地当前身份与 localStorage 保存位置。'],rules:['清理本地数据前需要二次确认；正式身份认证未接入。']},
  settings:{fields:['medTime：HH:mm 必填；napMinutes：1–120 必填。'],rules:['保存时保留 notificationEnabled，不覆盖通用设置中的通知偏好。','当前页面只更新页面计划值，不发送系统级提醒。']},
  accountSettings:{fields:['settings.notificationEnabled：boolean；authStatus：active / signed-out / closed。'],rules:['通知开关仅写本地偏好，不请求系统通知权限。','退出设置 signed-out 并保留记录；注销入口进入单独确认页。']},
  agreement:{fields:['正式协议 version、effectiveAt、content：待业务方提供。'],rules:['当前只读占位，不提供同意按钮，也不记录同意状态。']},
  accountDelete:{fields:['确认输入：必须精确等于“注销”；authStatus=closed。'],rules:['确认后清除本地记录与设置，再写入 closed 状态。','项目文件内的页面修改意见不属于账号数据，不在此操作中删除。']},
  records:{fields:['meds、events、sleep、ess、adverse：各列表记录数。'],rules:['数量由对应数组长度实时计算；点击分类进入相应列表。']},
  notice:{fields:['当前无推送消息数据。'],rules:['显示空状态；真实订阅消息需用户授权和服务端投递能力。']}
};
function devSpecFor(route){const spec=DEV_SPECS[route.name]||DEV_SPECS.home;return {data:spec.fields.join('\n'),logic:spec.rules.join('\n')}}

function requirementFor(route){
  const base=REQUIREMENTS[route.name]||REQUIREMENTS.home;
  if(route.name==='chat'){
    const topics={med:'药品使用指导',adverse:'猝倒与不良反应',interaction:'饮食与药物相互作用',faq:'常见问题'};
    return {...base,title:topics[route.topic]||base.title};
  }
  return base;
}

REQUIREMENTS.ai = {"title": "眠宝帮您", "group": "眠宝帮您", "origin": "指定链接完整功能整合", "goal": "在一个会话入口中承接眠宝陪伴、知识查询、病程与用药记录、创新支付和人工服务。", "interactions": ["显示小绵羊欢迎、四档今日感受、热门问题和自由咨询；支持本地关键词匹配、多意图合并与超范围回复。", "展示入组、福利订单和直付/后报销进度；在会话中逐步完善资料、上传材料、核对提交，支持暂停、恢复、重新填写及驳回补件。", "聊天中记录病程文字、录制语音、上传图片；支持时间线、类型筛选、音频回放、图片放大和用药记录。", "先在聊天中展示三篇推荐文章；查看更多展开六篇文章及分类，支持全文阅读、收起与展开。", "真人客服入口、疑似不良事件识别与确认记录；头像展开患者资料、历史会话和福利关爱记录。", "发起会话后，输入区上方展示可横向滑动的创新支付、记录病程、用药记录、真人客服；状态按钮保留源模块场景切换和数据重置。"], "pending": "真实 AI、医学内容、客服履约、保险核验、申请审核及云同步尚未接入；麦克风录音依赖浏览器授权与支持。"};
DEV_SPECS.ai = {"fields": ["服务独立状态 mianbao-integrated-service-v1；sessions[]、messages[]、dailyMood 等源模块字段。", "enrollment、type、code、patient、orders[]、aidDrafts 与会话 careFlows；材料图片本地保存。", "IndexedDB mianbao-integrated-care-records-v1 的 records、media；记录时间、文字、媒体、药品、用药状态、备注。", "源模块 articles[]、articleFilter、articleId 与消息 kind=articles/appPanel。", "reports[]、patient、sessions[]、orders[]；历史会话分页；申请人姓名打码。", "activeSession、view、conversationActions；入组/支付/订单状态控件。"], "rules": ["采用指定链接中的完整服务流程；会话超过 3 天未互动新建，历史保留近 12 个月；AI 为本地规则匹配，医学与政策内容待正式审核。该模块数据不改写首页、专病管理、权益中心与我的现有记录。", "保留源模块的状态字典与订单过滤：20 区分药房审核阶段、21 过滤；后报销需处方与发票，直付含用药数量。申请提交为本地流程，未接保险/审核/理赔接口；不改变原权益中心的状态。", "语音为录音与回放，不含语音转文字；每段最长 2 分钟，图片每条最多 4 张，单文件最多 10 MB，图片压缩后保存。记录时间不能在未来，保存前需停止录音；用药状态含已服用/漏服/暂停，新增记录不提供医学建议。", "所有文章操作保持在眠宝会话内；内容为记录与资料整理说明，正式医学内容和发布审核接口待接入。", "客服为源模块模拟服务，不实际拨号；不良事件仅本地记录，不能称为正式上报。历史会话、订单详情和材料查看均在当前会话中展开。", "首屏与空会话不显示快捷按钮；状态设置只更新本服务模块。清空聊天保留说明、病历、用药与订单；重置仅清理本服务模块数据。宿主左侧说明及右侧修改意见沿用原保存机制。"]};

REQUIREMENTS.ai.interactions[0] = "显示小绵羊欢迎、热门问题和自由咨询；支持本地关键词匹配、多意图合并与超范围回复。";
DEV_SPECS.ai.fields[0] = "服务独立状态 mianbao-integrated-service-v1；sessions[]、messages[]。";
DEV_SPECS.ai.rules[0] = "欢迎区仅展示眠宝形象与介绍，点击问问眠宝进入咨询；不展示或写入每日状态记录。会话超过 3 天未互动新建，历史保留近 12 个月；AI 为本地规则匹配，医学与政策内容待正式审核。该模块数据不改写首页、专病管理、权益中心与我的现有记录。";

REQUIREMENTS.home.interactions = ["首页标题下展示三张眠宝推荐卡片：健康记录、眠宝帮你、服务权益；可自动轮播、左右滑动、点击箭头或指示点切换。", "四档状态选择：精神饱满/有些疲惫/需要小睡/状态不佳；\n选择后下方对应文案变更；", "根据商保状态与今日用药记录展示对应文案；点击文案进入下一步，点击眠宝切换预览状态。", "六个入口：药房地图、线上购药、多元支付、用药提醒、不良反应速记和我的专员。", "点击今日用药或首页权益卡的记录按钮，居中弹出眠宝 GIF 引导；确认已按医嘱服药后保存，已记录时显示完成状态与查看入口。", "点击日常小憩时钟居中弹出与今日用药同样的眠宝 GIF 卡片，填写时长并添加，随后关闭弹窗并在首页显示倒计时。进行中再次点击可暂停、继续或结束并记录。"];
DEV_SPECS.home = {"fields": ["homeBanners[]：title、text、action、target、theme；homeBannerIndex、homeBannerPaused：当前会话状态。当前三项为可替换的静态配置。", "moods[本地日期]：四档状态之一。\n建议正式字段（待确认）：userId、recordDate、moodCode、createdAt、updatedAt；recordDate 按选定业务时区生成。", "当前字段补齐：insuranceStatus、meds[].day、homePreviewState。\n建议申请字段（待确认）：applicationId、applicationStatus、benefitStatus、updatedAt、rejectReason。", "pharmacy、shop、payment、medReminder、adverseForm、specialist。", "settings.medTime；meds[]：id、time、day、note；动效 assets/mianbao-med-guide.gif。", "napSession：id、day、startedAt、totalSeconds、remainingSeconds、endsAt、status(running/paused/finished)；时长 1—120 整数分钟；naps[]：id、day、time、minutes；动效 assets/mianbao-nap-guide.gif。"], "rules": ["每 5 秒循环切换；点击按钮进入对应页面。离开首页清除计时器，返回重新启动；隐藏页面、焦点在轮播内、用户暂停或系统要求减少动态时不自动切换。切换仅更新轮播，不重绘页面或清空编辑内容。隐藏卡片不可获得焦点。业务活动图片、上线时间及运营配置接口待确认。", "同日只能提交一次；已记录时禁用四个选项。\n\n【B02/B03｜现状】四档仅更新“今天的感受”文字；权益主文案由支付和服药记录决定。当前同日一次，不可修改。\n【建议规则（待确认）】晨起记录按 userId + recordDate 唯一；误选通过“修改当日状态”覆盖原记录而非新增，保留修改时间；未选择时显示引导，已选择时显示选中项。跨日重新计算日期及可选状态。\n【待确认】是否开放修改；四档对应反馈文案与形象配置；晨起反馈与权益信息的排列关系；日期统一北京时间还是用户时区。未确认前不把晨起状态当作疾病判断。", "未领取或审核中进入商保页；已领取未记录打开用药弹窗；已记录进入服药记录。\n\n【A02/D01｜现状】未领取/审核中进入 payment；已领取且今日无记录打开服药弹窗；已记录进入 med。点击眠宝可覆盖展示状态，不改变申请数据。\n【建议规则（待确认）】申请状态与权益可用状态分别保存；approved 只有经权益接口确认可用后才映射“已领取”。审核拒绝显示拒绝原因及重申入口，不能映射已领取。状态成功刷新后统一重算首页与权益中心。\n【待确认】未申请/审核中/已通过/已拒绝分别对应的首页文案、按钮、跳转；通过后是否需激活；多个申请取哪一份；申请服务、失效规则。临时展示状态不作为真实办理依据，正式版是否保留点击切换需确认。", "点击进入相应二级页面；首页不再展示随访管家和全部记录入口，我的页面的记录入口保持可用。", "点击任务不再直接跳详情；确认后保存当前时间与日期并关闭弹窗，同日该弹窗只保存一次，刷新任务及首页权益文案。已记录点击查看进入服药详情；开启减少动态时以静态眠宝替代 GIF。", "添加时建立计时会话，不计入已完成次数。倒计时每秒按 endsAt 和当前时间计算，不改写整页或左侧编辑内容；切换页面继续，刷新恢复。暂停保存剩余秒数，继续重建 endsAt。到时自动保存一条小憩记录，id 去重，归属开始日期；提前结束至少计时 1 秒才保存，分钟向上取整。保存失败保留会话可重试，不显示虚假完成；取消本次小憩不新增记录；未接入关闭页面后的通知。"]};
REQUIREMENTS.rights.interactions = ["顶部标题下展示眠宝形象、当前创新支付状态、状态说明和操作按钮；按钮进入商保直付页。", "进入用药权益状态和申请流程页。", "进入费用与比例的预估计算页。", "最新意见要求自动滚动 Banner；本模块只补需求，当前中间页面不增加轮播。"];
DEV_SPECS.rights = {"fields": ["当前读取 insuranceStatus：unclaimed → 未申请，reviewing → 审核中，claimed → 已通过，rejected → 已拒绝。当前本地流程只生成前三态，rejected 为兼容后续状态数据。\n正式申请来源、申请维度及审核接口仍待业务确认。", "目标页面 payment。\n建议 serviceCode、applicationId、currentApplication；权益卡与首页读取同一申请数据。", "目标页面 calculator。\n目标 calculator；预估规则包含 calculationVersion、serviceCode（若接入正式方案）。", "建议 bannerId、imageUrl、title、sortOrder、enabled、startAt、endAt、targetType、target、audienceRule。"], "rules": ["【当前实现】进入权益中心实时读取状态；申请或权益状态变更后返回本页重算。未申请→了解申请流程；审核中→查看申请进度；已通过→查看用药权益；已拒绝→查看申请详情，均进入 payment。未知值回退为未申请。未接入真实审核，不生成虚构审核结果。\n【待确认】创新支付是否仅对应商保、通过与权益激活的关系、多份申请/拒绝原因/补件/撤回/重新申请/到期规则；正式状态以真实接口为准。", "首页权益卡同步读取该页的状态。\n\n【A02/D01｜建议规则（待确认）】进入商保直付查看本用户对应服务的当前申请；提交/状态更新后返回本页刷新卡片；无资格/服务不可用显示原因，不默认可申请。\n【待确认】资格核验、服务地区、创新支付卡是否汇总该入口、多个申请排序。", "入口不直接计算或判断保险资格。\n\n【D02｜建议规则（待确认）】仅跳计算器；输入和结果不改变申请资格或审核状态；计算器明确金额性质和估算口径。\n【待确认】用户手填比例还是按方案计算、地区/保单数据来源。", "【A03｜建议规则（待确认）】仅展示已启用且在有效时间内的 Banner；按 sortOrder 排序；0 张隐藏区域，1 张不轮播，多张默认每 5 秒循环；支持手动切换，离开页面停止。点击按配置跳内部页面或受支持外链；无目标则不可点；图片失败使用占位，失效目标给出提示。\n【待确认】轮播间隔、尺寸/数量/指示器、配置来源、地区或状态定向、外链规则。"]};
REQUIREMENTS.nap.interactions = ["点击日常小憩时钟居中弹出与今日用药同样的眠宝 GIF 卡片，填写时长并添加，随后关闭弹窗并在首页显示倒计时。进行中再次点击可暂停、继续或结束并记录。", "展示已完成的小憩时长和时间。"];
DEV_SPECS.nap = {"fields": ["napSession：id、day、startedAt、totalSeconds、remainingSeconds、endsAt、status(running/paused/finished)；时长 1—120 整数分钟；naps[]：id、day、time、minutes；动效 assets/mianbao-nap-guide.gif。", "naps[]：id、day、time、minutes。"], "rules": ["添加时建立计时会话，不计入已完成次数。倒计时每秒按 endsAt 和当前时间计算，不改写整页或左侧编辑内容；切换页面继续，刷新恢复。暂停保存剩余秒数，继续重建 endsAt。到时自动保存一条小憩记录，id 去重，归属开始日期；提前结束至少计时 1 秒才保存，分钟向上取整。保存失败保留会话可重试，不显示虚假完成；取消本次小憩不新增记录；未接入关闭页面后的通知。", "到时或提前结束成功保存后刷新列表；同一会话最多一条记录，未完成计时不计入次数。"]};
REQUIREMENTS.profile.interactions = ["展示当前身份与服务授权说明。", "提供清理当前浏览器业务记录的入口。"];
DEV_SPECS.profile = {"fields": ["当前账户状态、localStorage。\n建议 userId、nickname、contact、role、authorizationRecords、dataSyncStatus；仅按确认范围收集。", "mianbao-prototype-v1。\n建议 clearScope: localCache；正式云端删除另有 deleteRequestId/status。"], "rules": ["不展示未经核验的患者资格。\n\n【E01｜建议规则（待确认）】展示真实账号身份和授权状态；健康资料按账号隔离，云端同步失败可见；登录过期不展示旧账号私有资料。\n【待确认】实名/处方/确诊是否必需、家属访问、资料编辑、授权拒绝后功能范围。", "执行前确认；写入 index.html 的说明和意见保留。\n\n【E01/E02｜现状】只清本地业务记录，页面说明/意见留在项目文件。\n【建议规则（待确认）】确认中明确清理范围；清缓存不删除云端账号数据；清理失败保留原状态并提示；正式数据删除须走单独身份验证流程。\n【待确认】本期是否仍只清本地、哪些缓存保留、云端删除/数据保留。\n\n【E02/E03｜通用建议（待确认）】存在保存/删除/查询时，加载、成功、失败和空数据分别显示；失败保留输入或原数据，不伪造完成。重复请求使用记录级标识去重；未保存离开提示；新增/修改/删除成功刷新依赖统计。只读页面无额外数据写入。\n【E06｜说明版本】“现状”描述当前界面；“建议规则（待确认）”是开发方案供业务确认；“待实现”只指说明中的新模块。旧页面通用规则与本模块建议冲突时先确认再实现，不能视为中间页面已经变更。\n【已确认｜二级导航】本页面隐藏底部五项一级导航栏，内容区占用释放的底部空间；使用顶部返回按钮回到来源页。仅首页、专病管理、眠宝帮你、权益中心、我的显示底部导航。"]};
delete REQUIREMENTS.welfare;
delete DEV_SPECS.welfare;

REQUIREMENTS.login = {"title": "眠宝登录", "group": "登录与健康档案", "origin": "新增交互", "goal": "登录页展示眠宝形象，只有微信手机号登录按钮和两项协议查看/确认入口；不展示主导航。", "interactions": ["登录页展示眠宝形象，只有微信手机号登录按钮和两项协议查看/确认入口；不展示主导航。", "分别打开用户协议和隐私政策弹窗；可同意或暂不同意。点击登录后按用户协议→隐私政策顺序确认。", "底部展示应用标识、获取手机号说明、打码号码与拒绝/允许两个按钮。"], "pending": "真实微信手机号授权、账户服务、正式协议正文及档案接口待接入。"};
DEV_SPECS.login = {"fields": ["authStatus：signed-out/active/closed；loginSession.phoneAuthorized、authorizedAt。", "protocolConsents.terms/privacy：version、confirmedAt；当前 version=preview-20261013。", "静态样式号码 138 **** 0000；不采集或保存该号码。"], "rules": ["首次访问及没有手机号授权的旧记录进入登录；保存的授权且 authStatus=active 时直接进入首页。退出登录回到登录页，保留已有业务记录。当前只实现授权样式与本地登录状态，不获取真实手机号或调用微信 API。", "两项都确认后才能打开手机号授权；拒绝或关闭中断本次登录，已确认项保留。版本变化需重新确认。当前正文仅为流程说明，正式协议及隐私政策文本、主体与法务审核待提供。", "拒绝返回登录页；允许保存登录状态并进入首页，无档案时立即显示眠宝建档引导。保存失败保留弹窗，不伪造登录成功。真实微信 getPhoneNumber 及服务端换取手机号、用户会话、登录失效机制待接入。"]};
REQUIREMENTS.patientArchive = {"title": "建立健康档案", "group": "登录与健康档案", "origin": "新增交互", "goal": "建档页显示眠宝引导；仅填写 NT1阵发性睡病确诊时间、当前使用药物两个业务字段。", "interactions": ["建档页显示眠宝引导；仅填写 NT1阵发性睡病确诊时间、当前使用药物两个业务字段。", "保存完成后进入首页；稍后建档或返回后，可从我的→个人资料继续建立或修改。"], "pending": "真实微信手机号授权、账户服务、正式协议正文及档案接口待接入。"};
DEV_SPECS.patientArchive = {"fields": ["patientArchive.diagnosisDate：YYYY-MM-DD，必填；currentDrugs：1—500 字，必填，可填写暂无用药；createdAt、updatedAt 为保存元数据。", "onboardingPending：首次登录缺档案时为 true；archiveFormDraft：当前填写草稿。"], "rules": ["校验日期真实有效且不晚于当前业务日期；药物去除首尾空白后不得为空。不自动推断药品、剂量或治疗方案，其他疾病/身份信息不在本页采集。", "首次授权后首页弹出眠宝建档提示；已有完整档案不提示。稍后再说关闭引导，不创建空档案；保存成功更新档案并清除待建档状态；失败保留输入和旧档案。页面隐藏主导航，返回不保存输入。实际档案数据接口、权限、隐私合规与业务日期时区待确认。"]};
REQUIREMENTS.profile = {"title": "个人资料", "group": "登录与健康档案", "origin": "新增交互", "goal": "显示是否已建档，以及确诊时间和当前使用药物；可进入建立或修改档案。", "interactions": ["显示是否已建档，以及确诊时间和当前使用药物；可进入建立或修改档案。", "保留原清除记录入口。"], "pending": "真实微信手机号授权、账户服务、正式协议正文及档案接口待接入。"};
DEV_SPECS.profile = {"fields": ["patientArchive.diagnosisDate、currentDrugs。", "父应用 mianbao-prototype-v1。"], "rules": ["未建档显示建立档案，已建档显示摘要和修改档案。", "操作前二次确认；清理父应用记录后重新进入登录，不修改独立眠宝服务的数据。"]};

REQUIREMENTS.home.interactions.unshift("手机号授权后到达首页，无健康档案时展示带眠宝的建档提示弹窗。");
DEV_SPECS.home.fields.unshift("onboardingPending、patientArchive；目标 patientArchive。");
DEV_SPECS.home.rules.unshift("点击建立档案进入两字段表单，稍后再说关闭提示；已有档案不展示。刷新时未处理的提示保留；不影响首页原任务与服务。");
DEV_SPECS.accountSettings.rules.push("退出登录进入 login 页面，保留已保存的档案和业务记录；再次授权后进入首页。");

// Applied feedback 20261013
REQUIREMENTS.home = {"title": "患者首页", "group": "首页", "origin": "图示页面", "goal": "让患者在首页的一张卡片中记录晨起状态、看到眠宝反馈，并快速找到今日任务与快捷服务。", "interactions": ["先展示晨起状态及眠宝权益卡，再展示推荐 Banner。", "快捷服务新增病程记录；打开二级页直接记录文字、图片或语音，并共用眠宝病历夹数据。", "今日用药和小憩的引导弹窗及计时逻辑保持现状。"], "pending": "正式药品名、任务计划、消息提醒和外部服务入口需业务方确认。"};
DEV_SPECS.home = {"fields": ["onboardingPending、patientArchive；目标 patientArchive。", "当前字段补齐：insuranceStatus、meds[].day、homePreviewState。\n建议申请字段（待确认）：applicationId、applicationStatus、benefitStatus、updatedAt、rejectReason。", "homeBanners[]：title、text、action、target、theme；bannerStates.home：index、paused。", "journey、pharmacy、shop、payment、medReminder、adverseForm、specialist。", "路由 journey；内嵌入口 entry=recordJourney。与眠宝帮您共用 IndexedDB mianbao-integrated-care-records-v1 的 records/media。", "settings.medTime；meds[]：id、time、day、note；动效 assets/mianbao-med-guide.gif。", "napSession：id、day、startedAt、totalSeconds、remainingSeconds、endsAt、status(running/paused/finished)；时长 1—120 整数分钟；naps[]：id、day、time、minutes；动效 assets/mianbao-nap-guide.gif。", "moods[本地日期]：四档状态之一。\n建议正式字段（待确认）：userId、recordDate、moodCode、createdAt、updatedAt；recordDate 按选定业务时区生成。"], "rules": ["点击建立档案进入两字段表单，稍后再说关闭提示；已有档案不展示。刷新时未处理的提示保留；不影响首页原任务与服务。", "未领取或审核中进入商保页；已领取未记录打开用药弹窗；已记录进入服药记录。\n\n【A02/D01｜现状】未领取/审核中进入 payment；已领取且今日无记录打开服药弹窗；已记录进入 med。点击眠宝可覆盖展示状态，不改变申请数据。\n【建议规则（待确认）】申请状态与权益可用状态分别保存；approved 只有经权益接口确认可用后才映射“已领取”。审核拒绝显示拒绝原因及重申入口，不能映射已领取。状态成功刷新后统一重算首页与权益中心。\n【待确认】未申请/审核中/已通过/已拒绝分别对应的首页文案、按钮、跳转；通过后是否需激活；多个申请取哪一份；申请服务、失效规则。临时展示状态不作为真实办理依据，正式版是否保留点击切换需确认。", "页面顺序为顶部问候→晨起状态和眠宝权益卡→Banner→快捷服务→今日任务。轮播每 5 秒循环；离开页面清除计时器，页面隐藏、轮播内有焦点、主动暂停或系统要求减少动态时暂停。仅更新轮播区域，不清空左侧编辑输入。", "病程记录进入 journey 二级页，直接开始文字/图片/语音记录流程；其余入口保留原跳转。该页隐藏五项主导航，并通过顶部返回回到首页。不新增随访管家或全部记录入口。", "文字≤2000 字；单条≤4 张图片、单张≤10 MB；单段录音≤2 分钟。文字、图片或语音至少一项；提交前停止录音并等待附件保存。保存到既有病历夹，同一来源可从眠宝帮您回看，不建立独立记录副本。", "点击任务不再直接跳详情；确认后保存当前时间与日期并关闭弹窗，同日该弹窗只保存一次，刷新任务及首页权益文案。已记录点击查看进入服药详情；开启减少动态时以静态眠宝替代 GIF。", "添加时建立计时会话，不计入已完成次数。倒计时每秒按 endsAt 和当前时间计算，不改写整页或左侧编辑内容；切换页面继续，刷新恢复。暂停保存剩余秒数，继续重建 endsAt。到时自动保存一条小憩记录，id 去重，归属开始日期；提前结束至少计时 1 秒才保存，分钟向上取整。保存失败保留会话可重试，不显示虚假完成；取消本次小憩不新增记录；未接入关闭页面后的通知。", "同日只能提交一次；已记录时禁用四个选项。\n\n【B02/B03｜现状】四档仅更新“今天的感受”文字；权益主文案由支付和服药记录决定。当前同日一次，不可修改。\n【建议规则（待确认）】晨起记录按 userId + recordDate 唯一；误选通过“修改当日状态”覆盖原记录而非新增，保留修改时间；未选择时显示引导，已选择时显示选中项。跨日重新计算日期及可选状态。\n【待确认】是否开放修改；四档对应反馈文案与形象配置；晨起反馈与权益信息的排列关系；日期统一北京时间还是用户时区。未确认前不把晨起状态当作疾病判断。"]};
REQUIREMENTS.special = {"title": "发作性睡病专区", "group": "健康档案", "origin": "图示页面", "goal": "集中记录猝倒、睡眠和自测信息，帮助患者回顾一段时间内的变化。", "interactions": ["底部 Tab 显示健康档案，路由仍为 special；专区标题和已有记录不因改名变化。", "保留猝倒统计、快速记录和自然周趋势。", "测评区展示当前全部量表名称 ESS/SRSS，可点名称、箭头或左右滑动卡片；照片记录绑定所操作卡片。", "睡眠辅助工具仅展示小憩闹钟、注意力挑战、睡眠日志。"], "pending": "正式量表题目、授权、计分规则及拍照识别需确认；照片仅保存在当前浏览器。"};
DEV_SPECS.special = {"fields": ["events[].day、本月与上月事件数、今日事件数。\n建议统计参数：periodStart、periodEnd、comparisonStart、comparisonEnd、count、comparisonCount、hasRecordedData。", "weekOffset、events[].day。\n建议趋势字段：periodStart、periodEnd、dayCounts[]、selectedWeek；条目按 occurredAt 过滤。", "scaleCatalog[]：code、name、canAnswer；activeScale；ess[]；scalePhotos[]；scrollLeft 为卡片视图位置。", "nap、game、sleepList。", "Tab label=健康档案；route=special；专区页面标题仍为发作性睡病专区。"], "rules": ["月度反馈按已记录次数比较；快速记录保存后同时更新月度和今日统计。\n\n【C03｜现状】本月累计条数直接与上个完整月比较；上月 0 条进入无上月记录文案。统计是已记录次数，不是完整发作次数。\n【建议规则（待确认）】默认对比同等经过天数；展示两个区间及记录次数，用“记录增加/减少/持平”文案。无记录标“无已记录数据”，不推断没有事件。补录、编辑、删除后重算对应日/月，并清除临时展示覆盖态。\n【待确认】等长区间或整月比较、2 月与大小月截止处理、是否要明确记录“无事件”、月度提示文案。正式版不以记录减少直接得出病情改善。", "周一至周日聚合；查看记录从底部弹出所选周列表。\n\n【C04｜现状】周图与底部列表按同一 weekOffset/日期过滤；图表无记录画为 0。\n【建议规则（待确认）】周一至周日，同一周范围同时驱动图表与列表；允许历史周，不允许超过当前周；返回时保留选中周。新增/修改/删除后更新受影响周；无数据显示“该周暂无已记录事件”。\n【待确认】最早查询范围、无记录日是否用空标记、是否加入月份/诱因分析。独立 trend 页的入口和保留范围另行确认。", "当前量表清单为 ESS、SRSS。名称高亮与当前卡片同步；第一张禁止向前、最后一张禁止向后，不循环。ESS 支持答题/拍照，SRSS 支持拍照；拍照按钮携带对应 scale，不依赖之前打开过哪张卡。切卡只更新选中视图，不重绘页面，不清空左侧编辑内容。趋势沿用现有本周得分计算；正式量表清单、版本、计分及医学审核仍待接入。", "只保留这三个区域入口；点击进入相应二级页，返回后沿用原记录。科学小贴士与不良反应记录从该区域移除；其他页面既有不良反应入口保持可用。“睡眠日子”按睡眠日志处理。", "只修改导航和分组名称，保留原路由、页面功能及记录关联，不重建记录。二级页面不展示主导航。"]};
REQUIREMENTS.rights = {"title": "权益中心", "group": "权益中心", "origin": "图示页面", "goal": "集中展示多元支付与保障服务。", "interactions": ["标题→权益 Banner→眠宝创新支付状态卡→多元支付与保障。", "状态概览保留未申请、审核中、已申请；已申请业务含义另行定义。", "原商保直付与计算器入口继续可用。"], "pending": "保险资格、福利项目与正式服务渠道需接入真实规则。"};
DEV_SPECS.rights = {"fields": ["rightsBanners[]：title、text、action、target、theme；bannerStates.rights：index、paused。", "insuranceStatus；paymentSummary() 输出 key=unclaimed/reviewing/applied；label、copy、action。", "目标页面 payment。\n建议 serviceCode、applicationId、currentApplication；权益卡与首页读取同一申请数据。", "目标页面 calculator。\n目标 calculator；预估规则包含 calculationVersion、serviceCode（若接入正式方案）。"], "rules": ["三张固定卡片进入商保直付、商保计算器、眠宝帮您；每 5 秒轮播，可手动切换或暂停。权益与首页独立保存会话索引和暂停状态；隐藏页面、焦点在轮播内或减少动态时暂停。离开页面停止计时，返回恢复所选卡。", "按本次确认保留文档三种概览名称。原型临时将旧 claimed/rejected 展示归入 applied，保留其底层数据，不表示两种审核结果业务等价。已申请的正式含义及真实状态映射另行定义；卡片不宣称通过、领取、支付或履约完成。三个按钮均进入原申请详情服务，正式统一数据与接口仍待实现。", "首页权益卡同步读取该页的状态。\n\n【A02/D01｜建议规则（待确认）】进入商保直付查看本用户对应服务的当前申请；提交/状态更新后返回本页刷新卡片；无资格/服务不可用显示原因，不默认可申请。\n【待确认】资格核验、服务地区、创新支付卡是否汇总该入口、多个申请排序。", "入口不直接计算或判断保险资格。\n\n【D02｜建议规则（待确认）】仅跳计算器；输入和结果不改变申请资格或审核状态；计算器明确金额性质和估算口径。\n【待确认】用户手填比例还是按方案计算、地区/保单数据来源。"]};
REQUIREMENTS.journey = {"title": "病程记录", "group": "首页 · 快捷服务", "origin": "页面修改意见补充", "goal": "从首页直接记录文字、图片或语音，并在既有眠宝病历夹中回看。", "interactions": ["从首页病程记录入口直接启动记录。", "保存后可打开病历夹，顶部返回首页。"], "pending": "真实账号、上传服务和云同步未接入；麦克风权限和录音格式取决于浏览器。"};
DEV_SPECS.journey = {"fields": ["records：id、type=journey、when、created、updated、flowId、title、text、media[]；文字≤2000 字。", "media：id、blob；记录引用 id/kind/name/duration；最多 4 张图，单图≤10 MB，压缩最长边约1600px；录音≤2分钟。", "与眠宝帮您共用 records/media 和会话存储，entry=recordJourney 直接启动记录流程。"], "rules": ["文字、图片或语音至少一项；时间需有效，现有实现允许约 1 分钟的时钟误差。保存失败保留输入可重试，不提供诊断或处方建议。", "录音需麦克风权限；不支持、未授权或设备错误时使用文字/图片。录音中或处理附件时禁止提交；语音保存原音频，不自动转写。附件与记录共用眠宝 IndexedDB。", "不创建第二套数据；可从病历夹查看、回放或修改既有记录。二级页隐藏主导航，返回首页保留已保存内容。"]};


// Voice case 20261014
REQUIREMENTS.home = {"title": "患者首页", "group": "首页", "origin": "图示页面", "goal": "让患者在首页的一张卡片中记录晨起状态、看到眠宝反馈，并快速找到今日任务与快捷服务。", "interactions": ["先展示晨起状态及眠宝权益卡，再展示推荐 Banner。", "快捷服务新增病程记录；打开二级页直接记录文字、图片或语音，并共用眠宝病历夹数据。", "今日用药和小憩的引导弹窗及计时逻辑保持现状。", "快捷服务新增语音病历，进入独立页面展示语音整理、关键字段标红及保存回看。"], "pending": "正式药品名、任务计划、消息提醒和外部服务入口需业务方确认。"};
DEV_SPECS.home = {"fields": ["onboardingPending、patientArchive；目标 patientArchive。", "当前字段补齐：insuranceStatus、meds[].day、homePreviewState。\n建议申请字段（待确认）：applicationId、applicationStatus、benefitStatus、updatedAt、rejectReason。", "homeBanners[]：title、text、action、target、theme；bannerStates.home：index、paused。", "voiceCase、journey、pharmacy、shop、payment、medReminder、adverseForm、specialist。", "route=voiceCase；historyRoute=voiceCaseHistory；state.voiceCases[]。", "路由 journey；内嵌入口 entry=recordJourney。与眠宝帮您共用 IndexedDB mianbao-integrated-care-records-v1 的 records/media。", "settings.medTime；meds[]：id、time、day、note；动效 assets/mianbao-med-guide.gif。", "napSession：id、day、startedAt、totalSeconds、remainingSeconds、endsAt、status(running/paused/finished)；时长 1—120 整数分钟；naps[]：id、day、time、minutes；动效 assets/mianbao-nap-guide.gif。", "moods[本地日期]：四档状态之一。\n建议正式字段（待确认）：userId、recordDate、moodCode、createdAt、updatedAt；recordDate 按选定业务时区生成。"], "rules": ["点击建立档案进入两字段表单，稍后再说关闭提示；已有档案不展示。刷新时未处理的提示保留；不影响首页原任务与服务。", "未领取或审核中进入商保页；已领取未记录打开用药弹窗；已记录进入服药记录。\n\n【A02/D01｜现状】未领取/审核中进入 payment；已领取且今日无记录打开服药弹窗；已记录进入 med。点击眠宝可覆盖展示状态，不改变申请数据。\n【建议规则（待确认）】申请状态与权益可用状态分别保存；approved 只有经权益接口确认可用后才映射“已领取”。审核拒绝显示拒绝原因及重申入口，不能映射已领取。状态成功刷新后统一重算首页与权益中心。\n【待确认】未申请/审核中/已通过/已拒绝分别对应的首页文案、按钮、跳转；通过后是否需激活；多个申请取哪一份；申请服务、失效规则。临时展示状态不作为真实办理依据，正式版是否保留点击切换需确认。", "页面顺序为顶部问候→晨起状态和眠宝权益卡→Banner→快捷服务→今日任务。轮播每 5 秒循环；离开页面清除计时器，页面隐藏、轮播内有焦点、主动暂停或系统要求减少动态时暂停。仅更新轮播区域，不清空左侧编辑输入。", "语音病历进入 voiceCase 独立二级页；病程记录进入既有 journey 文字/图片/录音流程；其余入口保留原跳转。所有二级页面隐藏五项主导航，并通过顶部返回回到首页。", "本次按用户确认仅实现 Demo 展示。点击或长按底部按钮展示固定示例整理效果；不调用麦克风、语音转写或真实大模型。该二级页不展示首页功能栏。", "文字≤2000 字；单条≤4 张图片、单张≤10 MB；单段录音≤2 分钟。文字、图片或语音至少一项；提交前停止录音并等待附件保存。保存到既有病历夹，同一来源可从眠宝帮您回看，不建立独立记录副本。", "点击任务不再直接跳详情；确认后保存当前时间与日期并关闭弹窗，同日该弹窗只保存一次，刷新任务及首页权益文案。已记录点击查看进入服药详情；开启减少动态时以静态眠宝替代 GIF。", "添加时建立计时会话，不计入已完成次数。倒计时每秒按 endsAt 和当前时间计算，不改写整页或左侧编辑内容；切换页面继续，刷新恢复。暂停保存剩余秒数，继续重建 endsAt。到时自动保存一条小憩记录，id 去重，归属开始日期；提前结束至少计时 1 秒才保存，分钟向上取整。保存失败保留会话可重试，不显示虚假完成；取消本次小憩不新增记录；未接入关闭页面后的通知。", "同日只能提交一次；已记录时禁用四个选项。\n\n【B02/B03｜现状】四档仅更新“今天的感受”文字；权益主文案由支付和服药记录决定。当前同日一次，不可修改。\n【建议规则（待确认）】晨起记录按 userId + recordDate 唯一；误选通过“修改当日状态”覆盖原记录而非新增，保留修改时间；未选择时显示引导，已选择时显示选中项。跨日重新计算日期及可选状态。\n【待确认】是否开放修改；四档对应反馈文案与形象配置；晨起反馈与权益信息的排列关系；日期统一北京时间还是用户时区。未确认前不把晨起状态当作疾病判断。"]};
REQUIREMENTS.records = {"title": "我的记录", "group": "我的", "origin": "交互补充", "goal": "集中访问不同类型的本地记录。", "interactions": ["查看每类记录数量。", "点击分类进入对应列表。", "语音病历条数与语音病历记录页使用同一来源，点击进入对应历史列表。"], "pending": "正式版本需账户同步和权限控制。"};
DEV_SPECS.records = {"fields": ["voiceCases、meds、events、sleep、ess、adverse 的数组长度及对应记录路由。", "目标页面。\n建议 target、filters、pageCursor、returnTarget；所有私有数据绑定 userId。"], "rules": ["数量按数组长度实时计算。\n\n【C10｜现状】仅五类，不含小憩、照片/SRSS、游戏、预约与晨起状态。\n【建议规则（待确认）】用一份类别配置供“我的记录/全部记录”；展示每类有效记录全量条数，不含草稿/失败；测评按记录统一列表，明确有分数与无分数照片是否计数。\n【待确认】本期类别清单；未纳入类型是否有其他全量入口；重复来源与任务计数不能混用。", "语音病历进入 voiceCaseHistory；其余分类保留原对应列表。各类条数读取已保存数据，不统计未保存草稿。"]};
REQUIREMENTS.voiceCase = {"title": "语音病历", "group": "首页 · 快捷服务", "origin": "新增功能需求", "goal": "由眠宝引导讲述近期情况，展示整理病历与时间、症状、次数，并确认保存。", "interactions": ["点击或长按底部按钮；按下进入聆听状态，松开进入整理状态，约 1.1 秒后回显固定示例。", "整理内容中的时间、症状、次数标红，同时逐项显示原始描述与转换内容。", "点击保存病历后可查看记录；也可再记录一段，生成另一条病历。"], "pending": "后续真实语音转写/大模型服务、模糊时间的澄清与编辑规则由正式需求另行定义；本次仅展示确认过的 Demo 效果。"};
DEV_SPECS.voiceCase = {"fields": ["route=voiceCase；route.caseId：可选历史记录 ID。", "临时 voiceCaseUi：phase=idle/listening/processing/ready、referenceAt、draft、savedId、job、timer。", "originalText、optimizedText、highlights[]：field(time/symptoms/count)、text；source=demo。", "time.originalDescription、time.convertedDate(YYYY-MM-DD)；symptoms.originalDescription、symptoms.extracted；count.originalDescription；referenceAt(ISO)、timeZone=Asia/Shanghai。", "state.voiceCases[]：id、createdAt、updatedAt、source、referenceAt、timeZone、originalText、optimizedText、highlights、time、symptoms、count；浏览器存储键 mianbao-prototype-v1。"], "rules": ["从首页进入新建；从记录列表携带 caseId 打开已保存内容。不存在的 ID 回退到新建。二级页隐藏主导航，底部录入按钮固定，结果区域独立滚动。", "Demo 使用固定原话，不采集真实音频、不接真实转写或大模型。按下记录 referenceAt，松开后整理；点击直接体验同一效果。整理中禁用录入；触摸取消或 Escape 取消当前聆听。离开页面取消未完成任务，避免延迟结果覆盖其他页面；未保存草稿离开后不保留。键盘空格/回车可触发。", "仅整理示例原意，不新增疾病诊断，不将“大概三次”改为精确次数。普通文字不标红；关键字段按结构化 highlights 渲染且转义文本。固定示例：昨天晚上看电视、大笑后双腿发软和站立不稳、大概三次。", "“昨天晚上”以按下按钮时的北京时间业务日期减一天；保留晚间描述，不编造具体时分。日期转换以该条记录的 referenceAt 为锚点，次日回看不重新计算。症状保留原话并归纳为“双腿发软、站立不稳”；次数保存“大概出现了三次”，本期不增加数值次数字段。", "仅 ready 且有 draft 时允许保存。单次结果只保存一次，重复操作不新增；再记录形成新结果。保存失败恢复原数组并保留草稿，可重试。语音病历独立保存结构化结果，不自动新增猝倒记录、不改动病程记录/用药统计。与主应用同一存储键，清除主应用记录时一并清理；账号与云同步未接入。"]};
REQUIREMENTS.voiceCaseHistory = {"title": "语音病历记录", "group": "语音病历 · 记录回看", "origin": "新增功能配套页", "goal": "回看已保存的原话、整理病历与提取字段。", "interactions": ["点击新增语音病历进入录入页。", "点击记录卡片回看完整内容与关键字段。"], "pending": "分页、云端记录和正式账号关联待接入。"};
DEV_SPECS.voiceCaseHistory = {"fields": ["state.voiceCases[]；route=voiceCaseHistory。", "id、time.convertedDate、symptoms.extracted、count.originalDescription、createdAt。", "route.caseId；voiceCases[].id；savedId。"], "rules": ["新增进入 voiceCase 新建页；仅显示已成功保存的数据，未保存草稿不计入列表。", "按 createdAt 倒序展示；记录发生日期与保存时间分别展示，不相互覆盖。列表与“我的记录”中语音病历条数读取同一数组。", "按 ID 读取，保留当时原话与日期换算结果；保存按钮禁用以防重复。可按住再记录生成新的病历，不覆盖原记录。本期无编辑、单条删除或自动写入猝倒趋势。"]};

// Rights banner removed 20261014
REQUIREMENTS.rights = {"title": "权益中心", "group": "权益中心", "origin": "图示页面", "goal": "集中展示多元支付与保障服务。", "interactions": ["标题→眠宝创新支付状态卡→多元支付与保障。", "状态概览保留未申请、审核中、已申请；已申请业务含义另行定义。", "原商保直付与计算器入口继续可用。"], "pending": "保险资格、福利项目与正式服务渠道需接入真实规则。"};
DEV_SPECS.rights = {"fields": ["insuranceStatus；paymentSummary() 输出 key=unclaimed/reviewing/applied；label、copy、action。", "目标页面 payment。\n建议 serviceCode、applicationId、currentApplication；权益卡与首页读取同一申请数据。", "目标页面 calculator。\n目标 calculator；预估规则包含 calculationVersion、serviceCode（若接入正式方案）。"], "rules": ["按本次确认保留文档三种概览名称。原型临时将旧 claimed/rejected 展示归入 applied，保留其底层数据，不表示两种审核结果业务等价。已申请的正式含义及真实状态映射另行定义；卡片不宣称通过、领取、支付或履约完成。三个按钮均进入原申请详情服务，正式统一数据与接口仍待实现。", "首页权益卡同步读取该页的状态。\n\n【A02/D01｜建议规则（待确认）】进入商保直付查看本用户对应服务的当前申请；提交/状态更新后返回本页刷新卡片；无资格/服务不可用显示原因，不默认可申请。\n【待确认】资格核验、服务地区、创新支付卡是否汇总该入口、多个申请排序。", "入口不直接计算或判断保险资格。\n\n【D02｜建议规则（待确认）】仅跳计算器；输入和结果不改变申请资格或审核状态；计算器明确金额性质和估算口径。\n【待确认】用户手填比例还是按方案计算、地区/保单数据来源。"]};
