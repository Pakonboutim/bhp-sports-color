/** Staff dashboard v8: fast session login, color roles, activity attendance, grouped printing. */
(function(){
'use strict';
const S=Sports,params=new URLSearchParams(location.search),color=params.get('color'),team=S.COLORS[color];
let key='',sessionToken=localStorage.getItem(`bhp_staff_session_${color}`)||'',data=null,currentSport='';
const $=id=>document.getElementById(id),genderLabel={Male:'ชาย',Female:'หญิง',Mixed:'ผสม'};
const PRINT_GROUPS=[
  {id:'p13',label:'ป.1–ป.3',levels:['ป.1','ป.2','ป.3']},
  {id:'p46',label:'ป.4–ป.6',levels:['ป.4','ป.5','ป.6']},
  {id:'m13',label:'ม.1–ม.3',levels:['ม.1','ม.2','ม.3']},
  {id:'m46',label:'ม.4–ม.6',levels:['ม.4','ม.5','ม.6']}
];
if(!team){$('staff-login').innerHTML='<div class="notice">ลิงก์ไม่ถูกต้อง ต้องระบุ color เป็น red, yellow, blue หรือ pink</div>';return}
$('staff-banner').classList.add('banner-'+color);$('staff-title').textContent=`STAFF ${team.th}`;
const personName=p=>`${p.prefix||''}${p.firstName||''} ${p.lastName||''}`.trim();
const keyOf=x=>`${x.level}|${x.room}`;
const sortStudents=(a,b)=>String(a.level).localeCompare(String(b.level),'th',{numeric:true})||String(a.room).localeCompare(String(b.room),'th',{numeric:true})||Number(a.number||0)-Number(b.number||0);
const auth=()=>({color,staffKey:key,staffSessionToken:sessionToken});
function keepSession(response){if(response&&response.staffSessionToken){sessionToken=response.staffSessionToken;localStorage.setItem(`bhp_staff_session_${color}`,sessionToken)}}
const athletesFor=id=>(data.athletes||[]).filter(a=>a.sportId===id);
const allowed=(student,sport)=>{const levels=String(sport.level||'').split(',').map(x=>x.trim()),levelOk=!sport.level||sport.level==='ทุกระดับ'||(sport.level==='ประถม'&&student.level.startsWith('ป.'))||(sport.level==='มัธยม'&&student.level.startsWith('ม.'))||levels.includes(student.level),title=student.prefix||'',male=['นาย','เด็กชาย','ด.ช.'].some(x=>title.startsWith(x)),female=['นางสาว','นาง','เด็กหญิง','ด.ญ.'].some(x=>title.startsWith(x)),genderOk=sport.gender==='Mixed'||(sport.gender==='Male'&&male)||(sport.gender==='Female'&&female);return levelOk&&genderOk};

async function loadStaff(payload){
  const result=await S.api('getStaffData',payload,'POST');keepSession(result);data=result;
  $('staff-login').hidden=true;$('staff-app').hidden=false;render();
}
async function login(){
  key=$('staff-key').value.trim();if(!key)return;
  const button=$('staff-login-btn');button.disabled=true;button.textContent='กำลังเข้าสู่ระบบ…';
  try{await loadStaff({color,staffKey:key})}
  catch(e){$('staff-login-error').hidden=false;$('staff-login-error').textContent=e.message}
  finally{button.disabled=false;button.textContent='เข้าสู่ระบบ'}
}
async function autoLogin(){
  if(!sessionToken)return;
  $('staff-login-btn').disabled=true;$('staff-login-btn').textContent='กำลังเปิดเซสชันเดิม…';
  try{await loadStaff({color,staffSessionToken:sessionToken})}
  catch(e){localStorage.removeItem(`bhp_staff_session_${color}`);sessionToken='';$('staff-login-btn').disabled=false;$('staff-login-btn').textContent='เข้าสู่ระบบ'}
}
$('staff-login-btn').onclick=login;$('staff-key').onkeydown=e=>{if(e.key==='Enter')login()};
document.querySelectorAll('.staff-menu button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.staff-menu button,.staff-view').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('staff-'+b.dataset.view).classList.add('active')});

