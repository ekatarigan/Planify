/**
 * ==========================================================================
 * Planify - Personal Study Planner for Students
 * "Plan smarter, study better."
 * JavaScript Application Controller
 * ==========================================================================
 */

// Kunci Penyimpanan LocalStorage
const STORAGE_KEY = "planify_tasks_data";
const LEGACY_STORAGE_KEY = "student_task_manager_data";
const KEY_USER_NAME = "planify_user_name";
const KEY_THEME = "planify_theme";
const KEY_POMO_SETTINGS = "planify_pomo_settings";
const KEY_POMO_STATS = "planify_pomo_stats";

// Data awal contoh tugas kuliah untuk pengguna baru
const INITIAL_TASKS = [
  {
    id: "task_1",
    name: "Makalah Analisis Algoritma Sorting & Pencarian",
    course: "Kecerdasan Buatan",
    deadline: getFutureDate(1, 23, 59), // Besok
    priority: "High",
    status: "In Progress"
  },
  {
    id: "task_2",
    name: "Desain Prototipe UI/UX Web Kampus",
    course: "Pemrograman Web",
    deadline: getFutureDate(3, 17, 0), // 3 hari lagi
    priority: "Medium",
    status: "To Do"
  },
  {
    id: "task_3",
    name: "Laporan Praktikum Normalisasi Query SQL",
    course: "Basis Data",
    deadline: getFutureDate(-1, 12, 0), // Kemarin (Selesai)
    priority: "Low",
    status: "Completed"
  }
];

// Helper untuk membuat tanggal dinamis
function getFutureDate(offsetDays, hours = 23, minutes = 59) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

// ==========================================
// STATE APLIKASI
// ==========================================
let tasks = [];
let userName = "Student";
let currentTheme = "light";
let currentFilterStatus = "all"; // 'all' | 'To Do' | 'In Progress' | 'Completed' | 'Overdue'
let currentFilterPriority = "all"; // 'all' | 'High' | 'Medium' | 'Low'
let currentFilterCourse = "all";
let searchQuery = "";
let editingTaskId = null;

// State Kalender
const todayDate = new Date();
let calYear = todayDate.getFullYear();
let calMonth = todayDate.getMonth();
let selectedDateKey = formatLocalDateKey(todayDate);
let activeViewMode = "cards"; // 'cards' | 'calendar' | 'pomodoro'

// State Pomodoro
let pomoSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15
};

let pomoMode = "focus"; // 'focus' | 'shortBreak' | 'longBreak'
let pomoTimeLeft = 25 * 60; // dalam detik
let pomoIsRunning = false;
let pomoTimerInterval = null;
let pomoSelectedTaskId = "";

let pomoStats = {
  date: formatLocalDateKey(new Date()),
  completedSessions: 0,
  totalFocusMinutes: 0
};

// Nama Bulan Bahasa Indonesia
const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// ==========================================
// DOM ELEMENTS REFERENCE
// ==========================================
const elements = {
  // Brand & Header
  brandHomeLink: document.getElementById("brandHomeLink"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeIconSun: document.getElementById("themeIconSun"),
  themeIconMoon: document.getElementById("themeIconMoon"),
  userProfileBtn: document.getElementById("userProfileBtn"),
  headerUserAvatar: document.getElementById("headerUserAvatar"),
  headerUserName: document.getElementById("headerUserName"),
  openAddModalBtn: document.getElementById("openAddModalBtn"),

  // Greeting Banner
  greetingTitle: document.getElementById("greetingTitle"),
  greetingSubtitle: document.getElementById("greetingSubtitle"),
  quickFocusBtn: document.getElementById("quickFocusBtn"),
  quickTodayBtn: document.getElementById("quickTodayBtn"),

  // Dashboard Stats
  statTotalTasks: document.getElementById("statTotalTasks"),
  statPendingTasks: document.getElementById("statPendingTasks"),
  statCompletedTasks: document.getElementById("statCompletedTasks"),
  statOverdueTasks: document.getElementById("statOverdueTasks"),
  progressPercentage: document.getElementById("progressPercentage"),
  progressBarFill: document.getElementById("progressBarFill"),
  progressDetailText: document.getElementById("progressDetailText"),

  // Upcoming Tasks
  upcomingSection: document.getElementById("upcomingSection"),
  upcomingTotalBadge: document.getElementById("upcomingTotalBadge"),
  upcomingGroupsContainer: document.getElementById("upcomingGroupsContainer"),

  // View Navigation
  viewCardsBtn: document.getElementById("viewCardsBtn"),
  viewCalendarBtn: document.getElementById("viewCalendarBtn"),
  viewPomodoroBtn: document.getElementById("viewPomodoroBtn"),
  controlsSection: document.getElementById("controlsSection"),
  tasksSection: document.getElementById("tasksSection"),
  calendarSection: document.getElementById("calendarSection"),
  pomodoroSection: document.getElementById("pomodoroSection"),

  // Filters & Search
  filterTabs: document.querySelectorAll(".filter-tabs .tab-btn"),
  courseFilterSelect: document.getElementById("courseFilterSelect"),
  priorityFilterSelect: document.getElementById("priorityFilterSelect"),
  searchInput: document.getElementById("searchInput"),

  // Tasks Grid & Empty State
  tasksGrid: document.getElementById("tasksGrid"),
  emptyState: document.getElementById("emptyState"),
  emptyStateAddBtn: document.getElementById("emptyStateAddBtn"),

  // Calendar Elements
  calendarMonthTitle: document.getElementById("calendarMonthTitle"),
  prevMonthBtn: document.getElementById("prevMonthBtn"),
  nextMonthBtn: document.getElementById("nextMonthBtn"),
  todayBtn: document.getElementById("todayBtn"),
  calendarDaysGrid: document.getElementById("calendarDaysGrid"),
  selectedDayCard: document.getElementById("selectedDayCard"),
  selectedDayTitle: document.getElementById("selectedDayTitle"),
  selectedDaySubtitle: document.getElementById("selectedDaySubtitle"),
  selectedDayTasksList: document.getElementById("selectedDayTasksList"),
  addForDateBtn: document.getElementById("addForDateBtn"),

  // Focus Mode / Pomodoro Elements
  pomoFocusBtn: document.getElementById("pomoFocusBtn"),
  pomoShortBreakBtn: document.getElementById("pomoShortBreakBtn"),
  pomoLongBreakBtn: document.getElementById("pomoLongBreakBtn"),
  pomoTimerDisplay: document.getElementById("pomoTimerDisplay"),
  pomoTaskSelect: document.getElementById("pomoTaskSelect"),
  pomoStartPauseBtn: document.getElementById("pomoStartPauseBtn"),
  pomoResetBtn: document.getElementById("pomoResetBtn"),
  pomoSkipBtn: document.getElementById("pomoSkipBtn"),
  pomoSessionsCompleted: document.getElementById("pomoSessionsCompleted"),
  pomoTotalTime: document.getElementById("pomoTotalTime"),

  // Task Modal
  taskModal: document.getElementById("taskModal"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelModalBtn: document.getElementById("cancelModalBtn"),
  modalHeading: document.getElementById("modalHeading"),
  taskForm: document.getElementById("taskForm"),
  editTaskId: document.getElementById("editTaskId"),
  taskNameInput: document.getElementById("taskNameInput"),
  courseInput: document.getElementById("courseInput"),
  deadlineInput: document.getElementById("deadlineInput"),
  priorityInput: document.getElementById("priorityInput"),
  statusInput: document.getElementById("statusInput"),
  nameError: document.getElementById("nameError"),
  courseError: document.getElementById("courseError"),
  deadlineError: document.getElementById("deadlineError"),

  // Onboarding Modal
  onboardingModal: document.getElementById("onboardingModal"),
  onboardingForm: document.getElementById("onboardingForm"),
  onboardingNameInput: document.getElementById("onboardingNameInput"),

  // Settings Modal
  settingsModal: document.getElementById("settingsModal"),
  settingsForm: document.getElementById("settingsForm"),
  closeSettingsBtn: document.getElementById("closeSettingsBtn"),
  cancelSettingsBtn: document.getElementById("cancelSettingsBtn"),
  settingsNameInput: document.getElementById("settingsNameInput"),
  settingsFocusDuration: document.getElementById("settingsFocusDuration"),
  settingsShortBreakDuration: document.getElementById("settingsShortBreakDuration"),
  settingsLongBreakDuration: document.getElementById("settingsLongBreakDuration"),
  clearAllDataBtn: document.getElementById("clearAllDataBtn"),

  // Toast
  toast: document.getElementById("toastNotification")
};

// ==========================================
// 1. BOOTSTRAP & INISIALISASI
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initPlanify();
});

