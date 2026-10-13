// Swift Programming Quiz Application
// Handles Login Gateway, Quiz Track Selection (Day 2), Real-Time Scoring & Live Leaderboard

class SwiftQuizApp {
  constructor() {
    this.questions = QUIZ_DATA.questions;
    this.currentIndex = 0;
    this.activeFilter = 'all'; // 'all', 'easy', 'medium', 'output', 'bookmarked'
    
    // Screens: 'login', 'dashboard', 'quiz'
    this.currentScreen = 'login';

    // User progress state
    this.userAnswers = {}; // { [questionId]: { selected: 'A', isCorrect: true, userText?: '', pointsEarned?: number } }
    this.bookmarked = new Set();
    this.streak = 0;
    this.maxStreak = 0;
    this.questionStartTime = Date.now();
    this.soundEnabled = localStorage.getItem('swift_quiz_sound') !== 'false';
    
    // Current Logged-in User
    this.currentUser = null;

    // Leaderboard State (Clean competitor list - no guinea pig test users)
    this.initLeaderboard();

    // Timer state
    this.timerSeconds = 0;
    this.timerInterval = null;
    
    // Audio Context
    this.audioCtx = null;
    
    this.initElements();
    this.bindEvents();
    this.checkSessionAndShowScreen();
    this.startLiveTournamentSimulation();
  }