function render(){
  const open=data.staffRegistrationOpen!==false,full=(data.sports||[]).filter(s=>athletesFor(s.id).length>=Number(s.athleteLimit)).length;
  $('staff-status').className='notice '+(open?'staff-open':'staff-closed');
  $('staff-status').textContent=open?'🟢 ระบบเปิดรับ: เพิ่ม ลบ และเปลี่ยนนักกีฬาได้จนกว่าจะครบโควตา':'🔒 แอดมินปิดระบบลงทะเบียนนักกีฬาแล้ว';
  $('staff-overview').innerHTML=`<div class="staff-stat-grid"><article class="sports-card"><strong>${data.students.length}</strong><span>นักเรียนในสี</span></article><article class="sports-card"><strong>${data.teachers.length}</strong><span>ครูประจำสี</span></article><article class="sports-card"><strong>${data.athletes.length}</strong><span>รายการนักกีฬา</span></article><article class="sports-card"><strong>${full}/${data.sports.length}</strong><span>กีฬาที่ลงครบ</span></article></div><h2 class="section-title">สถานะกีฬา</h2><div class="grid grid-2">${data.sports.map(s=>sportCard(s)).join('')}</div>`;
  renderStudents();renderTeachers();renderRoles();renderAttendance();renderRegister();renderAthletes();renderResults();
}
function sportCard(s){const count=athletesFor(s.id).length,max=Number(s.athleteLimit),complete=count>=max;return`<article class="sports-card"><h3>${S.esc(s.name)}</h3><div class="meta"><span class="chip">${S.esc(s.level)}</span><span class="chip">${genderLabel[s.gender]||S.esc(s.gender)}</span></div><div class="quota"><span style="width:${Math.min(100,count/max*100)}%"></span></div><p class="quota-copy ${complete?'complete':''}">${count} / ${max} คน · ${complete?'ครบแล้ว':'เหลือ '+(max-count)+' คน'}</p></article>`}
function rosterTable(items,type){return`<div class="table-wrap"><table class="data-table"><thead><tr><th>ลำดับ</th><th>ชื่อ–สกุล</th><th>${type==='student'?'ชั้น/ห้อง':'หน้าที่'}</th></tr></thead><tbody>${items.map((p,i)=>`<tr><td>${i+1}</td><td>${S.esc(personName(p))}</td><td>${type==='student'?S.esc(p.level+'/'+p.room):S.esc(p.role||'-')}</td></tr>`).join('')}</tbody></table></div>`}

function roomSelectorHtml(rooms,prefix){
  return PRINT_GROUPS.map(g=>{const list=rooms.filter(r=>g.levels.includes(r.level)).sort((a,b)=>a.level.localeCompare(b.level,'th',{numeric:true})||String(a.room).localeCompare(String(b.room),'th',{numeric:true}));return list.length?`<fieldset class="print-check-group"><legend>${g.label}</legend><div class="print-check-grid">${list.map(r=>`<label class="print-room-choice"><input type="checkbox" value="${S.esc(r.key)}" checked><span>${S.esc(r.level)}/${S.esc(r.room)}</span></label>`).join('')}</div></fieldset>`:''}).join('');
}
function bindGroupButtons(root,checks,draw,prefix){
  root.querySelector(`#${prefix}-select-all`).onclick=()=>{checks.querySelectorAll('input').forEach(x=>x.checked=true);draw()};
  root.querySelector(`#${prefix}-select-none`).onclick=()=>{checks.querySelectorAll('input').forEach(x=>x.checked=false);draw()};
  root.querySelectorAll('[data-select-group]').forEach(btn=>btn.onclick=()=>{const g=PRINT_GROUPS.find(x=>x.id===btn.dataset.selectGroup);checks.querySelectorAll('input').forEach(x=>x.checked=g.levels.includes(String(x.value).split('|')[0]));draw()});
}
function groupButtons(){return PRINT_GROUPS.map(g=>`<button type="button" class="secondary" data-select-group="${g.id}">${g.label}</button>`).join('')}