function initPlanify() {
  loadThemePreference();
  loadUserData();
  loadTasksData();
  loadPomoSettingsAndStats();
  setupEventListeners();
  renderApp();

  // Periksa apakah ini kunjungan pertama (onboarding)
  checkFirstTimeOnboarding();
}

/**
 * Memuat preferensi tema Dark / Light
 */
function loadThemePreference() {
  const savedTheme = localStorage.getItem(KEY_THEME);
  if (savedTheme) {
    currentTheme = savedTheme;
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    currentTheme = "dark";
  } else {
    currentTheme = "light";
  }
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(KEY_THEME, theme);

  if (theme === "dark") {
    elements.themeIconSun?.classList.remove("hidden");
    elements.themeIconMoon?.classList.add("hidden");
  } else {
    elements.themeIconSun?.classList.add("hidden");
    elements.themeIconMoon?.classList.remove("hidden");
  }
}

function toggleTheme() {
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  showToast(`Mode ${nextTheme === "dark" ? "Gelap (Dark Mode)" : "Terang (Light Mode)"} diaktifkan.`);
}

/**
 * Memuat data identitas pengguna
 */
function loadUserData() {
  const savedName = localStorage.getItem(KEY_USER_NAME);
  if (savedName && savedName.trim() !== "") {
    userName = savedName.trim();
  } else {
    userName = "";
  }
  updateUserDisplay();
}

function updateUserDisplay() {
  const displayName = userName || "Student";
  if (elements.headerUserName) elements.headerUserName.textContent = displayName;
  if (elements.headerUserAvatar) elements.headerUserAvatar.textContent = displayName.charAt(0).toUpperCase();

  // Dynamic Greeting based on time of day
  const hour = new Date().getHours();
  let timeGreeting = "Good morning";
  if (hour >= 12 && hour < 17) {
    timeGreeting = "Good afternoon";
  } else if (hour >= 17 || hour < 5) {
    timeGreeting = "Good evening";
  }

  if (elements.greetingTitle) {
    elements.greetingTitle.textContent = `${timeGreeting}, ${displayName}! 👋`;
  }
  if (elements.greetingSubtitle) {
    elements.greetingSubtitle.textContent = "Here's your study plan for today.";
  }
}

/**
 * Onboarding pengguna baru pertama kali
 */
function checkFirstTimeOnboarding() {
  const storedName = localStorage.getItem(KEY_USER_NAME);
  if (!storedName || storedName.trim() === "") {
    if (elements.onboardingModal) {
      elements.onboardingModal.classList.remove("hidden");
      elements.onboardingNameInput?.focus();
    }
  }
}

/**
 * Memuat data tugas dari LocalStorage (dengan migrasi data legacy jika ada)
 */
function loadTasksData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      tasks = JSON.parse(saved);
    } else {
      tasks = [...INITIAL_TASKS];
      saveTasksData();
    }
  } catch (error) {
    console.error("Gagal memuat tugas dari localStorage:", error);
    tasks = [...INITIAL_TASKS];
  }
}

function saveTasksData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Gagal menyimpan tugas ke localStorage:", error);
  }
}

/**
 * Memuat Pengaturan dan Statistik Pomodoro
 */
