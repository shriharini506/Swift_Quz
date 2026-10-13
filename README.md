# ⚡ Swift Programming Quiz • Round 2

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Swift](https://img.shields.io/badge/Swift-FA7343?style=for-the-badge&logo=swift&logoColor=white)](https://developer.apple.com/swift/)

An interactive, competitive quiz tournament web application built for **Swift Programming (Day 2: Logic, Functions & Algorithms)** based on the official Round 2 curriculum. Features a participant entry portal, real-time points engine, live tournament leaderboard, and an Apple/Xcode developer aesthetic.

---

## 🌟 Features

- **🚪 Participant Login Portal**:
  - Avatar selection (`🦅`, `🥷`, `🧙‍♂️`, `👨‍🚀`, `🐯`, `⚡`).
  - Custom display name and developer handle (`@handle`).
  - Persistent browser session via `localStorage`.

- **🎯 Tournament Track Selection Lobby**:
  - **Track 1**: Day 1 Swift Basics (Archive).
  - **Track 2**: **Day 2 Logic, Functions & Algorithms** (Active Round 2 Tournament).
  - **Track 3**: Day 3 OOP & Protocols (Upcoming).

- **💻 Xcode-Style Code Snippet Viewer**:
  - macOS window chrome (🔴 🟡 🟢) with Swift syntax token highlighting (keywords, types, strings, numbers, operators).
  - One-click copy snippet button with real-time feedback.
  - Interactive Console Predictor for Code Output questions (type answers or pick cards).

- **⚡ Real-Time Points & Scoring Engine**:
  - Difficulty multipliers: `+100 PTS` (Easy), `+150 PTS` (Medium), `+200 PTS` (Challenge & Code Output).
  - Speed bonus: `+50 PTS` (≤ 5s) / `+25 PTS` (≤ 10s).
  - Consecutive streak multiplier bonus (`🔥`).
  - Floating animated `+PTS` badge popup with synthesized sound effects.

- **🏆 Live Synchronized Leaderboard**:
  - Top 3 podium display (🥇 1st Crown, 🥈 2nd Silver, 🥉 3rd Bronze).
  - Real-time rank calculation as points are scored.
  - Background competitor activity feed simulator.
  - Mini-standings widget on the active quiz sidebar.

- **🎵 Web Audio Synthesizer**:
  - Pure Web Audio API synthesized sound fx (ascending major chords for correct answers, gentle buzz for incorrect, fanfare on finish).
  - Sound on/off toggle.

- **🎉 Completion Modal & Review**:
  - Tier badges (*Swift Grandmaster*, *Logic Maestro*, *Swift Practitioner*, *Apprentice*).
  - Accuracy meter, time elapsed, max streak.
  - Question-by-question review with explanations.
  - "Retry Missed Questions" mode and canvas confetti explosion.

---

## 📂 Project Structure

```
.
├── index.html                           # Multi-screen tournament layout & Tailwind CDN setup
├── style.css                            # Glassmorphism, Swift token highlighting & custom animations
├── questions.js                         # 20 curated questions extracted from Round 2 PPTX
├── app.js                               # Quiz state engine, Web Audio synthesis, points & leaderboard
├── Swift_Quiz_Round2 (1) (1).pptx       # Original curriculum presentation
├── .gitignore                           # Git ignore rules
└── README.md                            # Project documentation
```

---

## 🚀 Getting Started

### Option 1: Direct File
Simply open `index.html` in any modern web browser (Chrome, Safari, Firefox, Edge). No build tools or installations required!

### Option 2: Local HTTP Server
Run with Python:
```bash
python3 -m http.server 3000
```
Then visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Curriculum Covered (Day 2)

1. **Modulo & Integer Division** (`%`)
2. **Function Return Types** (`func`, `-> Type`, `return`)
3. **Branching Logic** (`if`, `else if`, `else`)
4. **Logical Operators** (`&&`, `||`, `!`)
5. **Ranges** (`...` Closed Range vs `..<` Half-Open Range)
6. **Comparison Operators** (`>=`, `!=`, `==`)
7. **Modular Programming Benefits**
8. **Loop Iterations & Counting**
9. **External Argument Labels vs Internal Parameter Names** (`func introduce(name person: String)`)
10. **Code Output Prediction**

---

## 👤 Author

Developed by **[@shriharini506](https://github.com/shriharini506)**