function renderStudents(){
  const root=$('staff-students'),rooms=[...new Map(data.students.filter(x=>x.level&&x.room).map(x=>[keyOf(x),{key:keyOf(x),level:x.level,room:x.room}])).values()];
  root.innerHTML=`<div class="section-head"><h2>นักเรียน${team.th}</h2><button class="secondary" data-print="students">🖨️ พิมพ์</button></div><div class="student-filters"><div class="field"><label>รูปแบบเอกสาร</label><select id="staff-print-style"><option value="list">เฉพาะรายชื่อ — A4 แนวตั้ง</option><option value="check">ตารางเช็คชื่อ 10 ช่อง — A4 แนวตั้ง</option></select></div><div class="field print-classroom-field"><label>ชั้น/ห้องที่ต้องการพิมพ์</label><div class="print-check-tools"><button type="button" class="secondary" id="staff-select-all">เลือกทั้งหมด</button><button type="button" class="secondary" id="staff-select-none">ล้างทั้งหมด</button>${groupButtons()}</div><div id="staff-classroom-checks" class="print-classroom-checks">${roomSelectorHtml(rooms,'staff')}</div></div></div><div id="filtered-students"></div>`;
  const checks=$('staff-classroom-checks'),selected=()=>new Set([...checks.querySelectorAll('input:checked')].map(x=>x.value));
  const draw=()=>{const set=selected(),shown=data.students.filter(x=>set.has(keyOf(x)));$('filtered-students').innerHTML=rosterTable(shown,'student');root.querySelector('[data-print]').onclick=()=>{if(!set.size)return S.toast('กรุณาเลือกอย่างน้อย 1 ชั้น/ห้อง');printStudentGroups(shown,$('staff-print-style').value)}};
  checks.onchange=draw;bindGroupButtons(root,checks,draw,'staff');draw();
}
function renderTeachers(){$('staff-teachers').innerHTML=`<div class="section-head"><h2>ครู${team.th}</h2><button class="secondary" data-print="teachers">🖨️ พิมพ์เช็กชื่อ</button></div>${rosterTable(data.teachers,'teacher')}`;$('staff-teachers').querySelector('[data-print]').onclick=()=>printRoster('รายชื่อครู',data.teachers.map(x=>({name:personName(x),detail:x.role||'-'})))}

