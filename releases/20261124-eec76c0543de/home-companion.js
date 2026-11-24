/* Homepage companion: archive -> medication -> daily voice record. */
let homeCompanionVisit={wasHome:false,day:'',stage:'idle',afterArchive:false,voiceStampAttempted:false};
let homeMedicationDraft=null;
const homeCompanionDay=()=>journeyBusinessDate(new Date().toISOString());
function homeGuideData(){const value=state.homeGuide&&typeof state.homeGuide==='object'?state.homeGuide:{};return {...value,medicationResponses:Array.isArray(value.medicationResponses)?value.medicationResponses:[]}}
function homeGuideWrite(patch,error='暂时未保存成功，请重试'){
 const previous=state.homeGuide;state.homeGuide={...homeGuideData(),...patch};
 try{store();return true}catch{state.homeGuide=previous;toast(error);return false}
}
function homeGuideValidDay(day){if(!/^\d{4}-\d{2}-\d{2}$/.test(day||''))return false;const date=new Date(day+'T00:00:00Z');return Number.isFinite(+date)&&date.toISOString().slice(0,10)===day}
function homeGuideMedicationDay(record){
 if(homeGuideValidDay(record?.day))return record.day;
 const value=record?.time||record?.recordedAt;return Number.isFinite(Date.parse(value))?journeyBusinessDate(value):'';
}
function homeGuideHasRecentMedication(){
 const day=homeCompanionDay(),start=journeyShiftDate(day,-13);
 return state.meds.some(record=>{const date=homeGuideMedicationDay(record);return date>=start&&date<=day&&record.usingMedication!==false&&!['notTaken','not-taken','missed','paused','未服用','漏服','暂停'].includes(record.status)});
}
function homeGuideHasVoiceToday(){
 const day=homeCompanionDay();return allJourneyRecords().some(record=>{
  const at=record.updatedAt||record.createdAt;return Boolean(String(record.originalText||record.originalTranscript||'').trim())&&Number.isFinite(Date.parse(at))&&journeyBusinessDate(at)===day;
 });
}
function homeCompanionBeforeRender(){
 if(route.name!=='home'||state.authStatus!=='active'||assistantJourneyEmbed||assistantMedicationEmbed){closeHomeVoiceOverlay();delete homeCompanionVisit.voiceSuccess;homeCompanionVisit.wasHome=false;return}
 const day=homeCompanionDay();
 if(!homeCompanionVisit.wasHome||homeCompanionVisit.day!==day){
  const afterArchive=homeCompanionVisit.afterArchive;
  homeCompanionVisit={wasHome:true,day,stage:!hasPatientArchive()?'archive':afterArchive||!homeGuideHasRecentMedication()?'medication':homeGuideData().voiceAskedDay===day||homeGuideHasVoiceToday()?'idle':'voice',afterArchive:false,voiceStampAttempted:false};
 }
 if(homeCompanionVisit.stage==='voice'&&!homeCompanionVisit.voiceStampAttempted){
  homeCompanionVisit.voiceStampAttempted=true;
  homeGuideWrite({voiceAskedDay:day},'本次询问暂未保存，您仍可以继续记录');
 }
}
function homeCompanionBenefitText(){return {unclaimed:'您的用药权益暂未领取',reviewing:'您提交的用药权益已经在审核中啦，眠宝将持续为您跟进','claimed-unrecorded':'今天的用药还未记录','claimed-recorded':'今天的用药已记录'}[homeStatus()]}
function homeCompanionBubbleMarkup(){
 if(homeCompanionVisit.voiceSuccess)return `<section class="home-companion-bubble home-companion-success" role="status"><p><strong>记录成功啦！</strong><br>眠宝已帮您保存这次病程。</p></section>`;
 const stage=homeCompanionVisit.stage;
 if(stage==='archive')return `<section class="home-companion-bubble" data-home-guide-stage="archive" aria-label="眠宝建档引导"><p>先让眠宝认识您，好吗？<br>告诉我您的确诊时间和当前用药，我会帮您收好。</p><div class="home-companion-actions"><button class="home-companion-primary" data-action="beginPatientArchive">建立档案</button><button class="home-companion-secondary" data-action="homeGuideLater">稍后再说</button></div></section>`;
 if(stage==='medication')return `<section class="home-companion-bubble" data-home-guide-stage="medication" aria-label="眠宝用药询问"><p>您最近有在使用药物吗？<br>把实际用药情况告诉眠宝，方便以后回顾。</p><div class="home-companion-actions"><button class="home-companion-primary" data-action="homeGuideMedication">记录用药</button><button class="home-companion-secondary" data-action="homeGuideLater">稍后再说</button></div></section>`;
 if(stage==='voice')return `<section class="home-companion-bubble" data-home-guide-stage="voice" aria-label="眠宝语音病程询问"><p>今天身体感觉怎么样？<br>愿意用语音告诉眠宝吗？我会帮您整理成病程记录。</p><div class="home-companion-actions"><button class="home-companion-primary" data-action="homeGuideVoice">语音记录</button><button class="home-companion-secondary" data-action="homeGuideLater">稍后再说</button></div></section>`;
 return '';
}
function renderHomeCompanionLayer(){
 let layer=document.getElementById('home-companion-layer');
 const visible=route.name==='home'&&state.authStatus==='active'&&!assistantJourneyEmbed&&!assistantMedicationEmbed;
 if(!visible){if(layer){layer.hidden=true;layer.innerHTML=''}return}
 if(!layer){layer=document.createElement('div');layer.id='home-companion-layer';layer.className='home-companion-floating-layer';layer.setAttribute('aria-label','眠宝悬浮记录助手');document.querySelector('.device').append(layer)}
 const content=`<div class="home-companion-floating-prompt" aria-live="polite">${homeCompanionBubbleMarkup()}</div><button class="home-floating-mascot" type="button" data-action="homeCompanionTap" aria-label="${hasPatientArchive()?'点击悬浮眠宝记录语音病程':'点击悬浮眠宝建立档案'}"><img src="assets/mianbao-guide-floating.png" alt="拿着记录本的眠宝"><span>点我记录</span></button>`;
 if(layer.innerHTML!==content)layer.innerHTML=content;
 layer.hidden=false;
}
function refreshHomeCompanion(){
 if(route.name!=='home')return;
 const copy=document.querySelector('.page--home .home-benefit-copy strong');if(copy)copy.textContent=homeCompanionBenefitText();
 renderHomeCompanionLayer();
}
function advanceHomeCompanionToVoice(){
 const day=homeCompanionDay();homeCompanionVisit.stage=homeGuideData().voiceAskedDay===day||homeGuideHasVoiceToday()?'idle':'voice';
 homeCompanionVisit.voiceStampAttempted=false;homeCompanionBeforeRender();refreshHomeCompanion();
}
function homeMedicationInitialDraft(){return {id:uid(),using:'',at:homeMedicationLocalNow(),drugName:state.patientArchive?.currentDrugs==='暂无用药'?'':String(state.patientArchive?.currentDrugs||'').slice(0,200),note:''}}
function homeMedicationLocalNow(){const value=new Date();return new Date(value.getTime()-value.getTimezoneOffset()*60000).toISOString().slice(0,16)}
function homeMedicationFormMarkup(){
 const d=homeMedicationDraft||homeMedicationInitialDraft();homeMedicationDraft=d;
 return `<div class="home-medication-intro"><img src="assets/mianbao-doctor.webp" alt="眠宝帮您记录用药"><p>按照实际情况填写，<br>眠宝帮您留下这次的用药信息。</p></div><form data-form="homeMedication"><fieldset class="home-medication-choice"><legend>您最近有在使用药物吗？</legend><label><input type="radio" name="using" value="yes" ${d.using==='yes'?'checked':''} required> 有在用药</label><label><input type="radio" name="using" value="no" ${d.using==='no'?'checked':''} required> 目前未用药</label></fieldset><div id="homeMedicationDetails" ${d.using!=='yes'?'hidden':''}><div class="form-field"><label for="homeMedicationDrug">实际使用药物</label><input id="homeMedicationDrug" name="drugName" maxlength="200" value="${esc(d.drugName)}" placeholder="填写实际使用的药品名称" ${d.using==='yes'?'required':'disabled'}></div><div class="form-field"><label for="homeMedicationAt">用药时间</label><input id="homeMedicationAt" type="datetime-local" name="at" value="${esc(d.at)}" max="${homeMedicationLocalNow()}" ${d.using==='yes'?'required':'disabled'}></div><div class="form-field"><label for="homeMedicationNote">用药情况（选填）</label><textarea id="homeMedicationNote" name="note" maxlength="500" rows="2" placeholder="如需补充，可按实际情况记录" ${d.using==='yes'?'':'disabled'}>${esc(d.note)}</textarea></div></div><p id="homeMedicationError" class="home-medication-error" role="alert"></p><button class="btn full" type="submit">保存用药情况</button><button class="btn ghost full" type="button" data-go="med" style="margin-top:9px">查看用药记录</button></form>`;
}
function saveHomeMedication(form){
 if(sheet!=='homeMedication'||!homeMedicationDraft)return;
 const fields=new FormData(form),using=fields.get('using');const error=message=>{$('#homeMedicationError').textContent=message};
 if(!['yes','no'].includes(using))return error('请选择目前是否在用药');
 const drugName=String(fields.get('drugName')||'').trim(),note=String(fields.get('note')||'').trim(),at=String(fields.get('at')||'');
 let time;if(using==='yes'){
  if(!drugName||drugName.length>200)return error('请填写实际使用的药品名称，最多200字');
  time=new Date(at);if(!at||!Number.isFinite(+time)||+time>Date.now())return error('请选择有效且不晚于当前时间的用药时间');
  if(note.length>500)return error('用药情况最多500字');
 }
 const previousMeds=state.meds,previousGuide=state.homeGuide,d=homeMedicationDraft;
 const entry=using==='yes'?{id:d.id,time:time.toISOString(),day:journeyBusinessDate(time),status:'taken',usingMedication:true,drugName,note:note||'已用药',source:'home-companion',recordedAt:dt()}:null;
 if(entry)state.meds=[...previousMeds.filter(item=>item.id!==entry.id),entry];
 const response={id:'response-'+d.id,usingMedication:using==='yes',time:dt(),day:homeCompanionDay(),medicationId:entry?.id||null};
 state.homeGuide={...homeGuideData(),medicationResponses:[...homeGuideData().medicationResponses.filter(item=>item.id!==response.id),response]};
 try{store()}catch{state.meds=previousMeds;state.homeGuide=previousGuide;return error('保存失败，内容仍保留，请重试')}
 homeMedicationDraft=null;sheet=null;homePreviewState=null;renderSheet();advanceHomeCompanionToVoice();
 toast(entry?'用药记录已保存':'已记录目前未用药');
}
function openHomeGuidedVoice(){openHomeVoiceOverlay()}
function handleHomeCompanionAction(name){
 if(!['homeCompanionTap','homeGuideMedication','homeGuideVoice','homeGuideLater'].includes(name))return false;
 if(route.name!=='home'||state.authStatus!=='active')return true;
 if(name==='homeGuideMedication'){homeMedicationDraft=homeMedicationInitialDraft();openSheet('homeMedication');return true}
 if(name==='homeGuideVoice'){openHomeGuidedVoice();return true}
 if(name==='homeCompanionTap'){
  if(!hasPatientArchive()){homeCompanionVisit.stage='archive';refreshHomeCompanion()}else openHomeGuidedVoice();return true;
 }
 if(homeCompanionVisit.stage==='archive'&&!homeGuideWrite({},'操作未保存，请重试'))return true;
 if(homeCompanionVisit.stage==='voice'&&!homeGuideWrite({voiceAskedDay:homeCompanionDay()},'操作未保存，请重试'))return true;
 homeCompanionVisit.stage='idle';refreshHomeCompanion();return true;
}
document.addEventListener('change',event=>{
 if(event.target.name!=='using'||!event.target.closest('[data-form="homeMedication"]'))return;
 homeMedicationDraft.using=event.target.value;const details=$('#homeMedicationDetails');details.hidden=event.target.value!=='yes';
 details.querySelectorAll('input,textarea').forEach(input=>{input.disabled=event.target.value!=='yes';input.required=event.target.value==='yes'&&input.name!=='note'});
 $('#homeMedicationError').textContent='';
});
document.addEventListener('input',event=>{
 if(!homeMedicationDraft||!event.target.closest('[data-form="homeMedication"]'))return;
 if(['drugName','at','note'].includes(event.target.name))homeMedicationDraft[event.target.name]=event.target.value;
});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden||typeof route==='undefined'||route.name!=='home'||state.authStatus!=='active')return;
 homeCompanionVisit.wasHome=false;homeCompanionBeforeRender();refreshHomeCompanion();
});
window.addEventListener('focus',()=>{
 if(typeof route==='undefined'||route.name!=='home'||homeCompanionVisit.day===homeCompanionDay())return;
 homeCompanionBeforeRender();refreshHomeCompanion();
});
