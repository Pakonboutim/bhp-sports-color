/**
 * BHP Sports Day Google Apps Script backend.
 * Existing color-assignment endpoints are retained; competition endpoints are additive.
 */
const SHEET_NAME_STUDENTS='นักเรียน';
const SHEET_NAME_COLORS='สีกีฬา';
const SHEET_NAME_TEACHERS='ครูกีฬาสี';
const SPORTS_SHEET='Sports';
const ATHLETES_SHEET='Athletes';
const MATCHES_SHEET='Matches';
const AUDIT_SHEET='AuditLog';
const COLORS=['red','yellow','blue','pink'];
const HEADERS={
  Sports:['SportId','Name','Level','Gender','AthleteLimit','Type','Active','UpdatedAt','TeamFormat'],
  Athletes:['SportId','Color','StudentId','StudentName','LevelRoom','UpdatedAt'],
  Matches:['MatchId','SportId','SportName','Round','TeamA','TeamB','ScoreA','ScoreB','Winner','Loser','Referee','Timestamp','Status'],
  AuditLog:['Time','Action','UserType','Details']
};

function doGet(e){const p=e&&e.parameter?e.parameter:{},a=p.action||'';try{let r;if(a==='getStudents')r=getStudents(p.level,p.room);else if(a==='getLevels')r=getLevels();else if(a==='getAllStudents')r=getAllStudents();else if(a==='getTeachers')r=getTeachers();else if(a==='getCompetitionData')r=getCompetitionData();else if(a==='getColorStudents')r=getColorStudents(p.color,p.sportId);else if(!a)r={status:'BHP Sports Day API is running'};else throw new Error('Unknown action: '+a);return json_(r)}catch(err){return json_({error:err.message})}}
function doPost(e){try{const p=JSON.parse(e.postData.contents||'{}'),a=p.action;let r;if(a==='saveColors')r=saveColors(p.students);else if(a==='saveSport')r=saveSport(p.sport,p.userType);else if(a==='deleteSport')r=deleteSport(p.sportId,p.userType);else if(a==='saveAthletes')r=saveAthletes(p.sportId,p.color,p.studentIds,p.userType);else if(a==='confirmResult')r=confirmResult(p);else if(a==='unlockResult')r=unlockResult(p.matchId,p.userType);else if(a==='editScore')r=editScore(p);else throw new Error('Unknown action: '+a);return json_(r)}catch(err){return json_({error:err.message})}}
function json_(v){return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON)}
function sheet_(name,headers){const ss=SpreadsheetApp.getActiveSpreadsheet();let sh=ss.getSheetByName(name);if(!sh){sh=ss.insertSheet(name);if(headers)sh.getRange(1,1,1,headers.length).setValues([headers]);sh.setFrozenRows(1)}return sh}
function rows_(sh){const v=sh.getDataRange().getValues();return v.length>1?v.slice(1):[]}
function now_(){return Utilities.formatDate(new Date(),Session.getScriptTimeZone()||'Asia/Bangkok','yyyy-MM-dd HH:mm:ss')}
function id_(prefix){return prefix+'-'+Utilities.getUuid().slice(0,8)}
function audit_(action,userType,details){sheet_(AUDIT_SHEET,HEADERS.AuditLog).appendRow([new Date(),action,userType||'System',typeof details==='string'?details:JSON.stringify(details)])}