function loadPomoSettingsAndStats() {
  try {
    const savedSettings = localStorage.getItem(KEY_POMO_SETTINGS);
    if (savedSettings) {
      pomoSettings = { ...pomoSettings, ...JSON.parse(savedSettings) };
    }

    const todayKey = formatLocalDateKey(new Date());
    const savedStats = localStorage.getItem(KEY_POMO_STATS);
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      if (parsedStats.date === todayKey) {
        pomoStats = parsedStats;
      } else {
        // Reset statistik jika berganti hari
        pomoStats = { date: todayKey, completedSessions: 0, totalFocusMinutes: 0 };
        savePomoStats();
      }
    }
  } catch (e) {
    console.error("Gagal memuat pengaturan Pomodoro:", e);
  }

  resetPomoTimer();
  updatePomoStatsDisplay();
}

function savePomoSettings() {
  localStorage.setItem(KEY_POMO_SETTINGS, JSON.stringify(pomoSettings));
}

function savePomoStats() {
  localStorage.setItem(KEY_POMO_STATS, JSON.stringify(pomoStats));
}

// ==========================================
// 2. LOGIKA DEADLINE & OVERDUE (PENTING)
// ==========================================

/**
 * Memeriksa apakah tugas terlambat (Overdue)
 * Aturan Penting: Status 'Completed' TIDAK PERNAH dianggap Overdue.
 */
function isTaskOverdue(task) {
  if (task.status === "Completed") return false;
  if (!task.deadline) return false;
  const deadlineDate = new Date(task.deadline);
  return !isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < Date.now();
}

/**
 * Format deadline menjadi keterangan ramah
 */
function formatDeadline(isoString) {
  if (!isoString) return { text: "-", isOverdue: false };

  const deadlineDate = new Date(isoString);
  if (isNaN(deadlineDate.getTime())) return { text: "-", isOverdue: false };

  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();

  const options = {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  };
  const dateFormatted = deadlineDate.toLocaleDateString("id-ID", options);

  if (diffMs < 0) {
    return { text: `Terlewat (${dateFormatted})`, isOverdue: true };
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTomorrow = startOfToday + 86400000;
  const startOfDayAfter = startOfToday + 86400000 * 2;
  const targetTime = deadlineDate.getTime();

  if (targetTime >= startOfToday && targetTime < startOfTomorrow) {
    return { text: `Hari ini, ${dateFormatted}`, isOverdue: false };
  } else if (targetTime >= startOfTomorrow && targetTime < startOfDayAfter) {
    return { text: `Besok, ${dateFormatted}`, isOverdue: false };
  } else {
    return { text: dateFormatted, isOverdue: false };
  }
}

// ==========================================
// 3. DASHBOARD STATISTIK & UPCOMING TASKS
// ==========================================

function updateDashboard() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pending = tasks.filter(t => t.status === "To Do" || t.status === "In Progress").length;
  const overdue = tasks.filter(t => isTaskOverdue(t)).length;

  if (elements.statTotalTasks) elements.statTotalTasks.textContent = total;
  if (elements.statPendingTasks) elements.statPendingTasks.textContent = pending;
  if (elements.statCompletedTasks) elements.statCompletedTasks.textContent = completed;
  if (elements.statOverdueTasks) elements.statOverdueTasks.textContent = overdue;

  // Persentase Progress
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  if (elements.progressPercentage) elements.progressPercentage.textContent = `${percentage}%`;
  if (elements.progressBarFill) elements.progressBarFill.style.width = `${percentage}%`;
  if (elements.progressDetailText) {
    elements.progressDetailText.textContent = `${completed} dari ${total} tugas selesai`;
  }

  // Update Section Upcoming Tasks
  renderUpcomingTasks();
}

/**
 * Merender daftar tugas mendatang (Overdue, Hari Ini, Besok, Minggu Ini)
 */
function renderUpcomingTasks() {
  if (!elements.upcomingGroupsContainer) return;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 86400000 - 1;
  const endOfTomorrow = endOfToday + 86400000;
  const endOfWeek = startOfToday + 86400000 * 7;

  // Filter tugas yang belum selesai
  const activeTasks = tasks.filter(t => t.status !== "Completed");

  const overdueList = [];
  const todayList = [];
  const tomorrowList = [];
  const thisWeekList = [];

  activeTasks.forEach(task => {
    if (!task.deadline) return;
    const time = new Date(task.deadline).getTime();

    if (time < now.getTime()) {
      overdueList.push(task);
    } else if (time <= endOfToday) {
      todayList.push(task);
    } else if (time <= endOfTomorrow) {
      tomorrowList.push(task);
    } else if (time <= endOfWeek) {
      thisWeekList.push(task);
    }
  });

  const totalUpcoming = overdueList.length + todayList.length + tomorrowList.length + thisWeekList.length;
  if (elements.upcomingTotalBadge) {
    elements.upcomingTotalBadge.textContent = `${totalUpcoming} Tugas Perhatian`;
  }

  // Urutkan masing-masing grup berdasarkan deadline terdekat
  const sortByDeadline = (a, b) => new Date(a.deadline) - new Date(b.deadline);
  overdueList.sort(sortByDeadline);
  todayList.sort(sortByDeadline);
  tomorrowList.sort(sortByDeadline);
  thisWeekList.sort(sortByDeadline);

  function createUpcomingColumnHTML(title, list, isOverdueCol = false) {
    const itemsHtml = list.length === 0
      ? `<div style="font-size:0.75rem; color:var(--text-muted); padding:6px 0;">Tidak ada tugas</div>`
      : list.map(t => {
        const dInfo = formatDeadline(t.deadline);
        return `
          <div class="upcoming-item ${isOverdueCol ? 'is-overdue' : ''}" data-task-id="${t.id}">
            <div class="upcoming-item-left">
              <span class="upcoming-item-title" title="${escapeHtml(t.name)}">${escapeHtml(t.name)}</span>
              <div class="upcoming-item-meta">
                <span style="font-weight:700; color:var(--primary);">${escapeHtml(t.course)}</span> &bull; 
                <span>${dInfo.text}</span>
              </div>
            </div>
            <button class="upcoming-item-btn" data-action="toggle-complete" data-id="${t.id}" title="Tandai Selesai" type="button">
              ✓
            </button>
          </div>
        `;
      }).join("");

    return `
      <div class="upcoming-column">
        <div class="upcoming-col-title" style="${isOverdueCol && list.length > 0 ? 'color:var(--color-overdue-text); font-weight:800;' : ''}">
          <span>${title}</span>
          <span class="upcoming-col-count" style="${isOverdueCol && list.length > 0 ? 'background:var(--color-overdue-bg); color:var(--color-overdue-text);' : ''}">${list.length}</span>
        </div>
        ${itemsHtml}
      </div>
    `;
  }

  elements.upcomingGroupsContainer.innerHTML = `
    ${createUpcomingColumnHTML("⚠️ Overdue", overdueList, true)}
    ${createUpcomingColumnHTML("📅 Hari Ini", todayList)}
    ${createUpcomingColumnHTML("☀️ Besok", tomorrowList)}
    ${createUpcomingColumnHTML("📆 Minggu Ini", thisWeekList)}
  `;
}