function renderRoles(){
  const root=$('staff-roles'),roles=data.colorRoles||[];
  const studentsSorted=data.students.slice().sort(sortStudents);

  const teacherRoleByName=name=>roles.find(x=>x.personType==='teacher'&&x.roleName===name);
  const teacherCommittee=roles.filter(x=>x.personType==='teacher'&&x.roleName==='กรรมการ').sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));
  const studentRoleByName=name=>roles.find(x=>x.personType==='student'&&x.roleName===name);
  const studentCommittee=roles.filter(x=>x.personType==='student'&&x.roleName==='กรรมการ').sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));

  const teacherOptionList=(selected='')=>`<option value="">— เลือกครู —</option>${data.teachers.map(t=>`<option value="${S.esc(t.id)}" ${t.id===selected?'selected':''}>${S.esc(personName(t))}${t.role?` · ${S.esc(t.role)}`:''}</option>`).join('')}`;
  const studentOptionList=(selected='')=>`<option value="">— เลือกนักเรียน —</option>${studentsSorted.map(st=>`<option value="${S.esc(st.id)}" ${st.id===selected?'selected':''}>${S.esc(personName(st))} · ${S.esc(st.level+'/'+st.room)} · เลขที่ ${S.esc(st.number)}</option>`).join('')}`;

  root.innerHTML=`<div class="section-head">
    <div>
      <h2>🎖️ ตำแหน่งใน${team.th}</h2>
      <p class="muted">ครู: 4 ตำแหน่งหลัก + กรรมการไม่จำกัด · นักเรียน: 4 ตำแหน่งหลัก + กรรมการสูงสุด 6 คน</p>
    </div>
    <button class="primary" id="save-color-roles">💾 บันทึก</button>
  </div>

  <h3 class="section-title">ตำแหน่งครู</h3>
  <div class="sports-card">
    <div class="fixed-role-grid">
      <div class="field"><label>ประธานสี</label><select data-teacher-fixed-role="ประธานสี">${teacherOptionList(teacherRoleByName('ประธานสี')?.teacherId||'')}</select></div>
      <div class="field"><label>รองประธานสี</label><select data-teacher-fixed-role="รองประธานสี">${teacherOptionList(teacherRoleByName('รองประธานสี')?.teacherId||'')}</select></div>
      <div class="field"><label>เลขานุการ</label><select data-teacher-fixed-role="เลขานุการ">${teacherOptionList(teacherRoleByName('เลขานุการ')?.teacherId||'')}</select></div>
      <div class="field"><label>เหรัญญิก</label><select data-teacher-fixed-role="เหรัญญิก">${teacherOptionList(teacherRoleByName('เหรัญญิก')?.teacherId||'')}</select></div>
    </div>
    <h4 style="margin:12px 0 8px">กรรมการครู <span class="chip" id="teacher-committee-count">${teacherCommittee.length} คน</span></h4>
    <div class="teacher-committee-list">${data.teachers.map(t=>{
      const checked=teacherCommittee.some(r=>r.teacherId===t.id);
      return`<label class="teacher-committee-choice"><input type="checkbox" data-teacher-committee="${S.esc(t.id)}" ${checked?'checked':''}><span><b>${S.esc(personName(t))}</b>${t.role?`<small>${S.esc(t.role)}</small>`:''}</span></label>`
    }).join('')}</div>
  </div>

  <h3 class="section-title">ตำแหน่งนักเรียน</h3>
  <div class="sports-card">
    <div class="fixed-role-grid">
      <div class="field"><label>ประธานสี</label><select data-student-fixed-role="ประธานสี">${studentOptionList(studentRoleByName('ประธานสี')?.studentId||'')}</select></div>
      <div class="field"><label>รองประธานสี</label><select data-student-fixed-role="รองประธานสี">${studentOptionList(studentRoleByName('รองประธานสี')?.studentId||'')}</select></div>
      <div class="field"><label>เลขานุการ</label><select data-student-fixed-role="เลขานุการ">${studentOptionList(studentRoleByName('เลขานุการ')?.studentId||'')}</select></div>
      <div class="field"><label>เหรัญญิก</label><select data-student-fixed-role="เหรัญญิก">${studentOptionList(studentRoleByName('เหรัญญิก')?.studentId||'')}</select></div>
    </div>
    <h4 style="margin:12px 0 8px">กรรมการนักเรียน <span class="chip" id="student-committee-count">${studentCommittee.length}/6 คน</span></h4>
    <div class="fixed-role-grid">${Array.from({length:6},(_,i)=>`<div class="field"><label>กรรมการ ${i+1}</label><select data-student-committee="${i}">${studentOptionList(studentCommittee[i]?.studentId||'')}</select></div>`).join('')}</div>
  </div>`;

  function validateNoDuplicates(values,message){
    const list=values.filter(Boolean);
    if(new Set(list).size!==list.length){S.toast(message);return false}
    return true;
  }

  function validateRoles(){
    const teacherFixed=[...root.querySelectorAll('[data-teacher-fixed-role]')];
    const teacherCommitteeBoxes=[...root.querySelectorAll('[data-teacher-committee]:checked')];
    const studentFixed=[...root.querySelectorAll('[data-student-fixed-role]')];
    const studentCommitteeSelects=[...root.querySelectorAll('[data-student-committee]')];

    if(teacherFixed.some(x=>!x.value)){S.toast('กรุณาเลือกครูให้ครบ 4 ตำแหน่งหลัก');return false}
    if(studentFixed.some(x=>!x.value)){S.toast('กรุณาเลือกนักเรียนให้ครบ 4 ตำแหน่งหลัก');return false}

    if(!validateNoDuplicates(
      [...teacherFixed.map(x=>x.value),...teacherCommitteeBoxes.map(x=>x.dataset.teacherCommittee)],
      'ครู 1 คนไม่สามารถมีหลายตำแหน่งพร้อมกันได้'
    ))return false;

    if(!validateNoDuplicates(
      [...studentFixed.map(x=>x.value),...studentCommitteeSelects.map(x=>x.value)],
      'นักเรียน 1 คนไม่สามารถมีหลายตำแหน่งพร้อมกันได้'
    ))return false;

    return true;
  }

  root.querySelectorAll('[data-teacher-committee]').forEach(el=>el.onchange=()=>{
    $('teacher-committee-count').textContent=`${root.querySelectorAll('[data-teacher-committee]:checked').length} คน`;
  });

  root.querySelectorAll('[data-student-committee]').forEach(el=>el.onchange=()=>{
    $('student-committee-count').textContent=`${[...root.querySelectorAll('[data-student-committee]')].filter(x=>x.value).length}/6 คน`;
  });

  $('save-color-roles').onclick=async()=>{
    if(!validateRoles())return;
    const btn=$('save-color-roles');btn.disabled=true;btn.textContent='กำลังบันทึก…';
    try{
      const teacherRoles=[];
      [...root.querySelectorAll('[data-teacher-fixed-role]')].forEach((sel,i)=>teacherRoles.push({teacherId:sel.value,roleName:sel.dataset.teacherFixedRole,sortOrder:i}));
      [...root.querySelectorAll('[data-teacher-committee]:checked')].forEach((box,i)=>teacherRoles.push({teacherId:box.dataset.teacherCommittee,roleName:'กรรมการ',sortOrder:4+i}));

      const studentRoles=[];
      [...root.querySelectorAll('[data-student-fixed-role]')].forEach((sel,i)=>studentRoles.push({studentId:sel.value,roleName:sel.dataset.studentFixedRole,sortOrder:i}));
      [...root.querySelectorAll('[data-student-committee]')].filter(x=>x.value).forEach((sel,i)=>studentRoles.push({studentId:sel.value,roleName:'กรรมการ',sortOrder:4+i}));

      const res=await S.api('saveColorRoles',{...auth(),teacherRoles,studentRoles},'POST');
      keepSession(res);S.toast('บันทึกตำแหน่งในสีแล้ว');await refreshStaff('roles');
    }catch(e){
      S.toast(e.message);btn.disabled=false;btn.textContent='💾 บันทึก'
    }
  };
}