/** Existing color assignment module. */
function colorMap_(){const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_COLORS),map={};if(!sh)return map;rows_(sh).forEach(r=>{const id=String(r[0]||'').trim();if(id)map[id]=String(r[1]||'').trim()});return map}
/** Resolve student columns from their headers so existing Sheet layouts remain compatible. */
function studentColumns_(header){
  const normalized=header.map(v=>String(v||'').trim().toLowerCase().replace(/[\s_\-\/]/g,''));
  const find=aliases=>{for(let i=0;i<normalized.length;i++)if(aliases.indexOf(normalized[i])>=0)return i;return-1};
  const columns={
    id:find(['รหัสนักเรียน','รหัสประจำตัว','เลขประจำตัว','เลขประจำตัวนักเรียน','studentid','id']),
    number:find(['เลขที่','ที่','number','no']),
    prefix:find(['คำนำหน้า','คำนำหน้านาม','prefix','title']),
    firstName:find(['ชื่อ','ชื่อจริง','firstname','name']),
    lastName:find(['นามสกุล','สกุล','lastname','surname']),
    level:find(['ระดับชั้น','ชั้น','ชั้นเรียน','level','grade']),
    room:find(['ห้อง','ห้องเรียน','room']),
    color:find(['สี','สีกีฬา','color','team'])
  };
  // Original six-column template: ID, number, level, room, first name, last name.
  if(columns.id<0)columns.id=0;
  if(columns.number<0)columns.number=1;
  if(columns.level<0)columns.level=2;
  if(columns.room<0)columns.room=3;
  if(columns.firstName<0)columns.firstName=4;
  if(columns.lastName<0)columns.lastName=5;
  return columns;
}
function studentObjects_(){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_STUDENTS);
  if(!sh)throw new Error('ไม่พบชีต '+SHEET_NAME_STUDENTS);
  const values=sh.getDataRange().getValues(),columns=studentColumns_(values[0]||[]),colors=colorMap_();
  return values.slice(1).map((r,i)=>{
    const id=String(r[columns.id]||'').trim();
    const inlineColor=columns.color>=0?String(r[columns.color]||'').trim():'';
    return{id:id,number:String(r[columns.number]||'').trim(),level:String(r[columns.level]||'').trim(),room:String(r[columns.room]||'').trim(),prefix:columns.prefix>=0?String(r[columns.prefix]||'').trim():'',firstName:String(r[columns.firstName]||'').trim(),lastName:String(r[columns.lastName]||'').trim(),color:inlineColor||colors[id]||'',rowIndex:i+2};
  }).filter(s=>s.id);
}
function getLevels(){const map={};studentObjects_().forEach(s=>{if(!s.level||!s.room)return;if(!map[s.level])map[s.level]=[];if(map[s.level].indexOf(s.room)<0)map[s.level].push(s.room)});Object.keys(map).forEach(k=>map[k].sort());return{levels:map}}
function getStudents(level,room){if(!level||!room)throw new Error('กรุณาระบุ level และ room');return{students:studentObjects_().filter(s=>s.level===level&&s.room===room).sort((a,b)=>Number(a.number)-Number(b.number))}}
function getAllStudents(){return{students:studentObjects_()}}
function saveColors(students){
  if(!Array.isArray(students)||!students.length)throw new Error('ไม่มีข้อมูลที่จะบันทึก');
  const ss=SpreadsheetApp.getActiveSpreadsheet(),studentSheet=ss.getSheetByName(SHEET_NAME_STUDENTS);
  if(!studentSheet)throw new Error('ไม่พบชีต '+SHEET_NAME_STUDENTS);
  const studentValues=studentSheet.getDataRange().getValues(),columns=studentColumns_(studentValues[0]||[]),byId={};
  students.forEach(s=>byId[String(s.id)]=s);
  // Preserve the original inline color column when it exists in the student sheet.
  if(columns.color>=0){
    const inlineColors=studentValues.slice(1).map(r=>{
      const s=byId[String(r[columns.id]||'').trim()];
      return[s?s.color||'':r[columns.color]||''];
    });
    if(inlineColors.length)studentSheet.getRange(2,columns.color+1,inlineColors.length,1).setValues(inlineColors);
  }
  // Keep the separate color sheet in sync for backward compatibility.
  const sh=sheet_(SHEET_NAME_COLORS,['รหัสนักเรียน','สีกีฬา','ชื่อ-สกุล','ระดับชั้น/ห้อง']),index={};
  rows_(sh).forEach((r,i)=>index[String(r[0]||'').trim()]=i+2);
  students.forEach(s=>{if(index[s.id])sh.getRange(index[s.id],2).setValue(s.color||'');else sh.appendRow([s.id,s.color||'',((s.prefix||'')+(s.firstName||'')+' '+(s.lastName||'')).trim(),(s.level||'')+'/'+(s.room||'')])});
  audit_('SAVE_COLORS','Admin',{count:students.length});
  return{success:true,saved:students.length};
}
function getTeachers(){const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_TEACHERS),teachers={red:[],yellow:[],blue:[],pink:[]};if(!sh)return{teachers:teachers};rows_(sh).forEach(r=>{const c=String(r[0]||'').toLowerCase();if(teachers[c])teachers[c].push({prefix:String(r[1]||''),firstName:String(r[2]||''),lastName:String(r[3]||''),role:String(r[4]||'')})});return{teachers:teachers}}

