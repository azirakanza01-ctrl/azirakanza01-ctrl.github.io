const DEMO_STUDENTS = [
  {id:1,name:"Aisyah Rahma",kelas:"SMP 8",group:"Maryam"},
  {id:2,name:"Rafi Akbar",kelas:"MA 10",group:"Al-Kindi"},
  {id:3,name:"Naila Putri",kelas:"SMP 9",group:"Maryam"},
  {id:4,name:"Faris Maulana",kelas:"MA 11",group:"Ibnu Sina"},
  {id:5,name:"Zahra Nadhifa",kelas:"SMP 7",group:"Al-Farabi"},
  {id:6,name:"Ahmad Fikri",kelas:"MA 12",group:"Al-Kindi"},
  {id:7,name:"Hana Safira",kelas:"SMP 8",group:"Ibnu Sina"},
  {id:8,name:"Rayyan Malik",kelas:"MA 10",group:"Al-Farabi"},
  {id:9,name:"Salma Azzahra",kelas:"SMP 9",group:"Maryam"},
  {id:10,name:"Daffa Rizki",kelas:"SMP 7",group:"Al-Kindi"},
  {id:11,name:"Naufal Hadi",kelas:"MA 11",group:"Ibnu Sina"},
  {id:12,name:"Kirana Zahwa",kelas:"MA 12",group:"Al-Farabi"}
];
const DEMO_SUBMISSIONS = [
  {id:101,student:"Aisyah Rahma",date:todayISO(),surah:"Ar-Rahman",start:1,end:8,method:"Individual",evaluation:"Baik — lanjut sesuai target",followup:"Lanjut sesuai target pekan ini."},
  {id:102,student:"Rafi Akbar",date:todayISO(),surah:"Al-Mulk",start:1,end:5,method:"Halaqah",evaluation:"Perlu pengulangan pada beberapa ayat",followup:"Ulangi ayat 4–5 sebelum setoran berikutnya."},
  {id:103,student:"Naila Putri",date:todayISO(),surah:"Maryam",start:12,end:18,method:"Individual",evaluation:"Perlu penguatan tajwid dan makhraj",followup:"Fokus pada ketepatan makhraj."},
  {id:104,student:"Faris Maulana",date:todayISO(),surah:"Al-Kahf",start:1,end:7,method:"Individual",evaluation:"Baik — lanjut sesuai target",followup:"Murajaah mandiri sesuai arahan pembimbing."},
  {id:105,student:"Zahra Nadhifa",date:todayISO(),surah:"Juz Amma",start:1,end:6,method:"Halaqah",evaluation:"Baik — lanjut sesuai target",followup:"Jaga kelancaran hafalan."},
  {id:106,student:"Ahmad Fikri",date:todayISO(),surah:"Al-Baqarah",start:255,end:257,method:"Individual",evaluation:"Perlu pengulangan pada beberapa ayat",followup:"Ulangi bagian yang masih tertukar."},
  {id:107,student:"Hana Safira",date:todayISO(),surah:"Al-Mulk",start:1,end:10,method:"Individual",evaluation:"Baik — lanjut sesuai target",followup:"Pertahankan konsistensi."},
  {id:108,student:"Rayyan Malik",date:todayISO(),surah:"Ar-Rahman",start:1,end:7,method:"Individual",evaluation:"Baik — lanjut sesuai target",followup:"Lanjut sesuai target pekan ini."}
];
function todayISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
function loadStore(key,fallback){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch{return fallback}}
let students=loadStore("tt_students_v1",DEMO_STUDENTS);
let submissions=loadStore("tt_submissions_v1",DEMO_SUBMISSIONS);
function persist(){try{localStorage.setItem("tt_students_v1",JSON.stringify(students));localStorage.setItem("tt_submissions_v1",JSON.stringify(submissions));}catch{showToast("Penyimpanan browser tidak tersedia. Data belum tersimpan.");}}
function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function initials(name){return name.split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase();}
function formatDate(date){if(!date)return "—";return new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(date+"T12:00:00"));}
function formatToday(){return new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"long"}).format(new Date());}
function showToast(message){const toast=$("#toast");toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2800);}
function setPage(page){const names={overview:"Overview",students:"Data santri",submissions:"Setoran hafalan",murajaah:"Murajaah planner",reports:"Laporan"};if(!names[page])return;$$(".page").forEach(p=>p.classList.toggle("active-page",p.id===`page-${page}`));$$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("#breadcrumbTitle").textContent=names[page];$("#sidebar").classList.remove("open");if(page==="students")renderStudents();if(page==="submissions")populateStudentSelect();if(page==="reports")renderReports();window.scrollTo({top:0,behavior:"smooth"});}
function renderActivity(){const list=$("#activityList");const latest=[...submissions].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,4);if(!latest.length){list.innerHTML='<div class="empty-state">Belum ada catatan setoran.</div>';return;}list.innerHTML=latest.map((s,i)=>`<div class="activity-item"><span class="activity-avatar ${i===1?"orange":i===2?"lavender":""}">${escapeHTML(initials(s.student))}</span><span class="activity-main"><strong>${escapeHTML(s.student)}</strong><small>${escapeHTML(s.surah)} · ayat ${s.start}–${s.end} · ${escapeHTML(s.method)}</small></span><span class="activity-time">${escapeHTML(formatDate(s.date))}</span></div>`).join("");}
function renderStudents(){const query=($("#studentSearch")?.value||"").trim().toLowerCase();const filtered=students.filter(s=>`${s.name} ${s.kelas} ${s.group}`.toLowerCase().includes(query));$("#studentTable").innerHTML=filtered.map((s,i)=>`<tr><td><div class="person-cell"><span class="person-initial ${i%3===1?"alt":""}">${escapeHTML(initials(s.name))}</span>${escapeHTML(s.name)}</div></td><td>${escapeHTML(s.kelas)}</td><td>${escapeHTML(s.group)}</td><td><span class="status-label">Aktif</span></td></tr>`).join("");$("#studentEmpty").classList.toggle("hidden",filtered.length>0);$("#studentCount").textContent=String(students.length).padStart(2,"0");}
function populateStudentSelect(){const select=$("#submissionStudent");const current=select.value;select.innerHTML='<option value="">Pilih santri</option>'+students.map(s=>`<option>${escapeHTML(s.name)}</option>`).join("");if(students.some(s=>s.name===current))select.value=current;}
function renderReports(){const sorted=[...submissions].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);$("#reportTotal").textContent=String(sorted.length).padStart(2,"0");$("#reportIndividual").textContent=String(sorted.filter(s=>s.method==="Individual").length).padStart(2,"0");$("#reportGroup").textContent=String(sorted.filter(s=>s.method==="Halaqah").length).padStart(2,"0");$("#submissionCount").textContent=String(sorted.filter(s=>s.date===todayISO()).length).padStart(2,"0");$("#reportTable").innerHTML=sorted.map(s=>`<tr><td>${escapeHTML(formatDate(s.date))}</td><td>${escapeHTML(s.student)}</td><td>${escapeHTML(s.surah)} ${s.start}–${s.end}</td><td>${escapeHTML(s.method)}</td><td><span class="status-label ${s.evaluation.startsWith("Perlu")||s.evaluation.startsWith("Setoran")?"review":""}">${escapeHTML(s.evaluation)}</span></td></tr>`).join("");}
function renderAll(){renderActivity();renderStudents();renderReports();populateStudentSelect();}
function openDialog(id){const d=document.getElementById(id);if(d?.showModal)d.showModal();}
function closeDialog(id){document.getElementById(id)?.close();}
function csvEscape(value){return `"${String(value??"").replace(/"/g,'""')}"`;}
function exportCSV(){const headers=["Tanggal","Nama santri","Surah","Ayat awal","Ayat akhir","Metode","Evaluasi","Tindak lanjut"];const rows=submissions.map(s=>[s.date,s.student,s.surah,s.start,s.end,s.method,s.evaluation,s.followup]);const csv=[headers,...rows].map(r=>r.map(csvEscape).join(",")).join("\r\n");const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="tahfidz-track-rekap.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast("Rekap CSV berhasil disiapkan.");}
document.addEventListener("DOMContentLoaded",()=>{
  $("#todayLabel").textContent=formatToday();
  $("#submissionDate").value=todayISO();
  renderAll();
  $$(".nav-link").forEach(button=>button.addEventListener("click",()=>setPage(button.dataset.page)));
  $$("[data-go]").forEach(button=>button.addEventListener("click",()=>setPage(button.dataset.go)));
  $("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
  $("#helpButton").addEventListener("click",()=>openDialog("aboutDialog"));
  $("#profileButton").addEventListener("click",()=>showToast("Mode demo: akun admin belum memakai sistem login."));
  $("#studentSearch").addEventListener("input",renderStudents);
  $("#addStudentButton").addEventListener("click",()=>openDialog("studentDialog"));
  $$("[data-close]").forEach(button=>button.addEventListener("click",()=>closeDialog(button.dataset.close)));
  $$("dialog").forEach(dialog=>dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()}));
  $("#studentForm").addEventListener("submit",event=>{event.preventDefault();const name=$("#newStudentName").value.trim();if(!name)return;if(students.some(s=>s.name.toLowerCase()===name.toLowerCase())){showToast("Nama tersebut sudah ada di daftar.");return;}students.push({id:Date.now(),name,kelas:$("#newStudentClass").value,group:$("#newStudentGroup").value});persist();renderAll();$("#studentForm").reset();closeDialog("studentDialog");showToast("Santri ditambahkan ke data demo.");});
  $("#submissionForm").addEventListener("submit",event=>{event.preventDefault();const start=Number($("#ayatStart").value),end=Number($("#ayatEnd").value);if(end<start){showToast("Ayat akhir tidak boleh lebih kecil dari ayat awal.");return;}const student=$("#submissionStudent").value;if(!student){showToast("Pilih nama santri terlebih dahulu.");return;}submissions.push({id:Date.now(),student,date:$("#submissionDate").value,surah:$("#submissionSurah").value,start,end,method:$('input[name="method"]:checked').value,evaluation:$("#evaluation").value,followup:$("#followup").value.trim()});persist();renderAll();$("#submissionForm").reset();$("#submissionDate").value=todayISO();showToast("Catatan setoran tersimpan di browser ini.");setPage("reports");});
  $("#exportButton").addEventListener("click",exportCSV);
});
