/** Shared Sports Competition utilities. Used by every competition page. */
(function(){
  'use strict';
  const DEFAULT_URL='https://script.google.com/macros/s/AKfycbywZcSjZJpOWRg1fB62_a_VNsiy5Rlr-TIukphiwY41cSYYtBj4iaVqJdOMq21L1hIf/exec';
  const COLORS={red:{th:'สีแดง',en:'RED',hex:'#E53935'},yellow:{th:'สีเหลือง',en:'YELLOW',hex:'#F9A825'},blue:{th:'สีฟ้า',en:'BLUE',hex:'#1E88E5'},pink:{th:'สีชมพู',en:'PINK',hex:'#D81B60'}};
  const url=()=>localStorage.getItem('bhp_script_url')||DEFAULT_URL;
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  async function api(action,params={},method='GET'){
    let response;
    if(method==='GET'){
      const query=new URLSearchParams({action,...params});
      response=await fetch(`${url()}?${query}`);
    }else response=await fetch(url(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...params})});
    const data=await response.json(); if(data.error)throw new Error(data.error); return data;
  }
  function toast(message){let el=document.querySelector('.toast-sports');if(!el){el=document.createElement('div');el.className='toast-sports';document.body.appendChild(el)}el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800)}
  const team=color=>`<span class="team"><i class="dot dot-${esc(color)}"></i>${esc(COLORS[color]?.th||color||'รอผล')}</span>`;
  const sportLabel=s=>`${esc(s.name)} · ${esc(s.level)} · ${esc(s.gender)}`;
  function options(items,value='id',label='name',placeholder='— เลือก —'){return `<option value="">${placeholder}</option>`+items.map(x=>`<option value="${esc(x[value])}">${esc(typeof label==='function'?label(x):x[label])}</option>`).join('')}
  window.Sports={COLORS,url,esc,api,toast,team,sportLabel,options};
})();
