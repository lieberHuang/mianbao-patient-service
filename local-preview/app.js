/* 本地交互原型：无接口、无真实医疗或支付服务。 */
const $ = (s, root=document) => root.querySelector(s);
const app = $('#app');
const tabbar = $('#tabbar');
const today = () => new Date().toLocaleDateString('sv-SE');
const dt = () => new Date().toISOString();
const nice = v => v ? new Date(v).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const saved = (()=>{try{return JSON.parse(localStorage.getItem('mianbao-prototype-v1'))||{}}catch{return {}}})();
const descriptionStorageKey='mianbao-page-descriptions-v1';
const legacyDescriptions=(()=>{try{return JSON.parse(localStorage.getItem(descriptionStorageKey))||{}}catch{return {}}})();
const fileDescriptions=(()=>{try{return JSON.parse($('#page-description-data').textContent)||{}}catch{return {}}})();
const descriptionOverrides={...fileDescriptions};
for(const [key,entry] of Object.entries(legacyDescriptions)){
  if(!fileDescriptions[key]||String(entry.updatedAt||'')>String(fileDescriptions[key].updatedAt||''))descriptionOverrides[key]=entry;
}
const pageFeedback=(()=>{try{return JSON.parse($('#page-feedback-data').textContent)||{}}catch{return {}}})();
const uid = () => globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const state = Object.assign({moods:{},meds:[],naps:[],events:[],sleep:[],ess:[],scalePhotos:[],adverse:[],voiceCases:[],documentCases:[],journeyRecords:[],journeyDraft:null,journeyDrafts:{},points:0,orders:[],appointments:[],settings:{medTime:'09:00',napMinutes:20,notificationEnabled:false},insuranceStatus:'unclaimed',authStatus:'signed-out',chat:[],game:[]},saved);
if(!state.journeyDrafts||typeof state.journeyDrafts!=='object'||Array.isArray(state.journeyDrafts))state.journeyDrafts={};
if(!Array.isArray(state.journeyRecords))state.journeyRecords=[];
if(!Array.isArray(state.documentCases))state.documentCases=[];
if(!Array.isArray(state.voiceCases))state.voiceCases=[];
if(!state.loginSession?.phoneAuthorized&&state.authStatus!=='closed')state.authStatus='signed-out';
let route={name:state.authStatus==='closed'?'mine':state.authStatus==='active'?'home':'login'}, stack=[], essStep=0, essAnswers=Array(8).fill(null), napTimer=null, napRemaining=0, napStarted=false, gameState=null, toastTimer;
let sheet=state.authStatus==='active'&&state.onboardingPending?'archiveGuide':null, weekOffset=0, activeScale='ESS', pharmacyLocation=null, pharmacyStores=[], pharmacyLoading=false, pharmacyError='', photoPreviewUrl='';
let homePreviewState=null, specialPreviewState=null;
let voiceRecognition=null, voiceListening=false, composeDraft='', composeKey=null;
let editingDescriptionKey=null, editingModuleIndex=0, descriptionDraft=null, descriptionDirty=false, descriptionSaving=false;
let feedbackKey=null, feedbackDraft='', feedbackDirty=false, feedbackSaving=false;
const store=()=>localStorage.setItem('mianbao-prototype-v1',JSON.stringify(state));
const hasToday=(arr)=>arr.some(x=>x.day===today());
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2700)}
const descriptionKey=r=>r.name==='chat'?`chat:${r.topic||'faq'}`:r.name;
function pageRequirement(){
  const key=descriptionKey(route),override=descriptionOverrides[key]||{};
  return {...requirementFor(route),...devSpecFor(route),...override,modules:override.modules||moduleSpecFor(route)};
}
function allowDescriptionLeave(next){
  if(!journeyCanLeave(next))return false;
  if(descriptionKey(next)===descriptionKey(route))return true;
  if(feedbackSaving||descriptionSaving){toast('内容正在保存，请稍候');return false}
  if((descriptionDirty||feedbackDirty)&&!confirm('当前页面有未保存的说明或修改意见。离开后将丢失这些修改，确定离开吗？'))return false;
  editingDescriptionKey=null;descriptionDraft=null;descriptionDirty=false;
  feedbackKey=null;feedbackDraft='';feedbackDirty=false;
  return true;
}
function go(name,data={}){if(name==='voiceCase'){name='journey';if(data.caseId)data={...data,caseId:'voice:'+data.caseId}}if(name==='voiceCaseHistory')name='journeyHistory';if(state.authStatus!=='active'&&!['mine','login'].includes(name))return toast('请先重新进入');const next={name,...data};if(!allowDescriptionLeave(next))return;stack.push(route);route=next;sheet=name==='pharmacy'?'location':null;render();app.scrollTop=0}
function back(){const next=stack.at(-1)||{name:'home'};if(!allowDescriptionLeave(next))return;route=stack.pop()||{name:'home'};sheet=null;render();app.scrollTop=0}
function tab(name){if(state.authStatus!=='active'&&!['mine','login'].includes(name))return toast('请先重新进入');const next={name};if(!allowDescriptionLeave(next))return;stack=[];route=next;sheet=null;render();app.scrollTop=0}
function header(title,sub=''){return `<header class="detail-head"><button class="back" data-action="back" aria-label="返回">‹</button><div><h1>${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div></header>`}
function card(content,extra=''){return `<section class="card ${extra}">${content}</section>`}
function row(icon,title,sub,dest){return `<button class="row" data-go="${dest}"><span class="rowicon">${icon}</span><span class="rowbody"><strong>${title}</strong><small>${sub}</small></span><span class="arrow">›</span></button>`}
function compactRow(icon,title,dest){return `<button class="row row--compact" data-go="${dest}"><span class="rowicon">${icon}</span><span class="rowbody"><strong>${title}</strong></span><span class="arrow">›</span></button>`}
function quick(icon,title,dest,badge=''){return `<button class="quick" data-go="${dest}"><span class="glyph">${icon}</span>${badge?`<span class="quick-badge">${esc(badge)}</span>`:''}<span>${title}</span></button>`}
function chart(vals,coral=false){const max=Math.max(1,...vals);return `<div class="chart">${vals.map((n,i)=>`<div class="barcol"><div class="bar ${coral?'coral':''}" style="height:${Math.max(3,Math.round(n/max*100))}%" title="${n}"></div><small>${['一','二','三','四','五','六','日'][i]}</small></div>`).join('')}</div>`}
function weekValues(items,field){const now=new Date(),day=(now.getDay()+6)%7,start=new Date(now);start.setHours(0,0,0,0);start.setDate(now.getDate()-day);return Array.from({length:7},(_,i)=>{const date=new Date(start);date.setDate(start.getDate()+i);const key=date.toLocaleDateString('sv-SE');const matches=items.filter(x=>x.day===key);return field?matches.reduce((a,x)=>a+(Number(x[field])||0),0):matches.length})}
function weekDates(offset=0){const now=new Date(),day=(now.getDay()+6)%7,start=new Date(now);start.setHours(0,0,0,0);start.setDate(now.getDate()-day+offset*7);return Array.from({length:7},(_,i)=>{const date=new Date(start);date.setDate(start.getDate()+i);return date.toLocaleDateString('sv-SE')})}
function valuesForWeek(items,offset=0,field){return weekDates(offset).map(day=>{const matches=items.filter(x=>x.day===day);return field?matches.reduce((a,x)=>a+(Number(x[field])||0),0):matches.length})}
function weekLabel(offset=0){const dates=weekDates(offset);return `${dates[0].slice(5).replace('-','/')}—${dates[6].slice(5).replace('-','/')}`}
function scaleRecords(name){return name==='ESS'?[...state.ess,...state.scalePhotos.filter(x=>x.scale==='ESS'&&x.score!==null)]:state.scalePhotos.filter(x=>x.scale==='SRSS'&&x.score!==null)}
function recentScaleRecords(name){return scaleRecords(name).map((record,index)=>{const score=record.score,parsedTime=Date.parse(record.time||record.createdAt||'');let day=String(record.day||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(parsedTime))day=new Date(parsedTime).toLocaleDateString('sv-SE');const parsedDay=new Date(day+'T00:00:00');if(score===null||score===undefined||String(score).trim()===''||!Number.isFinite(Number(score))||Number(score)<0||!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(+parsedDay)||parsedDay.toLocaleDateString('sv-SE')!==day)return null;return {record,score:Number(score),day,at:Number.isFinite(parsedTime)?parsedTime:+parsedDay,index}}).filter(Boolean).sort((a,b)=>a.at-b.at||a.index-b.index).slice(-7)}
function scaleTrendMarkup(name){const records=recentScaleRecords(name);if(!records.length)return '<div class="empty scale-trend-empty">暂无测评得分记录</div>';const max=Math.max(1,...records.map(x=>x.score));return `<div class="chart scale-record-chart" role="img" aria-label="${esc(name)}最近${records.length}次记录，按时间由早到晚：${records.map(x=>`${esc(x.day)} ${x.score}分`).join('；')}">${records.map(x=>`<div class="barcol"><div class="bar" style="height:${Math.max(3,Math.round(x.score/max*100))}%" title="${esc(x.day)} · ${x.score}分"></div><small>${esc(x.day.slice(5).replace('-','/'))}</small></div>`).join('')}</div>`}

