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
  /** Build A4 portrait student rosters/check sheets while preserving the existing school header. */
  function printDirectory(type,color,level,room,students,teachers){
    const printColors=color==='all'?colors:[color],isTeacher=type==='teachers',isCheck=type==='student-check';
    const checkHeaders=()=>Array.from({length:10},(_,i)=>`<th class="print-check">${i+1}</th>`).join('');
    const checkCells=()=>'<td class="print-check"></td>'.repeat(10);
    const sections=[];
    printColors.forEach(teamColor=>{
      if(isTeacher){
        const list=teachers[teamColor]||[],rows=list.map((t,i)=>`<tr><td>${i+1}</td><td>${S.esc(t.prefix||'')}${S.esc(t.firstName)} ${S.esc(t.lastName)}</td><td>${S.esc(t.role||'')}</td></tr>`).join('');
        sections.push(`<section class="print-directory-section public-print-page"><header><h1>รายชื่อครูประจำสี ${S.esc(S.COLORS[teamColor].th)}</h1><p>กีฬาสี ปีการศึกษา 2569 — โรงเรียนบ้านห้วยผึ้ง</p></header><table class="public-print-table"><thead><tr><th>ที่</th><th>ชื่อ-สกุล</th><th>หน้าที่</th></tr></thead><tbody>${rows||'<tr><td colspan="3">ยังไม่มีข้อมูล</td></tr>'}</tbody></table></section>`);
        return;
      }
      const filtered=students.filter(st=>st.color===teamColor&&(level==='all'||st.level===level)&&(room==='all'||String(st.room)===String(room))),groups={};
      filtered.forEach(st=>{const key=`${st.level}|${st.room}`;if(!groups[key])groups[key]={level:st.level,room:st.room,list:[]};groups[key].list.push(st)});
      Object.values(groups).sort((a,b)=>(a.level+a.room).localeCompare(b.level+b.room,'th',{numeric:true})).forEach(group=>{
        const title=`รายชื่อนักเรียน ${group.level} ห้อง ${group.room}`;
        const rows=group.list.sort((a,b)=>Number(a.number)-Number(b.number)).map(st=>`<tr><td>${S.esc(st.number)}</td><td>${S.esc(st.prefix||'')}${S.esc(st.firstName)} ${S.esc(st.lastName)}</td>${isCheck?checkCells():`<td>${S.esc(S.COLORS[teamColor].th)}</td>`}</tr>`).join('');
        const head=isCheck?`<tr><th class="print-no">เลขที่</th><th class="print-name">ชื่อ–สกุล</th>${checkHeaders()}</tr>`:`<tr><th class="print-no">เลขที่</th><th class="print-name">ชื่อ–สกุล</th><th class="print-color">สีกีฬา</th></tr>`;
        sections.push(`<section class="print-directory-section public-print-page"><header><h1>${S.esc(title)}</h1><p>กีฬาสี ปีการศึกษา 2569 — โรงเรียนบ้านห้วยผึ้ง</p></header><table class="public-print-table ${isCheck?'public-check-table':'public-list-table'}"><thead>${head}</thead><tbody>${rows}</tbody></table></section>`);
      });
    });
    let area=document.getElementById('public-print-area');if(!area){area=document.createElement('div');area.id='public-print-area';document.body.appendChild(area)}
    area.innerHTML=sections.join('')||'<section class="print-directory-section public-print-page"><header><h1>รายชื่อนักเรียน</h1><p>กีฬาสี ปีการศึกษา 2569 — โรงเรียนบ้านห้วยผึ้ง</p></header><p class="empty-state">ไม่พบรายชื่อตามเงื่อนไขที่เลือก</p></section>';
    document.body.classList.add('public-printing');window.onafterprint=()=>document.body.classList.remove('public-printing');setTimeout(()=>window.print(),100);
  }
  const results=await Promise.allSettled([S.api('getAllStudents'),S.api('getTeachers'),S.api('getPublicAthletes')]);
  const students=results[0].status==='fulfilled'?results[0].value.students||[]:[],teachers=results[1].status==='fulfilled'?results[1].value.teachers||{}:{},athletes=results[2].status==='fulfilled'?results[2].value.athletes||[]:[];
  if(results[0].status==='fulfilled')renderStudents(students);else studentEl.innerHTML=`<div class="empty-state">โหลดรายชื่อนักเรียนไม่ได้: ${S.esc(results[0].reason.message)}</div>`;
  if(results[1].status==='fulfilled')renderTeachers(teachers);else teacherEl.innerHTML=`<div class="empty-state">โหลดรายชื่อครูไม่ได้: ${S.esc(results[1].reason.message)}</div>`;
  if(athleteEl){if(results[2].status==='fulfilled')renderAthletes(athletes);else athleteEl.innerHTML=`<div class="empty-state">โหลดรายชื่อนักกีฬาไม่ได้: ${S.esc(results[2].reason.message)}</div>`}
  document.querySelectorAll('[data-directory-view]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-directory-view]').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.directory-panel').forEach(x=>x.classList.remove('active'));button.classList.add('active');document.getElementById('directory-'+button.dataset.directoryView).classList.add('active')});
  const printType=document.getElementById('public-print-type'),printLevel=document.getElementById('public-print-level'),printRoom=document.getElementById('public-print-room');
  const levels=[...new Set(students.map(st=>st.level).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'th',{numeric:true}));
  printLevel.innerHTML='<option value="all">ทุกชั้น</option>'+levels.map(x=>`<option value="${S.esc(x)}">${S.esc(x)}</option>`).join('');
  function refreshPrintRooms(){const level=printLevel.value,rooms=[...new Set(students.filter(st=>level==='all'||st.level===level).map(st=>String(st.room)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'th',{numeric:true}));printRoom.innerHTML='<option value="all">ทุกห้อง</option>'+rooms.map(x=>`<option value="${S.esc(x)}">ห้อง ${S.esc(x)}</option>`).join('')}
  function toggleStudentPrintFilters(){document.querySelectorAll('.public-student-print-filter').forEach(el=>el.style.display=printType.value==='teachers'?'none':'')}
  printLevel.onchange=refreshPrintRooms;printType.onchange=toggleStudentPrintFilters;refreshPrintRooms();toggleStudentPrintFilters();
  document.getElementById('public-print-button').onclick=()=>printDirectory(printType.value,document.getElementById('public-print-color').value,printLevel.value,printRoom.value,students,teachers);
})();
