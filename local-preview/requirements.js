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