function renderAttendance(){
  const root=$('staff-attendance'),days=data.activityDays||[],saved=data.attendance||[];
  if(!days.length){root.innerHTML='<div class="empty-state">ยังไม่ได้กำหนดวันกิจกรรม</div>';return}
  root.innerHTML=`<div class="section-head"><div><h2>✅ เช็คชื่อกิจกรรม</h2><p class="muted">สถานะ: มา / ขาด / ลา</p></div><button class="primary" id="save-attendance">💾 บันทึก</button></div><div class="activity-day-tabs">${days.map((d,i)=>`<button class="secondary activity-day-btn ${i===0?'active':''}" data-day="${d.date}">${S.esc(d.label)}</button>`).join('')}</div><div class="attendance-tools"><button class="secondary" id="attendance-all-present">✓ ตั้งทั้งหมดเป็นมา</button><button class="secondary" id="attendance-clear">ล้างสถานะ</button><span id="attendance-summary"></span></div><div id="attendance-list"></div>`;
  let current=days[0].date;
  const state={};
  saved.forEach(x=>{state[`${x.date}|${x.studentId}`]=x.status});
  function draw(){
    root.querySelectorAll('[data-day]').forEach(b=>b.classList.toggle('active',b.dataset.day===current));
    const groups={};data.students.slice().sort(sortStudents).forEach(st=>{const k=keyOf(st);(groups[k]??=[]).push(st)});
    $('attendance-list').innerHTML=Object.entries(groups).map(([k,rows])=>`<section class="attendance-room"><h3>${S.esc(k.replace('|','/'))}</h3>${rows.map(st=>{const status=state[`${current}|${st.id}`]||'';return`<div class="attendance-row"><span><b>${S.esc(personName(st))}</b><small>เลขที่ ${S.esc(st.number)}</small></span><div class="attendance-status"><button data-att-st="${S.esc(st.id)}" data-status="present" class="${status==='present'?'selected present':''}">มา</button><button data-att-st="${S.esc(st.id)}" data-status="absent" class="${status==='absent'?'selected absent':''}">ขาด</button><button data-att-st="${S.esc(st.id)}" data-status="leave" class="${status==='leave'?'selected leave':''}">ลา</button></div></div>`}).join('')}</section>`).join('');
    $('attendance-list').querySelectorAll('[data-att-st]').forEach(b=>b.onclick=()=>{state[`${current}|${b.dataset.attSt}`]=b.dataset.status;draw()});
    const statuses=data.students.map(st=>state[`${current}|${st.id}`]||'');$('attendance-summary').textContent=`มา ${statuses.filter(x=>x==='present').length} · ขาด ${statuses.filter(x=>x==='absent').length} · ลา ${statuses.filter(x=>x==='leave').length} · ยังไม่เช็ค ${statuses.filter(x=>!x).length}`;
  }
  root.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{current=b.dataset.day;draw()});
  $('attendance-all-present').onclick=()=>{data.students.forEach(st=>state[`${current}|${st.id}`]='present');draw()};
  $('attendance-clear').onclick=()=>{data.students.forEach(st=>delete state[`${current}|${st.id}`]);draw()};
  $('save-attendance').onclick=async()=>{const records=data.students.map(st=>({studentId:st.id,status:state[`${current}|${st.id}`]})).filter(x=>x.status);if(!records.length)return S.toast('ยังไม่มีสถานะที่จะบันทึก');const btn=$('save-attendance');btn.disabled=true;btn.textContent='กำลังบันทึก…';try{const res=await S.api('saveAttendance',{...auth(),date:current,records},'POST');keepSession(res);S.toast(`บันทึกเช็คชื่อ ${res.saved} คนแล้ว`);await refreshStaff('attendance')}catch(e){S.toast(e.message);btn.disabled=false;btn.textContent='💾 บันทึก'}};draw();
}