// ==========================================
// 4. FILTER & DAFTAR TUGAS (CARDS)
// ==========================================

function updateCourseFilterOptions() {
  if (!elements.courseFilterSelect) return;

  const currentVal = elements.courseFilterSelect.value;
  const courses = Array.from(new Set(tasks.map(t => t.course.trim()).filter(Boolean))).sort();

  let optionsHTML = '<option value="all">Semua Mata Kuliah</option>';
  courses.forEach(c => {
    const isSelected = c === currentVal ? "selected" : "";
    optionsHTML += `<option value="${escapeHtml(c)}" ${isSelected}>${escapeHtml(c)}</option>`;
  });

  elements.courseFilterSelect.innerHTML = optionsHTML;
}

function getFilteredTasks() {
  return tasks.filter(task => {
    // 1. Filter Status
    let matchStatus = true;
    if (currentFilterStatus === "all") {
      matchStatus = true;
    } else if (currentFilterStatus === "Overdue") {
      matchStatus = isTaskOverdue(task);
    } else {
      matchStatus = task.status === currentFilterStatus;
    }

    // 2. Filter Prioritas
    const matchPriority = currentFilterPriority === "all" || task.priority === currentFilterPriority;

    // 3. Filter Mata Kuliah
    const matchCourse = currentFilterCourse === "all" || task.course.toLowerCase() === currentFilterCourse.toLowerCase();

    // 4. Pencarian Teks
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = query === "" ||
      task.name.toLowerCase().includes(query) ||
      task.course.toLowerCase().includes(query);

    return matchStatus && matchPriority && matchCourse && matchSearch;
  });
}

function renderApp() {
  updateDashboard();
  updateCourseFilterOptions();
  updatePomoTaskDropdown();

  // Render Card Grid View
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    if (elements.tasksGrid) elements.tasksGrid.innerHTML = "";
    if (elements.emptyState) elements.emptyState.classList.remove("hidden");
  } else {
    if (elements.emptyState) elements.emptyState.classList.add("hidden");
    if (elements.tasksGrid) {
      elements.tasksGrid.innerHTML = filteredTasks.map(createTaskCardHTML).join("");
    }
  }

  // Render Calendar View & Selected Day Panel
  renderCalendar();
  renderSelectedDayTasks();
}

