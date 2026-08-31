/** Read-only public dashboard module. */
(async function(){
 const S=window.Sports, sportEl=document.getElementById('sports-list'), resultEl=document.getElementById('recent-results'), scoreEl=document.getElementById('scoreboard');
 try{const d=await S.api('getCompetitionData'),sports=d.sports||[],matches=d.matches||[];
 sportEl.innerHTML=sports.length?sports.map(x=>`<article class="sport-card"><h3>${S.esc(x.name)}</h3><div class="meta"><span class="chip">${S.esc(x.level)}</span><span class="chip">${S.esc(x.gender)}</span><span class="chip">${S.esc(x.type)}</span><span class="chip">${S.esc(x.athleteLimit)} คน/สี</span></div></article>`).join(''):'<div class="empty-state">ยังไม่มีกีฬา</div>';
 const confirmed=matches.filter(m=>m.status==='Confirmed').sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp)));
 resultEl.innerHTML=confirmed.length?confirmed.slice(0,6).map(m=>`<article class="sport-card"><b>${S.esc(m.sportName)}</b><div style="display:flex;justify-content:space-between;margin-top:10px">${S.team(m.teamA)} <span class="score">${S.esc(m.scoreA)}–${S.esc(m.scoreB)}</span> ${S.team(m.teamB)}</div></article>`).join(''):'<div class="empty-state">ยังไม่มีผลการแข่งขัน</div>';
 const points={red:0,yellow:0,blue:0,pink:0};confirmed.forEach(m=>{if(points[m.winner]!==undefined)points[m.winner]+=m.round==='Final'?3:1});
 scoreEl.innerHTML=Object.entries(points).sort((a,b)=>b[1]-a[1]).map(([c,p],i)=>`<div class="sport-card" style="display:flex;align-items:center"><b style="font-size:24px;width:36px">${i+1}</b>${S.team(c)}<b style="margin-left:auto;font-size:22px">${p}</b></div>`).join('');
 }catch(e){[sportEl,resultEl,scoreEl].forEach(el=>el.innerHTML=`<div class="empty-state">เชื่อมต่อข้อมูลไม่ได้: ${S.esc(e.message)}</div>`)}
})();

/** Read-only public student and teacher summaries. */
(async function(){
  'use strict';
  const S=window.Sports,studentEl=document.getElementById('public-students'),teacherEl=document.getElementById('public-teachers');
  const colors=['red','yellow','blue','pink'];
  function renderStudents(students){
    studentEl.innerHTML=`<div class="public-color-tabs">${colors.map((color,i)=>`<button class="public-color-tab color-${color} ${i===0?'active':''}" data-public-color="${color}">${S.team(color)} <b>${students.filter(s=>s.color===color).length}</b></button>`).join('')}</div><div id="public-student-list"></div>`;
    const list=studentEl.querySelector('#public-student-list');
    const draw=color=>{const filtered=students.filter(s=>s.color===color),groups={};filtered.forEach(s=>{const key=`${s.level}|${s.room}`;if(!groups[key])groups[key]={level:s.level,room:s.room,students:[]};groups[key].students.push(s)});list.innerHTML=filtered.length?`<div class="public-roster">${Object.values(groups).sort((a,b)=>(a.level+a.room).localeCompare(b.level+b.room,'th')).map(group=>`<details class="roster-group"><summary><span>${S.esc(group.level)} ห้อง ${S.esc(group.room)}</span><b>${group.students.length} คน</b></summary><div>${group.students.sort((a,b)=>Number(a.number)-Number(b.number)).map(s=>`<div class="public-person"><span class="person-no">${S.esc(s.number)}</span><span>${S.esc(s.prefix||'')}${S.esc(s.firstName)} ${S.esc(s.lastName)}</span></div>`).join('')}</div></details>`).join('')}</div>`:'<div class="empty-state">ยังไม่มีนักเรียนในสีนี้</div>'};
    studentEl.querySelectorAll('[data-public-color]').forEach(button=>button.onclick=()=>{studentEl.querySelectorAll('[data-public-color]').forEach(x=>x.classList.remove('active'));button.classList.add('active');draw(button.dataset.publicColor)});
    draw('red');
  }
  function renderTeachers(teachers){teacherEl.innerHTML=colors.map(color=>{const list=teachers[color]||[];return`<article class="sports-card teacher-color-card color-border-${color}"><div class="teacher-card-title">${S.team(color)}<b>${list.length} คน</b></div>${list.length?list.map((teacher,i)=>`<div class="public-person"><span class="person-no">${i+1}</span><span>${S.esc(teacher.prefix||'')}${S.esc(teacher.firstName)} ${S.esc(teacher.lastName)}${teacher.role?`<small class="person-role">${S.esc(teacher.role)}</small>`:''}</span></div>`).join(''):'<div class="empty-state">ยังไม่มีข้อมูล</div>'}</article>`}).join('')}
  const results=await Promise.allSettled([S.api('getAllStudents'),S.api('getTeachers')]);
  if(results[0].status==='fulfilled')renderStudents(results[0].value.students||[]);else studentEl.innerHTML=`<div class="empty-state">โหลดรายชื่อนักเรียนไม่ได้: ${S.esc(results[0].reason.message)}</div>`;
  if(results[1].status==='fulfilled')renderTeachers(results[1].value.teachers||{});else teacherEl.innerHTML=`<div class="empty-state">โหลดรายชื่อครูไม่ได้: ${S.esc(results[1].reason.message)}</div>`;
})();
