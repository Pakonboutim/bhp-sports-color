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
