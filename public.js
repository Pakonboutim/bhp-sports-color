/** Read-only public dashboard module. */
(function buildPublicNavigation(){
  const main=document.querySelector('.sports-main'),hero=main.querySelector('.hero'),sportList=document.getElementById('sports-list'),results=document.getElementById('recent-results'),score=document.getElementById('scoreboard'),directory=main.querySelector('.public-directory');
  if(main.dataset.staticDashboard==='true'){
    const navItems=document.querySelectorAll('[data-main-view]'),tabs=main.querySelector('.public-main-tabs'),activate=view=>{navItems.forEach(x=>x.classList.toggle('active',x.dataset.mainView===view));main.querySelectorAll('.public-main-panel').forEach(x=>x.classList.remove('active'));document.getElementById('main-'+view)?.classList.add('active')};
    navItems.forEach(button=>button.onclick=()=>{activate(button.dataset.mainView);window.scrollTo({top:0,behavior:'smooth'})});
    return;
  }
  document.body.classList.add('spc-dashboard');
  const sidebar=document.createElement('aside');sidebar.className='dashboard-sidebar';sidebar.innerHTML='<div class="sidebar-brand"><div class="sidebar-logo">🏆</div><div><b>SPC · ระบบกีฬาสี</b><small>โรงเรียนบ้านห้วยผึ้ง</small></div></div><div class="sidebar-season">📅 ปีการศึกษา 2569</div><div class="sidebar-label">เมนูหลัก</div><div class="sidebar-nav"><button data-main-view="overview" class="active">🏠 <span>ภาพรวม</span></button><button data-main-view="sports">🏅 <span>รายการกีฬา</span></button><button data-main-view="results">📋 <span>ผลการแข่งขัน</span></button><button data-main-view="bracket">🏆 <span>สายการแข่งขัน</span></button><button data-main-view="directory">👥 <span>สมาชิกสี</span></button></div><div class="sidebar-foot">ข้อมูลการแข่งขัน<br><small>อัปเดตจากระบบกลาง</small></div>';document.body.insertBefore(sidebar,main);
  const sportTitle=sportList.previousElementSibling,resultTitle=results.previousElementSibling,scoreTitle=score.previousElementSibling;
  const tabs=document.createElement('nav');tabs.className='public-main-tabs';tabs.setAttribute('aria-label','ส่วนข้อมูลหน้าหลัก');tabs.innerHTML='<button class="active" data-main-view="overview">🏠<span>ภาพรวม</span></button><button data-main-view="sports">🏅<span>รายการกีฬา</span></button><button data-main-view="results">📋<span>ผลทั้งหมด</span></button><button data-main-view="bracket">🏆<span>สายแข่ง</span></button><button data-main-view="directory">👥<span>สมาชิกสี</span></button>';
  const overview=document.createElement('section'),sports=document.createElement('section'),allResults=document.createElement('section'),bracket=document.createElement('section');overview.id='main-overview';overview.className='public-main-panel active';sports.id='main-sports';sports.className='public-main-panel';allResults.id='main-results';allResults.className='public-main-panel';bracket.id='main-bracket';bracket.className='public-main-panel';directory.id='main-directory';directory.classList.add('public-main-panel');
  allResults.innerHTML='<div class="sports-card dashboard-results-card"><div class="field"><label>กรองตามกีฬา</label><select id="dashboard-sport-filter"></select></div><section class="dashboard-winners"><div class="section-head"><div><h2>🏆 ผู้ชนะและรองชนะเลิศ</h2><p class="muted">สรุปจากผลรอบชิงชนะเลิศที่ยืนยันแล้ว</p></div></div><div id="dashboard-winner-summary" class="winner-summary-grid"></div></section><div class="table-wrap"><table class="data-table dashboard-result-table"><thead><tr><th>รอบการแข่งขัน</th><th>คะแนน</th><th>ผู้ชนะ</th><th>รองชนะเลิศ</th><th>กรรมการ</th><th>เวลา</th></tr></thead><tbody id="dashboard-result-rows"></tbody></table></div></div>';
  bracket.innerHTML='<div class="sports-card dashboard-bracket-card"><div class="field"><label>กีฬา Knockout</label><select id="dashboard-bracket-sport"></select></div><div id="dashboard-bracket-view"><div class="empty-state">กำลังโหลด…</div></div></div>';
  overview.append(scoreTitle,score,resultTitle,results);sports.append(sportTitle,sportList);hero.after(tabs,overview,sports,allResults,bracket,directory);
  const style=document.createElement('style');style.textContent='.spc-dashboard{background:#eef0f4}.dashboard-sidebar{position:fixed;inset:0 auto 0 0;width:244px;z-index:20;display:flex;flex-direction:column;background:rgba(255,255,255,.78);backdrop-filter:blur(28px) saturate(160%);-webkit-backdrop-filter:blur(28px) saturate(160%);border-right:1px solid rgba(0,0,0,.08);box-shadow:6px 0 24px rgba(0,0,0,.06)}.sidebar-brand{display:flex;align-items:center;gap:10px;padding:22px 18px 16px;border-bottom:1px solid rgba(0,0,0,.06)}.sidebar-logo{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;color:#fff;background:linear-gradient(135deg,#0a84ff,#5e5ce6);box-shadow:0 8px 18px rgba(10,132,255,.3);font-size:20px}.sidebar-brand b,.sidebar-brand small{display:block}.sidebar-brand b{font-size:14px}.sidebar-brand small{font-size:10px;color:var(--muted);margin-top:2px}.sidebar-season{margin:14px 16px 8px;padding:9px 11px;border-radius:10px;color:#0758b8;background:rgba(10,132,255,.1);font-size:11px;font-weight:700}.sidebar-label{padding:12px 20px 5px;color:#8e8e93;font-size:10px;font-weight:800;letter-spacing:.06em}.sidebar-nav{padding:4px 10px}.sidebar-nav button{display:flex;align-items:center;gap:11px;width:100%;padding:10px 12px;margin-bottom:3px;border:0;border-radius:10px;background:transparent;color:#3a3a3c;text-align:left;font-size:13px;font-weight:600}.sidebar-nav button:hover{background:rgba(0,0,0,.05)}.sidebar-nav button.active{color:#fff;background:linear-gradient(135deg,#0a84ff,#5e5ce6);box-shadow:0 5px 14px rgba(10,132,255,.28)}.sidebar-foot{margin-top:auto;padding:16px 20px;border-top:1px solid rgba(0,0,0,.06);color:#6e6e73;font-size:11px}.sidebar-foot small{font-size:10px;color:#8e8e93}.spc-dashboard .sports-header{margin-left:244px;background:rgba(255,255,255,.72);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);color:#1d1d1f;border-bottom:1px solid rgba(0,0,0,.08);box-shadow:0 2px 16px rgba(0,0,0,.05)}.spc-dashboard .sports-header p{color:#6e6e73;opacity:1}.spc-dashboard .sports-header h1{color:#1d1d1f}.spc-dashboard .sports-nav{display:none}.spc-dashboard .sports-main{max-width:none;margin-left:244px;padding:26px 28px 54px}.spc-dashboard .hero{max-width:1240px;margin:0 auto 18px;padding:30px 26px;background:linear-gradient(135deg,#0a84ff,#5e5ce6 62%,#ff375f);box-shadow:0 14px 34px rgba(94,92,230,.24)}.spc-dashboard .sports-card,.spc-dashboard .sport-card,.spc-dashboard .recent-result-card{box-shadow:0 8px 24px rgba(0,0,0,.07);border-color:rgba(0,0,0,.06)}.spc-dashboard .section-title,.spc-dashboard .public-main-panel{max-width:1240px;margin-left:auto;margin-right:auto}.spc-dashboard .public-main-tabs{max-width:1240px;margin:0 auto 14px}.dashboard-results-card,.dashboard-bracket-card{margin-top:0}.dashboard-winners{margin:4px 0 18px;padding:14px 0 2px;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}.dashboard-winners h2{margin:0;color:var(--primary);font-size:18px}.dashboard-winners .muted{margin:2px 0 0;color:var(--muted);font-size:12px}.winner-summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}.winner-summary-card{padding:12px;border:1px solid var(--border);border-left:4px solid var(--primary);border-radius:12px;background:#F8FAFC}.winner-summary-card h3{margin:0 0 8px;font-size:15px}.winner-summary-card ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}.winner-summary-card li{display:flex;justify-content:space-between;gap:10px;padding:7px 9px;border-radius:8px;background:#fff;border:1px solid var(--border);font-size:13px}.winner-summary-card li span{min-width:0}.winner-summary-card li b{white-space:nowrap;color:var(--green)}.dashboard-result-table{min-width:620px}.dashboard-result-group th{padding:11px 10px;color:var(--primary);background:#E8F0FB;border-top:2px solid var(--primary);font-size:14px}.dashboard-result-group+tr td{border-top:0}@media(min-width:761px){.spc-dashboard .public-main-tabs{display:none}}@media(max-width:760px){.dashboard-sidebar{display:none}.spc-dashboard .sports-header,.spc-dashboard .sports-main{margin-left:0}.spc-dashboard .sports-main{padding:12px}.spc-dashboard .public-main-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}.winner-summary-grid{grid-template-columns:1fr}.dashboard-result-table{min-width:560px}}';document.head.appendChild(style);
  const activate=view=>{tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.mainView===view));sidebar.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.mainView===view));main.querySelectorAll('.public-main-panel').forEach(x=>x.classList.remove('active'));document.getElementById('main-'+view).classList.add('active')};
  tabs.querySelectorAll('[data-main-view]').forEach(button=>button.onclick=()=>{activate(button.dataset.mainView);tabs.scrollIntoView({behavior:'smooth',block:'start'})});sidebar.querySelectorAll('[data-main-view]').forEach(button=>button.onclick=()=>{activate(button.dataset.mainView);window.scrollTo({top:0,behavior:'smooth'})});
})();

