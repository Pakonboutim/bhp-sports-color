/** Shared Sports Competition utilities. Direct Supabase reads + Edge Function writes. */
(function(){
  'use strict';

  const PROJECT_URL='https://wgmzzebuididxctksrpo.supabase.co';
  const EDGE_URL=`${PROJECT_URL}/functions/v1/sports-api`;
  const REST_URL=`${PROJECT_URL}/rest/v1`;
  const PUBLISHABLE_KEY='sb_publishable_f0VqFU0CieXtdcQLsn8Srg_WzD_7ehA';

  const COLORS={
    red:{th:'สีแดง',en:'RED',hex:'#E53935'},
    yellow:{th:'สีเหลือง',en:'YELLOW',hex:'#F9A825'},
    blue:{th:'สีฟ้า',en:'BLUE',hex:'#1E88E5'},
    pink:{th:'สีชมพู',en:'PINK',hex:'#D81B60'}
  };

  Object.defineProperties(COLORS,{
    'yellow-blue':{value:{th:'ทีมเหลือง + ฟ้า',en:'YELLOW + BLUE'},enumerable:false},
    'pink-red':{value:{th:'ทีมชมพู + แดง',en:'PINK + RED'},enumerable:false}
  });

  const url=()=>localStorage.getItem('bhp_api_url')||EDGE_URL;
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  async function rest(table,query=''){
    const r=await fetch(`${REST_URL}/${table}${query?`?${query}`:''}`,{headers:{apikey:PUBLISHABLE_KEY}});
    const data=await r.json();
    if(!r.ok)throw new Error(data?.message||JSON.stringify(data));
    return data;
  }

  const mapStudent=(s,i=0)=>({id:s.student_id,number:String(s.number??''),level:s.level||'',room:String(s.room??''),prefix:s.prefix||'',firstName:s.first_name||'',lastName:s.last_name||'',color:s.color||'',rowIndex:i+2});
  const mapSport=s=>({id:s.sport_id,name:s.name,level:s.level||'',gender:s.gender,athleteLimit:Number(s.athlete_limit),type:s.type,active:s.active,updatedAt:s.updated_at||'',teamFormat:s.team_format||'Standard4'});
  const mapMatch=m=>({id:m.match_id,sportId:m.sport_id,sportName:m.sport_name,round:m.round,teamA:m.team_a||'',teamB:m.team_b||'',scoreA:m.score_a??'',scoreB:m.score_b??'',winner:m.winner||'',loser:m.loser||'',referee:m.referee_name||'',timestamp:m.confirmed_at||'',status:m.status,matchDate:m.match_date||'',matchTime:m.match_time?String(m.match_time).slice(0,5):''});

  async function allStudents(){const rows=await rest('students','select=student_id,number,prefix,first_name,last_name,level,room,color&active=eq.true&order=level.asc,room.asc,number.asc');return rows.map(mapStudent)}
  async function teachers(){const rows=await rest('teachers','select=color,prefix,first_name,last_name,role&active=eq.true&order=color.asc,last_name.asc');const out={red:[],yellow:[],blue:[],pink:[]};rows.forEach(t=>{if(out[t.color])out[t.color].push({prefix:t.prefix||'',firstName:t.first_name,lastName:t.last_name,role:t.role||''})});return out}
  async function competition(){const [sp,ma,se]=await Promise.all([rest('sports','select=*&active=eq.true&order=name.asc'),rest('matches','select=match_id,sport_id,sport_name,round,team_a,team_b,score_a,score_b,winner,loser,referee_name,confirmed_at,status,match_date,match_time&order=match_date.asc,match_time.asc'),rest('app_settings','select=key,value&key=eq.StaffRegistrationOpen')]);return{sports:sp.map(mapSport),matches:ma.map(mapMatch),staffRegistrationOpen:se?.[0]?.value!==false}}
  async function publicAthletes(){const rows=await rest('athletes','select=sport_id,color,student_id,student_name,level_room,photo_url&order=sport_id.asc,color.asc'),sports=await rest('sports','select=sport_id,name'),names=Object.fromEntries(sports.map(s=>[s.sport_id,s.name]));return rows.map(a=>({sportId:a.sport_id,sportName:names[a.sport_id]||'',color:a.color,studentId:a.student_id,studentName:a.student_name,levelRoom:a.level_room,photoUrl:a.photo_url||''}))}

  async function api(action,params={},method='GET'){
    if(method==='GET'){
      if(action==='getAllStudents')return{students:await allStudents()};
      if(action==='getStudents'){const students=(await allStudents()).filter(s=>s.level===String(params.level||'')&&String(s.room)===String(params.room||''));return{students}}
      if(action==='getLevels'){const levels={};(await allStudents()).forEach(s=>{if(!s.level||!s.room)return;if(!levels[s.level])levels[s.level]=[];if(!levels[s.level].includes(s.room))levels[s.level].push(s.room)});Object.values(levels).forEach(x=>x.sort((a,b)=>String(a).localeCompare(String(b),'th',{numeric:true})));return{levels}}
      if(action==='getTeachers')return{teachers:await teachers()};
      if(action==='getCompetitionData')return await competition();
      if(action==='getPublicAthletes')return{athletes:await publicAthletes()};
    }
    const r=await fetch(url(),{method:'POST',headers:{apikey:PUBLISHABLE_KEY,'Content-Type':'application/json;charset=utf-8'},body:JSON.stringify({action,...params})});
    const data=await r.json();
    if(!r.ok||data.error)throw new Error(data.error||data.message||JSON.stringify(data));
    return data;
  }

  function toast(message){let el=document.querySelector('.toast-sports');if(!el){el=document.createElement('div');el.className='toast-sports';document.body.appendChild(el)}el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800)}
  const teamLabel=color=>COLORS[color]?.th||color||'รอผล';
  const team=color=>`<span class="team">${String(color||'').split('-').filter(c=>COLORS[c]).map(c=>`<i class="dot dot-${esc(c)}"></i>`).join('')}${esc(teamLabel(color))}</span>`;
  const sportLabel=s=>`${esc(s.name)} · ${esc(s.level)} · ${esc(s.gender)}`;
  function options(items,value='id',label='name',placeholder='— เลือก —'){return`<option value="">${placeholder}</option>`+items.map(x=>`<option value="${esc(x[value])}">${esc(typeof label==='function'?label(x):x[label])}</option>`).join('')}

  window.Sports={COLORS,url,esc,api,toast,team,teamLabel,sportLabel,options,PUBLISHABLE_KEY};

  document.addEventListener('DOMContentLoaded',()=>{
    if(document.getElementById('printArea')&&document.getElementById('print-classroom-checks')&&!document.querySelector('script[data-admin-print-upgrade]')){
      const s=document.createElement('script');s.src='admin-print-upgrade.js?v=20260916-8';s.dataset.adminPrintUpgrade='1';document.body.appendChild(s);
    }
  });
})();
