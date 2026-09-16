/** Admin print upgrade v8: group shortcuts, whole-room pagination, repeated color header. */
(function(){
'use strict';
const GROUPS=[
  {id:'p13',label:'ป.1–ป.3',levels:['ป.1','ป.2','ป.3']},
  {id:'p46',label:'ป.4–ป.6',levels:['ป.4','ป.5','ป.6']},
  {id:'m13',label:'ม.1–ม.3',levels:['ม.1','ม.2','ม.3']},
  {id:'m46',label:'ม.4–ม.6',levels:['ม.4','ม.5','ม.6']}
];
const colorText={red:'สีแดง',yellow:'สีเหลือง',blue:'สีฟ้า',pink:'สีชมพู'};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function addStyle(){if(document.getElementById('admin-print-v8-style'))return;const st=document.createElement('style');st.id='admin-print-v8-style';st.textContent=`@media print{#printArea,#printArea *{font-family:"Angsana New","AngsanaUPC",serif!important;font-size:16pt!important;line-height:1.05!important}.print-room-block{break-inside:avoid!important;page-break-inside:avoid!important;margin:0 0 5px}.print-room-title{font-family:"Angsana New","AngsanaUPC",serif!important;font-size:16pt!important;margin:3px 0 2px;padding:2px 5px;border:1px solid #333;background:#eee}.print-compact-group .portrait-check-table,.print-compact-group .portrait-roster-table,.print-compact-group .portrait-check-table th,.print-compact-group .portrait-check-table td,.print-compact-group .portrait-roster-table th,.print-compact-group .portrait-roster-table td{font-size:16pt!important;line-height:1.05!important}.print-compact-group .portrait-check-table .p-check{width:6mm!important;padding:0!important}.print-compact-group .p-no{width:10mm!important}}`;document.head.appendChild(st)}
function addButtons(){const root=document.getElementById('print-classroom-checks');if(!root)return;const tools=root.parentElement?.querySelector('.print-check-tools');if(!tools||tools.querySelector('[data-admin-print-group]'))return;GROUPS.forEach(g=>{const b=document.createElement('button');b.type='button';b.className='btn';b.dataset.adminPrintGroup=g.id;b.textContent=g.label;b.onclick=()=>{root.querySelectorAll('input').forEach(x=>x.checked=g.levels.includes(String(x.value).split('|')[0]))};tools.appendChild(b)})}
function roomBlocks(rows){const m=new Map();rows.forEach(st=>{const k=st.level+'|'+st.room;if(!m.has(k))m.set(k,{level:st.level,room:st.room,students:[]});m.get(k).students.push(st)});return [...m.values()].sort((a,b)=>String(a.level).localeCompare(String(b.level),'th',{numeric:true})||String(a.room).localeCompare(String(b.room),'th',{numeric:true}))}
function paginate(rooms,checks){const cap=checks?42:46,pages=[];let page=[],used=0;rooms.forEach(r=>{const units=r.students.length+3;if(page.length&&used+units>cap){pages.push(page);page=[];used=0}page.push(r);used+=units});if(page.length)pages.push(page);return pages}
function studentName(s){return `${s.prefix||''}${s.firstName||''} ${s.lastName||''}`.trim()}
window.buildPrintByRoom=function(students,colorFilter='all'){
  addStyle();const colors=colorFilter==='all'?['red','yellow','blue','pink']:[colorFilter],checks=(typeof roomPrintMode!=='undefined'&&roomPrintMode==='check'),pages=[],COLS=10;
  const checkH=Array(COLS).fill(0).map((_,i)=>`<th class="p-check">${i+1}</th>`).join(''),checkC=()=>'<td class="p-check"></td>'.repeat(COLS);
  colors.forEach(color=>GROUPS.forEach(group=>{const rows=students.filter(s=>s.color===color&&group.levels.includes(s.level));if(!rows.length)return;const chunks=paginate(roomBlocks(rows),checks);chunks.forEach((rooms,i)=>pages.push(`<div class="print-page print-portrait-page print-compact-group"><div class="print-header"><h2>รายชื่อนักเรียน ${esc(colorText[color])}</h2><p>${esc(group.label)} · กีฬาสี ปีการศึกษา 2569 — โรงเรียนบ้านห้วยผึ้ง${chunks.length>1?` · หน้า ${i+1}/${chunks.length}`:''}</p></div>${rooms.map(room=>`<section class="print-room-block"><h3 class="print-room-title">${esc(room.level)}/${esc(room.room)}</h3><table class="${checks?'portrait-check-table':'portrait-roster-table'}"><thead><tr><th class="p-no">เลขที่</th><th class="p-name">ชื่อ–สกุล</th>${checks?checkH:''}</tr></thead><tbody>${room.students.sort((a,b)=>Number(a.number||0)-Number(b.number||0)).map(s=>`<tr><td>${esc(s.number||'')}</td><td class="p-name">${esc(studentName(s))}</td>${checks?checkC():''}</tr>`).join('')}</tbody></table></section>`).join('')}</div>`))}));
  const area=document.getElementById('printArea');if(area)area.innerHTML=pages.join('')||'<div class="print-page"><div class="print-header"><h2>ไม่พบข้อมูล</h2></div></div>';
};
addStyle();document.addEventListener('DOMContentLoaded',()=>setTimeout(addButtons,150));const mo=new MutationObserver(addButtons);mo.observe(document.documentElement,{subtree:true,childList:true});
})();