(async function(){
 const S=window.Sports, sportEl=document.getElementById('sports-list'), resultEl=document.getElementById('recent-results'), scoreEl=document.getElementById('scoreboard'), dashboardFilter=document.getElementById('dashboard-sport-filter'), dashboardWinner=document.getElementById('dashboard-winner-summary'), dashboardRows=document.getElementById('dashboard-result-rows'), bracketFilter=document.getElementById('dashboard-bracket-sport'), bracketView=document.getElementById('dashboard-bracket-view');
 try{const d=await S.api('getCompetitionData'),sports=d.sports||[],matches=d.matches||[];
 sportEl.innerHTML=sports.length?sports.map(x=>`<article class="sport-card public-sport-card"><span class="sport-icon">🏅</span><div><h3>${S.esc(x.name)}</h3><div class="meta"><span class="chip">${S.esc(x.level)}</span><span class="chip">${S.esc(x.gender)}</span><span class="chip">${S.esc(x.type)}</span>${x.teamFormat==='UpperMaleCombined2'?'<span class="chip">ทีมรวม 2 ฝ่าย</span>':''}<span class="chip">${S.esc(x.athleteLimit)} คน/สี</span></div></div></article>`).join(''):'<div class="empty-state">ยังไม่มีกีฬา</div>';
 const confirmed=matches.filter(m=>m.status==='Confirmed').sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp)));
 const roundLabels={'Semi Final 1':'รอบรองชนะเลิศ 1','Semi Final 2':'รอบรองชนะเลิศ 2','Final':'รอบชิงชนะเลิศ','Round Robin':'รอบพบกันหมด'};
 resultEl.innerHTML=confirmed.length?confirmed.slice(0,6).map(m=>`<article class="recent-result-card"><header><div><span class="result-kicker">ผลการแข่งขัน</span><h3>${S.esc(m.sportName)}</h3></div><span class="result-round">${S.esc(roundLabels[m.round]||m.round)}</span></header><div class="result-matchup"><div class="result-team ${m.winner===m.teamA?'is-winner':''}">${S.team(m.teamA)}</div><div class="result-score"><strong>${S.esc(m.scoreA)}</strong><span>–</span><strong>${S.esc(m.scoreB)}</strong></div><div class="result-team result-team-right ${m.winner===m.teamB?'is-winner':''}">${S.team(m.teamB)}</div></div><footer><span class="result-winner">🏆 ชนะ: ${S.team(m.winner)}</span>${m.timestamp?`<time>${S.esc(m.timestamp)}</time>`:''}</footer></article>`).join(''):'<div class="empty-state">ยังไม่มีผลการแข่งขัน</div>';
 const awards={red:{champion:0,runnerUp:0},yellow:{champion:0,runnerUp:0},blue:{champion:0,runnerUp:0},pink:{champion:0,runnerUp:0}};
 confirmed.filter(m=>m.round==='Final').forEach(m=>{String(m.winner||'').split('-').forEach(color=>{if(awards[color])awards[color].champion++});String(m.loser||'').split('-').forEach(color=>{if(awards[color])awards[color].runnerUp++})});
  scoreEl.className='public-scoreboard';scoreEl.innerHTML=Object.entries(awards).sort((a,b)=>b[1].champion-a[1].champion||b[1].runnerUp-a[1].runnerUp).map(([color,total],i)=>`<article class="score-rank medal-rank color-border-${color}"><div class="score-rank-head"><span class="rank-no">${i+1}</span>${S.team(color)}</div><div class="medal-counts"><div class="medal-stat medal-gold"><span>🥇</span><strong>${total.champion}</strong><small>ชนะเลิศ</small></div><div class="medal-stat medal-silver"><span>🥈</span><strong>${total.runnerUp}</strong><small>รองชนะเลิศ</small></div></div></article>`).join('');
  const ranked=Object.entries(awards).sort((a,b)=>b[1].champion-a[1].champion||b[1].runnerUp-a[1].runnerUp);const podiumOrder=[1,0,2].filter(i=>ranked[i]);scoreEl.innerHTML=`<div class="score-podium">${podiumOrder.map(i=>{const [color,total]=ranked[i];return`<article class="podium-card podium-${i+1} color-border-${color}"><span class="podium-medal">${i===0?'👑':i===1?'🥈':'🥉'}</span><strong>${i+1}</strong>${S.team(color)}<b>${total.champion} รายการชนะเลิศ</b><small>🥇 ${total.champion} · 🥈 ${total.runnerUp}</small></article>`}).join('')}</div><div class="score-list">${ranked.map(([color,total],i)=>`<div class="score-list-row color-border-${color}"><span class="score-list-rank">${i+1}</span>${S.team(color)}<span class="score-bar"><i style="width:${Math.max(8,Math.round((total.champion+total.runnerUp)/Math.max(1,ranked[0][1].champion+ranked[0][1].runnerUp)*100))}%"></i></span><small>🥇 ${total.champion} · 🥈 ${total.runnerUp}</small><b>${total.champion+total.runnerUp} รายการ</b></div>`).join('')}</div>`;
  dashboardFilter.innerHTML='<option value="">ทุกกีฬา</option>'+sports.map(s=>`<option value="${S.esc(s.id)}">${S.esc(s.name)}</option>`).join('');
  function renderDashboardResults(){
    const selected=confirmed.filter(m=>!dashboardFilter.value||m.sportId===dashboardFilter.value),champions=selected.filter(m=>m.round==='Final'&&m.winner);
    dashboardWinner.innerHTML=champions.length?champions.map(m=>`<article class="winner-summary-card"><h3>${S.esc(m.sportName)}</h3><ul><li><span>🥇 ผู้ชนะ ${S.team(m.winner)}</span><b>${S.esc(m.scoreA)}–${S.esc(m.scoreB)}</b></li><li><span>🥈 รองชนะเลิศ ${S.team(m.loser||'ยังไม่ระบุ')}</span><b>รองชนะเลิศ</b></li></ul></article>`).join(''):'<div class="empty-state">ยังไม่มีผลรอบชิงชนะเลิศที่ยืนยัน</div>';
    const groups=[];selected.forEach(m=>{const key=m.sportId||m.sportName;let group=groups.find(x=>x.key===key);if(!group){group={key,name:m.sportName||'ไม่ระบุรายการ',rows:[]};groups.push(group)}group.rows.push(m)});
    dashboardRows.innerHTML=selected.length?groups.map(group=>`<tr class="dashboard-result-group"><th colspan="6">🏅 ${S.esc(group.name)}</th></tr>${group.rows.map(m=>`<tr><td>${S.esc(roundLabels[m.round]||m.round)}<br><small>${S.team(m.teamA)} vs ${S.team(m.teamB)}</small></td><td class="score">${S.esc(m.scoreA)}–${S.esc(m.scoreB)}</td><td>${S.team(m.winner)}</td><td>${S.team(m.loser||'ยังไม่ระบุ')}</td><td>${S.esc(m.referee)}</td><td>${S.esc(m.timestamp)}</td></tr>`).join('')}`).join(''):'<tr><td colspan="6" class="empty-state">ยังไม่มีผลการแข่งขัน</td></tr>';
  }
  function renderDashboardBracket(){
    const sport=sports.find(s=>s.id===bracketFilter.value);if(!sport){bracketView.innerHTML='<div class="empty-state">เลือกกีฬา Knockout</div>';return}
    const ms=matches.filter(m=>m.sportId===sport.id),final=ms.find(m=>m.round==='Final');
    if(sport.teamFormat==='UpperMaleCombined2'){const row=color=>`<div class="team-row ${final?.winner===color?'team-winner':final?.loser===color?'team-loser':''}">${S.team(color)}<b>${final?.status==='Confirmed'?(final.teamA===color?final.scoreA:final.scoreB):'—'}</b></div>`;bracketView.innerHTML=`<div class="notice">การแข่งขันพิเศษชาย ม.4–ม.6</div><div class="match"><div class="match-title">รอบชิงชนะเลิศ — ทีมรวม 2 ทีม</div>${row('yellow-blue')}${row('pink-red')}</div>${final?.winner?`<div class="champion" style="margin-top:16px"><div class="trophy">🏆</div><h2>CHAMPION</h2>${S.team(final.winner)}</div>`:''}`;return}
    const semi1=ms.find(m=>m.round==='Semi Final 1'),semi2=ms.find(m=>m.round==='Semi Final 2'),fA=semi1?.winner||'รอผล',fB=semi2?.winner||'รอผล';const row=(c,m)=>`<div class="team-row ${m?.winner===c?'team-winner':m?.loser===c?'team-loser':''}">${S.team(c)}<b>${m?.status==='Confirmed'?(m.teamA===c?m.scoreA:m.scoreB):'—'}</b></div>`,matchCard=(m,title,a,b)=>`<div class="match"><div class="match-title">${title}</div>${row(a,m)}${row(b,m)}</div>`;bracketView.innerHTML=`<div class="bracket"><div class="round">${matchCard(semi1,'รอบรองชนะเลิศ 1','red','yellow')}${matchCard(semi2,'รอบรองชนะเลิศ 2','blue','pink')}</div><div class="connector">➜</div><div class="round">${matchCard(final,'รอบชิงชนะเลิศ',fA,fB)}${final?.winner?`<div class="champion"><div class="trophy">🏆</div><h2>CHAMPION</h2>${S.team(final.winner)}</div>`:''}</div></div>`;
  }
  dashboardFilter.onchange=renderDashboardResults;renderDashboardResults();
  const knockoutSports=sports.filter(s=>s.type==='Knockout');bracketFilter.innerHTML=S.options(knockoutSports);bracketFilter.onchange=renderDashboardBracket;if(knockoutSports[0])bracketFilter.value=knockoutSports[0].id;renderDashboardBracket();
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

    const tools=document.querySelector('.print-check-tools');
    if(tools&&!tools.querySelector('[data-print-group]')){
      tools.insertAdjacentHTML('beforeend',PRINT_LEVEL_GROUPS.map(group=>`<button type="button" class="secondary print-group-btn" data-print-group="${group.id}">${group.label}</button>`).join(''));
    }

    document.getElementById('public-print-all').onclick=()=>root.querySelectorAll('input').forEach(x=>x.checked=true);
    document.getElementById('public-print-none').onclick=()=>root.querySelectorAll('input').forEach(x=>x.checked=false);

    if(tools){
      tools.querySelectorAll('[data-print-group]').forEach(button=>{
        button.onclick=()=>{
          const group=PRINT_LEVEL_GROUPS.find(g=>g.id===button.dataset.printGroup);
          if(!group)return;
          root.querySelectorAll('input').forEach(input=>{
            const level=String(input.value).split('|')[0];
            input.checked=group.levels.includes(level);
          });
        };
      });
    }
  }
  function selectedClassrooms(){return new Set([...document.querySelectorAll('#public-print-classrooms input:checked')].map(x=>x.value))}
  function printDirectory(type,color,selectedRooms,students,teachers){
    const printColors=color==='all'?colors:[color],isTeacher=type==='teachers',isCheck=type==='student-check';
    const checkHeaders=()=>Array.from({length:10},(_,i)=>`<th class="print-check">${i+1}</th>`).join('');
    const checkCells=()=>'<td class="print-check"></td>'.repeat(10);
    const sections=[];

    function roomBlocks(rowsData){
      const map=new Map();
      rowsData.forEach(st=>{
        const key=roomKey(st);
        if(!map.has(key))map.set(key,{key,level:st.level,room:st.room,students:[]});
        map.get(key).students.push(st);
      });
      return [...map.values()].sort((a,b)=>String(a.level).localeCompare(String(b.level),'th',{numeric:true})||String(a.room).localeCompare(String(b.room),'th',{numeric:true}));
    }

    function paginateWholeRooms(rooms){
      const capacity=isCheck?44:48;
      const pages=[];
      let page=[],used=0;
      rooms.forEach(room=>{
        const units=room.students.length+3;
        if(page.length&&used+units>capacity){
          pages.push(page);
          page=[];
          used=0;
        }
        page.push(room);
        used+=units;
      });
      if(page.length)pages.push(page);
      return pages;
    }

    function renderRoom(room){
      const rows=room.students.sort(sortStudents).map(st=>`<tr><td>${S.esc(st.number||'')}</td><td>${S.esc(st.prefix||'')}${S.esc(st.firstName)} ${S.esc(st.lastName)}</td>${isCheck?checkCells():''}</tr>`).join('');
      const head=isCheck
        ?`<tr><th class="print-no">เลขที่</th><th class="print-name">ชื่อ–สกุล</th>${checkHeaders()}</tr>`
        :`<tr><th class="print-no">เลขที่</th><th class="print-name">ชื่อ–สกุล</th></tr>`;
      return `<section class="print-room-block"><h2 class="print-room-title">${S.esc(room.level)}/${S.esc(room.room)}</h2><table class="public-print-table ${isCheck?'public-check-table':'public-list-table'}"><thead>${head}</thead><tbody>${rows}</tbody></table></section>`;
    }

    printColors.forEach(teamColor=>{
      const colorName=S.COLORS[teamColor].th;

      if(isTeacher){
        const list=teachers[teamColor]||[],rows=list.map((t,i)=>`<tr><td>${i+1}</td><td>${S.esc(t.prefix||'')}${S.esc(t.firstName)} ${S.esc(t.lastName)}</td><td>${S.esc(t.role||'')}</td></tr>`).join('');
        sections.push(`<section class="print-directory-section public-print-page"><header><h1>รายชื่อครูประจำ${S.esc(colorName)}</h1><p>กีฬาสี ปีการศึกษา 2569 — โรงเรียนบ้านห้วยผึ้ง</p></header><table class="public-print-table public-list-table"><thead><tr><th>ที่</th><th>ชื่อ-สกุล</th><th>หน้าที่</th></tr></thead><tbody>${rows||'<tr><td colspan="3">ยังไม่มีข้อมูล</td></tr>'}</tbody></table></section>`);
        return;
      }

      PRINT_LEVEL_GROUPS.forEach(group=>{
        const rowsData=students
          .filter(st=>st.color===teamColor&&group.levels.includes(st.level)&&selectedRooms.has(roomKey(st)))
          .sort(sortStudents);
        if(!rowsData.length)return;

        const rooms=roomBlocks(rowsData);
        const pages=paginateWholeRooms(rooms);

        pages.forEach((pageRooms,pageIndex)=>{
          sections.push(`<section class="print-directory-section public-print-page compact-group-page"><header><h1>รายชื่อนักเรียน ${S.esc(colorName)}</h1><p>${S.esc(group.label)} · กีฬาสี ปีการศึกษา 2569 — โรงเรียนบ้านห้วยผึ้ง${pages.length>1?` · หน้า ${pageIndex+1}/${pages.length}`:''}</p></header>${pageRooms.map(renderRoom).join('')}</section>`);
        });
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