function createTaskCardHTML(task) {
  const isCompleted = task.status === "Completed";
  const overdue = isTaskOverdue(task);
  const priorityClass = `priority-${task.priority.toLowerCase()}`;
  const deadlineFormatted = formatDeadline(task.deadline);

  let statusBadgeClass = "status-todo";
  if (task.status === "In Progress") statusBadgeClass = "status-progress";
  if (task.status === "Completed") statusBadgeClass = "status-completed";

  const toggleBtnTitle = isCompleted ? "Batalkan tanda selesai" : "Tandai tugas sebagai selesai";

  return `
    <article class="task-card ${isCompleted ? 'is-completed' : ''}" data-task-id="${task.id}">
      <div>
        <div class="card-header">
          <span class="course-tag" title="${escapeHtml(task.course)}">${escapeHtml(task.course)}</span>
          <span class="priority-badge ${priorityClass}">
            ${task.priority === 'High' ? '🔥' : task.priority === 'Medium' ? '⚡' : '🌱'} ${task.priority}
          </span>
        </div>

        <h3 class="task-title">${escapeHtml(task.name)}</h3>

        <div class="deadline-info ${overdue ? 'is-overdue' : ''}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>${overdue ? '⚠️ ' + deadlineFormatted.text : deadlineFormatted.text}</span>
        </div>
      </div>

      <div class="card-footer">
        <span class="status-pill ${statusBadgeClass}">
          ${task.status === 'Completed' ? '✓' : '•'} ${task.status}
        </span>

        <div class="card-actions">
          <!-- Tombol Mulai Fokus pada Tugas Ini -->
          <button class="action-btn" data-action="focus-task" data-id="${task.id}" title="Fokus pada tugas ini (Pomodoro)" type="button">
            ⏱️
          </button>

          <!-- Tombol Tandai Selesai -->
          <button class="action-btn btn-complete-toggle" data-action="toggle-complete" data-id="${task.id}" title="${toggleBtnTitle}" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>

          <!-- Tombol Edit -->
          <button class="action-btn" data-action="edit" data-id="${task.id}" title="Edit Tugas" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>

          <!-- Tombol Hapus -->
          <button class="action-btn btn-delete" data-action="delete" data-id="${task.id}" title="Hapus Tugas" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

// ==========================================
// 5. KALENDER JADWAL (INTERACTIVE)
// ==========================================

function formatLocalDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateKeyFromISO(isoString) {
  if (!isoString) return "";
  return formatLocalDateKey(new Date(isoString));
}

function getTasksForDateKey(dateKey) {
  return tasks.filter(t => getDateKeyFromISO(t.deadline) === dateKey);
}

function renderCalendar() {
  if (!elements.calendarDaysGrid) return;

  if (elements.calendarMonthTitle) {
    elements.calendarMonthTitle.textContent = `${MONTH_NAMES_ID[calMonth]} ${calYear}`;
  }

  const todayKey = formatLocalDateKey(new Date());
  const firstDayOfMonth = new Date(calYear, calMonth, 1);
  const lastDayOfMonth = new Date(calYear, calMonth + 1, 0);

  // Hari pertama dalam minggu (0 = Minggu, 1 = Senin)
  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6;

  const totalDaysCurrentMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(calYear, calMonth, 0).getDate();

  const totalCells = Math.ceil((startDayIndex + totalDaysCurrentMonth) / 7) * 7;
  let cellsHTML = "";

  for (let i = 0; i < totalCells; i++) {
    let dayNum;
    let cellDate;
    let isOtherMonth = false;

    if (i < startDayIndex) {
      dayNum = prevMonthLastDay - startDayIndex + i + 1;
      cellDate = new Date(calYear, calMonth - 1, dayNum);
      isOtherMonth = true;
    } else if (i < startDayIndex + totalDaysCurrentMonth) {
      dayNum = i - startDayIndex + 1;
      cellDate = new Date(calYear, calMonth, dayNum);
    } else {
      dayNum = i - (startDayIndex + totalDaysCurrentMonth) + 1;
      cellDate = new Date(calYear, calMonth + 1, dayNum);
      isOtherMonth = true;
    }

    const cellDateKey = formatLocalDateKey(cellDate);
    const isToday = cellDateKey === todayKey;
    const isSelected = cellDateKey === selectedDateKey;

    const dayTasks = getTasksForDateKey(cellDateKey);
    const taskCount = dayTasks.length;

    let pillsHTML = "";
    const maxVisiblePills = 2;
    const visibleTasks = dayTasks.slice(0, maxVisiblePills);
    const remainingCount = taskCount - maxVisiblePills;

    visibleTasks.forEach(task => {
      const pClass = `priority-${task.priority.toLowerCase()}`;
      const isComp = task.status === "Completed" ? "is-completed" : "";
      pillsHTML += `
        <div class="cal-task-pill ${pClass} ${isComp}" title="${escapeHtml(task.name)} (${task.priority})">
          <span>${escapeHtml(task.name)}</span>
        </div>
      `;
    });

    if (remainingCount > 0) {
      pillsHTML += `<div class="cal-more-text">+${remainingCount} lagi</div>`;
    }

    let dotsHTML = "";
    dayTasks.slice(0, 3).forEach(task => {
      const dotColorClass = `dot-${task.priority.toLowerCase()}`;
      dotsHTML += `<span class="legend-dot ${dotColorClass}"></span>`;
    });

    cellsHTML += `
      <div class="calendar-day-cell ${isOtherMonth ? 'is-other-month' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" data-date-key="${cellDateKey}">
        <div class="day-header-row">
          <span class="day-number">${dayNum}</span>
          ${taskCount > 0 ? `<span class="cal-task-count">${taskCount}</span>` : ''}
        </div>
        <div class="cal-tasks-container">
          ${pillsHTML}
        </div>
        <div class="cal-dots-row">
          ${dotsHTML}
        </div>
      </div>
    `;
  }

  elements.calendarDaysGrid.innerHTML = cellsHTML;
}

function renderSelectedDayTasks() {
  if (!elements.selectedDayTasksList) return;

  const [y, m, d] = selectedDateKey.split("-").map(Number);
  const selectedDateObj = new Date(y, m - 1, d);

  const formattedDateString = selectedDateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  if (elements.selectedDayTitle) {
    elements.selectedDayTitle.textContent = `Tugas: ${formattedDateString}`;
  }

  const dayTasks = getTasksForDateKey(selectedDateKey);

  if (dayTasks.length === 0) {
    elements.selectedDayTasksList.innerHTML = `
      <div class="selected-empty-notice">
        Belum ada tugas dengan deadline pada tanggal ini.
      </div>
    `;
    return;
  }

  elements.selectedDayTasksList.innerHTML = dayTasks.map(task => {
    const isComp = task.status === "Completed";
    const pClass = `priority-${task.priority.toLowerCase()}`;
    const deadlineTime = new Date(task.deadline).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });

    return `
      <div class="selected-task-row ${isComp ? 'is-completed' : ''}" data-task-id="${task.id}">
        <div class="selected-task-left">
          <button class="action-btn btn-complete-toggle" data-action="toggle-complete" data-id="${task.id}" title="Ubah Status">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
          <div>
            <div class="selected-task-title">${escapeHtml(task.name)}</div>
            <div class="selected-task-time">
              <span>📚 ${escapeHtml(task.course)}</span> &bull; 
              <span>⏰ ${deadlineTime}</span>
            </div>
          </div>
        </div>
        <div class="selected-task-right">
          <span class="priority-badge ${pClass}">
            ${task.priority === 'High' ? '🔥' : task.priority === 'Medium' ? '⚡' : '🌱'} ${task.priority}
          </span>
          <button class="action-btn" data-action="edit" data-id="${task.id}" title="Edit">
            ✏️
          </button>
          <button class="action-btn btn-delete" data-action="delete" data-id="${task.id}" title="Hapus">
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// ==========================================
// 6. FOCUS MODE / POMODORO LOGIC
// ==========================================

function updatePomoTaskDropdown() {
  if (!elements.pomoTaskSelect) return;

  const currentVal = elements.pomoTaskSelect.value;
  const activeTasks = tasks.filter(t => t.status !== "Completed");

  let optionsHTML = '<option value="">General Study / Belajar Bebas</option>';
  activeTasks.forEach(t => {
    const isSelected = t.id === currentVal ? "selected" : "";
    optionsHTML += `<option value="${t.id}" ${isSelected}>${escapeHtml(t.course)} &ndash; ${escapeHtml(t.name)}</option>`;
  });

  elements.pomoTaskSelect.innerHTML = optionsHTML;
}

function setPomoMode(mode) {
  pomoMode = mode;
  pomoIsRunning = false;
  clearInterval(pomoTimerInterval);

  elements.pomoFocusBtn?.classList.toggle("active", mode === "focus");
  elements.pomoShortBreakBtn?.classList.toggle("active", mode === "shortBreak");
  elements.pomoLongBreakBtn?.classList.toggle("active", mode === "longBreak");

  resetPomoTimer();
  updatePomoButtonUI();
}

function resetPomoTimer() {
  pomoIsRunning = false;
  clearInterval(pomoTimerInterval);

  if (pomoMode === "focus") {
    pomoTimeLeft = (pomoSettings.focusDuration || 25) * 60;
  } else if (pomoMode === "shortBreak") {
    pomoTimeLeft = (pomoSettings.shortBreakDuration || 5) * 60;
  } else if (pomoMode === "longBreak") {
    pomoTimeLeft = (pomoSettings.longBreakDuration || 15) * 60;
  }

  updatePomoDisplay();
  updatePomoButtonUI();
  document.title = "Planify - Plan smarter, study better.";
}

function updatePomoDisplay() {
  const mins = Math.floor(pomoTimeLeft / 60);
  const secs = pomoTimeLeft % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  if (elements.pomoTimerDisplay) {
    elements.pomoTimerDisplay.textContent = formatted;
  }

  if (pomoIsRunning) {
    const modeLabel = pomoMode === "focus" ? "Focus" : "Break";
    document.title = `(${formatted}) ${modeLabel} - Planify`;
  }
}

function updatePomoButtonUI() {
  if (!elements.pomoStartPauseBtn) return;
  if (pomoIsRunning) {
    elements.pomoStartPauseBtn.textContent = "Pause";
    elements.pomoStartPauseBtn.classList.remove("btn-primary");
    elements.pomoStartPauseBtn.classList.add("btn-secondary");
  } else {
    elements.pomoStartPauseBtn.textContent = pomoMode === "focus" ? "Mulai Fokus" : "Mulai Istirahat";
    elements.pomoStartPauseBtn.classList.add("btn-primary");
    elements.pomoStartPauseBtn.classList.remove("btn-secondary");
  }
}

function togglePomoStartPause() {
  if (pomoIsRunning) {
    pomoIsRunning = false;
    clearInterval(pomoTimerInterval);
    updatePomoButtonUI();
  } else {
    pomoIsRunning = true;
    updatePomoButtonUI();

    pomoTimerInterval = setInterval(() => {
      pomoTimeLeft--;
      updatePomoDisplay();

      if (pomoTimeLeft <= 0) {
        clearInterval(pomoTimerInterval);
        pomoIsRunning = false;
        handlePomoSessionComplete();
      }
    }, 1000);
  }
}

/**
 * Dipanggil saat waktu sesi Pomodoro mencapai 00:00
 */
function handlePomoSessionComplete() {
  playChimeSound();

  if (pomoMode === "focus") {
    // Catat statistik fokus
    pomoStats.completedSessions += 1;
    pomoStats.totalFocusMinutes += (pomoSettings.focusDuration || 25);
    savePomoStats();
    updatePomoStatsDisplay();

    // Dapatkan nama tugas yang difokuskan
    const taskId = elements.pomoTaskSelect ? elements.pomoTaskSelect.value : "";
    const matchedTask = tasks.find(t => t.id === taskId);
    const taskName = matchedTask ? matchedTask.name : "Belajar Bebas";

    showToast(`🎉 Sesi Fokus Selesai untuk: "${taskName}"! Waktunya istirahat.`);
    setPomoMode("shortBreak");
  } else {
    showToast("☕ Waktu istirahat selesai! Siap untuk sesi fokus berikutnya?");
    setPomoMode("focus");
  }
}

function skipPomoMode() {
  if (pomoMode === "focus") {
    setPomoMode("shortBreak");
  } else {
    setPomoMode("focus");
  }
  showToast(`Beralih ke mode: ${pomoMode === "focus" ? "Focus" : "Break"}`);
}

function updatePomoStatsDisplay() {
  if (elements.pomoSessionsCompleted) {
    elements.pomoSessionsCompleted.textContent = pomoStats.completedSessions;
  }
  if (elements.pomoTotalTime) {
    elements.pomoTotalTime.textContent = `${pomoStats.totalFocusMinutes} Menit`;
  }
}

/**
 * Suara Alarm / Chime Menggunakan Web Audio API (100% Offline & Sintesis Murni)
 */
function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Pleasant Major Chord)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.75);
    });
  } catch (err) {
    console.log("Audio chime playback fallback:", err);
  }
}