/** Competition read model shared by all pages. */
function getCompetitionData(){setupCompetitionSheets();const sports=rows_(sheet_(SPORTS_SHEET,HEADERS.Sports)).filter(r=>String(r[6])!=='false'&&r[0]).map(r=>({id:String(r[0]),name:String(r[1]),level:String(r[2]),gender:String(r[3]),athleteLimit:Number(r[4]),type:String(r[5]),active:r[6]!==false,updatedAt:String(r[7]||''),teamFormat:String(r[8]||'Standard4')}));const matches=rows_(sheet_(MATCHES_SHEET,HEADERS.Matches)).filter(r=>r[0]).map(r=>({id:String(r[0]),sportId:String(r[1]),sportName:String(r[2]),round:String(r[3]),teamA:String(r[4]),teamB:String(r[5]),scoreA:r[6]===''?'':Number(r[6]),scoreB:r[7]===''?'':Number(r[7]),winner:String(r[8]||''),loser:String(r[9]||''),referee:String(r[10]||''),timestamp:String(r[11]||''),status:String(r[12]||'Pending')}));return{sports:sports,matches:matches}}

/** Admin sports module. */
function saveSport(sport,userType){if(!sport||!String(sport.name||'').trim())throw new Error('กรุณาระบุชื่อกีฬา');let teamFormat=String(sport.teamFormat||'Standard4');if(['Standard4','UpperMaleCombined2'].indexOf(teamFormat)<0)throw new Error('รูปแบบทีมไม่ถูกต้อง');if(teamFormat==='UpperMaleCombined2'){sport.gender='Male';sport.level='ม.4,ม.5,ม.6';sport.type='Knockout'}if(['Male','Female','Mixed'].indexOf(sport.gender)<0)throw new Error('เพศไม่ถูกต้อง');if(['Knockout','Round Robin'].indexOf(sport.type)<0)throw new Error('ประเภทการแข่งขันไม่ถูกต้อง');const limit=Number(sport.athleteLimit);if(!Number.isInteger(limit)||limit<1)throw new Error('จำนวนนักกีฬาต้องมากกว่า 0');const lock=LockService.getScriptLock();lock.waitLock(10000);try{const sh=sheet_(SPORTS_SHEET,HEADERS.Sports),all=rows_(sh),id=sport.id||id_('SP'),idx=all.findIndex(r=>String(r[0])===id),row=[id,String(sport.name).trim(),String(sport.level||''),sport.gender,limit,sport.type,true,now_(),teamFormat];if(idx>=0&&(String(all[idx][5])!==sport.type||String(all[idx][8]||'Standard4')!==teamFormat))throw new Error('ไม่สามารถเปลี่ยนประเภทการแข่งขันหรือรูปแบบทีมหลังสร้างตารางแข่งแล้ว กรุณาสร้างกีฬาใหม่');if(idx>=0)sh.getRange(idx+2,1,1,row.length).setValues([row]);else sh.appendRow(row);createMatches_(id,row[1],sport.type,teamFormat);audit_(idx>=0?'UPDATE_SPORT':'CREATE_SPORT',userType||'Admin',{sportId:id,name:row[1],teamFormat:teamFormat});return{success:true,sportId:id}}finally{lock.releaseLock()}}
function createMatches_(sportId,name,type,teamFormat){const sh=sheet_(MATCHES_SHEET,HEADERS.Matches),existing=rows_(sh).some(r=>String(r[1])===sportId);if(existing)return;const blank=(round,a,b)=>[id_('MT'),sportId,name,round,a,b,'','','','','','','Pending'];if(teamFormat==='UpperMaleCombined2'){sh.appendRow(blank('Final','yellow-blue','pink-red'))}else if(type==='Knockout'){sh.appendRow(blank('Semi Final 1','red','yellow'));sh.appendRow(blank('Semi Final 2','blue','pink'));sh.appendRow(blank('Final','',''))}else{for(let i=0;i<COLORS.length;i++)for(let j=i+1;j<COLORS.length;j++)sh.appendRow(blank('Round Robin',COLORS[i],COLORS[j]))}}
function deleteSport(sportId,userType){if(!sportId)throw new Error('ไม่พบกีฬา');const lock=LockService.getScriptLock();lock.waitLock(10000);try{deleteRowsBy_(sheet_(SPORTS_SHEET,HEADERS.Sports),0,sportId);deleteRowsBy_(sheet_(ATHLETES_SHEET,HEADERS.Athletes),0,sportId);deleteRowsBy_(sheet_(MATCHES_SHEET,HEADERS.Matches),1,sportId);audit_('DELETE_SPORT',userType||'Admin',{sportId:sportId});return{success:true}}finally{lock.releaseLock()}}
function deleteRowsBy_(sh,col,value){for(let i=sh.getLastRow();i>=2;i--)if(String(sh.getRange(i,col+1).getValue())===String(value))sh.deleteRow(i)}

