/* Voice case prototype. Uses a fixed example; no microphone or model requests. */
let voiceCaseUi={key:null,phase:'idle',draft:null,savedId:null,referenceAt:null,job:0,timer:null};

function voiceCaseBusinessDate(value){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value))}
function voiceCaseShiftDate(day,offset){const date=new Date(day+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+offset);return date.toISOString().slice(0,10)}
function createVoiceCaseDemo(referenceAt){
  const date=voiceCaseShiftDate(voiceCaseBusinessDate(referenceAt),-1);
  const highlights=[
    {field:'time',text:date+' 晚间'},
    {text:'，看电视时因大笑出现'},
    {field:'symptoms',text:'双腿发软、站立不稳'},
    {text:'，'},
    {field:'count',text:'约三次'},
    {text:'，每次短暂出现后恢复。'}
  ];
  return {
    source:'demo',referenceAt,timeZone:'Asia/Shanghai',
    originalText:'昨天晚上看电视的时候，我因为大笑，突然双腿发软，站不稳，大概出现了三次，每次过一小会儿就好了。',
    optimizedText:highlights.map(part=>part.text).join(''),highlights,
    time:{originalDescription:'昨天晚上',convertedDate:date},
    symptoms:{originalDescription:'突然双腿发软，站不稳',extracted:'双腿发软、站立不稳'},
    count:{originalDescription:'大概出现了三次'}
  };
}

function voiceCaseReset(){clearTimeout(voiceCaseUi.timer);voiceCaseUi={key:null,phase:'idle',draft:null,savedId:null,referenceAt:null,job:voiceCaseUi.job+1,timer:null}}
function voiceCaseBeforeRender(){
  if(route.name!=='voiceCase'){if(voiceCaseUi.key!==null)voiceCaseReset();return}
  const key=route.caseId||'new';
  if(voiceCaseUi.key===key)return;
  voiceCaseReset();voiceCaseUi.key=key;
  if(route.caseId){const record=state.voiceCases.find(item=>item.id===route.caseId);if(record){voiceCaseUi.phase='ready';voiceCaseUi.draft=record;voiceCaseUi.savedId=record.id}}
}

function voiceCaseResult(record){
  const highlighted=(record.highlights||[{text:record.optimizedText}]).map(part=>part.field?`<span class="voice-case-key" data-key="${esc(part.field)}">${esc(part.text)}</span>`:esc(part.text)).join('');
  return `<section class="card voice-case-original"><h2>原始描述</h2><p>${esc(record.originalText)}</p></section>
    <section class="card voice-case-result"><div class="voice-case-section-head"><h2>整理后的病历</h2>${voiceCaseUi.savedId?'<span class="pill">已保存</span>':''}</div><p class="voice-case-summary">${highlighted}</p></section>
    <section class="card voice-case-fields"><h2>关键信息</h2>
      <div class="voice-case-field"><h3>时间</h3><dl><dt>原始描述</dt><dd>${esc(record.time.originalDescription)}</dd><dt>具体日期</dt><dd class="voice-case-key" data-key="time">${esc(record.time.convertedDate)}</dd></dl></div>
      <div class="voice-case-field"><h3>症状</h3><dl><dt>原始描述</dt><dd>${esc(record.symptoms.originalDescription)}</dd><dt>提取内容</dt><dd class="voice-case-key" data-key="symptoms">${esc(record.symptoms.extracted)}</dd></dl></div>
      <div class="voice-case-field"><h3>次数</h3><dl><dt>原始描述</dt><dd class="voice-case-key" data-key="count">${esc(record.count.originalDescription)}</dd></dl></div>
    </section>`;
}

function voiceCaseContent(){
  if(voiceCaseUi.phase==='ready'&&voiceCaseUi.draft)return voiceCaseResult(voiceCaseUi.draft);
  if(voiceCaseUi.phase==='processing')return `<section class="voice-case-wait" role="status"><img src="assets/mianbao-doctor.webp" alt="整理记录的眠宝"><h2>眠宝正在整理</h2><p>识别文字，整理时间、症状和次数</p><span class="voice-case-loader" aria-hidden="true"></span></section>`;
  if(voiceCaseUi.phase==='listening')return `<section class="voice-case-wait" role="status"><img src="assets/mianbao-doctor.webp" alt="倾听的眠宝"><h2>我在听，慢慢说</h2><div class="voice-case-wave" aria-hidden="true">${Array.from({length:7},(_,i)=>`<i style="--wave-delay:${i*-.12}s"></i>`).join('')}</div><p>松开后，眠宝帮您整理</p></section>`;
  return `<section class="voice-case-welcome"><img src="assets/mianbao-doctor.webp" alt="眠宝陪您记录"><div><h2>说说近期的身体情况</h2><p>什么时候、有什么症状、出现几次</p></div></section><section class="card voice-case-prompt"><div class="voice-case-mic" aria-hidden="true">🎙</div><h2>从一段话开始</h2><p>按住下方按钮，讲述当时的情况。<br>松开后，查看整理的病历与关键信息。</p><blockquote>“昨天晚上，双腿突然发软，<br>大概出现了三次……”</blockquote></section>`;
}

function voiceCaseDock(){
  const processing=voiceCaseUi.phase==='processing',ready=voiceCaseUi.phase==='ready';
  return `<div class="voice-case-dock"><div class="voice-case-dock__save" ${ready?'':'hidden'}><button class="btn full" data-voice-action="save" ${voiceCaseUi.savedId?'disabled':''}>${voiceCaseUi.savedId?'病历已保存':'保存病历'}</button></div><button class="voice-case-hold" data-voice-action="hold" ${processing?'disabled':''}><span aria-hidden="true">🎙</span><strong>${processing?'正在整理…':voiceCaseUi.phase==='listening'?'松开，开始整理':ready?'按住，再记录一段':'按住说话'}</strong></button><p class="voice-case-dock__hint">${processing?'稍等，正在提取关键信息':voiceCaseUi.phase==='listening'?'正在聆听您的描述':'按住说话 · 松开后整理'}</p></div>`;
}

