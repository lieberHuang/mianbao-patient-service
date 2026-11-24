/* Homepage-only voice capture mask. Uses the existing demo transcription adapter. */
let homeVoiceCapture=null,homeVoiceSuccessTimer=null;
const homeVoiceMic=`<svg viewBox="0 0 32 40" aria-hidden="true"><rect x="10" y="2" width="12" height="24" rx="6"/><path d="M4 18v2a12 12 0 0 0 24 0v-2M16 32v6M9 38h14"/></svg>`;
function homeVoiceDraft(){
 const guide=homeGuideData(),draft=guide.inlineVoiceDraft;
 if(draft?.record?.originalText)return {record:journeyClone(draft.record),durationMs:draft.durationMs||0,referenceAt:draft.referenceAt||draft.record.referenceAt||dt(),legacyKey:draft.legacyKey||''};
 const key=guide.voiceDraftKey,legacy=key&&/^home-voice-/.test(key)&&state.journeyDrafts[key]?.record;
 if(legacy?.originalText)return {record:journeyClone(legacy),durationMs:legacy.voiceSegments?.at(-1)?.durationMs||0,referenceAt:legacy.referenceAt||dt(),legacyKey:key};
 return null;
}
function openHomeVoiceOverlay(){
 if(route.name!=='home'||state.authStatus!=='active')return;
 if(!hasPatientArchive()){homeCompanionVisit.stage='archive';refreshHomeCompanion();return}
 if(homeVoiceCapture)return;
 if(!homeGuideWrite({voiceAskedDay:homeCompanionDay()},'暂时无法开始记录，请重试'))return;
 clearTimeout(homeVoiceSuccessTimer);delete homeCompanionVisit.voiceSuccess;
 const draft=homeVoiceDraft(),node=document.createElement('section');node.id='home-voice-mask';node.className='home-voice-mask';node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');node.setAttribute('aria-label','眠宝语音病程记录');
 node.innerHTML=`<button type="button" class="home-voice-close" data-home-voice-close aria-label="关闭语音录入">×</button><div class="home-voice-stage"><img class="home-voice-mascot" src="assets/mianbao-guide-floating.png" alt="陪您记录的眠宝"><h2 id="homeVoiceTitle">把这次的情况说给眠宝听</h2><p class="home-voice-subtitle">什么时候、有什么表现、出现几次，<br>都可以慢慢说。</p><div class="home-voice-meter"><div class="home-voice-mic">${homeVoiceMic}</div><div class="home-voice-waves" aria-hidden="true">${'<i></i>'.repeat(7)}</div><strong id="homeVoiceTime">00:00</strong></div><p id="homeVoiceMessage" class="home-voice-message" role="status"></p></div><div class="home-voice-controls"><p id="homeVoiceGesture">按住说话，上滑取消</p><button id="homeVoiceHold" class="home-voice-hold" type="button">按住说话</button><div id="homeVoiceRetry" class="home-voice-retry" hidden><button type="button" data-home-voice-retry>重试保存</button><button type="button" data-home-voice-new>重新录入</button></div></div>`;
 homeVoiceCapture={node,phase:draft?'error':'idle',record:draft?.record||null,referenceAt:draft?.referenceAt||'',durationMs:draft?.durationMs||0,legacyKey:draft?.legacyKey||'',message:draft?'上次的语音还没有保存，可以继续保存或重新录入。':'',lastFocus:document.activeElement,inertNodes:[],startedAt:0,cancel:false,controller:null,revision:0};
 const device=document.querySelector('.device');for(const child of [...device.children]){if(!child.hasAttribute('inert')){child.inert=true;homeVoiceCapture.inertNodes.push(child)}}device.append(node);
 const hold=node.querySelector('#homeVoiceHold');
 hold.addEventListener('pointerdown',event=>{if(event.button!==0||homeVoiceCapture?.phase!=='idle')return;event.preventDefault();hold.setPointerCapture(event.pointerId);beginHomeVoiceHold(event.clientY)});
 hold.addEventListener('pointermove',event=>{const session=homeVoiceCapture;if(session?.phase!=='recording')return;session.cancel=session.startY-event.clientY>=70;paintHomeVoiceOverlay()});
 hold.addEventListener('pointerup',event=>{finishHomeVoiceHold();if(hold.hasPointerCapture(event.pointerId))hold.releasePointerCapture(event.pointerId)});
 hold.addEventListener('pointercancel',()=>finishHomeVoiceHold(true));hold.addEventListener('lostpointercapture',()=>{if(homeVoiceCapture?.phase==='recording')finishHomeVoiceHold(true)});
 hold.addEventListener('keydown',event=>{if([' ','Enter'].includes(event.key)&&!event.repeat){event.preventDefault();beginHomeVoiceHold(0)}});hold.addEventListener('keyup',event=>{if([' ','Enter'].includes(event.key)){event.preventDefault();finishHomeVoiceHold()}});
 node.querySelector('[data-home-voice-close]').addEventListener('click',closeHomeVoiceOverlay);
 node.querySelector('[data-home-voice-retry]').addEventListener('click',processHomeInlineVoice);
 node.querySelector('[data-home-voice-new]').addEventListener('click',resetHomeInlineVoice);
 node.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(homeVoiceCapture?.phase==='recording')finishHomeVoiceHold(true);else closeHomeVoiceOverlay();return}
  if(event.key!=='Tab')return;const buttons=[...node.querySelectorAll('button')].filter(button=>!button.hidden&&!button.disabled&&button.getClientRects().length);const index=buttons.indexOf(document.activeElement);event.preventDefault();buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();
 });
 paintHomeVoiceOverlay();(draft?node.querySelector('[data-home-voice-retry]'):hold).focus({preventScroll:true});
}
function paintHomeVoiceOverlay(){
 const session=homeVoiceCapture;if(!session)return;const {node,phase,cancel}=session,recording=phase==='recording',processing=phase==='processing',failed=phase==='error';
 node.dataset.phase=phase;node.classList.toggle('home-voice-cancel',recording&&cancel);node.querySelector('#homeVoiceTitle').textContent=processing?'眠宝正在帮您记录':failed?'这次还没有保存成功':recording?(cancel?'松开手指，取消录入':'正在听，慢慢说'):'把这次的情况说给眠宝听';
 node.querySelector('#homeVoiceMessage').textContent=session.message||'';
 node.querySelector('#homeVoiceGesture').textContent=processing?'正在整理并保存，请稍等':failed?'内容已保留，可以重试':recording?(cancel?'松开取消':'松开完成，上滑取消'):'按住说话，上滑取消';
 const hold=node.querySelector('#homeVoiceHold');hold.hidden=failed;hold.disabled=processing;hold.textContent=processing?'正在保存…':recording?(cancel?'松开取消':'松开完成'):'按住说话';node.querySelector('#homeVoiceRetry').hidden=!failed;
}
function beginHomeVoiceHold(y){
 const session=homeVoiceCapture;if(!session||session.phase!=='idle')return;
 session.phase='recording';session.startedAt=Date.now();session.referenceAt=dt();session.startY=y;session.cancel=false;session.message='';session.record=null;session.durationMs=0;
 session.node.querySelector('#homeVoiceTime').textContent='00:00';session.timer=setInterval(()=>{if(homeVoiceCapture!==session||session.phase!=='recording')return;const seconds=Math.floor((Date.now()-session.startedAt)/1000);session.node.querySelector('#homeVoiceTime').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');if(seconds>=60)finishHomeVoiceHold()},200);paintHomeVoiceOverlay();
}
function finishHomeVoiceHold(cancel=false){
 const session=homeVoiceCapture;if(!session||session.phase!=='recording')return;
 clearInterval(session.timer);session.durationMs=Math.min(60000,Date.now()-session.startedAt);
 if(cancel||session.cancel||session.durationMs<500){session.phase='idle';session.message=cancel||session.cancel?'已取消，可以重新说。':'时间太短，请按住后再说。';session.cancel=false;paintHomeVoiceOverlay();return}
 processHomeInlineVoice();
}
function persistHomeInlineVoice(session){
 return homeGuideWrite({inlineVoiceDraft:{record:journeyClone(session.record),referenceAt:session.referenceAt,durationMs:session.durationMs,legacyKey:session.legacyKey||'',updatedAt:dt()}},'语音内容暂未保存，请重试');
}
async function processHomeInlineVoice(){
 const session=homeVoiceCapture;if(!session||session.phase==='processing')return;
 session.phase='processing';session.message='';session.controller=new AbortController();const signal=session.controller.signal,revision=++session.revision;paintHomeVoiceOverlay();
 let timedOut=false;const timeout=setTimeout(()=>{timedOut=true;session.controller?.abort()},20000);
 const active=()=>homeVoiceCapture===session&&session.revision===revision&&route.name==='home'&&state.authStatus==='active';
 try{
  if(!session.record?.originalText){
   const text=String(await journeyAwait(journeyProvider().transcribe({signal,durationMs:session.durationMs,referenceAt:session.referenceAt}),signal)||'').trim();if(!active())return;if(!text)throw new Error('没有识别到内容，请重新录入');if(text.length>2000)throw new Error('这段内容较长，请分成两次录入');
   const record=emptyJourneyRecord();Object.assign(record,{id:'home-inline-voice-'+uid(),inputMode:'voice',referenceAt:session.referenceAt,source:'home-companion-voice',originalText:text,originalTranscript:text,voiceSegments:[{id:uid(),text,referenceAt:session.referenceAt,durationMs:session.durationMs}]});session.record=record;
   if(!persistHomeInlineVoice(session))throw new Error('保存失败，语音内容仍在，请重试');
  }
  if(!session.record.extractedAt){
   const result=await journeyAwait(journeyProvider().extract({kind:'voice',text:session.record.originalText,images:journeyClone(session.record.images||[]),referenceAt:session.referenceAt,signal}),signal);if(!active())return;if(!result?.facts||typeof result.facts!=='object')throw new Error('内容还没有整理完成，请重试');
   for(const key of Object.keys(session.record.facts))if(result.facts[key]!=null)session.record.facts[key]=String(result.facts[key]);
   session.record.description=journeyDefaultDescription(session.record)||session.record.originalText;session.record.extractedAt=dt();session.record.optimizedText=journeySummaryText(session.record);session.record.userEditedFields=[];
  }
  if(!active()||signal.aborted)return;
  const record=journeyClone(session.record);record.id||='home-inline-voice-'+uid();record.source='home-companion-voice';record.inputMode||='voice';record.createdAt||=dt();record.updatedAt=dt();record.needsExtraction=false;
  const previousRecords=state.journeyRecords,previousGuide=state.homeGuide,previousDrafts=state.journeyDrafts;
  // Stable ID makes a failed save retry update the same attempt instead of creating another record.
  if(!previousRecords.some(item=>item.id===record.id))state.journeyRecords=[...previousRecords,record];
  state.homeGuide={...homeGuideData(),inlineVoiceDraft:null,voiceAskedDay:homeCompanionDay()};
  if(session.legacyKey&&/^home-voice-/.test(session.legacyKey)){state.journeyDrafts={...previousDrafts};delete state.journeyDrafts[session.legacyKey]}
  try{store()}catch{state.journeyRecords=previousRecords;state.homeGuide=previousGuide;state.journeyDrafts=previousDrafts;throw new Error('保存失败，内容仍保留，请重试')}
  clearTimeout(timeout);closeHomeVoiceOverlay();homeCompanionVisit.stage='idle';homeCompanionVisit.voiceSuccess={recordId:record.id};refreshHomeCompanion();
  homeVoiceSuccessTimer=setTimeout(()=>{delete homeCompanionVisit.voiceSuccess;refreshHomeCompanion()},3500);
 }catch(error){if(!active())return;session.phase='error';session.message=error.name==='AbortError'?(timedOut?'整理等待超时，内容已保留，请重试':'已取消本次整理'):error.message||'暂时未保存成功，请重试';paintHomeVoiceOverlay()}
 finally{clearTimeout(timeout)}
}
function resetHomeInlineVoice(){
 const session=homeVoiceCapture;if(!session||session.phase==='processing')return;
 if(!homeGuideWrite({inlineVoiceDraft:null},'暂时无法重新录入，请重试'))return;
 session.record=null;session.referenceAt='';session.legacyKey='';session.phase='idle';session.message='';session.node.querySelector('#homeVoiceTime').textContent='00:00';paintHomeVoiceOverlay();session.node.querySelector('#homeVoiceHold').focus();
}
function closeHomeVoiceOverlay(){
 const session=homeVoiceCapture;if(!session)return;
 session.revision++;session.controller?.abort();clearInterval(session.timer);homeVoiceCapture=null;
 const restoreFocus=session.node.contains(document.activeElement)||document.activeElement===document.body;session.node.remove();session.inertNodes.forEach(node=>{if(node.isConnected)node.inert=false});if(restoreFocus&&session.lastFocus?.isConnected)session.lastFocus.focus({preventScroll:true});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&homeVoiceCapture?.phase==='recording')finishHomeVoiceHold(true)});
window.addEventListener('pagehide',closeHomeVoiceOverlay);