// ==========================================
// 7. TASK CRUD & MODAL FORM LOGIC
// ==========================================

function openAddTaskModal(prefillDateKey = null) {
  editingTaskId = null;
  elements.modalHeading.textContent = "Tambah Tugas Baru";
  elements.taskForm.reset();
  elements.editTaskId.value = "";
  resetFormErrors();

  if (prefillDateKey) {
    elements.deadlineInput.value = `${prefillDateKey}T23:59`;
  } else {
    // Default deadline: besok jam 23:59
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
    elements.deadlineInput.value = formatDateTimeLocal(d);
  }

  elements.priorityInput.value = "Medium";
  elements.statusInput.value = "To Do";
  elements.taskModal.classList.remove("hidden");
  elements.taskNameInput.focus();
}

function openEditTaskModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  elements.modalHeading.textContent = "Edit Tugas";
  elements.editTaskId.value = task.id;
  elements.taskNameInput.value = task.name;
  elements.courseInput.value = task.course;
  elements.deadlineInput.value = formatDateTimeLocal(new Date(task.deadline));
  elements.priorityInput.value = task.priority;
  elements.statusInput.value = task.status;

  resetFormErrors();
  elements.taskModal.classList.remove("hidden");
  elements.taskNameInput.focus();
}

function closeTaskModal() {
  elements.taskModal.classList.add("hidden");
  editingTaskId = null;
  resetFormErrors();
}