function homeStatus(){const status=state.insuranceStatus||'unclaimed';return homePreviewState||(status==='claimed'?(hasToday(state.meds)?'claimed-recorded':'claimed-unrecorded'):status==='reviewing'?'reviewing':'unclaimed')}
function monthCount(offset=0){const now=new Date(),d=new Date(now.getFullYear(),now.getMonth()+offset,1);const month=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;return state.events.filter(x=>x.day?.startsWith(month)).length}
function monthMood(){if(specialPreviewState)return specialPreviewState;const prior=monthCount(-1),current=monthCount();return prior===0?'none':current<prior?'down':current>prior?'up':'same'}
const tabs=[['home','⌂','首页'],['special','▧','健康档案'],['ai','✦','眠宝帮您'],['rights','▤','知识中心'],['mine','♙','我的']];
function renderTabs(){const active=tabs.some(t=>t[0]===route.name)?route.name:null;tabbar.innerHTML=tabs.map(([id,icon,label])=>`<button class="tab ${active===id?'active':''}" data-tab="${id}" ${active===id?'aria-current="page"':''} ${state.authStatus!=='active'&&id!=='mine'?'disabled':''}><span class="icon">${icon}</span><span>${label}</span></button>`).join('')}
function renderRequirements(){
  const key=descriptionKey(route);
  const req=pageRequirement();
  const feedback=pageFeedback[key]?.text;
  const panel=$('#requirement-panel');
  const previousScroll=panel.scrollTop;
  if(editingDescriptionKey===key){
    const draft=descriptionDraft;
    panel.innerHTML=`<div class="req-header"><div class="req-brand">眠宝<span>患者服务</span></div><span class="req-live"><i></i> 编辑说明</span></div>
      <div class="req-location">${esc(req.group)} <span>／</span> 编辑当前页面</div>
      <h2 class="req-edit-title">编辑页面说明</h2>
      <p class="req-edit-help">保存后写入 index.html，仅更新左侧说明，不改变中间页面的交互与样式。</p>
      <form data-requirement-form class="req-edit-form">
        <label>页面标题<input name="title" maxlength="60" required value="${esc(draft.title)}"></label>
        <label>页面目标<textarea name="goal" rows="3" required>${esc(draft.goal)}</textarea></label>
        <div class="req-edit-modules"><div class="req-edit-modules__heading"><strong>页面模块</strong><small>按中间页面的区域逐块填写</small></div>
          ${draft.modules.map((item,i)=>`<details class="req-module-edit" data-module-edit ${i===editingModuleIndex?'open':''}><summary><span>模块 ${String(i+1).padStart(2,'0')}</span><strong>${esc(item.title)}</strong></summary><div class="req-module-edit__body"><button class="req-remove-module" type="button" data-requirement-action="remove-module" data-module-index="${i}" ${draft.modules.length===1?'disabled':''}>删除此模块</button>
            <label>模块名称<input data-module-index="${i}" data-module-field="title" maxlength="80" value="${esc(item.title)}"></label>
            <label>展示与操作<textarea data-module-index="${i}" data-module-field="description" rows="3">${esc(item.description)}</textarea></label>
            <label>字段与数据<textarea data-module-index="${i}" data-module-field="fields" rows="3">${esc(item.fields)}</textarea></label>
            <label>状态与逻辑<textarea data-module-index="${i}" data-module-field="logic" rows="3">${esc(item.logic)}</textarea></label>
          </div></details>`).join('')}
          <button type="button" class="req-add-module" data-requirement-action="add-module" ${draft.modules.length>=20?'disabled':''}>＋ 添加模块</button>
        </div>
        <div class="req-edit-modules__heading"><strong>页面通用规则</strong><small>适用于多个模块的说明</small></div>
        <label>事件与流转 <small>每行一项，可留空</small><textarea name="interactions" rows="7">${esc(draft.interactions)}</textarea></label>
        <label>字段与数据 <small>每行一项</small><textarea name="data" rows="5">${esc(draft.data)}</textarea></label>
        <label>状态与逻辑 <small>每行一项</small><textarea name="logic" rows="6">${esc(draft.logic)}</textarea></label>
        <label>接口与待接入<textarea name="pending" rows="4">${esc(draft.pending)}</textarea></label>
        <div class="req-edit-actions"><button type="button" class="req-cancel" data-requirement-action="cancel" ${descriptionSaving?'disabled':''}>取消</button><button type="submit" class="req-save" ${descriptionSaving?'disabled':''}>${descriptionSaving?'正在保存…':'保存说明'}</button></div>
      </form>${feedback?`<section class="req-section req-section--feedback"><h3>本页修改意见 <span>${pageFeedback[key]?.appliedAt?'已按意见调整':'待统一调整'}</span></h3><p>${esc(feedback).replace(/\n/g,'<br>')}</p></section>`:''}`;
    panel.scrollTop=previousScroll;
    return;
  }
  panel.innerHTML=`<div class="req-header"><div class="req-brand">眠宝<span>患者服务</span></div><span class="req-live"><i></i> 页面需求</span></div>
    <div class="req-location">${esc(req.group)} <span>／</span> 当前页面</div>
    <div class="req-title-row"><h2>${esc(req.title)}</h2><div class="req-title-actions"><span class="req-origin">${descriptionOverrides[key]?'已自定义':'默认说明'} · ${esc(req.origin)}</span><button type="button" class="req-edit-button" data-requirement-action="edit">编辑说明</button>${descriptionOverrides[key]?'<button type="button" class="req-reset-button" data-requirement-action="reset">恢复默认</button>':''}</div></div>
    <p class="req-goal">${esc(req.goal)}</p>
    <section class="req-section req-section--modules"><h3>页面模块 <small>${req.modules.length} 个</small></h3><div class="req-module-list">${req.modules.map((item,i)=>`<article class="req-module-card"><header><span>${String(i+1).padStart(2,'0')}</span><h4>${esc(item.title)}</h4><button type="button" data-requirement-action="edit-module" data-module-index="${i}" aria-label="编辑${esc(item.title)}模块">编辑</button></header><div class="req-module-part"><strong>展示与操作</strong><p>${esc(item.description)}</p></div><div class="req-module-part"><strong>字段与数据</strong><p>${esc(item.fields)}</p></div><div class="req-module-part"><strong>状态与逻辑</strong><p>${esc(item.logic)}</p></div></article>`).join('')}</div></section>
    <details class="req-page-rules"><summary>页面通用规则与待接入事项</summary>
      <section class="req-section"><h3>事件与流转</h3><ol>${req.interactions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section>
      <section class="req-section req-section--data"><h3>字段与数据</h3><div class="req-spec-lines">${String(req.data||'').split('\n').filter(Boolean).map(x=>`<p>${esc(x)}</p>`).join('')}</div></section>
      <section class="req-section req-section--logic"><h3>状态与逻辑</h3><ol>${String(req.logic||'').split('\n').filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section>
      <section class="req-section req-section--pending"><h3>接口与待接入</h3><p>${esc(req.pending)}</p></section>
    </details>
    ${feedback?`<section class="req-section req-section--feedback"><h3>本页修改意见 <span>${pageFeedback[key]?.appliedAt?'已按意见调整':'待统一调整'}</span></h3><p>${esc(feedback).replace(/\n/g,'<br>')}</p></section>`:''}
    <div class="req-footer"><span class="key-dot"></span> 页面说明与修改意见均写入项目文件</div>`;
  panel.scrollTop=0;
}
function renderFeedback(){
  const key=descriptionKey(route);
  if(feedbackKey!==key){feedbackKey=key;feedbackDraft=pageFeedback[key]?.text||'';feedbackDirty=false}
  const req=pageRequirement();
  const entry=pageFeedback[key];
  $('#feedback-panel').innerHTML=`<div class="feedback-header"><div class="feedback-mark">修改意见</div><span class="feedback-file">写入 index.html</span><button type="button" class="feedback-close" data-feedback-action="close" aria-label="关闭修改意见">×</button></div>
    <div class="feedback-location">当前页面</div><h2>${esc(req.title)}</h2>
    <p class="feedback-intro">在这里写下此页面希望调整的内容。保存后会同步显示在左侧说明中，供后续统一修改。</p>
    <label class="feedback-label" for="page-feedback-input">页面修改意见</label>
    <textarea id="page-feedback-input" maxlength="5000" placeholder="例如：晨起状态需要支持补记；文章卡片需要调整标题样式……">${esc(feedbackDraft)}</textarea>
    <div class="feedback-counter"><span id="feedback-count">${feedbackDraft.length}</span> / 5000 字</div>
    <button class="feedback-save" data-feedback-action="save" ${feedbackSaving?'disabled':''}>${feedbackSaving?'正在保存…':'保存修改意见'}</button>
    <p class="feedback-status">${entry?`已保存至项目文件 · ${esc(nice(entry.updatedAt))}`:'尚无已保存的修改意见'}</p>
    <div class="feedback-hint">每个页面单独保存。清空输入框并保存，可移除该页面的修改意见。</div>`;
}
async function saveFeedback(){
  if(feedbackSaving)return;
  if(location.protocol==='file:'){toast('请通过本地服务打开页面后保存');return}
  const key=descriptionKey(route);
  const text=$('#page-feedback-input').value.trim();
  feedbackDraft=text;
  feedbackSaving=true;renderFeedback();
  try{
    const response=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pageKey:key,text})});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||'保存失败');
    if(result.entry)pageFeedback[key]=result.entry;else delete pageFeedback[key];
    feedbackDraft=text;feedbackDirty=false;
    toast(text?'修改意见已写入 index.html':'本页修改意见已清空');
    renderRequirements();
  }catch(error){toast(`保存失败：${error.message}`)}
  finally{feedbackSaving=false;renderFeedback()}
}
function startDescriptionEdit(moduleIndex=0){
  const key=descriptionKey(route);
  const req=pageRequirement();
  editingDescriptionKey=key;
  editingModuleIndex=moduleIndex;
  descriptionDraft={title:req.title,goal:req.goal,interactions:req.interactions.join('\n'),data:req.data,logic:req.logic||'',pending:req.pending,modules:req.modules.map(item=>({...item}))};
  descriptionDirty=false;
  renderRequirements();
  $('#requirement-panel [name="title"]').focus();
}
function removeLegacyDescription(key){
  delete legacyDescriptions[key];
  try{
    if(Object.keys(legacyDescriptions).length)localStorage.setItem(descriptionStorageKey,JSON.stringify(legacyDescriptions));
    else localStorage.removeItem(descriptionStorageKey);
  }catch{}
}
async function writeDescription(pageKey,entry){
  const response=await fetch('/api/description',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pageKey,entry})});
  const result=await response.json();
  if(!response.ok)throw new Error(result.error||'保存失败');
  return result.entry;
}
async function saveDescription(e){
  e.preventDefault();
  if(descriptionSaving)return;
  if(location.protocol==='file:')return toast('请通过本地服务打开页面后保存');
  const form=e.target;
  const values=Object.fromEntries(new FormData(form));
  const interactions=String(values.interactions||'').split('\n').map(x=>x.trim()).filter(Boolean);
  if(!String(values.title||'').trim()||!String(values.goal||'').trim()){toast('请填写页面标题和目标');return}
  const modules=[...form.querySelectorAll('[data-module-edit]')].map(block=>Object.fromEntries(['title','description','fields','logic'].map(field=>[field,block.querySelector(`[data-module-field="${field}"]`).value.trim()])));
  if(!modules.length||modules.some(item=>!item.title)){toast('请至少保留一个有名称的模块');return}
  const key=descriptionKey(route);
  const entry={title:values.title.trim(),goal:values.goal.trim(),interactions,data:String(values.data||'').trim(),logic:String(values.logic||'').trim(),pending:String(values.pending||'').trim(),modules};
  descriptionSaving=true;renderRequirements();
  try{
    descriptionOverrides[key]=await writeDescription(key,entry);
    fileDescriptions[key]=descriptionOverrides[key];
    removeLegacyDescription(key);
    editingDescriptionKey=null;descriptionDraft=null;descriptionDirty=false;
    toast('当前页面说明已写入 index.html');
    renderFeedback();
  }catch(error){toast(`保存失败：${error.message}`)}
  finally{descriptionSaving=false;renderRequirements()}
}
async function resetDescription(){
  const key=descriptionKey(route);
  if(descriptionSaving||!descriptionOverrides[key]||!confirm('确定将当前页面说明恢复为项目默认内容吗？'))return;
  if(location.protocol==='file:')return toast('请通过本地服务打开页面后恢复默认');
  descriptionSaving=true;
  try{
    await writeDescription(key,null);
    delete descriptionOverrides[key];
    delete fileDescriptions[key];
    removeLegacyDescription(key);
    toast('当前页面说明已恢复默认');
    renderFeedback();
  }catch(error){toast(`恢复失败：${error.message}`)}
  finally{descriptionSaving=false;renderRequirements()}
}
async function migrateLegacyDescriptions(){
  if(location.protocol==='file:')return;
  for(const [key,entry] of Object.entries(legacyDescriptions)){
    if(fileDescriptions[key]&&String(entry.updatedAt||'')<=String(fileDescriptions[key].updatedAt||'')){
      removeLegacyDescription(key);continue;
    }
    if(editingDescriptionKey===key||descriptionSaving)continue;
    try{
      const savedEntry=await writeDescription(key,entry);
      fileDescriptions[key]=savedEntry;
      descriptionOverrides[key]=savedEntry;
      removeLegacyDescription(key);
      if(descriptionKey(route)===key){renderRequirements();renderFeedback()}
    }catch(error){console.warn('旧页面说明迁移失败',key,error)}
  }
}
function render(){clearInterval(homeBannerTimer);homeBannerTimer=null;if(!['ai','chat'].includes(route.name))stopVoice();journeyBeforeRender();renderTabs();$('.device').classList.toggle('device--no-tabs',!tabs.some(([name])=>name===route.name));const pages={login,patientArchive,home,special,ai,journey,journeyHistory,rights,articleDetail,mine,med,medReminder,nap,eventForm,eventList,trend,essIntro,essQuiz,essResult,essHistory,game,sleepForm,sleepList,tip,pharmacy,shop,follow,specialist,payment,chat,appointment,contact,emergency,calculator,profile,settings,accountSettings,agreement,accountDelete,records,notice};app.classList.toggle('app--mianbao-service',route.name==='ai');app.classList.toggle('app--journey-record',route.name==='journey');app.innerHTML=(pages[route.name]||home)();renderRequirements();renderFeedback();renderSheet();bindPage()}
function openSheet(type){sheet=type;renderSheet()}
function closeSheet(){if(sheet==='archiveGuide')return deferArchiveGuide();if(['loginTerms','loginPrivacy','wechatPhone'].includes(sheet))loginInProgress=false;if(photoPreviewUrl){URL.revokeObjectURL(photoPreviewUrl);photoPreviewUrl=''}sheet=null;renderSheet()}
function renderSheet(){
  const root=$('#sheet-root');
  if(!sheet){root.innerHTML='';return}
  let body='',title='';
  if(sheet==='loginTerms'||sheet==='loginPrivacy'){
    const privacy=sheet==='loginPrivacy';title=privacy?'隐私政策':'用户协议';
    body=`<div class="protocol-dialog-copy"><h3>${privacy?'请了解您的信息如何使用':'欢迎使用眠宝患者服务'}</h3><p>${privacy?'登录流程将请求手机号授权；建档时填写的确诊时间与当前使用药物用于建立您的健康档案。':'眠宝提供信息查询、病程与用药记录、服务流程查询。请按实际情况填写信息，医疗与用药问题请咨询医生或药师。'}</p><p class="protocol-draft-note">${privacy?'正式隐私政策正文待提供。':'正式用户协议正文待提供。'}</p></div><button class="btn full" data-action="closeSheet">我知道了</button>`;
  }else if(sheet==='wechatPhone'){
    title='微信手机号授权';
    body=`<div class="wechat-permission-app"><img src="assets/mianbao-lamb.webp" alt="眠宝"><strong>眠宝患者服务</strong><span>申请</span></div><h3 class="wechat-permission-title">获取你的手机号</h3><p class="wechat-permission-purpose">用于识别你的账号并完成登录</p><div class="wechat-phone-number"><strong>138 **** 0000</strong><span>微信绑定手机号</span><i aria-hidden="true">✓</i></div><div class="wechat-permission-actions"><button data-action="denyWechatPhone">拒绝</button><button data-action="authorizeWechatPhone">允许</button></div>`;
  }else if(sheet==='archiveGuide'){
    title='建立您的健康档案';
    body=`<div class="archive-guide-mascot"><img src="assets/mianbao-lamb.webp" alt="邀请您建档的眠宝"></div><h3 class="task-guide-title">先建立一份健康档案吧</h3><p class="task-guide-copy">告诉眠宝您的确诊时间和当前用药，<br>方便日后记录与回顾。</p><button class="btn full" data-action="beginPatientArchive">建立档案</button><button class="btn ghost full" data-action="deferArchive">稍后再说</button>`;
  }else if(sheet==='location'){
    title='附近药店';
    body=pharmacyLocation?`<p class="sheet-note">已获取当前位置。下方为开放地图中的附近药店，具体营业与药品库存请向药店核实。</p>${pharmacyLoading?'<div class="empty">正在查找附近药店…</div>':pharmacyError?`<div class="empty">${esc(pharmacyError)}</div>`:pharmacyStores.length?pharmacyStores.map((place,i)=>`<div class="pharmacy-place"><span class="pharmacy-place__number">${i+1}</span><div><strong>${esc(place.name)}</strong><small>${esc(place.address||'地址暂无')} · 约 ${place.distance.toFixed(1)} 公里</small></div></div>`).join(''):'<div class="empty">3 公里内暂无可展示的开放地图药店信息</div>'}<button class="btn secondary full" data-action="locate">重新定位</button>`:`<div class="location-consent"><span>⌖</span><h3>获取您的当前位置</h3><p>授权后显示当前位置地图，并查询 3 公里内的药店。位置会发送给 OpenStreetMap 地图及 Overpass 查询服务；不会在本地保存坐标。</p>${pharmacyError?`<div class="notice warn">${esc(pharmacyError)}</div>`:''}<button class="btn full" data-action="locate">${pharmacyLoading?'正在请求定位…':'授权位置并查找'}</button></div>`;
  }else if(sheet==='med'){
    title='记录今日用药';
    body=`${taskMascot('med')}<h3 class="task-guide-title">${hasToday(state.meds)?'今天的用药，眠宝已记好':'今天的用药，眠宝帮您记下'}</h3><p class="task-guide-copy">${hasToday(state.meds)?'您已完成今日记录，随时可以回顾。':'计划时间：'+esc(state.settings.medTime)+'。确认已按医嘱服药后，点下方按钮记录。'}</p>${hasToday(state.meds)?'<button class="btn full" data-go="med">查看用药记录</button>':'<button class="btn full" data-action="homeMedNow">我已按医嘱服药，记录一下</button>'}`;
  }else if(sheet==='nap'){
    title='日常小憩时钟';const session=state.napSession,active=session&&session.status!=='finished';
    body=`${taskMascot('nap')}<h3 class="task-guide-title">${active?'眠宝陪您安心休息':'给自己安排一段小憩'}</h3>${active?`<p class="task-guide-copy">${session.status==='paused'?'计时已暂停，可以继续小憩。':'计时进行中，关闭弹窗后首页仍显示倒计时。'}</p><div id="napClock" class="count task-guide-clock">${formatClock(napSeconds())}</div><div class="button-row"><button class="btn" data-action="${session.status==='paused'?'napStart':'napPause'}">${session.status==='paused'?'继续小憩':'暂停计时'}</button><button class="btn secondary" data-action="napFinish">结束并记录</button></div><button class="btn ghost full" data-action="napCancel">取消本次小憩</button>`:`<p class="task-guide-copy">选择这次的时长，眠宝会帮您计时。</p><form data-form="homeNap"><label class="task-duration-label" for="homeNapMinutes">小憩时长（分钟）</label><input id="homeNapMinutes" name="minutes" type="number" min="1" max="120" step="1" value="${state.settings.napMinutes}" required><button class="btn full" type="submit">添加并开始小憩</button></form>`}`;
  }else if(sheet==='event'){
    title='快速记录猝倒';
    body=`<form data-form="event">${eventFields()}<button class="btn full" type="submit">保存记录</button></form>`;
  }else if(sheet==='eventList'){
    title='猝倒记录';
    const days=weekDates(weekOffset),list=state.events.filter(x=>days.includes(x.day)).slice().reverse();
    body=`<p class="sheet-note">${weekLabel(weekOffset)} · 本周 ${list.length} 次</p>${list.length?list.map(x=>`<div class="item"><strong>${nice(x.time)}</strong><small>诱因：${esc(x.trigger||'未填写')} · ${esc(x.duration||'未填写')} 分钟<br>${esc(x.note||'无备注')}</small></div>`).join(''):'<div class="empty">该周暂无已保存的猝倒记录</div>'}`;
  }else if(sheet==='photo'){
    title=`${activeScale} 拍照记录`;
    const photos=state.scalePhotos.filter(x=>x.scale===activeScale).slice().reverse();
    body=`<form data-form="scalePhoto"><p class="sheet-note">可拍照或选取量表图片；如填写得分，本页柱状图会显示该记录。暂不识别图片或解释分数。</p><div class="form-field"><label for="scalePhotoFile">量表照片 *</label><input id="scalePhotoFile" name="photo" type="file" accept="image/*" capture="environment" required></div><div id="scalePhotoPreview"></div><div class="form-field"><label for="scaleScore">得分（可选）</label><input id="scaleScore" name="score" type="number" min="0" max="999" step="1" placeholder="自行填写纸质量表得分"></div><button class="btn full" type="submit">保存照片记录</button></form>${photos.length?`<div class="sheet-history"><strong>最近记录</strong>${photos.slice(0,4).map(x=>`<div class="photo-history"><img src="${x.image}" alt="已保存的${esc(x.scale)}量表照片"><span>${nice(x.time)}<small>${x.score===null?'未填写得分':`${x.score} 分`}</small></span><button class="photo-history__delete" data-delete-photo="${x.id}" type="button">删除</button></div>`).join('')}</div>`:''}`;
  }
  root.innerHTML=`<div class="sheet-backdrop" data-sheet-close="true"></div><section class="bottom-sheet ${['med','nap','archiveGuide','loginTerms','loginPrivacy'].includes(sheet)?'task-dialog':''} ${sheet==='wechatPhone'?'wechat-permission-sheet':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-handle"></div><div class="sheet-heading"><h2>${esc(title)}</h2>${sheet==='archiveGuide'?'':'<button type="button" data-action="closeSheet" aria-label="关闭弹窗">×</button>'}</div><div class="sheet-body">${body}</div></section>`;
  const form=$('form[data-form]',root);if(form)form.addEventListener('submit',handleForm);updateNapClock();
}
function distanceKm(a,b,c,d){const r=6371,rad=x=>x*Math.PI/180,p1=rad(a),p2=rad(c),dp=rad(c-a),dl=rad(d-b);return 2*r*Math.asin(Math.sqrt(Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2))}
async function loadNearbyPharmacies(lat,lon){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
    const query=`[out:json][timeout:10];nwr[amenity=pharmacy](around:3000,${lat},${lon});out center 30;`;
    const response=await fetch('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query),{signal:controller.signal});
    if(!response.ok)throw new Error('查询服务暂不可用');
    const data=await response.json();
    pharmacyStores=(data.elements||[]).map(x=>{const la=x.lat??x.center?.lat,lo=x.lon??x.center?.lon,t=x.tags||{};return la&&lo&&t.name?{name:t['name:zh']||t.name,address:[t['addr:street'],t['addr:housenumber']].filter(Boolean).join(' '),distance:distanceKm(lat,lon,la,lo)}:null}).filter(Boolean).sort((a,b)=>a.distance-b.distance).slice(0,12);
    pharmacyError='';
  }catch{pharmacyStores=[];pharmacyError='药店查询服务暂不可用，请稍后重试。';}
  finally{clearTimeout(timer);pharmacyLoading=false;if(route.name==='pharmacy')renderSheet()}
}
function locatePharmacies(){
  if(!navigator.geolocation){pharmacyError='当前浏览器不支持定位。';renderSheet();return}
  pharmacyLoading=true;pharmacyError='';renderSheet();
  navigator.geolocation.getCurrentPosition(({coords})=>{pharmacyLocation={lat:Number(coords.latitude.toFixed(5)),lon:Number(coords.longitude.toFixed(5))};render();loadNearbyPharmacies(pharmacyLocation.lat,pharmacyLocation.lon)},()=>{pharmacyLoading=false;pharmacyError='未获得定位权限，可在浏览器设置中允许后重试。';renderSheet()},{enableHighAccuracy:false,timeout:12000,maximumAge:300000});
}
function resizePhoto(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const image=new Image();image.onerror=reject;image.onload=()=>{const scale=Math.min(1,700/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.72))};image.src=reader.result};reader.readAsDataURL(file)})}