/** Color-manager athlete module; server enforces URL color scope and limit. */
/** Convert the saved sport level setting into allowed student levels. */
function sportAllowsLevel_(setting,level){const value=String(setting||'').trim();if(!value||value==='ทุกระดับ')return true;if(value==='ประถม')return String(level).indexOf('ป.')===0;if(value==='มัธยม')return String(level).indexOf('ม.')===0;return value.split(',').map(x=>x.trim()).indexOf(String(level).trim())>=0}
/** Match the student's title against the sport's Male/Female/Mixed setting. */
function sportAllowsGender_(setting,prefix){const gender=String(setting||'Mixed'),title=String(prefix||'').trim();if(gender==='Mixed')return true;const male=['นาย','เด็กชาย','ด.ช.'].some(x=>title.indexOf(x)===0),female=['นางสาว','นาง','เด็กหญิง','ด.ญ.'].some(x=>title.indexOf(x)===0);return gender==='Male'?male:gender==='Female'?female:true}
function getColorStudents(color,sportId){if(COLORS.indexOf(color)<0)throw new Error('สีไม่ถูกต้อง');const sports=getCompetitionData().sports,sport=sports.find(s=>s.id===sportId);if(!sport)throw new Error('ไม่พบกีฬา');const students=studentObjects_().filter(s=>s.color===color&&sportAllowsLevel_(sport.level,s.level)&&sportAllowsGender_(sport.gender,s.prefix));const selectedIds=rows_(sheet_(ATHLETES_SHEET,HEADERS.Athletes)).filter(r=>String(r[0])===sportId&&String(r[1])===color).map(r=>String(r[2]));return{students:students,selectedIds:selectedIds,limit:sport.athleteLimit,levels:sport.level,gender:sport.gender}}
function saveAthletes(sportId,color,studentIds,userType){if(COLORS.indexOf(color)<0)throw new Error('สีไม่ถูกต้อง');if(!Array.isArray(studentIds))throw new Error('ข้อมูลนักกีฬาไม่ถูกต้อง');const sport=getCompetitionData().sports.find(s=>s.id===sportId);if(!sport)throw new Error('ไม่พบกีฬา');if(studentIds.length>sport.athleteLimit)throw new Error('นักกีฬาเกินจำนวนที่กำหนด');const allowed=studentObjects_().filter(s=>s.color===color&&sportAllowsLevel_(sport.level,s.level)&&sportAllowsGender_(sport.gender,s.prefix)),map={};allowed.forEach(s=>map[s.id]=s);studentIds.forEach(id=>{if(!map[String(id)])throw new Error('พบนักเรียนที่ไม่ตรงกับสี เพศ หรือระดับชั้นของกีฬา')});const lock=LockService.getScriptLock();lock.waitLock(10000);try{const sh=sheet_(ATHLETES_SHEET,HEADERS.Athletes);for(let i=sh.getLastRow();i>=2;i--){const r=sh.getRange(i,1,1,2).getValues()[0];if(String(r[0])===sportId&&String(r[1])===color)sh.deleteRow(i)}studentIds.forEach(id=>{const s=map[String(id)];sh.appendRow([sportId,color,s.id,(s.prefix||'')+s.firstName+' '+s.lastName,s.level+'/'+s.room,now_()])});audit_('SAVE_ATHLETES',userType||'Color Manager',{sportId:sportId,color:color,levels:sport.level,gender:sport.gender,count:studentIds.length});return{success:true,saved:studentIds.length}}finally{lock.releaseLock()}}

