(function(){
  const form = document.getElementById('signup');
  const msg = document.getElementById('signup-msg');
  const cta = document.getElementById('get-started');

  if(cta){cta.addEventListener('click', (e)=>{e.preventDefault();document.getElementById('signup')?.scrollIntoView({behavior:'smooth'})})}

  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const f = e.target;
    const email = f.email?.value || '';
    if(!email){msg.textContent='Please enter a valid email.';return}
    msg.textContent = 'Thanks — you\'ll be notified.';
    f.reset();
    setTimeout(()=>{msg.textContent=''},4000);
  });
})();