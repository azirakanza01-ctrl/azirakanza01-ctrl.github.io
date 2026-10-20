const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  students: [
    { name: "Ahmad Rizky", id: "TT-001", level: "SMP", group: "Al-Kahfi", status: "Aktif" },
    { name: "Fatimah Nabila", id: "TT-002", level: "MA", group: "Ar-Rahman", status: "Aktif" },
    { name: "Muhammad Fikri", id: "TT-003", level: "SMP", group: "Al-Mulk", status: "Aktif" }
  ],
  deposits: [
    { name: "Ahmad Rizky", surah: "Al-Mulk", start: 1, end: 10, result: "Lancar", teacher: "Ust. Farhan", time: "09.42" },
    { name: "Fatimah Nabila", surah: "An-Naba’", start: 1, end: 8, result: "Perlu murajaah", teacher: "Ustazah Naila", time: "09.18" },
    { name: "Muhammad Fikri", surah: "Al-Waqi’ah", start: 1, end: 12, result: "Lancar", teacher: "Ust. Farhan", time: "08.56" }
  ],
  reviews: [
    { name: "Ahmad Rizky", passage: "Al-Mulk · ayat 1–10", reason: "Ulangi bagian yang belum lancar", initials: "AR" },
    { name: "Fatimah Nabila", passage: "An-Naba’ · ayat 1–8", reason: "Perhatikan ketepatan tajwid", initials: "FN" },
    { name: "Muhammad Fikri", passage: "Al-Waqi’ah · ayat 1–12", reason: "Jadwalkan murajaah ulang", initials: "MF" }
  ]
};

const pageNames = {
  overview: "Ringkasan",
  students: "Data santri",
  deposits: "Setoran hafalan",
  murajaah: "Murajaah",
  reports: "Laporan"
};

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2900);
}