function resetFormErrors() {
  elements.nameError?.classList.remove("visible");
  elements.courseError?.classList.remove("visible");
  elements.deadlineError?.classList.remove("visible");
}

function validateTaskForm() {
  let isValid = true;
  resetFormErrors();

  if (!elements.taskNameInput.value.trim()) {
    elements.nameError?.classList.add("visible");
    isValid = false;
  }

  if (!elements.courseInput.value.trim()) {
    elements.courseError?.classList.add("visible");
    isValid = false;
  }

  if (!elements.deadlineInput.value) {
    elements.deadlineError?.classList.add("visible");
    isValid = false;
  }

  return isValid;
}

function handleTaskFormSubmit(e) {
  e.preventDefault();
  if (!validateTaskForm()) return;

  const name = elements.taskNameInput.value.trim();
  const course = elements.courseInput.value.trim();
  const deadline = new Date(elements.deadlineInput.value).toISOString();
  const priority = elements.priorityInput.value;
  const status = elements.statusInput.value;

  if (editingTaskId) {
    // Update existing task
    const idx = tasks.findIndex(t => t.id === editingTaskId);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], name, course, deadline, priority, status };
      showToast("Tugas berhasil diperbarui.");
    }
  } else {
    // Add new task
    const newTask = {
      id: "task_" + Date.now(),
      name,
      course,
      deadline,
      priority,
      status
    };
    tasks.unshift(newTask);
    showToast("Tugas baru berhasil ditambahkan!");
  }

  saveTasksData();
  renderApp();
  closeTaskModal();
}

function toggleTaskComplete(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  if (task.status === "Completed") {
    task.status = "In Progress";
    showToast(`Status "${task.name}" dikembalikan ke In Progress.`);
  } else {
    task.status = "Completed";
    showToast(`Kerja bagus! "${task.name}" telah selesai. 🎉`);
  }

  saveTasksData();
  renderApp();
}

function deleteTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const confirmed = confirm(`Hapus tugas "${task.name}"?`);
  if (!confirmed) return;

  tasks = tasks.filter(t => t.id !== taskId);
  saveTasksData();
  renderApp();
  showToast("Tugas telah dihapus.");
}