  // --- Session & Multi-Screen Routing ---
  checkSessionAndShowScreen() {
    const saved = localStorage.getItem('swift_tournament_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
        // Already logged in -> Show Quiz Selection Dashboard
        this.switchScreen('dashboard');
      } catch (e) {
        this.currentUser = null;
        this.switchScreen('login');
      }
    } else {
      // First visit -> Show Login Screen
      this.switchScreen('login');
    }
  }

  switchScreen(screenName) {
    this.currentScreen = screenName;
    const loginEl = document.getElementById('login-screen');
    const dashEl = document.getElementById('dashboard-screen');
    const quizEl = document.getElementById('quiz-screen');

    if (loginEl) loginEl.classList.toggle('hidden', screenName !== 'login');
    if (dashEl) dashEl.classList.toggle('hidden', screenName !== 'dashboard');
    if (quizEl) quizEl.classList.toggle('hidden', screenName !== 'quiz');

    if (screenName === 'dashboard') {
      this.updateDashboardUserUI();
      this.recalculateRankings();
    } else if (screenName === 'quiz') {
      this.updateQuizUserUI();
      this.startTimer();
      this.renderQuestion();
      this.renderNavigator();
      this.updateStats();
      this.recalculateRankings();
    }
  }

  // --- User Profile Handling ---
  saveUser() {
    if (this.currentUser) {
      localStorage.setItem('swift_tournament_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('swift_tournament_user');
    }
  }

  logout() {
    // Completely clear session
    this.currentUser = null;
    localStorage.removeItem('swift_tournament_user');
    localStorage.removeItem('swift_quiz_user'); // Clean up any old guinea pig key
    this.userAnswers = {};
    this.streak = 0;
    this.timerSeconds = 0;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.switchScreen('login');
    this.playSound('click');
  }

  updateDashboardUserUI() {
    if (!this.currentUser) return;
    const avatarEl = document.getElementById('dash-user-avatar');
    const nameEl = document.getElementById('dash-user-name');
    const handleEl = document.getElementById('dash-user-handle');
    const pointsEl = document.getElementById('dash-user-points');

    if (avatarEl) avatarEl.textContent = this.currentUser.avatar;
    if (nameEl) nameEl.textContent = this.currentUser.name;
    if (handleEl) handleEl.textContent = `@${this.currentUser.handle}`;
    if (pointsEl) pointsEl.textContent = this.currentUser.points.toLocaleString();
  }

  updateQuizUserUI() {
    if (!this.currentUser) return;
    const avatarBadge = document.getElementById('user-avatar-badge');
    const nameBadge = document.getElementById('user-name-badge');
    const pointsBadge = document.getElementById('user-points-badge');
    const rankBadge = document.getElementById('user-rank-badge');

    if (avatarBadge) avatarBadge.textContent = this.currentUser.avatar;
    if (nameBadge) nameBadge.textContent = this.currentUser.name;
    if (pointsBadge) pointsBadge.textContent = this.currentUser.points.toLocaleString();
    if (rankBadge) rankBadge.textContent = `#${this.currentUser.rank}`;
  }

  // --- Real-Time Leaderboard System (No Guinea Pig Users) ---
  initLeaderboard() {
    // Official competing developers
    this.competitors = [
      { id: 'c1', name: 'Sophia Vance', handle: 'sophia_v', avatar: '🧙‍♀️', points: 2850, accuracy: 98, completed: 19 },
      { id: 'c2', name: 'Marcus Thorne', handle: 'm_thorne', avatar: '⚡', points: 2680, accuracy: 94, completed: 18 },
      { id: 'c3', name: 'Liam O\'Connor', handle: 'liam_dev', avatar: '👨‍🚀', points: 2420, accuracy: 90, completed: 17 },
      { id: 'c4', name: 'Priya Sharma', handle: 'priya_codes', avatar: '🐯', points: 2290, accuracy: 89, completed: 16 },
      { id: 'c5', name: 'Kenji Sato', handle: 'kenji_s', avatar: '🥷', points: 1940, accuracy: 85, completed: 15 },
      { id: 'c6', name: 'Elena Rostova', handle: 'elena_ios', avatar: '📱', points: 1710, accuracy: 82, completed: 14 },
      { id: 'c7', name: 'David Kim', handle: 'david_k', avatar: '💻', points: 1450, accuracy: 78, completed: 12 }
    ];

    this.recalculateRankings();
  }

  recalculateRankings() {
    const list = [...this.competitors];

    // Only include user if they are logged in
    if (this.currentUser) {
      list.push({
        id: this.currentUser.id,
        name: this.currentUser.name,
        handle: this.currentUser.handle,
        avatar: this.currentUser.avatar,
        points: this.currentUser.points,
        accuracy: this.calculateAccuracy(),
        completed: Object.keys(this.userAnswers).length,
        isCurrentUser: true
      });
    }

    // Sort descending by points
    list.sort((a, b) => b.points - a.points);

    // Assign rank numbers
    list.forEach((item, idx) => {
      item.rank = idx + 1;
      if (item.isCurrentUser && this.currentUser) {
        const oldRank = this.currentUser.rank;
        this.currentUser.rank = item.rank;
        if (oldRank && item.rank < oldRank) {
          this.showRankUpToast(oldRank, item.rank);
        }
      }
    });

    this.rankedList = list;
    this.updateQuizUserUI();
    this.updateDashboardUserUI();
    this.renderMiniLeaderboard();
    this.renderFullLeaderboard();
  }

  calculateAccuracy() {
    const answered = Object.values(this.userAnswers);
    if (answered.length === 0) return 100;
    const correct = answered.filter(a => a.isCorrect).length;
    return Math.round((correct / answered.length) * 100);
  }

  showRankUpToast(fromRank, toRank) {
    this.showFloatingPoints(`🎉 Climbed to Rank #${toRank}!`, 'text-emerald-400 font-bold');
  }

  // --- Real-time Activity Simulation ---
  startLiveTournamentSimulation() {
    const tickerEl = document.getElementById('live-activity-ticker');

    setInterval(() => {
      if (this.currentScreen === 'login') return;

      const comp = this.competitors[Math.floor(Math.random() * this.competitors.length)];
      const ptsGain = Math.floor(Math.random() * 3 + 1) * 50;
      comp.points += ptsGain;
      comp.completed = Math.min(20, (comp.completed || 10) + 1);

      const qNum = Math.floor(Math.random() * 20) + 1;
      const text = `${comp.name} answered Q${qNum} (+${ptsGain} PTS)`;
      if (tickerEl) {
        tickerEl.textContent = text;
      }

      this.recalculateRankings();
    }, 14000);
  }

  // --- Render Leaderboard UI ---
  renderMiniLeaderboard() {
    const container = document.getElementById('mini-leaderboard-rows');
    if (!container || !this.rankedList) return;

    container.innerHTML = '';
    const top4 = this.rankedList.slice(0, 4);
    const userInTop4 = top4.some(item => item.isCurrentUser);

    const displayItems = [...top4];
    if (!userInTop4) {
      const userItem = this.rankedList.find(item => item.isCurrentUser);
      if (userItem) displayItems.push(userItem);
    }

    displayItems.forEach((item) => {
      const row = document.createElement('div');
      const isUser = item.isCurrentUser;
      row.className = `p-2 rounded-xl flex items-center justify-between gap-3 text-xs border transition-all ${
        isUser 
          ? 'leaderboard-current-user bg-orange-500/15 border-orange-500/40' 
          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850'
      }`;

      let rankBadge = `<span class="w-5 text-center font-bold text-slate-400 font-mono">#${item.rank}</span>`;
      if (item.rank === 1) rankBadge = `<span class="w-5 text-center text-amber-400 font-bold">🥇</span>`;
      if (item.rank === 2) rankBadge = `<span class="w-5 text-center text-slate-300 font-bold">🥈</span>`;
      if (item.rank === 3) rankBadge = `<span class="w-5 text-center text-amber-600 font-bold">🥉</span>`;

      row.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0">
          ${rankBadge}
          <span class="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xs shrink-0">${item.avatar}</span>
          <div class="truncate">
            <span class="font-bold ${isUser ? 'text-orange-300' : 'text-slate-200'} truncate block leading-tight">${item.name} ${isUser ? '(You)' : ''}</span>
            <span class="text-[10px] text-slate-500 font-mono leading-tight">@${item.handle}</span>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="font-mono font-bold text-amber-300 text-xs">${item.points.toLocaleString()}</span>
          <span class="text-[10px] text-slate-500 ml-0.5">PTS</span>
        </div>
      `;
      container.appendChild(row);
    });
  }

  renderFullLeaderboard() {
    const podiumEl = document.getElementById('leaderboard-podium');
    const tableEl = document.getElementById('leaderboard-table-rows');
    if (!this.rankedList) return;

    if (podiumEl && this.rankedList.length >= 3) {
      const first = this.rankedList[0];
      const second = this.rankedList[1];
      const third = this.rankedList[2];

      podiumEl.innerHTML = `
        <!-- 2nd Place -->
        <div class="flex flex-col items-center p-3 rounded-2xl bg-slate-900/80 border border-slate-700/70 text-center relative ${second.isCurrentUser ? 'border-orange-500/60 ring-1 ring-orange-500' : ''}">
          <span class="text-xs mb-1">🥈 2nd</span>
          <span class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-lg mb-1">${second.avatar}</span>
          <div class="font-bold text-xs text-slate-200 truncate w-full">${second.name}</div>
          <div class="text-xs font-mono font-bold text-amber-300 mt-1">${second.points.toLocaleString()} PTS</div>
        </div>

        <!-- 1st Place (Crown) -->
        <div class="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-b from-amber-500/15 via-slate-900/90 to-slate-900/90 border border-amber-500/40 text-center relative shadow-lg shadow-amber-500/10 ${first.isCurrentUser ? 'border-orange-500 ring-2 ring-orange-500/40' : ''}">
          <div class="absolute -top-3 text-amber-400 text-lg">👑</div>
          <span class="text-xs font-bold text-amber-400 mb-1 mt-1">🥇 1st</span>
          <span class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-0.5 flex items-center justify-center mb-1">
            <span class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">${first.avatar}</span>
          </span>
          <div class="font-bold text-sm text-amber-200 truncate w-full">${first.name}</div>
          <div class="text-xs font-mono font-bold text-amber-300 mt-1">${first.points.toLocaleString()} PTS</div>
        </div>

        <!-- 3rd Place -->
        <div class="flex flex-col items-center p-3 rounded-2xl bg-slate-900/80 border border-slate-700/70 text-center relative ${third.isCurrentUser ? 'border-orange-500/60 ring-1 ring-orange-500' : ''}">
          <span class="text-xs mb-1">🥉 3rd</span>
          <span class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-lg mb-1">${third.avatar}</span>
          <div class="font-bold text-xs text-slate-200 truncate w-full">${third.name}</div>
          <div class="text-xs font-mono font-bold text-amber-300 mt-1">${third.points.toLocaleString()} PTS</div>
        </div>
      `;
    }

    if (tableEl) {
      tableEl.innerHTML = '';
      this.rankedList.forEach(item => {
        const isUser = item.isCurrentUser;
        const row = document.createElement('div');
        row.className = `p-3 rounded-xl flex items-center justify-between gap-3 text-xs border transition-all ${
          isUser 
            ? 'leaderboard-current-user bg-orange-500/15 border-orange-500/50' 
            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850'
        }`;

        let rankBadge = `<span class="w-6 text-center font-bold text-slate-400 font-mono">#${item.rank}</span>`;
        if (item.rank === 1) rankBadge = `<span class="w-6 text-center text-amber-400 font-bold text-sm">🥇</span>`;
        if (item.rank === 2) rankBadge = `<span class="w-6 text-center text-slate-300 font-bold text-sm">🥈</span>`;
        if (item.rank === 3) rankBadge = `<span class="w-6 text-center text-amber-600 font-bold text-sm">🥉</span>`;

        row.innerHTML = `
          <div class="flex items-center gap-3 min-w-0">
            ${rankBadge}
            <span class="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sm shrink-0">${item.avatar}</span>
            <div class="truncate">
              <div class="font-bold ${isUser ? 'text-orange-300' : 'text-slate-100'} flex items-center gap-2">
                <span>${item.name}</span>
                ${isUser ? '<span class="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">YOU</span>' : ''}
              </div>
              <div class="text-[11px] text-slate-400 font-mono">@${item.handle}</div>
            </div>
          </div>

          <div class="flex items-center gap-4 shrink-0 text-right">
            <div class="hidden sm:block">
              <div class="text-[10px] text-slate-500 uppercase font-semibold">Completed</div>
              <div class="font-bold text-slate-300">${item.completed}/20</div>
            </div>
            <div class="hidden sm:block">
              <div class="text-[10px] text-slate-500 uppercase font-semibold">Accuracy</div>
              <div class="font-bold text-emerald-400">${item.accuracy}%</div>
            </div>
            <div class="min-w-20 text-right">
              <div class="font-mono font-bold text-amber-300 text-sm">${item.points.toLocaleString()}</div>
              <div class="text-[10px] text-slate-500 uppercase tracking-wider">POINTS</div>
            </div>
          </div>
        `;
        tableEl.appendChild(row);
      });
    }
  }

  // --- Real-time Points Awarding ---
  awardPoints(question) {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - this.questionStartTime) / 1000));
    
    let base = 100;
    if (question.difficulty === 'Medium') base = 150;
    if (question.difficulty === 'Challenge' || question.type === 'output') base = 200;

    let speedBonus = 0;
    if (elapsedSeconds <= 5) speedBonus = 50;
    else if (elapsedSeconds <= 10) speedBonus = 25;

    let streakBonus = Math.min(100, this.streak * 20);
    const totalEarned = base + speedBonus + streakBonus;

    if (this.currentUser) {
      this.currentUser.points += totalEarned;
      this.saveUser();
      this.recalculateRankings();
    }

    this.showFloatingPoints(`+${totalEarned} PTS`, 'text-amber-300 font-black text-xl');
    return totalEarned;
  }

  showFloatingPoints(text, extraClasses = '') {
    const container = document.getElementById('floating-points-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `animate-float-points px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-orange-500/40 shadow-xl flex items-center gap-2 ${extraClasses}`;
    el.innerHTML = `<i class="fa-solid fa-bolt text-amber-400"></i><span>${text}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 2000);
  }

  // --- Audio Synthesis via Web Audio API ---
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'correct') {
        const notes = [1046.5, 1318.5, 1567.98];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0, now + idx * 0.07);
          gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.07 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.45);
        });
      } else if (type === 'incorrect') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'fanfare') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.25, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.65);
        });
      }
    } catch (e) {
      console.warn("Audio play error", e);
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('swift_quiz_sound', this.soundEnabled);
    this.updateSoundBtn();
    if (this.soundEnabled) this.playSound('click');
  }

  updateSoundBtn() {
    const btn = document.getElementById('sound-toggle-btn');
    if (!btn) return;
    if (this.soundEnabled) {
      btn.innerHTML = `<i class="fa-solid fa-volume-high text-orange-400"></i>`;
      btn.title = "Mute audio";
    } else {
      btn.innerHTML = `<i class="fa-solid fa-volume-xmark text-slate-400"></i>`;
      btn.title = "Enable audio";
    }
  }

  // --- Swift Syntax Highlighting Helper ---
  highlightSwift(code) {
    if (!code) return '';
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const keywords = ['let', 'var', 'func', 'return', 'if', 'else', 'for', 'in', 'while', 'switch', 'case', 'break', 'true', 'false', 'nil'];
    keywords.forEach(kw => {
      const reg = new RegExp(`\\b(${kw})\\b`, 'g');
      escaped = escaped.replace(reg, '<span class="swift-kw">$1</span>');
    });

    const types = ['Int', 'String', 'Bool', 'Double', 'Float', 'Character', 'Array', 'Dictionary', 'Set'];
    types.forEach(t => {
      const reg = new RegExp(`\\b(${t})\\b`, 'g');
      escaped = escaped.replace(reg, '<span class="swift-type">$1</span>');
    });

    escaped = escaped.replace(/\b(print)\b(?=\()/g, '<span class="swift-fn">$1</span>');
    escaped = escaped.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/g, (match) => {
      if (keywords.includes(match) || types.includes(match) || match === 'print') return match;
      return `<span class="swift-fn">${match}</span>`;
    });

    escaped = escaped.replace(/(".*?")/g, '<span class="swift-str">$1</span>');
    escaped = escaped.replace(/\b(\d+)\b/g, '<span class="swift-num">$1</span>');
    escaped = escaped.replace(/(&gt;=|&lt;=|!=|==|&amp;&amp;|\|\||\%|\+|\-|\*|\-&gt;|\.\.\.&lt;|\.\.\.)/g, '<span class="swift-op">$1</span>');

    return escaped;
  }

  // --- DOM Elements Initialization ---
  initElements() {
    this.qNumberBadge = document.getElementById('q-number-badge');
    this.qTotalBadge = document.getElementById('q-total-badge');
    this.qDifficultyBadge = document.getElementById('q-difficulty-badge');
    this.qCategoryBadge = document.getElementById('q-category-badge');
    this.qPointsBadge = document.getElementById('q-points-badge');
    this.qPrompt = document.getElementById('q-prompt');
    this.codeContainer = document.getElementById('code-container');
    this.codeBlock = document.getElementById('code-block');
    this.copyCodeBtn = document.getElementById('copy-code-btn');
    this.optionsContainer = document.getElementById('options-container');
    this.explanationBox = document.getElementById('explanation-box');
    this.explanationText = document.getElementById('explanation-text');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.bookmarkBtn = document.getElementById('bookmark-btn');
    this.scoreDisplay = document.getElementById('current-score-text');
    this.streakBadge = document.getElementById('streak-badge');
    this.streakCount = document.getElementById('streak-count');
    this.navGrid = document.getElementById('nav-grid');
    this.timerDisplay = document.getElementById('timer-display');
    this.codeOutputTerminal = document.getElementById('code-output-terminal');
    this.terminalInput = document.getElementById('terminal-input');
    this.terminalSubmit = document.getElementById('terminal-submit');

    this.updateSoundBtn();
  }

  // --- Event Binding ---
  bindEvents() {
    // 1. Entry Login Form Submission
    document.getElementById('entry-login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('entry-name').value.trim();
      const handle = document.getElementById('entry-handle').value.trim();
      const selectedAvatar = document.querySelector('#login-avatar-grid .avatar-choice.selected')?.dataset.avatar || '🦅';

      if (!name || !handle) return;

      this.currentUser = {
        id: 'usr_' + Date.now(),
        name: name,
        handle: handle.replace(/^@/, ''),
        avatar: selectedAvatar,
        points: 0,
        rank: 8,
        isCurrentUser: true
      };

      this.saveUser();
      this.playSound('fanfare');
      this.switchScreen('dashboard');
    });

    // Login Avatar Selection
    const loginAvatars = document.querySelectorAll('#login-avatar-grid .avatar-choice');
    loginAvatars.forEach(btn => {
      btn.addEventListener('click', () => {
        this.playSound('click');
        loginAvatars.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // 2. Dashboard Actions
    document.getElementById('launch-day2-quiz-btn')?.addEventListener('click', () => {
      this.playSound('click');
      this.switchScreen('quiz');
    });

    document.getElementById('dash-logout-btn')?.addEventListener('click', () => {
      if (confirm('Log out and return to the login portal?')) {
        this.logout();
      }
    });

    // 3. Quiz Navigation Actions
    document.getElementById('quiz-back-to-dashboard-btn')?.addEventListener('click', () => {
      this.playSound('click');
      this.switchScreen('dashboard');
    });

    this.prevBtn?.addEventListener('click', () => {
      this.playSound('click');
      this.navigate(-1);
    });

    this.nextBtn?.addEventListener('click', () => {
      this.playSound('click');
      this.navigate(1);
    });

    this.bookmarkBtn?.addEventListener('click', () => {
      this.playSound('click');
      this.toggleBookmark();
    });

    document.getElementById('sound-toggle-btn')?.addEventListener('click', () => {
      this.toggleSound();
    });

    // Leaderboard Modal Triggers
    const openLeaderboard = () => {
      this.playSound('click');
      document.getElementById('leaderboard-modal').classList.remove('hidden');
      this.renderFullLeaderboard();
    };
    document.getElementById('open-leaderboard-btn')?.addEventListener('click', openLeaderboard);
    document.getElementById('dash-open-leaderboard-btn')?.addEventListener('click', openLeaderboard);
    document.getElementById('view-full-leaderboard-link')?.addEventListener('click', openLeaderboard);
    document.getElementById('view-leaderboard-from-results')?.addEventListener('click', () => {
      document.getElementById('results-modal').classList.add('hidden');
      openLeaderboard();
    });
    document.getElementById('close-leaderboard-btn')?.addEventListener('click', () => {
      document.getElementById('leaderboard-modal').classList.add('hidden');
    });

    // Reset Tournament Leaderboard
    document.getElementById('reset-leaderboard-btn')?.addEventListener('click', () => {
      if (confirm('Reset tournament scores and restart?')) {
        if (this.currentUser) this.currentUser.points = 0;
        this.saveUser();
        this.initLeaderboard();
        this.restartQuiz(true);
      }
    });

    this.copyCodeBtn?.addEventListener('click', () => {
      const q = this.getCurrentQuestion();
      if (q.code) {
        navigator.clipboard.writeText(q.code).then(() => {
          this.copyCodeBtn.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i><span class="text-xs text-emerald-400">Copied!</span>`;
          setTimeout(() => {
            this.copyCodeBtn.innerHTML = `<i class="fa-regular fa-copy text-xs"></i><span class="text-xs">Copy</span>`;
          }, 1800);
        });
      }
    });

    // Terminal Submit for code output questions
    if (this.terminalSubmit && this.terminalInput) {
      this.terminalSubmit.addEventListener('click', () => {
        this.handleTerminalAnswer();
      });
      this.terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.handleTerminalAnswer();
        }
      });
    }

    // Filter Chips
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.playSound('click');
        filterButtons.forEach(b => b.classList.remove('bg-orange-500/20', 'text-orange-400', 'border-orange-500/40'));
        btn.classList.add('bg-orange-500/20', 'text-orange-400', 'border-orange-500/40');
        this.activeFilter = btn.dataset.filter;
        this.renderNavigator();
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (this.currentScreen !== 'quiz') return;
      if (document.activeElement === this.terminalInput) return;

      if (e.key === 'ArrowLeft') {
        this.navigate(-1);
      } else if (e.key === 'ArrowRight') {
        this.navigate(1);
      } else if (e.key.toLowerCase() === 'b') {
        this.toggleBookmark();
      } else {
        const optionKeys = { '1': 'A', 'a': 'A', '2': 'B', 'b': 'B', '3': 'C', 'c': 'C', '4': 'D', 'd': 'D' };
        if (optionKeys[e.key.toLowerCase()]) {
          const optId = optionKeys[e.key.toLowerCase()];
          const currentQ = this.getCurrentQuestion();
          const exists = currentQ.options.some(o => o.id === optId);
          if (exists) {
            this.handleAnswer(optId);
          }
        }
      }
    });

    // Results modal buttons
    document.getElementById('restart-btn')?.addEventListener('click', () => this.restartQuiz(false));
    document.getElementById('retry-missed-btn')?.addEventListener('click', () => this.retryMissedQuestions());
    document.getElementById('finish-quiz-btn')?.addEventListener('click', () => this.finishQuiz());
    document.getElementById('close-results-btn')?.addEventListener('click', () => {
      document.getElementById('results-modal').classList.add('hidden');
    });
  }

  // --- Timer ---
  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay(this.timerSeconds);
    }, 1000);
  }

  updateTimerDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const str = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    if (this.timerDisplay) {
      this.timerDisplay.textContent = str;
    }
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex];
  }

  // --- Question Rendering ---
  renderQuestion() {
    this.questionStartTime = Date.now();
    const q = this.getCurrentQuestion();
    const answerState = this.userAnswers[q.id];

    this.qNumberBadge.textContent = `Question ${q.id}`;
    this.qTotalBadge.textContent = `${q.id} / ${this.questions.length}`;
    
    this.qDifficultyBadge.textContent = q.difficulty;
    this.qDifficultyBadge.className = 'text-xs font-semibold px-2.5 py-1 rounded-full border ';
    if (q.difficulty === 'Easy') {
      this.qDifficultyBadge.className += 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      if (this.qPointsBadge) this.qPointsBadge.textContent = '+100 PTS';
    } else if (q.difficulty === 'Medium') {
      this.qDifficultyBadge.className += 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      if (this.qPointsBadge) this.qPointsBadge.textContent = '+150 PTS';
    } else if (q.difficulty === 'Challenge') {
      this.qDifficultyBadge.className += 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      if (this.qPointsBadge) this.qPointsBadge.textContent = '+200 PTS';
    } else {
      this.qDifficultyBadge.className += 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      if (this.qPointsBadge) this.qPointsBadge.textContent = '+200 PTS';
    }

    this.qCategoryBadge.textContent = q.category;
    this.qPrompt.textContent = q.prompt;

    const isBookmarked = this.bookmarked.has(q.id);
    this.bookmarkBtn.innerHTML = isBookmarked 
      ? `<i class="fa-solid fa-bookmark text-amber-400"></i>` 
      : `<i class="fa-regular fa-bookmark text-slate-400 hover:text-slate-200"></i>`;
    this.bookmarkBtn.title = isBookmarked ? 'Remove bookmark' : 'Bookmark this question (B)';

    // Code snippet display
    if (q.code) {
      this.codeContainer.classList.remove('hidden');
      const lines = q.code.split('\n');
      const highlightedLines = lines.map((line, idx) => {
        const num = idx + 1;
        const codeHtml = this.highlightSwift(line) || '&nbsp;';
        return `<div class="table-row hover:bg-slate-800/40 transition-colors">
          <span class="table-cell pr-4 text-right text-slate-600 select-none text-xs w-6">${num}</span>
          <span class="table-cell text-slate-200 font-mono text-xs sm:text-sm whitespace-pre">${codeHtml}</span>
        </div>`;
      }).join('');
      this.codeBlock.innerHTML = highlightedLines;
    } else {
      this.codeContainer.classList.add('hidden');
      this.codeBlock.innerHTML = '';
    }

    // Terminal Input container for code output questions
    if (q.type === 'output' && this.codeOutputTerminal) {
      this.codeOutputTerminal.classList.remove('hidden');
      if (this.terminalInput) {
        this.terminalInput.value = answerState?.userText || '';
        this.terminalInput.disabled = !!answerState;
      }
    } else if (this.codeOutputTerminal) {
      this.codeOutputTerminal.classList.add('hidden');
    }

    // Options Rendering
    this.renderOptions(q, answerState);

    // Explanation Box
    if (answerState) {
      this.explanationBox.classList.remove('hidden');
      this.explanationText.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="mt-0.5 text-base ${answerState.isCorrect ? 'text-emerald-400' : 'text-rose-400'}">
            <i class="fa-solid ${answerState.isCorrect ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
          </div>
          <div>
            <div class="font-semibold text-sm mb-1 ${answerState.isCorrect ? 'text-emerald-300' : 'text-rose-300'}">
              ${answerState.isCorrect ? `Correct Answer! (+${answerState.pointsEarned} PTS)` : `Incorrect - Correct is ${q.correct}`}
            </div>
            <p class="text-sm text-slate-300 leading-relaxed">${q.explanation}</p>
          </div>
        </div>
      `;
    } else {
      this.explanationBox.classList.add('hidden');
      this.explanationText.innerHTML = '';
    }

    this.prevBtn.disabled = this.currentIndex === 0;
    this.prevBtn.classList.toggle('opacity-40', this.currentIndex === 0);
    this.prevBtn.classList.toggle('cursor-not-allowed', this.currentIndex === 0);

    const isLast = this.currentIndex === this.questions.length - 1;
    this.nextBtn.innerHTML = isLast 
      ? `<span>Review Results</span><i class="fa-solid fa-flag-checkered text-xs"></i>`
      : `<span>Next</span><i class="fa-solid fa-arrow-right text-xs"></i>`;

    this.renderNavigator();
    this.updateStats();
  }

  // --- Render Multiple Choice Options ---
  renderOptions(q, answerState) {
    this.optionsContainer.innerHTML = '';

    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-card group w-full p-4 rounded-xl text-left border flex items-center justify-between gap-4 transition-all glass-panel cursor-pointer';

      const isSelected = answerState && answerState.selected === opt.id;
      const isCorrectOption = opt.id === q.correct;

      let badgeClass = 'bg-slate-800 text-slate-300 group-hover:bg-orange-500/20 group-hover:text-orange-400 group-hover:border-orange-500/30';
      let icon = '';

      if (answerState) {
        if (isCorrectOption) {
          btn.classList.add('correct');
          badgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
          icon = `<i class="fa-solid fa-circle-check text-emerald-400 text-lg animate-pop-in"></i>`;
        } else if (isSelected && !isCorrectOption) {
          btn.classList.add('incorrect');
          badgeClass = 'bg-rose-500/20 text-rose-400 border-rose-500/50';
          icon = `<i class="fa-solid fa-circle-xmark text-rose-400 text-lg animate-pop-in"></i>`;
        } else {
          btn.classList.add('opacity-50');
        }
      }

      btn.innerHTML = `
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border border-slate-700/60 ${badgeClass} transition-colors">
            ${opt.id}
          </div>
          <span class="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">
            ${opt.text}
          </span>
        </div>
        <div class="shrink-0 flex items-center gap-2">
          ${icon}
          <span class="text-xs text-slate-500 group-hover:text-slate-400 font-mono hidden sm:inline">[${opt.id}]</span>
        </div>
      `;

      if (answerState) {
        btn.classList.add('disabled');
        btn.style.pointerEvents = 'none';
      } else {
        btn.addEventListener('click', () => {
          this.handleAnswer(opt.id);
        });
      }

      this.optionsContainer.appendChild(btn);
    });
  }

  // --- Handle Terminal Direct Answer for Code Output questions ---
  handleTerminalAnswer() {
    if (!this.terminalInput) return;
    const val = this.terminalInput.value.trim();
    if (!val) return;

    const q = this.getCurrentQuestion();
    const isCorrect = val.toLowerCase() === (q.expectedOutput || '').toLowerCase();
    
    let matchedOption = q.options.find(o => o.text.trim().toLowerCase() === val.toLowerCase());
    const selectedId = matchedOption ? matchedOption.id : (isCorrect ? q.correct : 'X');

    let pts = 0;
    if (isCorrect) {
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      this.playSound('correct');
      pts = this.awardPoints(q);
    } else {
      this.streak = 0;
      this.playSound('incorrect');
    }

    this.userAnswers[q.id] = {
      selected: selectedId,
      userText: val,
      isCorrect: isCorrect,
      pointsEarned: pts,
      timestamp: Date.now()
    };

    this.renderQuestion();
  }

  // --- Handle Multiple Choice Answer ---
  handleAnswer(optId) {
    const q = this.getCurrentQuestion();
    if (this.userAnswers[q.id]) return;

    const isCorrect = (optId === q.correct);
    let pts = 0;

    if (isCorrect) {
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      this.playSound('correct');
      pts = this.awardPoints(q);
    } else {
      this.streak = 0;
      this.playSound('incorrect');
    }

    this.userAnswers[q.id] = {
      selected: optId,
      isCorrect: isCorrect,
      pointsEarned: pts,
      timestamp: Date.now()
    };

    this.renderQuestion();
  }

  // --- Toggle Bookmark ---
  toggleBookmark() {
    const q = this.getCurrentQuestion();
    if (this.bookmarked.has(q.id)) {
      this.bookmarked.delete(q.id);
    } else {
      this.bookmarked.add(q.id);
    }
    this.renderQuestion();
    this.renderNavigator();
  }

  // --- Navigation ---
  navigate(delta) {
    const newIdx = this.currentIndex + delta;
    if (newIdx < 0) return;
    if (newIdx >= this.questions.length) {
      this.finishQuiz();
      return;
    }
    this.currentIndex = newIdx;
    this.renderQuestion();
  }

  jumpToQuestion(index) {
    this.playSound('click');
    this.currentIndex = index;
    this.renderQuestion();
  }

  // --- Render Navigator Pills ---
  renderNavigator() {
    this.navGrid.innerHTML = '';

    this.questions.forEach((q, idx) => {
      if (this.activeFilter === 'easy' && q.difficulty !== 'Easy') return;
      if (this.activeFilter === 'medium' && q.difficulty !== 'Medium') return;
      if (this.activeFilter === 'output' && q.type !== 'output') return;
      if (this.activeFilter === 'bookmarked' && !this.bookmarked.has(q.id)) return;

      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'nav-pill relative w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer border ';

      const isCurrent = idx === this.currentIndex;
      const ans = this.userAnswers[q.id];
      const isBookmarked = this.bookmarked.has(q.id);

      if (isCurrent) {
        pill.classList.add('ring-2', 'ring-orange-500', 'scale-105', 'z-10');
      }

      if (ans) {
        if (ans.isCorrect) {
          pill.className += 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30';
        } else {
          pill.className += 'bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30';
        }
      } else {
        pill.className += 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200';
      }

      pill.innerHTML = `<span>${q.id}</span>`;

      if (isBookmarked) {
        pill.innerHTML += `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900"></span>`;
      }

      pill.addEventListener('click', () => {
        this.jumpToQuestion(idx);
      });

      this.navGrid.appendChild(pill);
    });
  }

  // --- Update Dashboard Stats ---
  updateStats() {
    const answeredCount = Object.keys(this.userAnswers).length;
    const correctCount = Object.values(this.userAnswers).filter(a => a.isCorrect).length;

    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `${correctCount} / ${this.questions.length}`;
    }

    if (this.streakCount && this.streakBadge) {
      this.streakCount.textContent = this.streak;
      if (this.streak > 1) {
        this.streakBadge.classList.remove('opacity-40');
      } else {
        this.streakBadge.classList.add('opacity-40');
      }
    }
  }

  // --- Quiz Completion & Modal ---
  finishQuiz() {
    this.playSound('fanfare');
    this.triggerConfetti();

    const total = this.questions.length;
    const answered = Object.keys(this.userAnswers).length;
    const correct = Object.values(this.userAnswers).filter(a => a.isCorrect).length;
    const scorePct = Math.round((correct / total) * 100);

    const modal = document.getElementById('results-modal');
    document.getElementById('modal-score-pct').textContent = `${scorePct}%`;
    document.getElementById('modal-score-ratio').textContent = `${correct} of ${total} Questions Correct`;
    document.getElementById('modal-points-earned').textContent = `${this.currentUser ? this.currentUser.points.toLocaleString() : 0} PTS`;
    document.getElementById('modal-final-rank').textContent = `#${this.currentUser ? this.currentUser.rank : 8}`;
    document.getElementById('modal-streak-max').textContent = `${this.maxStreak} in a row`;
    document.getElementById('modal-accuracy').textContent = answered ? `${Math.round((correct / answered) * 100)}%` : '0%';

    const titleEl = document.getElementById('modal-title-grade');
    const badgeEl = document.getElementById('modal-badge-grade');
    if (scorePct >= 90) {
      titleEl.textContent = 'Swift Grandmaster! 🏆';
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      badgeEl.textContent = 'Expert Tier';
    } else if (scorePct >= 75) {
      titleEl.textContent = 'Logic Maestro! 🚀';
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30';
      badgeEl.textContent = 'Advanced Tier';
    } else if (scorePct >= 50) {
      titleEl.textContent = 'Swift Practitioner! 💡';
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30';
      badgeEl.textContent = 'Intermediate Tier';
    } else {
      titleEl.textContent = 'Keep Leveling Up! 🌱';
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30';
      badgeEl.textContent = 'Apprentice Tier';
    }

    const listEl = document.getElementById('modal-review-list');
    if (listEl) {
      listEl.innerHTML = '';
      this.questions.forEach((q) => {
        const ans = this.userAnswers[q.id];
        const isCorrect = ans && ans.isCorrect;
        const item = document.createElement('div');
        item.className = `p-4 rounded-xl border ${isCorrect ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-rose-950/20 border-rose-500/20'} flex flex-col gap-2`;

        item.innerHTML = `
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-300">Question ${q.id} • ${q.difficulty} (${q.category})</span>
            <span class="${isCorrect ? 'text-emerald-400' : 'text-rose-400'} font-semibold flex items-center gap-1.5">
              <i class="fa-solid ${isCorrect ? 'fa-check' : 'fa-xmark'}"></i>
              ${isCorrect ? `Correct (+${ans.pointsEarned || 0} PTS)` : (ans ? `Selected ${ans.selected} (Correct: ${q.correct})` : 'Unanswered')}
            </span>
          </div>
          <div class="text-sm font-medium text-slate-100">${q.prompt}</div>
          ${q.code ? `<pre class="text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-slate-300 font-mono overflow-x-auto">${q.code}</pre>` : ''}
          <div class="text-xs text-slate-400 mt-1"><strong class="text-slate-300">Explanation:</strong> ${q.explanation}</div>
        `;
        listEl.appendChild(item);
      });
    }

    const retryBtn = document.getElementById('retry-missed-btn');
    const missedCount = this.questions.length - correct;
    if (retryBtn) {
      if (missedCount > 0) {
        retryBtn.classList.remove('hidden');
        retryBtn.textContent = `Retry ${missedCount} Missed Questions`;
      } else {
        retryBtn.classList.add('hidden');
      }
    }

    modal.classList.remove('hidden');
  }

  // --- Retry Missed Questions ---
  retryMissedQuestions() {
    const missed = this.questions.filter(q => {
      const ans = this.userAnswers[q.id];
      return !ans || !ans.isCorrect;
    });

    if (missed.length === 0) return;

    this.questions = missed;
    this.currentIndex = 0;
    this.userAnswers = {};
    this.streak = 0;
    document.getElementById('results-modal').classList.add('hidden');
    this.renderQuestion();
    this.renderNavigator();
    this.updateStats();
  }

  // --- Full Restart ---
  restartQuiz(resetDataset = true) {
    if (resetDataset) {
      this.questions = QUIZ_DATA.questions;
    }
    this.currentIndex = 0;
    this.userAnswers = {};
    this.bookmarked.clear();
    this.streak = 0;
    this.timerSeconds = 0;
    document.getElementById('results-modal').classList.add('hidden');
    this.startTimer();
    this.renderQuestion();
    this.renderNavigator();
    this.updateStats();
    this.recalculateRankings();
  }

  // --- Confetti Canvas ---
  triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#FF5436', '#FF8A00', '#F43F5E', '#10B981', '#38BDF8', '#A855F7', '#FBBF24'];

    for (let i = 0; i < 140; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        w: Math.random() * 9 + 5,
        h: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.8) * 20,
        gravity: 0.45,
        rotation: Math.random() * 360,
        vRotation: (Math.random() - 0.5) * 15,
        opacity: 1
      });
    }

    let animationId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRotation;
        p.opacity -= 0.007;

        if (p.opacity > 0 && p.y < canvas.height + 20) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      if (alive) {
        animationId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.quizApp = new SwiftQuizApp();
});