function bindPage(){bindHomeBanner();bindScaleCarousel();bindKnowledgeCenter();bindJourneyRecords();const f=$('form[data-form]',app);if(f)f.addEventListener('submit',handleForm);const input=$('#helpQuestion');if(input){input.value=composeDraft;input.addEventListener('input',()=>composeDraft=input.value);$('#helpVoice').addEventListener('click',toggleVoice);updateVoiceUI()}}
function helpComposer(){const key=route.name==='chat'?`chat:${route.topic||'faq'}`:'ai';if(composeKey!==key){stopVoice();composeKey=key;composeDraft=''}return `<form data-form="chat" class="help-composer ${route.name==='ai'?'help-composer--primary':''}"><div class="help-composer__row"><button id="helpVoice" class="help-voice" type="button" aria-label="开始语音输入" aria-pressed="false">🎙</button><input id="helpQuestion" name="question" aria-label="输入问题" placeholder="想问什么？也可以语音输入" maxlength="2000" required autocomplete="off"><button class="btn" type="submit">发送</button></div><p id="helpVoiceStatus" class="help-voice-status" role="status">语音识别后可编辑，点击发送提交</p></form>`}
function updateVoiceUI(message){const btn=$('#helpVoice'),status=$('#helpVoiceStatus');if(btn){btn.setAttribute('aria-pressed',String(voiceListening));btn.setAttribute('aria-label',voiceListening?'结束语音输入':'开始语音输入');btn.classList.toggle('listening',voiceListening);btn.textContent=voiceListening?'■':'🎙'}if(status)status.textContent=message||(voiceListening?'正在听，请说话；点击 ■ 结束':'语音识别后可编辑，点击发送提交')}
function stopVoice(){const recognition=voiceRecognition;voiceRecognition=null;voiceListening=false;if(recognition){recognition.onresult=null;recognition.onend=null;recognition.onerror=null;try{recognition.abort()}catch{}}}
function toggleVoice(){if(voiceListening){try{voiceRecognition.stop()}catch{stopVoice();updateVoiceUI()}return}const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){updateVoiceUI('当前浏览器不支持语音识别，请使用文字或系统键盘听写');toast('当前浏览器不支持语音识别');return}const recognition=new Speech();recognition.lang='zh-CN';recognition.continuous=false;recognition.interimResults=true;voiceRecognition=recognition;const prefix=composeDraft.trim();let failed=false;recognition.onresult=e=>{if(voiceRecognition!==recognition)return;const spoken=Array.from(e.results).map(result=>result[0].transcript).join('');composeDraft=(prefix+(prefix?' ':'')+spoken).slice(0,2000);const input=$('#helpQuestion');if(input)input.value=composeDraft};recognition.onerror=e=>{if(voiceRecognition!==recognition)return;failed=true;const messages={'not-allowed':'未获得麦克风权限，请允许后重试或使用文字','audio-capture':'没有可用麦克风，请检查设备','no-speech':'未识别到声音，请重试','network':'语音识别连接失败，请重试或使用文字','service-not-allowed':'语音识别服务不可用，请使用文字'};voiceListening=false;updateVoiceUI(messages[e.error]||'语音识别未完成，请重试或使用文字')};recognition.onend=()=>{if(voiceRecognition!==recognition)return;voiceListening=false;voiceRecognition=null;if(!failed)updateVoiceUI(composeDraft?'识别已结束，确认文字后点击发送':'未识别到文字，请重试')};try{recognition.start();voiceListening=true;updateVoiceUI()}catch{voiceRecognition=null;voiceListening=false;updateVoiceUI('语音无法启动，请重试或使用文字')}}

