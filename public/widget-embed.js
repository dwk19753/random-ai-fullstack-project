(function(){
  const STORAGE_KEY = 'random-ai-widget-config';
  const defaultConfig = {title:'Help',placeholder:'Ask me anything...',welcome:'Hi, how can I help?'};
  function loadConfig(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||defaultConfig}catch(e){return defaultConfig}}
  function createDOM(){
    if(document.getElementById('ra-widget-root')) return;
    const link = document.createElement('link'); link.rel='stylesheet'; link.href='widget.css'; document.head.appendChild(link);

    const root = document.createElement('div'); root.id='ra-widget-root'; root.className='ra-widget-root';

    root.innerHTML = `
      <div class="ra-bubble" id="ra-bubble" aria-hidden="false">?
      </div>
      <div class="ra-panel" id="ra-panel" aria-hidden="true">
        <div class="ra-header"><span id="ra-title">${defaultConfig.title}</span><button id="ra-close">✕</button></div>
        <div class="ra-body" id="ra-body"></div>
        <form class="ra-input-row" id="ra-form"><input id="ra-input" placeholder="${defaultConfig.placeholder}" autocomplete="off"><button type="submit">Send</button></form>
      </div>
    `;
    document.body.appendChild(root);

    const bubble = document.getElementById('ra-bubble');
    const panel = document.getElementById('ra-panel');
    const close = document.getElementById('ra-close');
    const form = document.getElementById('ra-form');
    const input = document.getElementById('ra-input');
    const body = document.getElementById('ra-body');

    bubble.addEventListener('click', ()=>{openPanel();});
    close.addEventListener('click', ()=>{closePanel();});
    form.addEventListener('submit',(e)=>{e.preventDefault();const v=input.value.trim();if(!v) return;appendMessage('user',v);input.value='';sendToServer(v)});
  }

  function appendMessage(who, text){
    const body = document.getElementById('ra-body');
    if(!body) return;
    const el = document.createElement('div'); el.className='ra-msg ra-'+who; el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function fakeReply(userText){
    // Deprecated: use server-backed replies
    const cfg = loadConfig();
    setTimeout(()=>{appendMessage('bot', cfg.welcome);}, 600);
    setTimeout(()=>{appendMessage('bot','Echo: '+userText);}, 1200);
  }

  async function sendToServer(userText){
    const cfg = loadConfig();
    // show a typing indicator
    appendMessage('bot','...');
    try{
      const token = localStorage.getItem('random-ai-widget-token');
      const headers = {'Content-Type':'application/json'};
      if(token) headers['Authorization'] = 'Bearer ' + token;
      const res = await fetch('/api/chat', {method:'POST',headers,body:JSON.stringify({message:userText})});
      const data = await res.json();
      // remove the last typing indicator
      const body = document.getElementById('ra-body');
      if(body && body.lastChild && body.lastChild.textContent === '...') body.removeChild(body.lastChild);
      if(data && data.reply) appendMessage('bot', data.reply);
      else appendMessage('bot','Sorry, something went wrong.');
    }catch(e){
      const body = document.getElementById('ra-body');
      if(body && body.lastChild && body.lastChild.textContent === '...') body.removeChild(body.lastChild);
      appendMessage('bot','Network error');
      console.error(e);
    }
  }

  function openPanel(){
    const panel = document.getElementById('ra-panel'); if(!panel) return; panel.setAttribute('aria-hidden','false');
    const cfg = loadConfig(); document.getElementById('ra-title').textContent = cfg.title || defaultConfig.title;
    const body = document.getElementById('ra-body'); if(body && body.children.length===0){appendMessage('bot', cfg.welcome)}
  }
  function closePanel(){const panel=document.getElementById('ra-panel');if(panel)panel.setAttribute('aria-hidden','true');}

  function init(opts){
    const existing = window.RandomAIWidget && window.RandomAIWidget._inited;
    if(existing) return window.RandomAIWidget;
    if(opts && typeof opts === 'object'){
      const stored = loadConfig();
      const merged = Object.assign({}, stored, opts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    createDOM();
    window.RandomAIWidget = {init: init, open: openPanel, close: closePanel, _inited:true};
    return window.RandomAIWidget;
  }

  // Auto-init with saved config so demo pages just include script
  if(document.readyState === 'complete' || document.readyState === 'interactive') init(); else document.addEventListener('DOMContentLoaded', init);

  // Expose a small API to allow changing config at runtime
  window.RandomAIWidget = window.RandomAIWidget || {init:init, open:()=>{document.getElementById('ra-panel')?.setAttribute('aria-hidden','false')}};
})();