async function refreshStaff(view){
  const result=await S.api('getStaffData',auth(),'POST');keepSession(result);data=result;render();document.querySelector(`[data-view="${view}"]`)?.click();
}

function renderRegister(){const root=$('staff-register');root.innerHTML=`<h2>ลงทะเบียนนักกีฬา</h2><p class="muted">ระบบแสดงเฉพาะนักเรียนที่ตรงกับสี เพศ และระดับชั้นของกีฬา</p><div class="grid grid-2">${data.sports.map(s=>`<button class="sport-choice" data-sport="${s.id}">${sportCard(s)}</button>`).join('')}</div><div id="staff-picker"></div>`;root.querySelectorAll('[data-sport]').forEach(b=>b.onclick=()=>openPicker(b.dataset.sport))}
function openPicker(id){currentSport=id;const sport=data.sports.find(s=>s.id===id),eligible=data.students.filter(st=>allowed(st,sport)),selected=new Set(athletesFor(id).map(a=>a.studentId)),max=Number(sport.athleteLimit),open=data.staffRegistrationOpen!==false,picker=$('staff-picker');picker.innerHTML=`<article class="sports-card picker"><div class="section-head picker-head"><div><h2>${S.esc(sport.name)}</h2><p>${S.esc(sport.level)} · ${genderLabel[sport.gender]} · รับ ${max} คน</p></div><div class="picker-head-actions"><strong id="picker-count"></strong><button id="staff-save-athletes" class="primary" ${open?'':'disabled'}>💾 บันทึกรายชื่อ</button></div></div><section class="athlete-zone selected-zone"><h3>รายชื่อนักกีฬา <span id="selected-label"></span></h3><div id="selected-athletes" class="athlete-name-grid"></div></section><section class="athlete-zone"><h3>รายชื่อที่ผ่านเงื่อนไข</h3><div id="available-athletes" class="athlete-name-grid"></div></section></article>`;
const nameButton=(st,isSelected)=>`<button type="button" class="athlete-name ${isSelected?'is-selected':''}" data-student="${S.esc(st.id)}" ${open?'':'disabled'}><span>${isSelected?'✓':'+'}</span><b>${S.esc(personName(st))}</b><small>${S.esc(st.level+'/'+st.room)} · เลขที่ ${S.esc(st.number)}</small></button>`;
const drawPicker=()=>{const chosen=eligible.filter(st=>selected.has(st.id)),available=eligible.filter(st=>!selected.has(st.id)),full=selected.size>=max;$('picker-count').textContent=`${selected.size}/${max}`;$('selected-label').textContent=`(${selected.size}/${max} คน)`;$('selected-athletes').innerHTML=chosen.map(st=>nameButton(st,true)).join('')||'<div class="empty-state">ยังไม่ได้เลือก</div>';$('available-athletes').innerHTML=available.map(st=>nameButton(st,false)).join('')||'<div class="empty-state">ไม่มีรายชื่อ</div>';picker.querySelectorAll('[data-student]').forEach(button=>{const isSelected=selected.has(button.dataset.student);button.disabled=!open||(!isSelected&&full);button.onclick=()=>{if(isSelected)selected.delete(button.dataset.student);else if(selected.size<max)selected.add(button.dataset.student);else return S.toast(`รับได้ไม่เกิน ${max} คน`);drawPicker()}})};drawPicker();
$('staff-save-athletes').onclick=async()=>{const button=$('staff-save-athletes');button.disabled=true;button.textContent='กำลังบันทึก…';try{const response=await S.api('saveAthletes',{...auth(),sportId:id,studentIds:[...selected],userType:'Staff'},'POST');keepSession(response);S.toast('บันทึกรายชื่อนักกีฬาแล้ว');await refreshStaff('register');openPicker(id)}catch(e){S.toast(e.message);button.disabled=false;button.textContent='💾 บันทึกรายชื่อ'}}}