const homeBanners=[
 {title:'让每一次记录，都更清楚',text:'随手记录猝倒，回顾发生时间与当时的情况。',action:'记录健康情况',target:'eventForm',theme:'blue'},
 {title:'有问题，来找眠宝',text:'说说您想了解的问题，眠宝陪您一起整理。',action:'和眠宝聊聊',target:'ai',theme:'mint'},
 {title:'和眠宝一起，读一点新知识',text:'查看患教文章，了解记录与复诊准备。',action:'前往知识中心',target:'rights',theme:'coral'}
];
const bannerStates={home:{index:0}};
let homeBannerTimer=null;
function bannerConfig(){return {kind:'home',items:homeBanners,state:bannerStates.home}}
function homeBannerMarkup(){const {kind,items,state}=bannerConfig();return `<section class="home-banner" data-banner-kind="${kind}" aria-label="${kind==='rights'?'权益服务':'首页推荐'}内容，共 ${items.length} 张" aria-roledescription="轮播"><div class="home-banner__viewport"><div class="home-banner__track" style="transform:translateX(-${state.index*100}%)">${items.map((item,i)=>`<article class="home-banner__slide home-banner__slide--${item.theme}" ${i!==state.index?'inert':''} aria-hidden="${i!==state.index}"><div><small>眠宝陪伴 · ${String(i+1).padStart(2,'0')}</small><h2>${item.title}</h2><p>${item.text}</p><button data-go="${item.target}">${item.action} <span aria-hidden="true">›</span></button></div><img src="assets/mianbao-lamb.webp" alt=""></article>`).join('')}</div></div><div class="home-banner__controls"><button class="home-banner__arrow" data-banner-step="-1" aria-label="上一张推荐">‹</button><div class="home-banner__dots">${items.map((_,i)=>`<button data-banner-index="${i}" aria-label="第 ${i+1} 张推荐" aria-pressed="${i===state.index}" class="${i===state.index?'active':''}"></button>`).join('')}</div><button class="home-banner__arrow" data-banner-step="1" aria-label="下一张推荐">›</button></div></section>`}
function showHomeBanner(index){const {items,state}=bannerConfig();state.index=(index+items.length)%items.length;const carousel=$('.home-banner');if(!carousel)return;$('.home-banner__track',carousel).style.transform=`translateX(-${state.index*100}%)`;carousel.querySelectorAll('.home-banner__slide').forEach((slide,i)=>{slide.inert=i!==state.index;slide.setAttribute('aria-hidden',String(i!==state.index))});carousel.querySelectorAll('[data-banner-index]').forEach((button,i)=>{button.classList.toggle('active',i===state.index);button.setAttribute('aria-pressed',String(i===state.index))})}
function bindHomeBanner(){const carousel=$('.home-banner');if(!carousel)return;const {state,kind}=bannerConfig();carousel.querySelectorAll('[data-banner-step]').forEach(button=>button.addEventListener('click',()=>showHomeBanner(state.index+Number(button.dataset.bannerStep))));carousel.querySelectorAll('[data-banner-index]').forEach(button=>button.addEventListener('click',()=>showHomeBanner(Number(button.dataset.bannerIndex))));let start=null;const viewport=$('.home-banner__viewport',carousel);viewport.addEventListener('touchstart',e=>{start={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}},{passive:true});viewport.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))showHomeBanner(state.index+(dx<0?1:-1))},{passive:true});homeBannerTimer=setInterval(()=>{if(route.name===kind&&!document.hidden&&!carousel.contains(document.activeElement)&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)showHomeBanner(state.index+1)},5000)}

const scaleCatalog=[{code:'ESS',name:'ESS 量表',canAnswer:true},{code:'SRSS',name:'SRSS 量表',canAnswer:false}];
function scaleCardsMarkup(){return `<section class="scale-section" aria-label="测评记录"><div class="section-title scale-section__title"><span>测评记录</span><div class="scale-arrows"><button data-scale-step="-1" aria-label="上一量表">‹</button><button data-scale-step="1" aria-label="下一量表">›</button></div></div><div class="scale-names" aria-label="量表名称">${scaleCatalog.map(item=>`<button data-scale-name="${item.code}" aria-pressed="${activeScale===item.code}" class="${activeScale===item.code?'selected':''}">${item.name}</button>`).join('')}</div><div class="scale-carousel" tabindex="0" aria-label="左右滑动查看量表卡片">${scaleCatalog.map(item=>card(`<div class="scale-slide__head"><h2>${item.name}</h2></div>${scaleTrendMarkup(item.code)}<div class="button-row">${item.canAnswer?'<button class="btn secondary" data-go="essIntro">进入测评</button>':''}<button class="btn" data-scale-photo="${item.code}">拍照记录</button></div>`,`scale-card scale-slide ${activeScale===item.code?'selected':''}`)).join('')}</div></section>`}
function bindScaleCarousel(){const track=$('.scale-carousel');if(!track)return;const slides=Array.from(track.children),names=Array.from(app.querySelectorAll('[data-scale-name]'));const position=i=>slides[i].offsetLeft-slides[0].offsetLeft;const update=i=>{activeScale=scaleCatalog[i].code;names.forEach((button,j)=>{button.classList.toggle('selected',i===j);button.setAttribute('aria-pressed',String(i===j))});slides.forEach((slide,j)=>{slide.classList.toggle('selected',i===j);slide.inert=i!==j;slide.setAttribute('aria-hidden',String(i!==j))});app.querySelectorAll('[data-scale-step]').forEach(button=>{button.disabled=Number(button.dataset.scaleStep)<0?i===0:i===slides.length-1})};const select=i=>{i=Math.max(0,Math.min(slides.length-1,i));update(i);track.scrollTo({left:position(i),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};let queued=false;track.addEventListener('scroll',()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;let nearest=0;slides.forEach((slide,i)=>{if(Math.abs(position(i)-track.scrollLeft)<Math.abs(position(nearest)-track.scrollLeft))nearest=i});update(nearest)})},{passive:true});names.forEach((button,i)=>button.addEventListener('click',()=>select(i)));app.querySelectorAll('[data-scale-step]').forEach(button=>button.addEventListener('click',()=>select(scaleCatalog.findIndex(item=>item.code===activeScale)+Number(button.dataset.scaleStep))));track.addEventListener('keydown',e=>{if(e.target!==track||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();select(scaleCatalog.findIndex(item=>item.code===activeScale)+(e.key==='ArrowLeft'?-1:1))});const current=Math.max(0,scaleCatalog.findIndex(item=>item.code===activeScale));track.scrollLeft=position(current);update(current)}

function home(){
  const m=state.moods[today()],status=homeStatus();
  const moodOptions=[['😀','精神饱满'],['🙂','有些疲惫'],['😴','需要小睡'],['😟','状态不佳']];
  const copy={
    unclaimed:'您的用药权益暂未领取',
    reviewing:'您提交的用药权益已经在审核中啦，眠宝将持续为您跟进',
    'claimed-unrecorded':'今天的用药还未记录',
    'claimed-recorded':'今天的用药已记录'
  }[status];
  return `<div class="page page--home">
    <header class="page-head page-head--home"><h1>您好！今天感觉怎么样？</h1></header>
    <section class="home-checkin" aria-label="晨起状态与眠宝反馈">
      <div class="moods">${moodOptions.map(([emoji,label])=>`<button class="mood ${m===label?'selected':''}" data-mood="${label}" aria-pressed="${m===label}" ${m?'disabled':''}><span aria-hidden="true">${emoji}</span>${label}</button>`).join('')}</div>
      <div class="home-checkin__story home-checkin__story--benefit">
        <div class="home-benefit-copy"><strong>${esc(copy)}</strong><span>${m?`今天的感受：${esc(m)}`:'先选一个最接近你现在的感受吧'}</span></div>
        <button class="home-mascot-button" data-action="cycleHomePreview" aria-label="切换眠宝展示状态"><img src="assets/mianbao-lamb.webp" alt=""></button>
      </div>
    </section>
    ${homeBannerMarkup()}
    <div class="section-title">NT1专区</div>
    ${card(`<div class="quick-grid">${quick('✎','病程记录','journey')}${quick('📍','药房地图','pharmacy')}${quick('💊','线上购药','shop')}${quick('🛡','患者福利','payment',paymentSummary().label)}${quick('⏰','用药记录','medReminder')}${quick('👩‍⚕️','我的专员','specialist')}</div>`)}
  </div>`;
}
function special(){
  const month=monthCount(),mood=monthMood();
  const messages={down:'比上月有改善哦，眠宝和你一起upup～',up:'怎么会这样，要注意身体哦～',none:'记录问题是改善问题的第一步，眠宝和你一起进步～',same:'和上月一样，眠宝陪你继续记录～'};
  return `<div class="page page--special"><header class="page-head"><div><h1>发作性睡病专区</h1><p class="sub">记录症状，也看见自己的变化</p></div></header>
    <section class="month-summary month-summary--${mood}"><div class="month-summary__hero"><div class="month-summary__text"><small>本月已记录猝倒事件</small><strong>${month} <i>次</i></strong><p>${messages[mood]}</p></div><button class="month-summary__mascot" data-action="cycleSpecialPreview" aria-label="切换眠宝月度状态"><img src="assets/mianbao-lamb.webp" alt="眠宝陪你查看月度记录"></button></div><div class="month-summary__actions"><button class="btn" data-action="openEventSheet">快速记录 <span aria-hidden="true">＋</span></button></div></section>
    ${card(`<div class="section-title trend-title"><span>猝倒周期趋势</span><span class="period-controls"><button data-action="weekPrev" aria-label="上一周">‹</button><small>${weekLabel(weekOffset)}</small><button data-action="weekNext" aria-label="下一周">›</button></span></div>${chart(valuesForWeek(state.events,weekOffset),true)}<button class="btn secondary full" data-action="openEventListSheet">查看记录</button>`)}
    ${scaleCardsMarkup()}
  </div>`;
}
function ai(){return `<iframe id="mianbaoServiceFrame" class="mianbao-service-frame" title="眠宝帮您患者服务" src="mianbao-service/index.html?v=local-records-20261014" allow="microphone"></iframe>`}
function paymentSummary(){const source=state.insuranceStatus||'unclaimed';const key=['unclaimed','reviewing'].includes(source)?source:['applied','claimed','rejected'].includes(source)?'applied':'unclaimed';const states={unclaimed:{label:'未申请',copy:'了解创新支付服务，查看申请流程。',action:'了解申请流程'},reviewing:{label:'审核中',copy:'申请正在审核，查看当前办理进度。',action:'查看申请进度'},applied:{label:'已申请',copy:'查看您的申请信息与服务办理情况。',action:'查看申请详情'}};return {key,...states[key]}}
function rights(){return knowledgeCenter()}

