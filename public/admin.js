(function(){
  const KEY = 'random-ai-widget-config';
  const form = document.getElementById('cfg-form');
  const saved = document.getElementById('saved');
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
  function render(){const cfg=load(); if(form){form.title.value = cfg.title||''; form.welcome.value = cfg.welcome||''; form.placeholder.value = cfg.placeholder||''}}
  function save(cfg){localStorage.setItem(KEY, JSON.stringify(cfg)); saved.textContent='Saved.'; setTimeout(()=>saved.textContent='',2000)}
  if(!form) return; render();
  form.addEventListener('submit', (e)=>{e.preventDefault(); const cfg={title:form.title.value||'Support', welcome:form.welcome.value||'Hi!', placeholder:form.placeholder.value||'Ask...'}; save(cfg); // also init widget with new config if present on page
    if(window.RandomAIWidget && window.RandomAIWidget.init) window.RandomAIWidget.init(cfg);
  });
  document.getElementById('open-demo').addEventListener('click', ()=>{window.open('widget-demo.html','_blank')});
})();