function voiceCase(){return `<div class="voice-case-page"><header class="detail-head voice-case-header"><button class="back" data-action="back" aria-label="返回">‹</button><h1>语音病历</h1><button class="voice-case-history-link" data-go="voiceCaseHistory">查看记录</button></header><div class="voice-case-scroll">${voiceCaseContent()}</div>${voiceCaseDock()}</div>`}
function voiceCaseHistory(){const list=state.voiceCases.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));return `<div class="page page--detail">${header('语音病历记录')}<div class="voice-case-history-list">${list.length?list.map(item=>`<button class="card voice-case-history-item" data-voice-action="view" data-case-id="${esc(item.id)}"><div><strong>${esc(item.time.convertedDate)}</strong><span class="arrow">›</span></div><p>${esc(item.symptoms.extracted)}</p><small>${esc(item.count.originalDescription)} · ${esc(nice(item.createdAt))}</small></button>`).join(''):`<div class="empty"><img class="voice-case-empty-mascot" src="assets/mianbao-doctor.webp" alt="眠宝"><p>还没有语音病历<br>请从首页进入语音病历，记录近期情况</p></div>`}</div></div>`}

function refreshVoiceCase(){
  if(route.name!=='voiceCase')return;
  const scroll=$('.voice-case-scroll');if(scroll)scroll.innerHTML=voiceCaseContent();
  const button=$('[data-voice-action="hold"]');
  if(button){button.disabled=voiceCaseUi.phase==='processing';button.classList.toggle('listening',voiceCaseUi.phase==='listening');button.querySelector('strong').textContent=voiceCaseUi.phase==='processing'?'正在整理…':voiceCaseUi.phase==='listening'?'松开，开始整理':voiceCaseUi.phase==='ready'?'按住，再记录一段':'按住说话';}
  const save=$('.voice-case-dock__save');if(save){save.hidden=voiceCaseUi.phase!=='ready';const btn=$('button',save);btn.disabled=Boolean(voiceCaseUi.savedId);btn.textContent=voiceCaseUi.savedId?'病历已保存':'保存病历'}
  const hint=$('.voice-case-dock__hint');if(hint)hint.textContent=voiceCaseUi.phase==='processing'?'稍等，正在提取关键信息':voiceCaseUi.phase==='listening'?'正在聆听您的描述':'按住说话 · 松开后整理';
  if(scroll)scroll.scrollTop=0;
}

function beginVoiceCaseHold(){
  if(route.name!=='voiceCase'||['listening','processing'].includes(voiceCaseUi.phase))return;
  voiceCaseUi.phase='listening';voiceCaseUi.referenceAt=dt();voiceCaseUi.savedId=null;voiceCaseUi.draft=null;refreshVoiceCase();
}
function finishVoiceCaseHold(){
  if(voiceCaseUi.phase!=='listening')return;
  voiceCaseUi.phase='processing';const token=++voiceCaseUi.job;const referenceAt=voiceCaseUi.referenceAt;refreshVoiceCase();
  voiceCaseUi.timer=setTimeout(()=>{if(token!==voiceCaseUi.job||route.name!=='voiceCase')return;voiceCaseUi.draft=createVoiceCaseDemo(referenceAt);voiceCaseUi.phase='ready';voiceCaseUi.timer=null;refreshVoiceCase()},1100);
}
function cancelVoiceCaseHold(){if(voiceCaseUi.phase!=='listening')return;voiceCaseUi.phase='idle';refreshVoiceCase()}
function saveVoiceCase(){
  if(voiceCaseUi.phase!=='ready'||!voiceCaseUi.draft||voiceCaseUi.savedId)return;
  const entry={...JSON.parse(JSON.stringify(voiceCaseUi.draft)),id:uid(),createdAt:dt(),updatedAt:dt()};const previous=state.voiceCases;
  state.voiceCases=[...previous,entry];
  try{store()}catch{state.voiceCases=previous;toast('保存失败，请重试');return}
  voiceCaseUi.savedId=entry.id;voiceCaseUi.draft=entry;refreshVoiceCase();toast('语音病历已保存');
}
function bindVoiceCase(){
  app.querySelectorAll('[data-voice-action="view"]').forEach(button=>button.addEventListener('click',()=>go('voiceCase',{caseId:button.dataset.caseId})));
  const button=$('[data-voice-action="hold"]');if(!button)return;
  button.addEventListener('pointerdown',e=>{if(e.button!==0||button.disabled)return;e.preventDefault();button.setPointerCapture(e.pointerId);beginVoiceCaseHold()});
  button.addEventListener('pointerup',e=>{if(button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId);finishVoiceCaseHold()});
  button.addEventListener('pointercancel',cancelVoiceCaseHold);
  button.addEventListener('click',e=>{if(e.detail===0&&!['listening','processing'].includes(voiceCaseUi.phase)){beginVoiceCaseHold();finishVoiceCaseHold()}});
  button.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)&&!e.repeat){e.preventDefault();beginVoiceCaseHold()}if(e.key==='Escape'){e.preventDefault();cancelVoiceCaseHold()}});
  button.addEventListener('keyup',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();finishVoiceCaseHold()}});
  $('[data-voice-action="save"]').addEventListener('click',saveVoiceCase);
}