function renderAthletes(){const root=$('staff-athletes');root.innerHTML=`<div class="section-head"><h2>รายชื่อนักกีฬา</h2><button class="secondary" id="print-all-athletes">🖨️ พิมพ์ทุกกีฬา</button></div><div class="grid grid-2">${data.sports.map(s=>{const rows=athletesFor(s.id);return`<article class="sports-card"><div class="section-head"><div><h3>${S.esc(s.name)}</h3><p>${rows.length}/${s.athleteLimit} คน</p></div><button class="secondary" data-print-sport="${s.id}">พิมพ์</button></div>${rows.map(a=>`<div class="public-person"><span>${S.esc(a.studentName)}<small class="person-role">${S.esc(a.levelRoom)}</small></span></div>`).join('')||'<div class="empty-state">ยังไม่มีรายชื่อ</div>'}</article>`}).join('')}</div>`;root.querySelectorAll('[data-print-sport]').forEach(b=>b.onclick=()=>printSports([b.dataset.printSport]));$('print-all-athletes').onclick=()=>printSports(data.sports.map(s=>s.id))}
function renderResults(){$('staff-results').innerHTML=`<h2>ผลการแข่งขันของทีม</h2><div class="grid">${data.matches.map(m=>`<article class="sports-card"><h3>${S.esc(m.sportName)} · ${S.esc(m.round)}</h3><p>${S.team(m.teamA)} <b>${m.scoreA===''?'–':m.scoreA+' – '+m.scoreB}</b> ${S.team(m.teamB)}</p></article>`).join('')||'<div class="empty-state">ยังไม่มีคู่แข่งขันของทีมนี้</div>'}`}

