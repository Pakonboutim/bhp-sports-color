# 📘 คู่มือตั้งค่าระบบแบ่งสีกีฬา — โรงเรียนบ้านห้วยผึ้ง

## ไฟล์ที่ได้รับ
| ไฟล์ | หน้าที่ |
|------|---------|
| `index.html` | เว็บไซต์หลัก — เปิดในเบราว์เซอร์ |
| `Code.gs` | Google Apps Script — วางใน Apps Script Editor |

---

## ขั้นตอนที่ 1 — สร้าง Google Sheet

1. ไปที่ [sheets.google.com](https://sheets.google.com) → สร้าง Spreadsheet ใหม่
2. ตั้งชื่อ เช่น `กีฬาสี 2569 บ้านห้วยผึ้ง`

---

## ขั้นตอนที่ 2 — ตั้งค่า Apps Script

1. เมนู **Extensions → Apps Script**
2. ลบโค้ดเดิมทั้งหมด
3. วางโค้ดจากไฟล์ `Code.gs` ทั้งหมด
4. กด **Save** (Ctrl+S)
5. เลือกฟังก์ชัน `setupSheets` → กด **Run**
   - ระบบจะสร้างชีต "นักเรียน" และ "สีกีฬา" ให้อัตโนมัติ
   - มีข้อมูลตัวอย่างให้ดู (ลบได้)

---

## ขั้นตอนที่ 3 — Deploy เป็น Web App

1. ใน Apps Script → เมนู **Deploy → New deployment**
2. คลิกไอคอน ⚙️ → เลือก **Web app**
3. ตั้งค่า:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. กด **Deploy**
5. **คัดลอก URL** ที่ขึ้นมา (จะเริ่มต้นด้วย `https://script.google.com/macros/s/...`)

> ⚠️ ถ้า Google ขอ permission → กด "Review permissions" → อนุญาต

---

## ขั้นตอนที่ 4 — กรอกข้อมูลนักเรียน

เปิดชีต **"นักเรียน"** กรอกข้อมูลตามโครงสร้าง:

| คอลัม A | B | C | D | E | F |
|---------|---|---|---|---|---|
| รหัสนักเรียน | เลขที่ | ระดับชั้น | ห้อง | ชื่อ | นามสกุล |
| 64001 | 1 | ม.3 | 1 | สมชาย | ใจดี |
| 65001 | 1 | ป.6 | 1 | มณี | แสงทอง |

**หมายเหตุ:**
- ระดับชั้น ต้องเขียนว่า `ป.1` `ป.2` ... `ม.1` `ม.2` ... (มีจุดหลัง ป หรือ ม)
- รหัสนักเรียนต้องไม่ซ้ำกัน (ใช้เลขประจำตัวนักเรียน)

---

## ขั้นตอนที่ 5 — เปิดใช้งานเว็บไซต์

1. เปิดไฟล์ `index.html` ในเบราว์เซอร์ (Chrome แนะนำ)
2. ไปที่แท็บ **⚙️ ตั้งค่า**
3. วาง URL จากขั้นตอนที่ 3 ในช่อง
4. กด **💾 บันทึก URL**
5. กด **🔗 ทดสอบการเชื่อมต่อ** → ต้องขึ้นว่า "เชื่อมต่อสำเร็จ"

---

## วิธีใช้งานประจำวัน

### แบ่งสีนักเรียน
1. แท็บ 🎨 **แบ่งสีนักเรียน**
2. เลือกระดับการศึกษา → ชั้น → ห้อง
3. กด **โหลดรายชื่อ**
4. คลิกวงกลมสีหน้าชื่อนักเรียนแต่ละคน
5. กด **💾 บันทึกสี → Google Sheet**

### ดูสรุป
- แท็บ 📊 **สรุปสี** → กด "รีเฟรชข้อมูล"
- เห็นจำนวนนักเรียนแต่ละสี แบ่งตามห้อง

### พิมพ์รายชื่อ
- แท็บ 🖨️ **พิมพ์รายชื่อ**
- เลือก **รายห้อง** หรือ **รายสี**
- กด **พิมพ์เลย** → ระบบจะเปิด print dialog

---

## ปัญหาที่พบบ่อย

| ปัญหา | วิธีแก้ |
|-------|---------|
| เชื่อมต่อไม่ได้ | ตรวจ URL ว่าถูกต้อง และ Deploy ใหม่อีกครั้ง |
| ไม่พบรายชื่อ | ตรวจสอบชื่อชั้น ว่าตรงกับใน Sheet (ป.1, ม.3) |
| บันทึกไม่ได้ | ตรวจสอบว่า Execute as "Me" และอนุญาต permission แล้ว |
| URL หมดอายุ | Deploy ใหม่ (New deployment) ได้เลย |

---

## Sports Competition Management module

The original student color assignment, teacher summary, print, and administration interface is preserved in `admin.html`. The public entry point is now `index.html`.

### Pages

- `index.html` — read-only sports, recent results, and scoreboard
- `admin.html` — existing administration plus sport CRUD, athlete links, result unlock, and score editing
- `register.html?color=red|yellow|blue|pink` — color-scoped athlete registration
- `referee.html` — score confirmation only
- `bracket.html` — read-only four-color knockout bracket
- `results.html` — read-only confirmed results

### Deployment

1. Replace the deployed Apps Script source with `Code.gs`.
2. Run `setupCompetitionSheets()` once. It adds only `Sports`, `Athletes`, `Matches`, and `AuditLog`; it does not clear existing sheets.
3. Deploy a new Apps Script Web App version using the existing deployment settings.
4. If the Web App URL changes, update `DEFAULT_URL` in `sports.js` and `SCRIPT_URL` in `admin.html`.
5. Host all HTML, CSS, and JS files together so the shared relative asset paths resolve.

The backend supports both the original six-column student sheet and a seven-column layout that includes a title/prefix column.
