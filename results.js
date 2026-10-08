/** Public results table module. */
(async function(){
  const S=Sports,sel=document.getElementById('sport-filter'),body=document.getElementById('result-rows'),summary=document.getElementById('winner-summary');
  const style=document.createElement('style');style.textContent='.result-group-row th{padding:11px 10px;color:var(--primary);background:#E8F0FB;border-top:2px solid var(--primary);font-size:14px}.result-group-row+tr td{border-top:0}.winner-placement{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;padding:7px 9px;border:1px solid var(--border);border-radius:8px;background:#fff;font-size:13px}.winner-placement.runner{margin-top:6px;background:#F8FAFC}.winner-placement b{min-width:0}.winner-placement em{font-style:normal;font-weight:800;color:var(--green);white-space:nowrap}@media(max-width:760px){#result-rows .result-group-row{display:block;border-radius:10px 10px 0 0;padding:0;box-shadow:none}#result-rows .result-group-row th{display:block;border:0;padding:10px 0;text-align:left}#result-rows td:nth-child(4)::before{content:"รองชนะเลิศ"}#result-rows td:nth-child(5)::before{content:"กรรมการ"}#result-rows td:nth-child(6)::before{content:"เวลา"}}';document.head.appendChild(style);
  const heading=document.getElementById('result-winners-title');if(heading)heading.textContent='🏆 ผู้ชนะและรองชนะเลิศ';
  const headerRow=body.closest('table')?.querySelector('thead tr');if(headerRow&&!headerRow.querySelector('.runner-up-head'))headerRow.insertAdjacentHTML('beforeend','<th class="runner-up-head">รองชนะเลิศ</th>');
  try{
    const d=await S.api('getCompetitionData');
    sel.innerHTML='<option value="">ทุกกีฬา</option>'+S.options(d.sports||[]).replace(/^<option[^>]*>.*?<\/option>/,'');
    function draw(){
      const sports=Object.fromEntries((d.sports||[]).map(x=>[x.id,x]));
      const confirmed=(d.matches||[]).filter(m=>m.status==='Confirmed'&&(!sel.value||m.sportId===sel.value));
      const finals=confirmed.filter(m=>m.round==='Final'&&m.winner);
      summary.innerHTML=finals.length?finals.map(m=>`<article class="winner-summary-card"><h3>${S.esc(sports[m.sportId]?.name||m.sportName)}</h3><div class="winner-placement"><span>🥇</span><b>ผู้ชนะ ${S.team(m.winner)}</b><em>${S.esc(m.scoreA)}–${S.esc(m.scoreB)}</em></div><div class="winner-placement runner"><span>🥈</span><b>รองชนะเลิศ ${S.team(m.loser||'ยังไม่ระบุ')}</b><em>รองชนะเลิศ</em></div></article>`).join(''):'<div class="empty-state">ยังไม่มีผลรอบชิงชนะเลิศที่ยืนยัน</div>';
      const resultGroups=[];
      confirmed.forEach(m=>{const key=m.sportId||m.sportName||'unknown';let group=resultGroups.find(x=>x.key===key);if(!group){group={key,name:sports[m.sportId]?.name||m.sportName||'ไม่ระบุรายการ',rows:[]};resultGroups.push(group)}group.rows.push(m)});
      const roundLabels={'Semi Final 1':'รอบรองชนะเลิศ 1','Semi Final 2':'รอบรองชนะเลิศ 2','Final':'รอบชิงชนะเลิศ','Round Robin':'รอบพบกันหมด'};
      body.innerHTML=confirmed.length?resultGroups.map(group=>`<tr class="result-group-row"><th colspan="6">🏅 ${S.esc(group.name)}</th></tr>${group.rows.map(m=>`<tr><td>${S.esc(roundLabels[m.round]||m.round)}<br><small>${S.team(m.teamA)} vs ${S.team(m.teamB)}</small></td><td class="score">${S.esc(m.scoreA)}–${S.esc(m.scoreB)}</td><td>${S.team(m.winner)}</td><td>${S.team(m.loser||'ยังไม่ระบุ')}</td><td>${S.esc(m.referee)}</td><td>${S.esc(m.timestamp)}</td></tr>`).join('')}`).join(''):'<tr><td colspan="6" class="empty-state">ยังไม่มีผลการแข่งขัน</td></tr>';
    }
    sel.onchange=draw;
    draw();
  }catch(e){
    summary.innerHTML=`<div class="empty-state">โหลดสรุปไม่ได้: ${S.esc(e.message)}</div>`;
    body.innerHTML=`<tr><td colspan="5">${S.esc(e.message)}</td></tr>`;
  }
})();