function checkHeaders(){return Array.from({length:10},(_,i)=>`<th class="print-check">${i+1}</th>`).join('')}
function checkCells(){return'<td class="print-check"></td>'.repeat(10)}
function roomBlocks(rows){const m=new Map();rows.forEach(st=>{const k=keyOf(st);if(!m.has(k))m.set(k,{level:st.level,room:st.room,students:[]});m.get(k).students.push(st)});return [...m.values()].sort((a,b)=>String(a.level).localeCompare(String(b.level),'th',{numeric:true})||String(a.room).localeCompare(String(b.room),'th',{numeric:true}))}
function paginateRooms(rooms,mode){const cap=mode==='check'?42:46,pages=[];let page=[],used=0;rooms.forEach(room=>{const units=room.students.length+3;if(page.length&&used+units>cap){pages.push(page);page=[];used=0}page.push(room);used+=units});if(page.length)pages.push(page);return pages}
function renderPrintRoom(room,mode){const checks=mode==='check';return`<section class="print-room-block"><h2 class="print-room-title">${S.esc(room.level)}/${S.esc(room.room)}</h2><table class="staff-print-table ${checks?'staff-check-table':'staff-list-table'}"><thead><tr><th class="print-no">เลขที่</th><th>ชื่อ–สกุล</th>${checks?checkHeaders():''}</tr></thead><tbody>${room.students.sort(sortStudents).map(st=>`<tr><td>${S.esc(st.number||'')}</td><td>${S.esc(personName(st))}</td>${checks?checkCells():''}</tr>`).join('')}</tbody></table></section>`}
function printStudentGroups(students,mode='check'){const sections=[];PRINT_GROUPS.forEach(g=>{const rows=students.filter(x=>g.levels.includes(x.level));if(!rows.length)return;const pages=paginateRooms(roomBlocks(rows),mode);pages.forEach((rooms,i)=>sections.push(`<section class="staff-print-section staff-print-page"><header><h1>รายชื่อนักเรียน ${S.esc(team.th)}</h1><p>${S.esc(g.label)} · กีฬาโรงเรียนบ้านห้วยผึ้ง ปีการศึกษา 2569${pages.length>1?` · หน้า ${i+1}/${pages.length}`:''}</p></header>${rooms.map(r=>renderPrintRoom(r,mode)).join('')}</section>`))});doPrint(sections.join(''))}
function printSection(title,rows){return`<section class="staff-print-section staff-print-page"><header><h1>${S.esc(title)} ${S.esc(team.th)}</h1><p>กีฬาโรงเรียนบ้านห้วยผึ้ง ปีการศึกษา 2569</p></header><table class="staff-print-table staff-check-table"><thead><tr><th>ที่</th><th>ชื่อ–สกุล</th><th>ชั้น/หน้าที่</th>${checkHeaders()}</tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${S.esc(r.name)}</td><td>${S.esc(r.detail)}</td>${checkCells()}</tr>`).join('')}</tbody></table></section>`}
function doPrint(html){$('staff-print-area').innerHTML=html;document.body.classList.add('staff-printing');window.onafterprint=()=>document.body.classList.remove('staff-printing');setTimeout(()=>window.print(),80)}
function printRoster(title,rows){doPrint(printSection(title,rows))}
function printSports(ids){doPrint(ids.map(id=>{const s=data.sports.find(x=>x.id===id);return printSection('รายชื่อนักกีฬา '+s.name,athletesFor(id).map(a=>({name:a.studentName,detail:a.levelRoom}))) }).join(''))}

autoLogin();
})();