/** Referee result module. Confirmation is locked and advances the final immediately. */
function matchRow_(matchId){const sh=sheet_(MATCHES_SHEET,HEADERS.Matches),data=rows_(sh),idx=data.findIndex(r=>String(r[0])===String(matchId));if(idx<0)throw new Error('ไม่พบการแข่งขัน');return{sheet:sh,row:idx+2,values:data[idx]}}
function confirmResult(p){const a=Number(p.scoreA),b=Number(p.scoreB);if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<0||a===b)throw new Error('คะแนนไม่ถูกต้องหรือเสมอกัน');if(!String(p.referee||'').trim())throw new Error('กรุณาระบุชื่อกรรมการ');const lock=LockService.getScriptLock();lock.waitLock(10000);try{const m=matchRow_(p.matchId),r=m.values;if(String(r[12])==='Confirmed')throw new Error('ผลการแข่งขันถูกยืนยันแล้ว');if(!r[4]||!r[5])throw new Error('ยังไม่ทราบคู่แข่งขัน');const winner=a>b?String(r[4]):String(r[5]),loser=a>b?String(r[5]):String(r[4]),stamp=now_();m.sheet.getRange(m.row,7,1,7).setValues([[a,b,winner,loser,String(p.referee).trim(),stamp,'Confirmed']]);advanceBracket_(String(r[1]),String(r[3]),winner);audit_('CONFIRM_RESULT',p.userType||'Referee',{matchId:p.matchId,referee:p.referee,winner:winner,loser:loser,score:a+'-'+b,status:'Confirmed'});return{success:true,winner:winner,loser:loser,status:'Confirmed',timestamp:stamp}}finally{lock.releaseLock()}}
function advanceBracket_(sportId,round,winner){if(round!=='Semi Final 1'&&round!=='Semi Final 2')return;const sh=sheet_(MATCHES_SHEET,HEADERS.Matches),data=rows_(sh),finalIdx=data.findIndex(r=>String(r[1])===sportId&&String(r[3])==='Final');if(finalIdx<0)return;sh.getRange(finalIdx+2,round==='Semi Final 1'?5:6).setValue(winner)}
function unlockResult(matchId,userType){const m=matchRow_(matchId),r=m.values;m.sheet.getRange(m.row,7,1,7).setValues([['','','','','','','Pending']]);if(String(r[3]).indexOf('Semi Final')===0){const data=rows_(m.sheet),fi=data.findIndex(x=>String(x[1])===String(r[1])&&String(x[3])==='Final');if(fi>=0){m.sheet.getRange(fi+2,5,1,9).setValues([['','','','','','','','','Pending']])}}audit_('UNLOCK_RESULT',userType||'Admin',{matchId:matchId});return{success:true}}
function editScore(p){const a=Number(p.scoreA),b=Number(p.scoreB);if(a<0||b<0||a===b)throw new Error('คะแนนไม่ถูกต้อง');const m=matchRow_(p.matchId),r=m.values;if(String(r[12])!=='Confirmed')throw new Error('แก้คะแนนได้เฉพาะผลที่ยืนยันแล้ว');const winner=a>b?String(r[4]):String(r[5]),loser=a>b?String(r[5]):String(r[4]);m.sheet.getRange(m.row,7,1,4).setValues([[a,b,winner,loser]]);advanceBracket_(String(r[1]),String(r[3]),winner);audit_('EDIT_SCORE',p.userType||'Admin',{matchId:p.matchId,score:a+'-'+b,winner:winner});return{success:true,winner:winner}}

/** Additive setup: never clears or replaces an existing sheet. */
function setupCompetitionSheets(){const sports=sheet_(SPORTS_SHEET,HEADERS.Sports);if(sports.getLastColumn()<HEADERS.Sports.length)sports.getRange(1,1,1,HEADERS.Sports.length).setValues([HEADERS.Sports]);sheet_(ATHLETES_SHEET,HEADERS.Athletes);sheet_(MATCHES_SHEET,HEADERS.Matches);sheet_(AUDIT_SHEET,HEADERS.AuditLog);return{success:true}}
function setupSheets(){const ss=SpreadsheetApp.getActiveSpreadsheet();if(!ss.getSheetByName(SHEET_NAME_STUDENTS)){const sh=ss.insertSheet(SHEET_NAME_STUDENTS);sh.getRange(1,1,1,7).setValues([['รหัสนักเรียน','เลขที่','ระดับชั้น','ห้อง','คำนำหน้า','ชื่อ','นามสกุล']]);sh.setFrozenRows(1)}if(!ss.getSheetByName(SHEET_NAME_COLORS)){const sh=ss.insertSheet(SHEET_NAME_COLORS);sh.getRange(1,1,1,4).setValues([['รหัสนักเรียน','สีกีฬา','ชื่อ-สกุล','ระดับชั้น/ห้อง']]);sh.setFrozenRows(1)}setupCompetitionSheets();SpreadsheetApp.getUi().alert('สร้างชีตที่จำเป็นเรียบร้อยแล้ว โดยไม่ลบข้อมูลเดิม')}
