/** Public results table module. */
(async function(){
  const S=Sports,sel=document.getElementById('sport-filter'),body=document.getElementById('result-rows'),summary=document.getElementById('winner-summary');
  const style=document.createElement('style');style.textContent='.result-group-row th{padding:11px 10px;color:var(--primary);background:#E8F0FB;border-top:2px solid var(--primary);font-size:14px}.result-group-row+tr td{border-top:0}@media(max-width:760px){#result-rows .result-group-row{display:block;border-radius:10px 10px 0 0;padding:0;box-shadow:none}#result-rows .result-group-row th{display:block;border:0;padding:10px 0;text-align:left}}';document.head.appendChild(style);
  try{
    const d=await S.api('getCompetitionData');
    sel.innerHTML='<option value="">ทุกกีฬา</option>'+S.options(d.sports||[]).replace(/^<option[^>]*>.*?<\/option>/,'');
    function draw(){
      const sports=Object.fromEntries((d.sports||[]).map(x=>[x.id,x]));
      const confirmed=(d.matches||[]).filter(m=>m.status==='Confirmed'&&(!sel.value||m.sportId===sel.value));
      const champions=confirmed.filter(m=>m.round==='Final'&&m.winner);
      const grouped={};
      champions.forEach(m=>{const key=m.winner||'unknown';if(!grouped[key])grouped[key]=[];grouped[key].push(m)});
      summary.innerHTML=champions.length?Object.entries(grouped).map(([team,matches])=>`<article class="winner-summary-card"><h3>${S.team(team)}</h3><ul>${matches.map(m=>`<li><span>${S.esc(sports[m.sportId]?.name||m.sportName)}</span><b>${S.esc(m.scoreA)}–${S.esc(m.scoreB)}</b></li>`).join('')}</ul></article>`).join(''):'<div class="empty-state">ยังไม่มีผลรอบชิงชนะเลิศที่ยืนยัน</div>';
      const resultGroups=[];
      confirmed.forEach(m=>{const key=m.sportId||m.sportName||'unknown';let group=resultGroups.find(x=>x.key===key);if(!group){group={key,name:sports[m.sportId]?.name||m.sportName||'ไม่ระบุรายการ',rows:[]};resultGroups.push(group)}group.rows.push(m)});
      const roundLabels={'Semi Final 1':'รอบรองชนะเลิศ 1','Semi Final 2':'รอบรองชนะเลิศ 2','Final':'รอบชิงชนะเลิศ','Round Robin':'รอบพบกันหมด'};
      body.innerHTML=confirmed.length?resultGroups.map(group=>`<tr class="result-group-row"><th colspan="5">🏅 ${S.esc(group.name)}</th></tr>${group.rows.map(m=>`<tr><td>${S.esc(roundLabels[m.round]||m.round)}<br><small>${S.team(m.teamA)} vs ${S.team(m.teamB)}</small></td><td class="score">${S.esc(m.scoreA)}–${S.esc(m.scoreB)}</td><td>${S.team(m.winner)}</td><td>${S.esc(m.referee)}</td><td>${S.esc(m.timestamp)}</td></tr>`).join('')}`).join(''):'<tr><td colspan="5" class="empty-state">ยังไม่มีผลการแข่งขัน</td></tr>';
    }
    sel.onchange=draw;
    draw();
  }catch(e){
    summary.innerHTML=`<div class="empty-state">โหลดสรุปไม่ได้: ${S.esc(e.message)}</div>`;
    body.innerHTML=`<tr><td colspan="5">${S.esc(e.message)}</td></tr>`;
  }
})();