function formatDateTimeLocal(date) {
  const d = new Date(date);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ==========================================
// 8. SETTINGS & PROFILE MODAL
// ==========================================

function openSettingsModal() {
  if (elements.settingsNameInput) elements.settingsNameInput.value = userName;
  if (elements.settingsFocusDuration) elements.settingsFocusDuration.value = pomoSettings.focusDuration;
  if (elements.settingsShortBreakDuration) elements.settingsShortBreakDuration.value = pomoSettings.shortBreakDuration;
  if (elements.settingsLongBreakDuration) elements.settingsLongBreakDuration.value = pomoSettings.longBreakDuration;

  elements.settingsModal?.classList.remove("hidden");
}

function closeSettingsModal() {
  elements.settingsModal?.classList.add("hidden");
}

function handleSettingsSubmit(e) {
  e.preventDefault();

  const newName = elements.settingsNameInput?.value.trim();
  if (newName) {
    userName = newName;
    localStorage.setItem(KEY_USER_NAME, userName);
    updateUserDisplay();
  }

  const focusDur = parseInt(elements.settingsFocusDuration?.value, 10);
  const shortDur = parseInt(elements.settingsShortBreakDuration?.value, 10);
  const longDur = parseInt(elements.settingsLongBreakDuration?.value, 10);

  if (focusDur > 0) pomoSettings.focusDuration = focusDur;
  if (shortDur > 0) pomoSettings.shortBreakDuration = shortDur;
  if (longDur > 0) pomoSettings.longBreakDuration = longDur;

  savePomoSettings();
  resetPomoTimer();

  closeSettingsModal();
  showToast("Pengaturan berhasil disimpan.");
}

function handleClearAllData() {
  const confirmed = confirm("Apakah Anda yakin ingin menghapus SELURUH data Planify? Tindakan ini tidak dapat dibatalkan.");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.removeItem(KEY_USER_NAME);
  localStorage.removeItem(KEY_POMO_SETTINGS);
  localStorage.removeItem(KEY_POMO_STATS);

  tasks = [];
  userName = "";
  closeSettingsModal();
  showToast("Seluruh data telah dihapus.");

  setTimeout(() => {
    window.location.reload();
  }, 800);
}

// ==========================================
// 9. EVENT LISTENERS SETUP
// ==========================================

function setupEventListeners() {
  // Theme Toggle
  elements.themeToggleBtn?.addEventListener("click", toggleTheme);

  // Profile / Settings
  elements.userProfileBtn?.addEventListener("click", openSettingsModal);
  elements.closeSettingsBtn?.addEventListener("click", closeSettingsModal);
  elements.cancelSettingsBtn?.addEventListener("click", closeSettingsModal);
  elements.settingsForm?.addEventListener("submit", handleSettingsSubmit);
  elements.clearAllDataBtn?.addEventListener("click", handleClearAllData);

  // First-Time Onboarding Form
  elements.onboardingForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputName = elements.onboardingNameInput?.value.trim();
    if (inputName) {
      userName = inputName;
      localStorage.setItem(KEY_USER_NAME, userName);
      updateUserDisplay();
      elements.onboardingModal?.classList.add("hidden");
      showToast(`Welcome to Planify, ${userName}! Mari mulai belajar.`);
    }
  });

  // Add Task Buttons
  elements.openAddModalBtn?.addEventListener("click", () => openAddTaskModal());
  elements.emptyStateAddBtn?.addEventListener("click", () => openAddTaskModal());
  elements.closeModalBtn?.addEventListener("click", closeTaskModal);
  elements.cancelModalBtn?.addEventListener("click", closeTaskModal);
  elements.taskForm?.addEventListener("submit", handleTaskFormSubmit);

  // Quick Action Buttons
  elements.quickFocusBtn?.addEventListener("click", () => switchViewMode("pomodoro"));
  elements.quickTodayBtn?.addEventListener("click", () => {
    switchViewMode("calendar");
    calYear = todayDate.getFullYear();
    calMonth = todayDate.getMonth();
    selectedDateKey = formatLocalDateKey(todayDate);
    renderCalendar();
    renderSelectedDayTasks();
  });

  // View Navigation Toggles
  elements.viewCardsBtn?.addEventListener("click", () => switchViewMode("cards"));
  elements.viewCalendarBtn?.addEventListener("click", () => switchViewMode("calendar"));
  elements.viewPomodoroBtn?.addEventListener("click", () => switchViewMode("pomodoro"));

  // Status Filter Tabs
  elements.filterTabs?.forEach(tab => {
    tab.addEventListener("click", () => {
      elements.filterTabs.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      currentFilterStatus = tab.getAttribute("data-status");
      renderApp();
    });
  });

  // Course Filter
  elements.courseFilterSelect?.addEventListener("change", (e) => {
    currentFilterCourse = e.target.value;
    renderApp();
  });

  // Priority Filter
  elements.priorityFilterSelect?.addEventListener("change", (e) => {
    currentFilterPriority = e.target.value;
    renderApp();
  });

  // Search Input (Real-time)
  elements.searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderApp();
  });

  // Calendar Month Navigation
  elements.prevMonthBtn?.addEventListener("click", () => {
    calMonth--;
    if (calMonth < 0) {
      calMonth = 11;
      calYear--;
    }
    renderCalendar();
  });

  elements.nextMonthBtn?.addEventListener("click", () => {
    calMonth++;
    if (calMonth > 11) {
      calMonth = 0;
      calYear++;
    }
    renderCalendar();
  });

  elements.todayBtn?.addEventListener("click", () => {
    calYear = todayDate.getFullYear();
    calMonth = todayDate.getMonth();
    selectedDateKey = formatLocalDateKey(todayDate);
    renderCalendar();
    renderSelectedDayTasks();
  });

  // Calendar Day Selection (Event Delegation)
  elements.calendarDaysGrid?.addEventListener("click", (e) => {
    const cell = e.target.closest(".calendar-day-cell");
    if (!cell) return;

    selectedDateKey = cell.getAttribute("data-date-key");
    renderCalendar();
    renderSelectedDayTasks();
  });

  // Add for Date Button in Calendar
  elements.addForDateBtn?.addEventListener("click", () => {
    openAddTaskModal(selectedDateKey);
  });

  // Focus Mode / Pomodoro Events
  elements.pomoFocusBtn?.addEventListener("click", () => setPomoMode("focus"));
  elements.pomoShortBreakBtn?.addEventListener("click", () => setPomoMode("shortBreak"));
  elements.pomoLongBreakBtn?.addEventListener("click", () => setPomoMode("longBreak"));
  elements.pomoStartPauseBtn?.addEventListener("click", togglePomoStartPause);
  elements.pomoResetBtn?.addEventListener("click", resetPomoTimer);
  elements.pomoSkipBtn?.addEventListener("click", skipPomoMode);

  // Global Actions Delegation (Edit, Delete, Toggle Complete, Focus Task)
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;

    const action = target.getAttribute("data-action");
    const taskId = target.getAttribute("data-id");

    if (action === "toggle-complete") {
      toggleTaskComplete(taskId);
    } else if (action === "edit") {
      openEditTaskModal(taskId);
    } else if (action === "delete") {
      deleteTask(taskId);
    } else if (action === "focus-task") {
      switchViewMode("pomodoro");
      if (elements.pomoTaskSelect) {
        elements.pomoTaskSelect.value = taskId;
      }
      showToast("Tugas dipilih untuk sesi fokus!");
    }
  });

  // Close modals on Escape key or backdrop click
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTaskModal();
      closeSettingsModal();
    }
  });

  elements.taskModal?.addEventListener("click", (e) => {
    if (e.target === elements.taskModal) closeTaskModal();
  });

  elements.settingsModal?.addEventListener("click", (e) => {
    if (e.target === elements.settingsModal) closeSettingsModal();
  });
}

function switchViewMode(mode) {
  activeViewMode = mode;

  elements.viewCardsBtn?.classList.toggle("active", mode === "cards");
  elements.viewCalendarBtn?.classList.toggle("active", mode === "calendar");
  elements.viewPomodoroBtn?.classList.toggle("active", mode === "pomodoro");

  if (mode === "cards") {
    elements.controlsSection?.classList.remove("hidden");
    elements.tasksSection?.classList.remove("hidden");
    elements.calendarSection?.classList.add("hidden");
    elements.pomodoroSection?.classList.add("hidden");
  } else if (mode === "calendar") {
    elements.controlsSection?.classList.add("hidden");
    elements.tasksSection?.classList.add("hidden");
    elements.calendarSection?.classList.remove("hidden");
    elements.pomodoroSection?.classList.add("hidden");
  } else if (mode === "pomodoro") {
    elements.controlsSection?.classList.add("hidden");
    elements.tasksSection?.classList.add("hidden");
    elements.calendarSection?.classList.add("hidden");
    elements.pomodoroSection?.classList.remove("hidden");
    updatePomoTaskDropdown();
  }
}

// ==========================================
// 10. TOAST NOTIFICATION HELPER
// ==========================================
let toastTimer = null;

function showToast(message, duration = 3000) {
  if (!elements.toast) return;

  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  elements.toast.style.opacity = "1";
  elements.toast.style.transform = "translateY(0)";

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.style.opacity = "0";
    elements.toast.style.transform = "translateY(10px)";
    setTimeout(() => {
      elements.toast.classList.add("hidden");
    }, 250);
  }, duration);
}

// Helper Sanitasi HTML
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
