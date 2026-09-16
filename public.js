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
 const roundLabels={'Semi Final 1':'รอบรองชนะเลิศ 1','Semi Final 2':'รอบรองชนะเลิศ 2','Final':'รอบชิงชนะเลิศ','Round Robin':'รอบพบกันหมด'};
 resultEl.innerHTML=confirmed.length?confirmed.slice(0,6).map(m=>`<article class="recent-result-card"><header><div><span class="result-kicker">ผลการแข่งขัน</span><h3>${S.esc(m.sportName)}</h3></div><span class="result-round">${S.esc(roundLabels[m.round]||m.round)}</span></header><div class="result-matchup"><div class="result-team ${m.winner===m.teamA?'is-winner':''}">${S.team(m.teamA)}</div><div class="result-score"><strong>${S.esc(m.scoreA)}</strong><span>–</span><strong>${S.esc(m.scoreB)}</strong></div><div class="result-team result-team-right ${m.winner===m.teamB?'is-winner':''}">${S.team(m.teamB)}</div></div><footer><span class="result-winner">🏆 ชนะ: ${S.team(m.winner)}</span>${m.timestamp?`<time>${S.esc(m.timestamp)}</time>`:''}</footer></article>`).join(''):'<div class="empty-state">ยังไม่มีผลการแข่งขัน</div>';
 const awards={red:{champion:0,runnerUp:0},yellow:{champion:0,runnerUp:0},blue:{champion:0,runnerUp:0},pink:{champion:0,runnerUp:0}};
 confirmed.filter(m=>m.round==='Final').forEach(m=>{String(m.winner||'').split('-').forEach(color=>{if(awards[color])awards[color].champion++});String(m.loser||'').split('-').forEach(color=>{if(awards[color])awards[color].runnerUp++})});
 scoreEl.className='public-scoreboard';scoreEl.innerHTML=Object.entries(awards).sort((a,b)=>b[1].champion-a[1].champion||b[1].runnerUp-a[1].runnerUp).map(([color,total],i)=>`<article class="score-rank medal-rank color-border-${color}"><div class="score-rank-head"><span class="rank-no">${i+1}</span>${S.team(color)}</div><div class="medal-counts"><div class="medal-stat medal-gold"><span>🥇</span><strong>${total.champion}</strong><small>ชนะเลิศ</small></div><div class="medal-stat medal-silver"><span>🥈</span><strong>${total.runnerUp}</strong><small>รองชนะเลิศ</small></div></div></article>`).join('');
 }catch(e){[sportEl,resultEl,scoreEl].forEach(el=>el.innerHTML=`<div class="empty-state">เชื่อมต่อข้อมูลไม่ได้: ${S.esc(e.message)}</div>`)}
})();

