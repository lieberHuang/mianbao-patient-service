// Host integration keeps the source patient flows independent from the other tabs.
document.getElementById('serviceClearChatButton').addEventListener('click',()=>document.getElementById('clearChatButton').click());
new MutationObserver(()=>{const button=document.querySelector('.mobile-panel-close');if(button&&button.textContent!=='关闭服务状态')button.textContent='关闭服务状态';}).observe(document.getElementById('device'),{childList:true,subtree:true});
