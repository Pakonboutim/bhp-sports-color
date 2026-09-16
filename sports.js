/** Shared Sports Competition utilities. Used by every competition page. */
(function(){
  'use strict';
  const DEFAULT_URL='https://wgmzzebuididxctksrpo.supabase.co/functions/v1/sports-api';
  const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnbXp6ZWJ1aWRpZHhjdGtzcnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MjA3NjQsImV4cCI6MjEwNTA5Njc2NH0.B-_3RcNXNXcU-3OMUdsKPAJlHcJgCf4VItEENaWxDE0';
  const COLORS={red:{th:'สีแดง',en:'RED',hex:'#E53935'},yellow:{th:'สีเหลือง',en:'YELLOW',hex:'#F9A825'},blue:{th:'สีฟ้า',en:'BLUE',hex:'#1E88E5'},pink:{th:'สีชมพู',en:'PINK',hex:'#D81B60'}};
  Object.defineProperties(COLORS,{'yellow-blue':{value:{th:'ทีมเหลือง + ฟ้า',en:'YELLOW + BLUE'},enumerable:false},'pink-red':{value:{th:'ทีมชมพู + แดง',en:'PINK + RED'},enumerable:false}});
  const url=()=>localStorage.getItem('bhp_api_url')||DEFAULT_URL;
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  async function api(action,params={},method='GET'){
    let response;
    const authHeaders={apikey:SUPABASE_ANON_KEY,Authorization:`Bearer ${SUPABASE_ANON_KEY}`};
    if(method==='GET'){
      const query=new URLSearchParams({action,...params});
      response=await fetch(`${url()}?${query}`,{headers:authHeaders});
    }else response=await fetch(url(),{method:'POST',headers:{...authHeaders,'Content-Type':'application/json;charset=utf-8'},body:JSON.stringify({action,...params})});
    const data=await response.json(); if(data.error)throw new Error(data.error); return data;
  }
  function toast(message){let el=document.querySelector('.toast-sports');if(!el){el=document.createElement('div');el.className='toast-sports';document.body.appendChild(el)}el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800)}
  const teamLabel=color=>COLORS[color]?.th||color||'รอผล';
  const team=color=>`<span class="team">${String(color||'').split('-').filter(c=>COLORS[c]).map(c=>`<i class="dot dot-${esc(c)}"></i>`).join('')}${esc(teamLabel(color))}</span>`;
  const sportLabel=s=>`${esc(s.name)} · ${esc(s.level)} · ${esc(s.gender)}`;
  function options(items,value='id',label='name',placeholder='— เลือก —'){return `<option value="">${placeholder}</option>`+items.map(x=>`<option value="${esc(x[value])}">${esc(typeof label==='function'?label(x):x[label])}</option>`).join('')}
  window.Sports={COLORS,url,esc,api,toast,team,teamLabel,sportLabel,options,SUPABASE_ANON_KEY};
})();