function patientUserId(){if(!state.userId){state.userId='MB'+uid().replace(/[^a-zA-Z0-9]/g,'').slice(0,12).toUpperCase();try{store()}catch{toast('用户ID暂未保存，请稍后重试')}}return state.userId}
function mine(){if(state.authStatus==='closed')return `<div class="page page--mine">${card(`<div class="mine-closed"><img src="assets/mianbao-lamb.webp" alt="眠宝"><h1>账户已注销</h1><p>本地记录已清除。</p><button class="btn full" data-action="restartDemo">重新进入</button></div>`)}</div>`;if(state.authStatus==='signed-out')return `<div class="page page--mine">${card(`<div class="mine-closed"><img src="assets/mianbao-lamb.webp" alt="眠宝"><h1>已退出登录</h1><p>本地记录仍保留。</p><button class="btn full" data-action="demoLogin">重新进入</button></div>`)}</div>`;return `<div class="page page--mine"><header class="page-head"><h1>我的</h1></header><section class="mine-profile"><div><small>你好，${esc(patientUserId())}</small><h2>与眠宝一起记录每一天</h2></div><img src="assets/mianbao-lamb.webp" alt="挥手的眠宝"></section><div class="section-title">我的服务</div>${card(`${compactRow('♙','个人资料','profile')}`)}<div class="section-title">设置</div>${card(`${compactRow('⚙','设置','accountSettings')}`)}</div>`}
function med(){const list=state.meds.slice().reverse();return `<div class="page page--detail">${header('服药打卡','仅用于记录，不提供漏服补服医学建议')}${card(`<div class="metric"><div><small>计划时间</small><br><strong>${esc(state.settings.medTime)}</strong></div><span class="pill">${hasToday(state.meds)?'今日已记录':'今日待记录'}</span></div><div class="button-row" style="margin-top:16px"><button class="btn" data-action="medNow">记录已按医嘱服药</button><button class="btn secondary" data-go="medReminder">修改提醒</button></div><p class="help">若错过计划时间或对用药有疑问，请按照处方和经审核的药品资料咨询医生或药师。</p>`)}${card(`<strong>最近记录</strong>${list.length?list.slice(0,8).map(x=>`<div class="item"><strong>${esc(x.day)}</strong><small>${nice(x.time)} · ${esc(x.note||'按时记录')}</small></div>`).join(''):`<div class="empty">还没有服药记录</div>`}`)}</div>`}
function medReminder(){return `<div class="page page--detail">${header('用药提醒')}${card(`<div class="reminder-intro"><span>⏰</span><div><strong>按计划用药</strong><small>设置提醒时间，方便每天查看用药任务</small></div></div>`)}<form data-form="medReminder">${card(`<div class="form-field"><label for="reminderTime">每日提醒时间</label><input id="reminderTime" name="medTime" type="time" value="${esc(state.settings.medTime)}" required></div><div class="setting-toggle"><div><strong>消息通知提醒</strong></div><label class="switch"><input name="notificationEnabled" type="checkbox" ${state.settings.notificationEnabled?'checked':''} aria-label="消息通知提醒"><span></span></label></div>`)}<button class="btn full" type="submit">保存提醒</button></form></div>`}
function nap(){const num=state.naps.filter(x=>x.day===today()).length;return `<div class="page page--detail">${header('小憩时钟','按自己的计划安排休息')}${card(`<div class="metric"><div><small>今日已记录</small><br><strong>${num} 次</strong></div><span class="pill">计划 ${state.settings.napMinutes} 分钟</span></div><div class="count" id="napClock" style="text-align:center;margin:24px 0">${formatClock(napStarted?napRemaining:state.settings.napMinutes*60)}</div><div class="button-row"><button class="btn" data-action="napStart" ${napTimer?'disabled':''}>${napTimer?'计时中':napStarted?'继续计时':'开始计时'}</button><button class="btn secondary" data-action="napPause">暂停</button><button class="btn ghost" data-action="napFinish">结束并记录</button></div>`)}${card(`<strong>小憩记录</strong>${state.naps.length?state.naps.slice().reverse().slice(0,8).map(x=>`<div class="item"><strong>${esc(x.minutes)} 分钟</strong><small>${nice(x.time)}</small></div>`).join(''):`<div class="empty">尚无记录，点击“开始计时”体验</div>`}`)}</div>`}
function formatClock(s){s=Math.max(0,s);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function eventFields(){return `<div class="form-field"><label for="eventTime">发生时间 *</label><input id="eventTime" name="time" type="datetime-local" required value="${new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16)}"></div><div class="form-field"><label for="eventDuration">持续时间（分钟）</label><input id="eventDuration" name="duration" type="number" min="0" max="120" placeholder="可稍后补充"></div><div class="form-field"><label for="eventTrigger">可能的诱因</label><select id="eventTrigger" name="trigger"><option value="">暂不确定</option><option>高兴</option><option>惊讶</option><option>紧张</option><option>其他</option></select></div><div class="form-field"><label for="eventNote">当时的情况</label><textarea id="eventNote" name="note" placeholder="例如场景、恢复情况"></textarea></div><p class="help">语音转写需接入录音权限及服务后实现。</p>`}
function eventForm(){return `<div class="page page--detail">${header('记录猝倒事件','可补记发生时间与当时情况')}<form data-form="event">${card(eventFields())}<button class="btn full" type="submit">保存事件记录</button></form></div>`}
function eventList(){return `<div class="page page--detail">${header('猝倒记录','点击记录后可查看内容')}<button class="btn full" data-go="eventForm">新增记录</button>${card(state.events.length?state.events.slice().reverse().map(x=>`<div class="item item-action"><div><strong>${nice(x.time)}</strong><small>诱因：${esc(x.trigger||'未填写')} · ${esc(x.duration||'未填写')} 分钟<br>${esc(x.note||'无备注')}</small></div><button data-delete="events:${x.id}" aria-label="删除记录">删除</button></div>`).join(''):`<div class="empty"><span class="icon">✎</span>还没有事件记录<br>可在发生后补记</div>`)}</div>`}
function trend(){return `<div class="page page--detail">${header('猝倒趋势','按本周已记录事件汇总')}${card(`<div class="metric"><span>本周事件</span><strong>${weekValues(state.events).reduce((a,b)=>a+b,0)} 次</strong></div>${chart(weekValues(state.events),true)}<p class="help">图表只统计已记录事件；没有记录不代表没有发生。</p>`)}${card(`<strong>本周记录</strong>${state.events.length?state.events.slice().reverse().slice(0,6).map(x=>`<div class="item"><strong>${nice(x.time)}</strong><small>${esc(x.trigger||'诱因未填写')} · ${esc(x.note||'无备注')}</small></div>`).join(''):`<div class="empty">暂无记录</div>`}`)}<button class="btn full" data-go="eventList">查看全部事件</button></div>`}
function essIntro(){return `<div class="page page--detail">${header('ESS 测评流程')}${card(`<h2 style="font-size:18px;margin:0 0 10px">开始前请了解</h2><p class="help">当前题干尚未接入正式 ESS 量表，所得分数不用于医学判断。</p><button class="btn full" data-action="essStart">开始测评</button>`)}${card(`${row('▥','历史测评','查看分数趋势','essHistory')}`)}</div>`}
function essQuiz(){return `<div class="page page--detail">${header('ESS 测评',`第 ${essStep+1} / 8 题`)}<div class="stepper">${Array.from({length:8},(_,i)=>`<span class="${i<=essStep?'on':''}"></span>`).join('')}</div>${card(`<div class="question">场景 ${essStep+1}：此处待填入经授权的正式量表题干。</div><p class="help">请选择一个等级。当前题目不能用于医学判断。</p>${['0 · 从不','1 · 偶尔','2 · 经常','3 · 很容易'].map((x,i)=>`<button class="choice ${essAnswers[essStep]===i?'selected':''}" data-ess-choice="${i}">${x}</button>`).join('')}`)}<div class="button-row"><button class="btn secondary" data-action="essPrev" ${essStep===0?'disabled':''}>上一题</button><button class="btn" data-action="essNext" ${essAnswers[essStep]===null?'disabled':''}>${essStep===7?'提交结果':'下一题'}</button></div></div>`}
function essResult(){return `<div class="page page--detail">${header('测评结果')}${card(`<div style="text-align:center"><small>本次得分</small><div class="count">${route.score}</div><p class="help">当前题目不是正式 ESS 量表，分数不能用于医学判断。</p></div>`)}<div class="button-row"><button class="btn secondary" data-go="essHistory">查看历史</button><button class="btn" data-action="essAgain">再做一次</button></div></div>`}
function essHistory(){return `<div class="page page--detail">${header('测评历史')}${card(state.ess.length?state.ess.slice().reverse().map(x=>`<div class="item"><strong>${x.score} 分</strong><small>${nice(x.time)}</small></div>`).join(''):`<div class="empty">暂无测评记录</div>`)}</div>`}
function game(){const g=gameState;return `<div class="page page--detail">${header('注意力挑战','捕捉清醒精灵 · 轻量游戏')}${card(`<p class="help">点击图中的 ✦，尽量不要点到 ○。本游戏仅供互动体验，不是临床注意力测试。</p><div class="metric"><div><small>得分</small><br><strong id="gameScore">${g?.score||0}</strong></div><span class="pill" id="gameTime">${g?g.left+' 秒':'未开始'}</span></div><div class="game-grid" style="margin:18px 0">${Array.from({length:20},(_,i)=>`<button class="game-tile" data-game-tile="${i}" ${g?'':'disabled'}>${g?.tiles[i]?'✦':'○'}</button>`).join('')}</div><button class="btn full" data-action="gameStart">${g?'重新开始':'开始 30 秒挑战'}</button>`)}${card(`<strong>最近成绩</strong>${state.game.length?state.game.slice().reverse().slice(0,5).map(x=>`<div class="item"><strong>${x.score} 分</strong><small>${nice(x.time)}</small></div>`).join(''):`<div class="empty">尚无挑战记录</div>`}`)}</div>`}
function sleepForm(){return `<div class="page page--detail">${header('新增睡眠日志')}<form data-form="sleep">${card(`<div class="form-field"><label for="bed">就寝时间 *</label><input id="bed" name="bed" type="datetime-local" required></div><div class="form-field"><label for="wake">起床时间 *</label><input id="wake" name="wake" type="datetime-local" required></div><div class="form-field"><label for="quality">主观睡眠感受</label><select id="quality" name="quality"><option>一般</option><option>很好</option><option>较差</option></select></div><div class="form-field"><label for="sleepNote">备注</label><textarea id="sleepNote" name="note" placeholder="可记录夜间觉醒或其他感受"></textarea></div>`)}<button class="btn full" type="submit">保存睡眠日志</button></form></div>`}
function sleepList(){return `<div class="page page--detail">${header('睡眠日志')}<button class="btn full" data-go="sleepForm">新增睡眠日志</button>${card(state.sleep.length?state.sleep.slice().reverse().map(x=>`<div class="item item-action"><div><strong>${nice(x.bed)} 至 ${nice(x.wake)}</strong><small>感受：${esc(x.quality)}${x.note?' · '+esc(x.note):''}</small></div><button data-delete="sleep:${x.id}">删除</button></div>`).join(''):`<div class="empty"><span class="icon">☾</span>还没有睡眠日志</div>`)}</div>`}
function tip(){const tips=['给自己留一段安静的休息时间。','把想问医生的问题先记下来。','记录症状发生的时间和场景，复诊时更容易回顾。'];return `<div class="page page--detail">${header('科学小贴士','示例内容 · 正式内容待医学审核')}${card(`<div style="text-align:center;font-size:50px;margin:12px">🃏</div><div class="question" style="text-align:center">${esc(tips[route.tipIndex||0])}</div><button class="btn full" data-action="flipTip">再看一条</button>`)}</div>`}
function pharmacy(){const loc=pharmacyLocation;const bbox=loc?`${loc.lon-.018}%2C${loc.lat-.013}%2C${loc.lon+.018}%2C${loc.lat+.013}`:'';return `<div class="page page--detail page--pharmacy">${header('药房地图','定位后查看周边药店')}<div class="pharmacy-map">${loc?`<iframe title="当前位置地图" loading="lazy" referrerpolicy="no-referrer" src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&amp;layer=mapnik&amp;marker=${loc.lat}%2C${loc.lon}"></iframe>`:`<div class="pharmacy-map__placeholder"><span>⌖</span><strong>当前位置地图</strong><small>授权定位后显示周边地图</small></div>`}</div><div class="pharmacy-map__attribution">${loc?'地图 © OpenStreetMap 贡献者 · 药店信息来自开放地图':'位置信息仅在授权后获取'}</div><button class="btn full" data-action="openPharmacySheet">${loc?'查看附近药店':'授权位置并查找药店'}</button></div>`}
function shop(){return `<div class="page page--detail">${header('线上购药')}<div class="coming-soon">待接入</div></div>`}
function follow(){return `<div class="page page--detail">${header('随访管家','随访计划与服务人员待接入')}${card(`${row('🗓','预约复诊','填写预约意向','appointment')}${row('🤝','联系随访专员','查看服务说明','contact')}`)}</div>`}
function specialist(){return `<div class="page page--detail">${header('我的专员')}${card(`<div class="specialist-card"><img src="assets/mianbao-doctor.webp" alt="医生形象眠宝"><h2>添加企业微信专员</h2><p>长按识别下方二维码添加专员，获取随访与服务协助。</p><div class="specialist-qr"><span>企业微信二维码</span></div></div>`)}</div>`}
function payment(){const status=state.insuranceStatus||'unclaimed',labels={unclaimed:'未领取',reviewing:'审核中',claimed:'已领取',rejected:'已拒绝'};return `<div class="page page--detail">${header('患者福利')}${card(`<div class="metric"><div><small>用药权益状态</small><br><strong style="font-size:20px">${labels[status]}</strong></div></div><p class="help">状态仅供页面预览，未向保险机构提交申请。</p><div class="button-row" style="margin-top:14px">${status==='unclaimed'?'<button class="btn" data-action="insuranceApply">切换为审核中</button>':status==='reviewing'?'<button class="btn" data-action="insuranceApprove">切换为已领取</button>':'<button class="btn secondary" data-action="insuranceReset">切换为未领取</button>'}</div>`)}${card(`<strong>预计流程</strong><div class="item">1. 了解适用资格与地区</div><div class="item">2. 核验保险与处方资料</div><div class="item">3. 展示可使用的支付渠道</div><p class="help">真实保险核验、支付与合作机构均未接入。</p>`)}</div>`}
function chat(){const topic=route.topic||'faq';const history=state.chat.filter(x=>x.topic===topic);return `<div class="page page--detail">${header(topics[topic])}${card(`<div class="chat"><div class="bubble-chat">你好，我是眠宝。你可以在这里记录想了解的问题。</div>${history.map(x=>`<div class="bubble-chat user">${esc(x.q)}</div><div class="bubble-chat">${esc(x.a)}</div>`).join('')}</div>`)}<div class="notice">具体用药问题请向医生或药师咨询。</div>${helpComposer()}</div>`}
function appointment(){return `<div class="page page--detail">${header('复诊预约','仅记录本地预约意向')}<form data-form="appointment">${card(`<div class="form-field"><label for="aName">称呼 *</label><input id="aName" name="name" required maxlength="30" placeholder="请输入称呼"></div><div class="form-field"><label for="aDate">期望日期 *</label><input id="aDate" name="date" type="date" required min="${today()}"></div><div class="form-field"><label for="aNote">需要沟通的事</label><textarea id="aNote" name="note" placeholder="例如复诊、症状变化等"></textarea></div><p class="help">预约意向暂未提交医院。</p>`)}<button class="btn full" type="submit">保存预约意向</button></form>${state.appointments.length?card(`<strong>已保存意向</strong>${state.appointments.slice().reverse().map(x=>`<div class="item"><strong>${esc(x.date)} · ${esc(x.name)}</strong><small>${esc(x.note||'无备注')} · 未提交给医院</small></div>`).join('')}`):''}</div>`}
function contact(){return `<div class="page page--detail">${header('随访专员','服务人员信息待确认')}${card(`<p class="help">图示提出添加企微与随访专员。正式版本需展示服务主体、工作时间、联系方式及个人信息授权。</p><button class="btn full" data-action="contactCheck">查看接入状态</button>`)}</div>`}
function emergency(){return `<div class="page page--detail">${header('紧急咨询','真实服务尚未接入')}${card(`<p>若正在发生紧急情况，请及时联系当地急救服务或前往医疗机构。</p><p class="help">此页不提供实时医生回复，也不保证在线响应。</p>`)}</div>`}
function calculator(){return `<div class="page page--detail">${header('商保计算器')}${card(`<div class="form-field"><label for="cost">预计费用（元）</label><input id="cost" type="number" min="0" placeholder="请输入金额"></div><div class="form-field"><label for="ratio">预估报销比例（%）</label><input id="ratio" type="number" min="0" max="100" placeholder="例如 50"></div><button class="btn full" data-action="calculate">计算预估金额</button><div id="calcResult" class="notice">实际报销需依保单、处方、审核结果确定。</div>`)}</div>`}

function profile(){const archive=state.patientArchive;return `<div class="page page--detail">${header('个人资料')}${card(`<div class="item"><strong>健康档案</strong><small>${hasPatientArchive()?'已建立':'尚未建立'}</small></div>${hasPatientArchive()?`<div class="item"><strong>NT1阵发性睡病确诊时间</strong><small>${esc(archive.diagnosisDate)}</small></div><div class="item"><strong>当前使用药物</strong><small>${esc(archive.currentDrugs)}</small></div>`:''}<button class="btn full" style="margin-top:15px" data-action="beginPatientArchive">${hasPatientArchive()?'修改档案':'建立档案'}</button>`)}</div>`}

function settings(){return `<div class="page page--detail">${header('提醒设置','保存计划，不发送系统通知')}<form data-form="settings">${card(`<div class="form-field"><label for="medTime">计划服药时间</label><input id="medTime" name="medTime" type="time" value="${esc(state.settings.medTime)}" required></div><div class="form-field"><label for="napMinutes">小憩时长（分钟）</label><input id="napMinutes" name="napMinutes" type="number" min="1" max="120" value="${state.settings.napMinutes}" required></div>`)}<button class="btn full" type="submit">保存设置</button></form></div>`}
function accountSettings(){return `<div class="page page--detail">${header('设置')}${card(`<div class="setting-toggle"><div><strong>消息通知提醒</strong></div><label class="switch"><input id="notificationToggle" type="checkbox" ${state.settings.notificationEnabled?'checked':''} aria-label="消息通知提醒"><span></span></label></div>${row('📄','用户协议','查看协议接入状态','agreement')}`)}${card(`<button class="row" data-action="demoLogout"><span class="rowicon">🚪</span><span class="rowbody"><strong>退出登录</strong><small>退出当前账户</small></span><span class="arrow">›</span></button>${row('⊘','注销账号','查看注销说明及本地数据处理','accountDelete')}`,'account-settings-actions')}</div>`}
function agreement(){return `<div class="page page--detail">${header('用户协议')}${card(`<h2 class="agreement-title">用户协议待接入</h2><p class="help">当前页面用于展示协议入口与阅读路径。正式协议应由业务方提供版本号、生效日期、服务主体、数据处理与联系渠道，并经法务审核后发布。</p>`)}</div>`}
function accountDelete(){return `<div class="page page--detail">${header('注销账号')}${card(`<h2 class="agreement-title">注销账号</h2><p class="help">点击下方按钮并输入“注销”后，将清除当前浏览器保存的记录与设置。</p><button class="btn danger full" data-action="deleteDemoAccount">注销账号并清除本地记录</button>`)}</div>`}
function records(){return `<div class="page page--detail">${header('我的记录')}${card(`${row('▧','病程记录',allJourneyRecords().length+' 条','journeyHistory')}${row('💊','服药记录',state.meds.length+' 条','med')}${row('✎','猝倒记录',state.events.length+' 条','eventList')}${row('☾','睡眠日志',state.sleep.length+' 条','sleepList')}${row('▥','ESS 测评历史',state.ess.length+' 条','essHistory')}`)}</div>`}
function notice(){return `<div class="page page--detail">${header('消息通知')}${card(`<div class="empty"><span class="icon">♧</span>暂无通知<br></div>`)}</div>`}
async function handleForm(e){e.preventDefault();const type=e.target.dataset.form,fd=new FormData(e.target),v=Object.fromEntries(fd);if(type==='patientArchive'){savePatientArchive(archiveFormValue(e.target))}
else if(type==='homeNap'){startNapSession(Number(v.minutes))}
else if(type==='event'){const time=new Date(v.time);if(Number.isNaN(+time))return toast('请选择有效的发生时间');state.events.push({id:uid(),time:time.toISOString(),day:time.toLocaleDateString('sv-SE'),duration:v.duration,trigger:v.trigger,note:v.note});specialPreviewState=null;store();toast('事件记录已保存');if(sheet==='event'){sheet=null;render()}else go('eventList')}
else if(type==='scalePhoto'){const file=v.photo;if(!(file instanceof File)||!file.size)return toast('请先选择量表照片');if(file.size>12*1024*1024)return toast('照片请小于 12 MB');const score=v.score===''?null:Number(v.score);if(score!==null&&(!Number.isInteger(score)||score<0||score>999))return toast('请输入有效的整数得分');try{const image=await resizePhoto(file);const entry={id:uid(),scale:activeScale,image,score,day:today(),time:dt()};state.scalePhotos.push(entry);try{store()}catch(error){state.scalePhotos.pop();throw error}toast('量表照片已保存');sheet=null;render()}catch{toast('照片保存失败，请换一张较小的图片重试')}}
else if(type==='sleep'){const bed=new Date(v.bed),wake=new Date(v.wake);if(Number.isNaN(+bed)||Number.isNaN(+wake)||wake<=bed)return toast('起床时间需晚于就寝时间');state.sleep.push({id:uid(),bed:bed.toISOString(),wake:wake.toISOString(),day:wake.toLocaleDateString('sv-SE'),quality:v.quality,note:v.note});store();toast('睡眠日志已保存');go('sleepList')}
else if(type==='appointment'){state.appointments.push({id:uid(),name:v.name,date:v.date,note:v.note,time:dt()});store();toast('预约意向已保存在本地');render()}
else if(type==='settings'){state.settings={...state.settings,medTime:v.medTime,napMinutes:Number(v.napMinutes)};store();toast('设置已保存');back()}
else if(type==='medReminder'){state.settings={...state.settings,medTime:v.medTime,notificationEnabled:fd.has('notificationEnabled')};store();toast('用药提醒已保存');back()}
else if(type==='chat'){const q=String(v.question||'').trim();if(!q)return;stopVoice();const a=/不良反应|副作用|猝倒/.test(q)?'我无法判断具体症状。你可以先保存发生时间和表现，再联系医生或药师。':'已收到你的问题。具体用药建议请咨询医生或药师。';state.chat.push({topic:route.topic||'faq',q,a});store();composeDraft='';render();app.scrollTop=app.scrollHeight}}
function action(name){switch(name){case'back':back();break;
case'readTerms':loginInProgress=false;showLoginProtocol('terms');break;
case'readPrivacy':loginInProgress=false;showLoginProtocol('privacy');break;
case'requestWechatLogin':advanceLogin();break;
case'confirmTerms':confirmLoginProtocol('terms');break;
case'confirmPrivacy':confirmLoginProtocol('privacy');break;
case'declineLoginProtocol':loginInProgress=false;closeSheet();break;
case'denyWechatPhone':loginInProgress=false;closeSheet();toast('已取消手机号授权');break;
case'authorizeWechatPhone':authorizeWechatPhone();break;
case'beginPatientArchive':beginPatientArchive();break;
case'deferArchive':deferArchiveGuide();break;
case'closeSheet':closeSheet();break;
case'cycleHomePreview':{const order=['unclaimed','reviewing','claimed-unrecorded','claimed-recorded'];homePreviewState=order[(order.indexOf(homeStatus())+1)%order.length];render();break}
case'openMedGuide':openSheet('med');break;
case'openNapGuide':openSheet('nap');break;
case'homeMedNow':{if(hasToday(state.meds)){sheet=null;homePreviewState=null;render();toast('今日用药已记录');break}const entry={id:uid(),time:dt(),day:today(),note:'按医嘱服药'};state.meds.push(entry);try{store()}catch{state.meds.pop();return toast('用药记录保存失败，请重试')}sheet=null;homePreviewState=null;render();toast('今日用药已记录');break}
case'cycleSpecialPreview':{const order=['down','up','none'];specialPreviewState=order[(order.indexOf(monthMood())+1)%order.length];render();break}
case'insuranceApply':state.insuranceStatus='reviewing';homePreviewState=null;store();render();toast('已切换为审核中');break;
case'insuranceApprove':state.insuranceStatus='claimed';homePreviewState=null;store();render();toast('已切换为已领取');break;
case'insuranceReset':state.insuranceStatus='unclaimed';homePreviewState=null;store();render();toast('已切换为未领取');break;
case'demoLogout':if(confirm('确定退出登录吗？本地记录会保留。')){state.authStatus='signed-out';store();clearInterval(napTimer);napTimer=null;go('login')}break;
case'demoLogin':go('login');break;
case'restartDemo':localStorage.removeItem('mianbao-prototype-v1');location.reload();break;
case'deleteDemoAccount':{const input=prompt('此操作会清除当前浏览器的记录。请输入“注销”确认：');if(input!=='注销')return;localStorage.setItem('mianbao-prototype-v1',JSON.stringify({authStatus:'closed'}));location.reload();break}
case'openEventSheet':openSheet('event');break;
case'openEventListSheet':openSheet('eventList');break;
case'weekPrev':weekOffset--;render();break;
case'weekNext':weekOffset++;render();break;
case'scalePrev':case'scaleNext':activeScale=activeScale==='ESS'?'SRSS':'ESS';render();break;
case'openPhotoSheet':openSheet('photo');break;
case'openPharmacySheet':openSheet('location');break;
case'locate':locatePharmacies();break;
case'medNow':{state.meds.push({id:uid(),time:dt(),day:today(),note:'按医嘱服药'});store();toast('今日用药已记录');render();break}
case'napStart':if(state.napSession?.status==='paused')resumeNapSession();else if(state.napSession?.status!=='running')startNapSession(Number(state.settings.napMinutes));break;
case'napPause':pauseNapSession();break;
case'napFinish':finishNapSession();break;
case'napCancel':{const previous=state.napSession;state.napSession=null;try{store()}catch{state.napSession=previous;return toast('取消失败，请重试')}clearInterval(napTimer);napTimer=null;napStarted=false;napRemaining=0;sheet=null;render();toast('本次小憩已取消');break;}
case'essStart':essStep=0;essAnswers=Array(8).fill(null);go('essQuiz');break;
case'essPrev':if(essStep>0)essStep--;render();break;
case'essNext':if(essAnswers[essStep]===null)return;if(essStep<7){essStep++;render()}else{const score=essAnswers.reduce((a,b)=>a+b,0);state.ess.push({id:uid(),day:today(),time:dt(),score,answers:[...essAnswers]});store();go('essResult',{score})}break;
case'essAgain':essStep=0;essAnswers=Array(8).fill(null);go('essQuiz');break;
case'gameStart':startGame();break;
case'flipTip':route.tipIndex=((route.tipIndex||0)+1)%3;render();break;
case'calculate':{const cost=Number($('#cost').value),ratio=Number($('#ratio').value);if(!Number.isFinite(cost)||!Number.isFinite(ratio)||cost<0||ratio<0||ratio>100||$('#cost').value===''||$('#ratio').value==='')return toast('请输入有效的费用和比例');$('#calcResult').textContent=`预估金额：${(cost*ratio/100).toFixed(2)} 元。实际待遇以保险机构审核为准。`;break}
case'clearData':if(confirm('确定清除当前浏览器中的全部业务记录吗？页面说明和修改意见会保留在项目文件中。')){descriptionDirty=false;localStorage.removeItem('mianbao-prototype-v1');location.reload()}break;
default:toast('该服务尚未接入，本页仅展示交互流程')}}
function startGame(){if(gameState?.timer)clearInterval(gameState.timer);gameState={score:0,left:30,tiles:Array.from({length:20},()=>Math.random()<.35)};gameState.timer=setInterval(()=>{gameState.left--;const el=$('#gameTime');if(el)el.textContent=gameState.left+' 秒';if(gameState.left<=0){clearInterval(gameState.timer);state.game.push({id:uid(),score:gameState.score,time:dt()});store();gameState=null;toast('挑战结束，成绩已保存');render()}},1000);render()}
document.addEventListener('click',e=>{if(e.target.closest('[data-sheet-close]')){closeSheet();return}const t=e.target.closest('button');if(!t)return;if(t.dataset.scalePhoto){activeScale=t.dataset.scalePhoto;openSheet('photo');return}if(t.dataset.tab){tab(t.dataset.tab);return}if(t.dataset.go){const [name,topic]=t.dataset.go.split(':');if(tabs.some(x=>x[0]===name))tab(name);else go(name,topic?{topic}:{});return}if(t.dataset.mood){if(state.moods[today()])return toast('今日状态已记录，不可修改');state.moods[today()]=t.dataset.mood;store();toast('今日状态已记录');render();return}if(t.dataset.action){action(t.dataset.action);return}if(t.dataset.essChoice!==undefined){essAnswers[essStep]=Number(t.dataset.essChoice);render();return}if(t.dataset.gameTile!==undefined&&gameState){const i=Number(t.dataset.gameTile),hit=gameState.tiles[i];gameState.score+=hit?1:-1;gameState.tiles[i]=Math.random()<.35;const score=$('#gameScore');if(score)score.textContent=gameState.score;t.textContent=gameState.tiles[i]?'✦':'○';t.classList.add(hit?'hit':'miss');setTimeout(()=>t.classList.remove('hit','miss'),300);return}if(t.dataset.deletePhoto){if(!confirm('确定删除这张本地量表照片吗？'))return;state.scalePhotos=state.scalePhotos.filter(x=>x.id!==t.dataset.deletePhoto);store();toast('照片记录已删除');render();return}if(t.dataset.delete){const [key,id]=t.dataset.delete.split(':');if(!confirm('确定删除这条本地记录吗？'))return;state[key]=state[key].filter(x=>x.id!==id);store();toast('记录已删除');render();return}});
document.addEventListener('click',e=>{
  const action=e.target.closest('[data-requirement-action]')?.dataset.requirementAction;
  if(action==='edit')startDescriptionEdit();
  if(action==='edit-module')startDescriptionEdit(Number(e.target.closest('[data-module-index]').dataset.moduleIndex));
  if(action==='cancel'){editingDescriptionKey=null;descriptionDraft=null;descriptionDirty=false;renderRequirements()}
  if(action==='reset')resetDescription();
  if(action==='add-module'&&!descriptionSaving&&descriptionDraft?.modules.length<20){descriptionDraft.modules.push({title:'新模块',description:'',fields:'',logic:''});editingModuleIndex=descriptionDraft.modules.length-1;descriptionDirty=true;renderRequirements()}
  if(action==='remove-module'&&!descriptionSaving&&descriptionDraft?.modules.length>1){descriptionDraft.modules.splice(Number(e.target.closest('[data-module-index]').dataset.moduleIndex),1);editingModuleIndex=Math.min(editingModuleIndex,descriptionDraft.modules.length-1);descriptionDirty=true;renderRequirements()}
  if(e.target.closest('[data-feedback-action="save"]'))saveFeedback();
  if(e.target.closest('#feedback-toggle')){
    const open=document.body.classList.toggle('feedback-open');
    $('#feedback-toggle').setAttribute('aria-expanded',String(open));
  }
  if(e.target.closest('[data-feedback-action="close"]')){
    document.body.classList.remove('feedback-open');
    $('#feedback-toggle').setAttribute('aria-expanded','false');
  }
});
document.addEventListener('change',e=>{
  if(e.target.id==='notificationToggle'){
    state.settings.notificationEnabled=e.target.checked;
    store();toast(e.target.checked?'已保存通知偏好':'已关闭通知偏好');
  }
  if(e.target.id==='scalePhotoFile'){
    if(photoPreviewUrl)URL.revokeObjectURL(photoPreviewUrl);
    const file=e.target.files?.[0];
    photoPreviewUrl=file?URL.createObjectURL(file):'';
    const preview=$('#scalePhotoPreview');
    if(preview)preview.innerHTML=file?`<img src="${photoPreviewUrl}" alt="待保存的量表照片预览">`:'';
  }
});
// Scale cards use native horizontal scrolling and scroll-snap; switching never rerenders the page.
document.addEventListener('input',e=>{
  if(e.target.id==='page-feedback-input'){
    feedbackDraft=e.target.value;
    feedbackDirty=feedbackDraft.trim()!==(pageFeedback[descriptionKey(route)]?.text||'');
    const count=$('#feedback-count');if(count)count.textContent=feedbackDraft.length;
    return;
  }
  if(!e.target.closest('[data-requirement-form]'))return;
  if(e.target.dataset.moduleField){
    descriptionDraft.modules[Number(e.target.dataset.moduleIndex)][e.target.dataset.moduleField]=e.target.value;
    if(e.target.dataset.moduleField==='title')e.target.closest('[data-module-edit]')?.querySelector('summary strong')?.replaceChildren(document.createTextNode(e.target.value||'未命名模块'));
  }
  else descriptionDraft[e.target.name]=e.target.value;
  descriptionDirty=true;
});
document.addEventListener('submit',e=>{if(e.target.matches('[data-requirement-form]'))saveDescription(e)});
window.addEventListener('beforeunload',e=>{clearInterval(napTimer);if(gameState?.timer)clearInterval(gameState.timer);if(descriptionDirty||feedbackDirty){e.preventDefault();e.returnValue=''}});
function taskMascot(kind){return `<picture class="task-guide-mascot"><source media="(prefers-reduced-motion: reduce)" srcset="assets/mianbao-lamb.webp"><img src="assets/mianbao-${kind}-guide.gif" alt="眠宝陪您${kind==='med'?'记录用药':'安排小憩'}"></picture>`}
function napSeconds(){const session=state.napSession;if(!session)return 0;return session.status==='running'?Math.max(0,Math.ceil((session.endsAt-Date.now())/1000)):Math.max(0,session.remainingSeconds||0)}
function napTaskCopy(){const session=state.napSession;if(!session)return `今日已记录 ${state.naps.filter(x=>x.day===today()).length} 次 · 添加小憩计划`;return session.status==='finished'?'本次小憩已完成 · 可开始新的小憩':`${session.status==='paused'?'已暂停':'小憩中'} · 剩余 ${formatClock(napSeconds())}`}
function updateNapClock(){napRemaining=napSeconds();napStarted=!!state.napSession&&state.napSession.status!=='finished';const clock=$('#napClock');if(clock)clock.textContent=formatClock(napRemaining);const task=$('#homeNapSummary');if(task)task.textContent=napTaskCopy();}
function finishNapSession(){const session=state.napSession;if(!session||session.status==='finished')return;const remaining=napSeconds(),elapsed=Math.max(0,session.totalSeconds-remaining);if(elapsed<1)return toast('请先完成至少 1 秒小憩');const record={id:session.id,day:session.day,time:dt(),minutes:Math.max(1,Math.ceil(elapsed/60))};const prev={...session};if(!state.naps.some(x=>x.id===session.id))state.naps.push(record);session.status='finished';session.remainingSeconds=0;session.endsAt=null;try{store()}catch{Object.assign(session,prev);state.naps=state.naps.filter(x=>x!==record);return toast('记录保存失败，请重试')}clearInterval(napTimer);napTimer=null;napStarted=false;napRemaining=0;if(sheet==='nap')sheet=null;render();toast('小憩记录已保存');}
function runNapTicker(){clearInterval(napTimer);napTimer=null;updateNapClock();if(state.napSession?.status!=='running')return;if(napSeconds()===0){finishNapSession();return}napTimer=setInterval(()=>{updateNapClock();if(state.napSession?.status==='running'&&napRemaining===0)finishNapSession()},1000)}
function startNapSession(minutes){if(!Number.isInteger(minutes)||minutes<1||minutes>120)return toast('请输入 1—120 分钟的整数时长');if(state.napSession?.status==='running')return toast('已有小憩正在计时');const previous=state.napSession;state.napSession={id:uid(),day:today(),startedAt:dt(),totalSeconds:minutes*60,remainingSeconds:minutes*60,endsAt:Date.now()+minutes*60000,status:'running'};try{store()}catch{state.napSession=previous;return toast('小憩计划保存失败，请重试')}sheet=null;render();runNapTicker();toast('小憩已开始');}
function pauseNapSession(){const session=state.napSession;if(session?.status!=='running')return;const before={...session};session.remainingSeconds=napSeconds();session.status='paused';session.endsAt=null;try{store()}catch{Object.assign(session,before);return toast('暂停保存失败，请重试')}clearInterval(napTimer);napTimer=null;updateNapClock();render();toast('小憩已暂停');}
function resumeNapSession(){const session=state.napSession;if(session?.status!=='paused')return;const before={...session};session.endsAt=Date.now()+session.remainingSeconds*1000;session.status='running';try{store()}catch{Object.assign(session,before);return toast('继续计时失败，请重试')}sheet=null;render();runNapTicker();}
window.addEventListener('focus',()=>{if(state.authStatus==='active'&&state.napSession?.status==='running')runNapTicker()});

const protocolVersion='preview-20261013';
let loginInProgress=false, archiveFormDraft=null;
const protocolConfirmed=key=>state.protocolConsents?.[key]?.version===protocolVersion&&!!state.protocolConsents[key].confirmedAt;
function hasPatientArchive(){return !!(state.patientArchive?.diagnosisDate&&state.patientArchive?.currentDrugs)}
function login(){return `<div class="page page--login"><div class="login-welcome"><div class="login-brand">眠宝<span>NT1阵发性睡眠服务平台</span></div><img class="login-mascot" src="assets/mianbao-lamb.webp" alt="向您挥手的眠宝"><h1>眠宝陪您，安睡每一天</h1></div><div class="login-actions"><button class="wechat-login" data-action="requestWechatLogin">立即登录</button><div class="login-protocols"><button data-action="readTerms" aria-label="查看用户协议">《用户协议》</button><button data-action="readPrivacy" aria-label="查看隐私政策">《隐私政策》</button></div></div></div>`}
const archiveDrugOptions=[{code:'pitolisant',label:'盐酸替洛利生'},{code:'modafinil',label:'莫达非尼'},{code:'methylphenidate',label:'哌甲酯'},{code:'other',label:'其他药物'},{code:'none',label:'暂无用药'}];
function archiveDrugSelection(value){if(Array.isArray(value.selectedDrugCodes))return {selectedDrugCodes:[...new Set(value.selectedDrugCodes.filter(code=>archiveDrugOptions.some(x=>x.code===code)))],otherDrugs:String(value.otherDrugs||'')};const raw=String(value.currentDrugs||'').trim();if(!raw)return {selectedDrugCodes:[],otherDrugs:''};if(raw==='暂无用药')return {selectedDrugCodes:['none'],otherDrugs:''};const parts=raw.split(/[、,，;；\n]+/).map(x=>x.trim()).filter(Boolean),selected=[],others=[];for(const part of parts){const option=archiveDrugOptions.find(x=>!['other','none'].includes(x.code)&&x.label===part);if(option)selected.push(option.code);else others.push(part)}if(others.length)selected.push('other');return {selectedDrugCodes:[...new Set(selected)],otherDrugs:others.length?(selected.length===1?raw:others.join('、')):''}}
function archiveFormValue(form){return {diagnosisDate:form.elements.diagnosisDate.value,selectedDrugCodes:[...form.querySelectorAll('[data-archive-drug]:checked')].map(input=>input.value),otherDrugs:form.elements.otherDrugs.value}}
function updateArchiveDrugSelection(input){const form=input.closest('form'),choices=[...form.querySelectorAll('[data-archive-drug]')];if(input.checked){if(input.value==='none')choices.forEach(item=>{if(item!==input)item.checked=false});else choices.find(item=>item.value==='none').checked=false}const other=choices.some(item=>item.value==='other'&&item.checked);form.querySelector('#archiveOtherDrugsField').hidden=!other;form.elements.otherDrugs.required=other;archiveFormDraft=archiveFormValue(form)}
function patientArchive(){const value=archiveFormDraft||state.patientArchive||{},selection=archiveDrugSelection(value),other=selection.selectedDrugCodes.includes('other');return `<div class="page page--detail page--archive">${header(hasPatientArchive()?'健康档案':'建立健康档案')}<div class="archive-intro"><img src="assets/mianbao-lamb.webp" alt="陪您建档的眠宝"><div><strong>眠宝帮您收好健康信息</strong><p>填写确诊时间与当前用药，方便日后回顾。</p></div></div><form data-form="patientArchive">${card(`<div class="form-field"><label for="archiveDiagnosisDate">NT1阵发性睡病确诊时间</label><input id="archiveDiagnosisDate" name="diagnosisDate" type="date" max="${today()}" value="${esc(value.diagnosisDate||'')}" required></div><fieldset class="archive-drug-field"><legend>当前使用药物 <span>可多选</span></legend><div class="archive-drug-options">${archiveDrugOptions.map(item=>`<label class="archive-drug-card ${item.code==='none'?'archive-drug-card--none':''}"><input data-archive-drug type="checkbox" name="selectedDrugCodes" value="${item.code}" ${selection.selectedDrugCodes.includes(item.code)?'checked':''}><span>${esc(item.label)}</span><i aria-hidden="true">✓</i></label>`).join('')}</div></fieldset><div id="archiveOtherDrugsField" class="form-field" ${other?'':'hidden'}><label for="archiveOtherDrugs">其他药物名称</label><textarea id="archiveOtherDrugs" name="otherDrugs" rows="2" maxlength="500" placeholder="填写当前使用的其他药物名称" ${other?'required':''}>${esc(selection.otherDrugs)}</textarea></div>`)}<button type="submit" class="btn full">${hasPatientArchive()?'保存档案':'保存并完成建档'}</button></form></div>`}

function showLoginProtocol(key){if(route.name!=='login')return;sheet=key==='terms'?'loginTerms':'loginPrivacy';renderSheet()}
function advanceLogin(){if(route.name!=='login')return;loginInProgress=true;sheet='wechatPhone';renderSheet()}
function confirmLoginProtocol(key){if(route.name!=='login')return;const previous=state.protocolConsents;state.protocolConsents={...previous,[key]:{version:protocolVersion,confirmedAt:dt()}};try{store()}catch{state.protocolConsents=previous;return toast('协议确认保存失败，请重试')}if(loginInProgress){advanceLogin();return}sheet=null;render()}
function authorizeWechatPhone(){if(route.name!=='login'||sheet!=='wechatPhone')return;if(!allowDescriptionLeave({name:'home'}))return;const previous={authStatus:state.authStatus,loginSession:state.loginSession,onboardingPending:state.onboardingPending};state.authStatus='active';state.loginSession={phoneAuthorized:true,authorizedAt:dt()};state.onboardingPending=!hasPatientArchive();try{store()}catch{Object.assign(state,previous);return toast('登录未完成，请重试')}loginInProgress=false;stack=[];route={name:'home'};sheet=state.onboardingPending?'archiveGuide':null;render();app.scrollTop=0;toast('登录成功');runNapTicker()}
function deferArchiveGuide(){const previous=state.onboardingPending;state.onboardingPending=false;try{store()}catch{state.onboardingPending=previous;return toast('操作未保存，请重试')}sheet=null;renderSheet()}
function beginPatientArchive(){if(!allowDescriptionLeave({name:'patientArchive'}))return;const previous=state.onboardingPending;state.onboardingPending=false;try{store()}catch{state.onboardingPending=previous;return toast('暂时无法建档，请重试')}archiveFormDraft=null;go('patientArchive')}
function savePatientArchive(value){const date=String(value.diagnosisDate||''),selection=archiveDrugSelection(value),codes=selection.selectedDrugCodes,other=selection.otherDrugs.trim();const parsed=new Date(date+'T00:00:00');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(+parsed)||parsed.toLocaleDateString('sv-SE')!==date||date>today())return toast('请选择不晚于今天的有效确诊时间');if(!codes.length)return toast('请选择当前使用药物，未用药请选择“暂无用药”');if(codes.includes('none')&&codes.length>1)return toast('“暂无用药”不能与其他药物同时选择');if(codes.includes('other')&&!other){$('#archiveOtherDrugs').focus();return toast('请填写其他药物名称')}const drugs=codes.includes('none')?'暂无用药':archiveDrugOptions.filter(item=>codes.includes(item.code)&&item.code!=='none').map(item=>item.code==='other'?other:item.label).join('、');if(drugs.length>500)return toast('当前用药信息最多500字，请适当精简');if(!allowDescriptionLeave({name:'home'}))return;const previous=state.patientArchive,oldPending=state.onboardingPending;state.patientArchive={diagnosisDate:date,currentDrugs:drugs,selectedDrugCodes:codes,otherDrugs:codes.includes('other')?other:'',createdAt:previous?.createdAt||dt(),updatedAt:dt()};state.onboardingPending=false;try{store()}catch{state.patientArchive=previous;state.onboardingPending=oldPending;return toast('档案保存失败，内容已保留，请重试')}archiveFormDraft=null;sheet=null;stack=[];route={name:'home'};render();app.scrollTop=0;toast('健康档案已建立')}
document.addEventListener('input',e=>{const form=e.target.closest('[data-form="patientArchive"]');if(form&&!e.target.matches('[data-archive-drug]'))archiveFormDraft=archiveFormValue(form)});
document.addEventListener('change',e=>{if(e.target.matches('[data-archive-drug]'))updateArchiveDrugSelection(e.target)});


render();
if(state.authStatus==='active')runNapTicker();
migrateLegacyDescriptions();