/** Read-only public student and teacher summaries. */
(async function(){
  'use strict';
  if(!document.getElementById('directory-athletes')){const menu=document.querySelector('.directory-menu'),printButton=menu&&menu.querySelector('[data-directory-view="print"]'),button=document.createElement('button'),panel=document.createElement('div');button.className='directory-menu-btn';button.dataset.directoryView='athletes';button.textContent='🏃 นักกีฬา';panel.className='directory-panel';panel.id='directory-athletes';panel.innerHTML='<div id="public-athletes"><div class="empty-state">กำลังโหลด…</div></div>';if(menu)menu.insertBefore(button,printButton);document.getElementById('directory-teachers').before(panel)}
  const S=window.Sports,studentEl=document.getElementById('public-students'),athleteEl=document.getElementById('public-athletes'),teacherEl=document.getElementById('public-teachers');
  const colors=['red','yellow','blue','pink'];
  function renderStudents(students){
    studentEl.innerHTML=`<div class="public-color-tabs">${colors.map((color,i)=>`<button class="public-color-tab color-${color} ${i===0?'active':''}" data-public-color="${color}">${S.team(color)} <b>${students.filter(s=>s.color===color).length}</b></button>`).join('')}</div><div id="public-student-list"></div>`;
    const list=studentEl.querySelector('#public-student-list');
    const draw=color=>{const filtered=students.filter(s=>s.color===color),groups={};filtered.forEach(s=>{const key=`${s.level}|${s.room}`;if(!groups[key])groups[key]={level:s.level,room:s.room,students:[]};groups[key].students.push(s)});list.innerHTML=filtered.length?`<div class="public-roster">${Object.values(groups).sort((a,b)=>(a.level+a.room).localeCompare(b.level+b.room,'th')).map(group=>`<details class="roster-group"><summary><span>${S.esc(group.level)} ห้อง ${S.esc(group.room)}</span><b>${group.students.length} คน</b></summary><div>${group.students.sort((a,b)=>Number(a.number)-Number(b.number)).map(s=>`<div class="public-person"><span class="person-no">${S.esc(s.number)}</span><span>${S.esc(s.prefix||'')}${S.esc(s.firstName)} ${S.esc(s.lastName)}</span></div>`).join('')}</div></details>`).join('')}</div>`:'<div class="empty-state">ยังไม่มีนักเรียนในสีนี้</div>'};
    studentEl.querySelectorAll('[data-public-color]').forEach(button=>button.onclick=()=>{studentEl.querySelectorAll('[data-public-color]').forEach(x=>x.classList.remove('active'));button.classList.add('active');draw(button.dataset.publicColor)});
    draw('red');
  }
  function renderTeachers(teachers){teacherEl.innerHTML=colors.map(color=>{const list=teachers[color]||[];return`<article class="sports-card teacher-color-card color-border-${color}"><div class="teacher-card-title">${S.team(color)}<b>${list.length} คน</b></div>${list.length?list.map((teacher,i)=>`<div class="public-person"><span class="person-no">${i+1}</span><span>${S.esc(teacher.prefix||'')}${S.esc(teacher.firstName)} ${S.esc(teacher.lastName)}${teacher.role?`<small class="person-role">${S.esc(teacher.role)}</small>`:''}</span></div>`).join(''):'<div class="empty-state">ยังไม่มีข้อมูล</div>'}</article>`}).join('')}
  function initials(name){return String(name||'?').trim().split(/\s+/).map(x=>x[0]||'').slice(0,2).join('')||'?'}
  function athleteAvatar(person){return person.photoUrl?`<span class="athlete-avatar avatar-large"><img src="${S.esc(person.photoUrl)}" alt="รูป ${S.esc(person.studentName)}" loading="lazy" referrerpolicy="no-referrer"></span>`:`<span class="athlete-avatar avatar-large avatar-fallback" aria-hidden="true">${S.esc(initials(person.studentName))}</span>`}
  function renderAthletes(athletes){const groups={};athletes.forEach(a=>{const key=a.sportId||a.sportName;if(!groups[key])groups[key]={name:a.sportName,rows:[]};groups[key].rows.push(a)});athleteEl.innerHTML=athletes.length?`<div class="public-athlete-sports">${Object.values(groups).map(group=>`<article class="sports-card public-athlete-card"><div class="section-head"><h3>🏅 ${S.esc(group.name)}</h3><b>${group.rows.length} คน</b></div><div class="public-athlete-grid">${group.rows.map(a=>`<div class="public-athlete-row color-border-${S.esc(a.color)}">${athleteAvatar(a)}<span><b>${S.esc(a.studentName)}</b><small>${S.esc(a.levelRoom)} · ${S.team(a.color)}</small></span></div>`).join('')}</div></article>`).join('')}</div>`:'<div class="empty-state">ยังไม่มีรายชื่อนักกีฬา</div>'}
  /** Build compact A4 portrait pages grouped as ป.1–3 / ป.4–6 / ม.1–3 / ม.4–6. */
  const PRINT_LEVEL_GROUPS=[
    {id:'p13',label:'ป.1–ป.3',levels:['ป.1','ป.2','ป.3']},
    {id:'p46',label:'ป.4–ป.6',levels:['ป.4','ป.5','ป.6']},
    {id:'m13',label:'ม.1–ม.3',levels:['ม.1','ม.2','ม.3']},
    {id:'m46',label:'ม.4–ม.6',levels:['ม.4','ม.5','ม.6']}
  ];
  const roomKey=st=>`${st.level}|${st.room}`;
  const classroomLabel=st=>`${st.level}/${st.room}`;
  function sortStudents(a,b){return String(a.level).localeCompare(String(b.level),'th',{numeric:true})||String(a.room).localeCompare(String(b.room),'th',{numeric:true})||Number(a.number||0)-Number(b.number||0)}
  function groupedClassroomOptions(students){
    const byKey=new Map();students.forEach(st=>{const key=roomKey(st);if(st.level&&st.room&&!byKey.has(key))byKey.set(key,{key,level:st.level,room:st.room})});
    return PRINT_LEVEL_GROUPS.map(group=>({group,rooms:[...byKey.values()].filter(r=>group.levels.includes(r.level)).sort((a,b)=>a.level.localeCompare(b.level,'th',{numeric:true})||String(a.room).localeCompare(String(b.room),'th',{numeric:true}))})).filter(x=>x.rooms.length);
  }
  function renderClassroomChecks(students){
    const root=document.getElementById('public-print-classrooms');if(!root)return;
    root.innerHTML=groupedClassroomOptions(students).map(({group,rooms})=>`<fieldset class="print-check-group"><legend>${group.label}</legend><div class="print-check-grid">${rooms.map(r=>`<label class="print-room-choice"><input type="checkbox" value="${S.esc(r.key)}" checked><span>${S.esc(r.level)}/${S.esc(r.room)}</span></label>`).join('')}</div></fieldset>`).join('');
    document.getElementById('public-print-all').onclick=()=>root.querySelectorAll('input').forEach(x=>x.checked=true);
    document.getElementById('public-print-none').onclick=()=>root.querySelectorAll('input').forEach(x=>x.checked=false);
  }
  function selectedClassrooms(){return new Set([...document.querySelectorAll('#public-print-classrooms input:checked')].map(x=>x.value))}
  function printDirectory(type,color,selectedRooms,students,teachers){
    const printColors=color==='all'?colors:[color],isTeacher=type==='teachers',isCheck=type==='student-check';
    const checkHeaders=()=>Array.from({length:10},(_,i)=>`<th class="print-check">${i+1}</th>`).join('');
    const checkCells=()=>'<td class="print-check"></td>'.repeat(10);
    const sections=[];
    printColors.forEach(teamColor=>{
      const colorName=S.COLORS[teamColor].th;
      if(isTeacher){
        const list=teachers[teamColor]||[],rows=list.map((t,i)=>`<tr><td>${i+1}</td><td>${S.esc(t.prefix||'')}${S.esc(t.firstName)} ${S.esc(t.lastName)}</td><td>${S.esc(t.role||'')}</td></tr>`).join('');
        sections.push(`<section class="print-directory-section public-print-page"><header><h1>รายชื่อครูประจำ${S.esc(colorName)}</h1><p>กีฬาสี ปีการศึกษา 2569 — โรงเรียนบ้านห้วยผึ้ง</p></header><table class="public-print-table public-list-table"><thead><tr><th>ที่</th><th>ชื่อ-สกุล</th><th>หน้าที่</th></tr></thead><tbody>${rows||'<tr><td colspan="3">ยังไม่มีข้อมูล</td></tr>'}</tbody></table></section>`);
        return;
      }
      PRINT_LEVEL_GROUPS.forEach(group=>{
        const rowsData=students.filter(st=>st.color===teamColor&&group.levels.includes(st.level)&&selectedRooms.has(roomKey(st))).sort(sortStudents);
        if(!rowsData.length)return;
        const rows=rowsData.map(st=>`<tr><td>${S.esc(st.number||'')}</td><td>${S.esc(st.prefix||'')}${S.esc(st.firstName)} ${S.esc(st.lastName)}</td><td>${S.esc(classroomLabel(st))}</td>${isCheck?checkCells():''}</tr>`).join('');
        const head=isCheck?`<tr><th class="print-no">เลขที่</th><th class="print-name">ชื่อ–สกุล</th><th class="print-class">ชั้น/ห้อง</th>${checkHeaders()}</tr>`:`<tr><th class="print-no">เลขที่</th><th class="print-name">ชื่อ–สกุล</th><th class="print-class">ชั้น/ห้อง</th></tr>`;
        sections.push(`<section class="print-directory-section public-print-page compact-group-page"><header><h1>รายชื่อนักเรียน ${S.esc(colorName)} — ${S.esc(group.label)}</h1><p>กีฬาสี ปีการศึกษา 2569 — โรงเรียนบ้านห้วยผึ้ง</p></header><table class="public-print-table ${isCheck?'public-check-table':'public-list-table'}"><thead>${head}</thead><tbody>${rows}</tbody></table></section>`);
      });
    });
    let area=document.getElementById('public-print-area');if(!area){area=document.createElement('div');area.id='public-print-area';document.body.appendChild(area)}
    area.innerHTML=sections.join('')||'<section class="print-directory-section public-print-page"><header><h1>รายชื่อนักเรียน</h1><p>กีฬาสี ปีการศึกษา 2569 — โรงเรียนบ้านห้วยผึ้ง</p></header><p class="empty-state">ไม่พบรายชื่อตามห้องที่เลือก</p></section>';
    document.body.classList.add('public-printing');window.onafterprint=()=>document.body.classList.remove('public-printing');setTimeout(()=>window.print(),100);
  }
  const results=await Promise.allSettled([S.api('getAllStudents'),S.api('getTeachers'),S.api('getPublicAthletes')]);
  const students=results[0].status==='fulfilled'?results[0].value.students||[]:[],teachers=results[1].status==='fulfilled'?results[1].value.teachers||{}:{},athletes=results[2].status==='fulfilled'?results[2].value.athletes||[]:[];
  if(results[0].status==='fulfilled')renderStudents(students);else studentEl.innerHTML=`<div class="empty-state">โหลดรายชื่อนักเรียนไม่ได้: ${S.esc(results[0].reason.message)}</div>`;
  if(results[1].status==='fulfilled')renderTeachers(teachers);else teacherEl.innerHTML=`<div class="empty-state">โหลดรายชื่อครูไม่ได้: ${S.esc(results[1].reason.message)}</div>`;
  if(athleteEl){if(results[2].status==='fulfilled')renderAthletes(athletes);else athleteEl.innerHTML=`<div class="empty-state">โหลดรายชื่อนักกีฬาไม่ได้: ${S.esc(results[2].reason.message)}</div>`}
  document.querySelectorAll('[data-directory-view]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-directory-view]').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.directory-panel').forEach(x=>x.classList.remove('active'));button.classList.add('active');document.getElementById('directory-'+button.dataset.directoryView).classList.add('active')});
  const printType=document.getElementById('public-print-type');
  renderClassroomChecks(students);
  function toggleStudentPrintFilters(){document.querySelectorAll('.public-student-print-filter').forEach(el=>el.style.display=printType.value==='teachers'?'none':'')}
  printType.onchange=toggleStudentPrintFilters;toggleStudentPrintFilters();
  document.getElementById('public-print-button').onclick=()=>{const selected=selectedClassrooms();if(printType.value!=='teachers'&&!selected.size){S.toast('กรุณาเลือกอย่างน้อย 1 ชั้น/ห้อง');return}printDirectory(printType.value,document.getElementById('public-print-color').value,selected,students,teachers)};
})();
