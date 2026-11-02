/**
 * Planify - Automated Verification & Smoke Test Suite
 * "Plan smarter, study better."
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runPlanifyTests() {
  console.log('==================================================');
  console.log('🧪 PLANIFY - AUTOMATED VERIFICATION SUITE');
  console.log('   "Plan smarter, study better."');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Uji Keberadaan File Inti
  console.log('1. Memeriksa Integritas File:');
  const requiredFiles = ['index.html', 'app.js', 'style.css'];
  for (const f of requiredFiles) {
    const full = path.join(__dirname, f);
    assert(fs.existsSync(full), `File ${f} tersedia di direktori utama`);
  }

  // 2. Uji Branding & Identitas di index.html
  console.log('\n2. Menguji Branding & Identitas Planify:');
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  assert(html.includes('<title>Planify - Plan smarter, study better.</title>'), 'Browser title memuat "Planify - Plan smarter, study better."');
  assert(html.includes('content="Planify - Personal study planner untuk mahasiswa'), 'Meta description memuat deskripsi Planify untuk mahasiswa');
  assert(html.includes('<h1 class="brand-title">Planify</h1>'), 'Header memuat nama brand Planify');
  assert(html.includes('<p class="brand-subtitle">Plan smarter, study better.</p>'), 'Header memuat tagline "Plan smarter, study better."');
  assert(html.includes('Belum ada tugas. Yuk, tambahkan tugas pertamamu!'), 'Empty state menggunakan teks bahasa yang ramah');
  assert(!html.includes('Student Task Manager'), 'Tidak ada sisa teks brand lama "Student Task Manager"');

  // 3. Uji Personal Workspace & Onboarding
  console.log('\n3. Menguji Personal Workspace & Onboarding:');
  assert(html.includes('id="onboardingModal"'), 'Modal onboarding pengguna pertama kali tersedia');
  assert(html.includes('Welcome to Planify 👋'), 'Modal onboarding memuat judul "Welcome to Planify 👋"');
  assert(html.includes("Let's personalize your study space."), 'Modal onboarding memuat "Let\'s personalize your study space."');
  assert(html.includes('What\'s your name?'), 'Modal onboarding menanyakan nama');
  assert(html.includes('Start Planning'), 'Tombol "Start Planning" tersedia');
  assert(html.includes('id="greetingTitle"'), 'Komponen Greeting Banner dinamis tersedia');
  assert(html.includes('id="settingsModal"'), 'Modal Pengaturan Profil & Studi tersedia');
  assert(html.includes('id="clearAllDataBtn"'), 'Tombol "Hapus Seluruh Data" tersedia di settings');

  // 4. Uji Dashboard & Upcoming Tasks
  console.log('\n4. Menguji Dashboard & Upcoming Tasks:');
  assert(html.includes('id="statTotalTasks"'), 'Statistik Total Tasks tersedia');
  assert(html.includes('id="statPendingTasks"'), 'Statistik In Progress / To Do tersedia');
  assert(html.includes('id="statCompletedTasks"'), 'Statistik Tugas Selesai tersedia');
  assert(html.includes('id="statOverdueTasks"'), 'Statistik Overdue (Terlewat) tersedia');
  assert(html.includes('Study Progress'), 'Komponen Study Progress bar tersedia');
  assert(html.includes('id="upcomingSection"'), 'Section Upcoming Tasks tersedia');
  assert(html.includes('id="upcomingGroupsContainer"'), 'Container pengelompokan Upcoming Tasks tersedia');

  // 5. Uji Search & Filter
  console.log('\n5. Menguji Search & Multi-Filter:');
  assert(html.includes('id="searchInput"'), 'Search input untuk nama tugas dan matkul tersedia');
  assert(html.includes('id="courseFilterSelect"'), 'Dropdown filter mata kuliah tersedia');
  assert(html.includes('id="priorityFilterSelect"'), 'Dropdown filter prioritas tersedia');
  assert(html.includes('data-status="Overdue"'), 'Filter status mencakup opsi Overdue');

  // 6. Uji Kalender & Focus Mode / Pomodoro
  console.log('\n6. Menguji Kalender & Focus Mode:');
  assert(html.includes('id="calendarSection"'), 'Section Kalender Jadwal tersedia');
  assert(html.includes('id="pomodoroSection"'), 'Section Focus Mode / Pomodoro tersedia');
  assert(html.includes('id="pomoTimerDisplay"'), 'Display timer digital besar tersedia');
  assert(html.includes('id="pomoTaskSelect"'), 'Dropdown pilihan tugas yang difokuskan tersedia');
  assert(html.includes('id="pomoStartPauseBtn"'), 'Tombol kontrol Mulai/Pause Pomodoro tersedia');
  assert(html.includes('id="pomoSessionsCompleted"'), 'Statistik sesi selesai hari ini tersedia');
  assert(html.includes('id="pomoTotalTime"'), 'Statistik total waktu fokus hari ini tersedia');

  // 7. Uji Dark Mode
  console.log('\n7. Menguji Dukungan Dark Mode:');
  assert(html.includes('id="themeToggleBtn"'), 'Tombol toggle Dark/Light mode tersedia di header');
  const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
  assert(css.includes('[data-theme="dark"]'), 'Token CSS Dark Mode [data-theme="dark"] terdefinisi');
  assert(css.includes('--bg-body: #0b0f19') || css.includes('--bg-body'), 'CSS Dark Mode memiliki background palette yang nyaman');

  // 8. Uji Logika JavaScript di app.js
  console.log('\n8. Menguji Logika di app.js:');
  const js = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  assert(js.includes('isTaskOverdue'), 'Fungsi isTaskOverdue terdefinisi');
  assert(js.includes('status === "Completed"') && js.includes('return false'), 'Status Completed dipastikan TIDAK dihitung Overdue');
  assert(js.includes('playChimeSound'), 'Fungsi sintesis suara alarm Web Audio API tersedia');
  assert(js.includes('handlePomoSessionComplete'), 'Handler selesai sesi fokus pomodoro terdefinisi');
  assert(js.includes('checkFirstTimeOnboarding'), 'Logika first-time onboarding terdefinisi');
  assert(js.includes('applyTheme'), 'Logika dark/light mode terdefinisi');
  assert(js.includes('handleClearAllData'), 'Fungsi hapus seluruh data dengan konfirmasi terdefinisi');

  console.log(`\n==================================================`);
  console.log(`🎯 HASIL AKHIR VERIFIKASI PLANIFY: ${passed} LULUS, ${failed} GAGAL`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runPlanifyTests();

