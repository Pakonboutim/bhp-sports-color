/** Read-only public dashboard module. */
(function buildPublicNavigation(){
  const main=document.querySelector('.sports-main'),hero=main.querySelector('.hero'),sportList=document.getElementById('sports-list'),results=document.getElementById('recent-results'),score=document.getElementById('scoreboard'),directory=main.querySelector('.public-directory');
  const sportTitle=sportList.previousElementSibling,resultTitle=results.previousElementSibling,scoreTitle=score.previousElementSibling;
  const tabs=document.createElement('nav');tabs.className='public-main-tabs';tabs.setAttribute('aria-label','ส่วนข้อมูลหน้าหลัก');tabs.innerHTML='<button class="active" data-main-view="overview">🏠<span>ภาพรวม</span></button><button data-main-view="sports">🏅<span>รายการกีฬา</span></button><button data-main-view="directory">👥<span>สมาชิกสี</span></button>';
  const overview=document.createElement('section'),sports=document.createElement('section');overview.id='main-overview';overview.className='public-main-panel active';sports.id='main-sports';sports.className='public-main-panel';directory.id='main-directory';directory.classList.add('public-main-panel');
  overview.append(scoreTitle,score,resultTitle,results);sports.append(sportTitle,sportList);hero.after(tabs,overview,sports,directory);
  tabs.querySelectorAll('[data-main-view]').forEach(button=>button.onclick=()=>{tabs.querySelectorAll('button').forEach(x=>x.classList.remove('active'));main.querySelectorAll('.public-main-panel').forEach(x=>x.classList.remove('active'));button.classList.add('active');document.getElementById('main-'+button.dataset.mainView).classList.add('active');tabs.scrollIntoView({behavior:'smooth',block:'start'})});
})();