function navigate(page) {
  $$(".page-content").forEach(section => section.classList.add("hidden"));
  const target = $(`#${page}Page`);
  if (target) target.classList.remove("hidden");
  $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  $("#breadcrumbCurrent").textContent = pageNames[page] || "Ringkasan";
  $("#sidebar").classList.remove("open");
  if (page === "students") renderStudents();
  if (page === "murajaah") renderReviews();
  if (page === "reports") updateReports();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$(".nav-item").forEach(button => button.addEventListener("click", () => navigate(button.dataset.page)));
$$("[data-go]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));
$("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#helpButton").addEventListener("click", () => showToast("Prototipe demonstrasi: gunakan menu di sebelah kiri untuk menjelajahi fitur."));
$("#profileButton").addEventListener("click", () => showToast("Profil contoh — fitur akun akan dibuat pada tahap backend."));

const dateFormatter = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
$("#todayLabel").textContent = dateFormatter.format(new Date());
$("#depositDate").value = new Date().toISOString().slice(0, 10);

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function renderStudents(filter = "") {
  const tbody = $("#studentsTable");
  const needle = filter.trim().toLowerCase();
  const rows = state.students.filter(student =>
    `${student.name} ${student.id} ${student.level} ${student.group}`.toLowerCase().includes(needle)
  );
  $("#studentTotal").textContent = `${rows.length} data`;
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Belum ada santri yang cocok dengan pencarian.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map((student, index) => `
    <tr>
      <td><span class="table-avatar ${index % 3 === 1 ? "sage" : index % 3 === 2 ? "gold" : ""}">${escapeHtml(initials(student.name))}</span>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.id)}</td><td>${escapeHtml(student.level)}</td>
      <td>${escapeHtml(student.group)}</td><td><span class="result-tag result-good">${escapeHtml(student.status)}</span></td>
    </tr>`).join("");
}
$("#studentSearch").addEventListener("input", event => renderStudents(event.target.value));

function renderRecent() {
  const tbody = $("#recentTable");
  tbody.innerHTML = state.deposits.slice(0, 6).map((deposit, index) => `
    <tr>
      <td><span class="table-avatar ${index % 3 === 1 ? "sage" : index % 3 === 2 ? "gold" : ""}">${escapeHtml(initials(deposit.name))}</span>${escapeHtml(deposit.name)}</td>
      <td>${escapeHtml(deposit.surah)} · ${deposit.start}–${deposit.end}</td>
      <td>${escapeHtml(deposit.teacher || "Pembimbing")}</td>
      <td><span class="result-tag ${deposit.result === "Lancar" ? "result-good" : "result-review"}">${escapeHtml(deposit.result)}</span></td>
      <td>${escapeHtml(deposit.time || "Baru")}</td>
    </tr>`).join("");
}
function updateCounters() {
  $("#depositCount").innerHTML = `${36 + Math.max(0, state.deposits.length - 3)}<span class="stat-unit"> sesi</span>`;
  $("#studentCount").textContent = 128 + Math.max(0, state.students.length - 3);
  $("#reviewCount").innerHTML = `${12 + Math.max(0, state.reviews.length - 3)}<span class="stat-unit"> santri</span>`;
  $("#reviewPill").textContent = String(state.reviews.length).padStart(2, "0");
  renderRecent();
  updateReports();
}
$("#depositForm").addEventListener("submit", event => {
  event.preventDefault();
  const start = Number($("#ayatStart").value);
  const end = Number($("#ayatEnd").value);
  if (end < start) {
    showToast("Ayat akhir harus sama dengan atau lebih besar dari ayat awal.");
    $("#ayatEnd").focus();
    return;
  }
  const name = $("#depositStudent").value;
  const surah = $("#depositSurah").value.trim();
  state.deposits.unshift({
    name, surah, start, end, result: $("#depositResult").value,
    teacher: "Pengurus tahfidz",
    time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
  });
  if ($("#depositResult").value !== "Lancar") {
    const existing = state.reviews.some(item => item.name === name && item.passage.toLowerCase().includes(surah.toLowerCase()));
    if (!existing) state.reviews.unshift({
      name, passage: `${surah} · ayat ${start}–${end}`,
      reason: $("#depositNotes").value.trim() || "Tinjau kembali pada murajaah berikutnya.",
      initials: initials(name)
    });
  }
  $("#depositForm").reset();
  $("#depositDate").value = new Date().toISOString().slice(0, 10);
  updateCounters();
  showToast("Catatan ditambahkan pada sesi demonstrasi ini.");
});

function renderReviews() {
  const root = $("#reviewList");
  $("#reviewPill").textContent = String(state.reviews.length).padStart(2, "0");
  if (!state.reviews.length) {
    root.innerHTML = `<div class="empty-state">Belum ada pengingat. Catatan baru akan muncul di sini.</div>`;
    return;
  }
  root.innerHTML = state.reviews.map((review, index) => `
    <article class="review-card">
      <div class="review-card-top"><span class="followup-avatar ${index % 3 === 1 ? "avatar-sage" : index % 3 === 2 ? "avatar-gold" : ""}">${escapeHtml(review.initials || initials(review.name))}</span><div><strong>${escapeHtml(review.name)}</strong><br><small>${escapeHtml(review.passage)}</small></div></div>
      <p>${escapeHtml(review.reason)}</p>
      <button class="secondary-button" data-complete-review="${index}">Tandai ditindaklanjuti ✓</button>
    </article>`).join("");
  $$("[data-complete-review]", root).forEach(button => button.addEventListener("click", () => {
    const review = state.reviews.splice(Number(button.dataset.completeReview), 1)[0];
    renderReviews();
    updateCounters();
    showToast(`Tindak lanjut ${review.name} ditandai selesai.`);
  }));
}

function updateReports() {
  $("#reportDeposits").textContent = 36 + Math.max(0, state.deposits.length - 3);
  $("#reportReviews").textContent = 12 + Math.max(0, state.reviews.length - 3);
}
$("#printReport").addEventListener("click", () => window.print());
$("#exportCsv").addEventListener("click", () => {
  const header = ["Nama santri", "Surah", "Ayat awal", "Ayat akhir", "Evaluasi", "Pembimbing", "Waktu"];
  const lines = state.deposits.map(item => [item.name, item.surah, item.start, item.end, item.result, item.teacher || "Pembimbing", item.time || ""]
    .map(value => `"${String(value).replace(/"/g, '""')}"`).join(","));
  const csv = [header.join(","), ...lines].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rekap-tahfidz-track-demo.csv";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Rekap contoh berhasil disiapkan.");
});

const studentDialog = $("#studentDialog");
$("#addStudentButton").addEventListener("click", () => studentDialog.showModal());
$("#closeStudentDialog").addEventListener("click", () => studentDialog.close());
$("#cancelStudent").addEventListener("click", () => studentDialog.close());
$("#studentForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#newStudentName").value.trim();
  const id = $("#newStudentId").value.trim();
  if (state.students.some(student => student.id.toLowerCase() === id.toLowerCase())) {
    showToast("ID santri sudah digunakan. Pilih ID yang berbeda.");
    return;
  }
  state.students.push({ name, id, level: $("#newStudentLevel").value, group: $("#newStudentGroup").value, status: "Aktif" });
  studentDialog.close();
  event.target.reset();
  renderStudents($("#studentSearch").value);
  updateCounters();
  showToast("Santri ditambahkan untuk sesi demonstrasi ini.");
});

const reviewDialog = $("#reviewDialog");
function openReviewDialog(studentName = "") {
  if (studentName && [...$("#reviewStudent").options].some(option => option.value === studentName)) $("#reviewStudent").value = studentName;
  reviewDialog.showModal();
}
$("#addReviewButton").addEventListener("click", () => openReviewDialog());
$("#closeReviewDialog").addEventListener("click", () => reviewDialog.close());
$("#cancelReview").addEventListener("click", () => reviewDialog.close());
$$("[data-student]").forEach(button => button.addEventListener("click", () => {
  openReviewDialog(button.dataset.student);
  $("#reviewPassage").value = "";
  $("#reviewReason").value = "";
}));
$("#studentForm").addEventListener("close", () => {});
$("#reviewForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#reviewStudent").value;
  state.reviews.unshift({
    name, passage: $("#reviewPassage").value.trim(),
    reason: $("#reviewReason").value.trim(), initials: initials(name)
  });
  reviewDialog.close();
  event.target.reset();
  updateCounters();
  renderReviews();
  showToast("Pengingat murajaah ditambahkan.");
});

renderStudents();
renderRecent();
renderReviews();
updateCounters();
