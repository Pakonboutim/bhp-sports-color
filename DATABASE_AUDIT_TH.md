# ตรวจสอบเว็บเดิม → Supabase Final Database

ตรวจจากไฟล์เว็บเดิมทั้งหมด:
- admin.html
- competition-admin.js / competition-admin-v2.js
- register.js
- staff.js
- referee.js
- public.js
- results.js
- bracket.js
- sports.js
- Code.gs

## ทุก Action เดิมและตำแหน่งข้อมูลใหม่

| Action เดิม | อ่าน/เขียน | Supabase |
|---|---|---|
| getLevels | อ่าน | students(level, room) |
| getStudents | อ่าน | students |
| getAllStudents | อ่าน | students |
| saveColors | UPDATE | students.color + audit_logs |
| getTeachers | อ่าน | teachers |
| getCompetitionData | อ่าน | sports + matches + app_settings |
| getPublicAthletes | อ่าน | athletes |
| getColorStudents | อ่าน | students + sports + athletes + photo_url |
| verifyAdmin | Auth | Supabase Auth + app_user_roles |
| getStaffData | Auth/อ่าน | Auth + app_user_roles + students/teachers/sports/athletes/matches |
| saveSport | INSERT/UPDATE | sports + ensure_matches_for_sport() + audit_logs |
| deleteSport | DELETE | sports; FK cascade ลบ athletes/matches + audit_logs |
| saveAthletes | DELETE+INSERT | replace_athletes() + audit_logs |
| setStaffRegistrationOpen | UPSERT | app_settings + audit_logs |
| updateMatchTeams | UPDATE | matches(team_a/team_b/match_date/match_time) + audit_logs |
| confirmResult | UPDATE | confirm_match_result() + trigger รอบชิง + audit_logs |
| unlockResult | UPDATE | unlock_match_result() + trigger รอบชิง + audit_logs |
| editScore | UPDATE | edit_match_score() + trigger รอบชิง + audit_logs |
| saveStudentPhoto | Storage+UPSERT | Storage athlete-photos + student_photos + athletes.photo_url + audit_logs |
| deleteStudentPhoto | Storage+DELETE | Storage athlete-photos + student_photos + athletes.photo_url + audit_logs |

## ตารางสุดท้าย

1. students
2. teachers
3. sports
4. athletes
5. matches
6. student_photos
7. app_settings
8. audit_logs
9. app_user_roles

ไม่สร้างตาราง `สีกีฬา` แยก เพราะข้อมูลสีอยู่ใน `students.color` โดยตรงแล้ว
และลดปัญหาข้อมูลสีสองที่ไม่ตรงกัน

## Storage

- bucket: `athlete-photos`
- public read
- JPG / PNG / WebP
- จำกัด 1.5 MB ตามระบบเดิม
- upload / replace / delete ผ่าน Edge Function เท่านั้น

## สิทธิ์

- หน้า public: อ่านเฉพาะข้อมูลที่จำเป็น
- เลขประจำตัวนักเรียน (`student_code`) ไม่เปิดให้ anon
- Admin/Staff/Referee/Color Manager ใช้ Supabase Auth
- role/color เก็บใน `app_user_roles`
- secret/service key ห้ามอยู่ใน GitHub Pages

## จุดที่ schema ก่อนหน้าขาดและเติมแล้ว

- app_user_roles สำหรับสิทธิ์ Admin/Staff/Referee/Color Manager
- Storage bucket รูปนักกีฬา
- athletes.photo_url สำหรับหน้า public โหลดเร็วโดยไม่เปิด student_code
- active / created_at / updated_at
- constraint สำหรับสถานะผลและคะแนน
- ฟังก์ชัน replace_athletes แบบ transaction
- ฟังก์ชัน bulk_set_student_colors
- ฟังก์ชัน confirm/unlock/edit score
- trigger rebuild รอบชิงเมื่อผลรอบรองเปลี่ยน
- explicit GRANT สำหรับ Data API รุ่นใหม่
- RLS ครบทุก table ใน public schema