(async function(){
 const S=window.Sports, sportEl=document.getElementById('sports-list'), resultEl=document.getElementById('recent-results'), scoreEl=document.getElementById('scoreboard');
 try{const d=await S.api('getCompetitionData'),sports=d.sports||[],matches=d.matches||[];
 sportEl.innerHTML=sports.length?sports.map(x=>`<article class="sport-card public-sport-card"><span class="sport-icon">🏅</span><div><h3>${S.esc(x.name)}</h3><div class="meta"><span class="chip">${S.esc(x.level)}</span><span class="chip">${S.esc(x.gender)}</span><span class="chip">${S.esc(x.type)}</span>${x.teamFormat==='UpperMaleCombined2'?'<span class="chip">ทีมรวม 2 ฝ่าย</span>':''}<span class="chip">${S.esc(x.athleteLimit)} คน/สี</span></div></div></article>`).join(''):'<div class="empty-state">ยังไม่มีกีฬา</div>';
 const confirmed=matches.filter(m=>m.status==='Confirmed').sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp)));
 resultEl.innerHTML=confirmed.length?confirmed.slice(0,6).map(m=>`<article class="sport-card"><b>${S.esc(m.sportName)}</b><div style="display:flex;justify-content:space-between;margin-top:10px">${S.team(m.teamA)} <span class="score">${S.esc(m.scoreA)}–${S.esc(m.scoreB)}</span> ${S.team(m.teamB)}</div></article>`).join(''):'<div class="empty-state">ยังไม่มีผลการแข่งขัน</div>';
 const points={red:0,yellow:0,blue:0,pink:0};confirmed.forEach(m=>String(m.winner||'').split('-').forEach(color=>{if(points[color]!==undefined)points[color]+=m.round==='Final'?3:1}));
 scoreEl.className='public-scoreboard';scoreEl.innerHTML=Object.entries(points).sort((a,b)=>b[1]-a[1]).map(([c,p],i)=>`<article class="score-rank color-border-${c}"><span class="rank-no">${i+1}</span>${S.team(c)}<strong>${p}<small>คะแนน</small></strong></article>`).join('');
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
  /** Build a clean A4 print view without exposing student identification numbers. */
  function printDirectory(type,color,students,teachers){
    const printColors=color==='all'?colors:[color];
    const sections=printColors.map(teamColor=>{
      if(type==='teachers'){
        const list=teachers[teamColor]||[],rows=list.map((t,i)=>`<tr><td>${i+1}</td><td>${S.esc(t.prefix||'')}${S.esc(t.firstName)} ${S.esc(t.lastName)}</td><td>${S.esc(t.role||'')}</td></tr>`).join('');
        return`<section class="print-directory-section"><h2>${S.esc(S.COLORS[teamColor].th)} — ครูประจำสี (${list.length} คน)</h2><table><thead><tr><th>ที่</th><th>ชื่อ-สกุล</th><th>หน้าที่</th></tr></thead><tbody>${rows||'<tr><td colspan="3">ยังไม่มีข้อมูล</td></tr>'}</tbody></table></section>`;
      }
      const filtered=students.filter(s=>s.color===teamColor),groups={};filtered.forEach(s=>{const key=`${s.level}|${s.room}`;if(!groups[key])groups[key]={level:s.level,room:s.room,list:[]};groups[key].list.push(s)});
      const roomSections=Object.values(groups).sort((a,b)=>(a.level+a.room).localeCompare(b.level+b.room,'th')).map(group=>`<h3>${S.esc(group.level)} ห้อง ${S.esc(group.room)} (${group.list.length} คน)</h3><table><thead><tr><th>เลขที่</th><th>ชื่อ-สกุล</th></tr></thead><tbody>${group.list.sort((a,b)=>Number(a.number)-Number(b.number)).map(s=>`<tr><td>${S.esc(s.number)}</td><td>${S.esc(s.prefix||'')}${S.esc(s.firstName)} ${S.esc(s.lastName)}</td></tr>`).join('')}</tbody></table>`).join('');
      return`<section class="print-directory-section"><h2>${S.esc(S.COLORS[teamColor].th)} — นักเรียน (${filtered.length} คน)</h2>${roomSections||'<p>ยังไม่มีข้อมูล</p>'}</section>`;
    }).join('');
    let area=document.getElementById('public-print-area');if(!area){area=document.createElement('div');area.id='public-print-area';document.body.appendChild(area)}
    area.innerHTML=`<header><h1>รายชื่อ${type==='teachers'?'ครูประจำสี':'นักเรียนตามสี'}</h1><p>กีฬาสี ปีการศึกษา 2569 — โรงเรียนบ้านห้วยผึ้ง</p></header>${sections}`;
    document.body.classList.add('public-printing');window.onafterprint=()=>document.body.classList.remove('public-printing');setTimeout(()=>window.print(),100);
  }
  const results=await Promise.allSettled([S.api('getAllStudents'),S.api('getTeachers')]);
  const students=results[0].status==='fulfilled'?results[0].value.students||[]:[],teachers=results[1].status==='fulfilled'?results[1].value.teachers||{}:{};
  if(results[0].status==='fulfilled')renderStudents(students);else studentEl.innerHTML=`<div class="empty-state">โหลดรายชื่อนักเรียนไม่ได้: ${S.esc(results[0].reason.message)}</div>`;
  if(results[1].status==='fulfilled')renderTeachers(teachers);else teacherEl.innerHTML=`<div class="empty-state">โหลดรายชื่อครูไม่ได้: ${S.esc(results[1].reason.message)}</div>`;
  document.querySelectorAll('[data-directory-view]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-directory-view]').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.directory-panel').forEach(x=>x.classList.remove('active'));button.classList.add('active');document.getElementById('directory-'+button.dataset.directoryView).classList.add('active')});
  document.getElementById('public-print-button').onclick=()=>printDirectory(document.getElementById('public-print-type').value,document.getElementById('public-print-color').value,students,teachers);
})();
