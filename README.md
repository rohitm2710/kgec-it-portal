# KGEC Department of Information Technology Portal

A pixel-accurate, fully interactive React + Tailwind CSS frontend recreating the designs for **Kalyani Government Engineering College (KGEC) - Department of Information Technology**.

---

## 🌟 Screens & Features Implemented

### 1. 🔑 Institutional Login Portal (`LoginPage.jsx`)
*Faithful reproduction of `Gemini_Generated_Image_les91les91les91l.png`*
- **Header**: Official KGEC Crest emblem with *"KGEC - Department of Information Technology Portal"* and *"Kalyani Government Engineering College"*.
- **Login Card**:
  - Segmented control toggling **Teacher Login** and **Student Login**.
  - **Institutional Email / ID** and **Password** inputs with eye toggle for password visibility.
  - **Remember Me** checkbox and **Forgot Password?** action.
  - Full-width dark navy `#08172c` **Sign In** button.
  - One-click demo profile selectors for quick testing (`Dr. S. Roy` and `Rahul Dey`).

---

### 2. 👨‍🏫 Teacher Dashboard & Workspace Modules (`TeacherDashboard.jsx`)
*Faithful reproduction of `Gemini_Generated_Image_i18m98i18m98i18m.png`*
- **Sidebar**:
  - KGEC IT Department Crest Logo.
  - `Upload Question (Question Bank)`.
  - `Check Copies (AI + OCR)` *(Highlighted active state with border matching screenshot)*.
  - `Routine Check`.
  - `Announcements`.
- **Top Header**:
  - Breadcrumb: *"Teacher Dashboard"*.
  - Main Title: *"Teacher Workspace Modules"*.
  - Subtitle: *"Select a module to manage exams, evaluate scripts, or broadcast notices"*.
  - Right: Notification Bell with unread counter, Dr. S. Roy profile avatar & dropdown, and `"8 Modules"` badge pill.
- **8 Interactive Workspace Modules Grid**:
  1. **Upload Question** (`QUESTION BANK`): Add MCQ and subjective questions with difficulty tags, Bloom's taxonomy, and LaTeX support.
  2. **Check Copies (AI + OCR)** (`EVALUATION`): Highlighted border card. Live OpenRouter AI grading simulation, handwritten script preview, OCR text transcription, question-by-question scoring, and faculty manual marks override.
  3. **Manual Marks Entry** (`GRADING`): Real-time interactive gradebook for IT Department batches with automated aggregate & letter grade computation.
  4. **Routine Check** (`SCHEDULE`): Weekly lecture, software lab, and seminar hall timetable with day and semester filters.
  5. **Announcements** (`BROADCAST`): Form to dispatch notices with PDF circular and image timetable attachments directly into the Student Feed.
  6. **Question Bank Archive** (`REPOSITORY`): Filterable question repository by subject and semester with export.
  7. **Exam Configuration** (`EXAMS`): Schedule MCQ & Subjective exam windows, timers, and AI proctoring rules.
  8. **Student Marks Ledger** (`RECORDS`): Departmental official registry with statistical summary and CSV export.

---

### 3. 🎓 Student Dashboard & Examination Portal (`StudentDashboard.jsx`)
*Faithful reproduction of `Gemini_Generated_Image_les91les91les91l (1).png`*
- **Mock Browser Frame**: Window controls, navigation buttons, and URL bar: `kgec.edu.in/portal/student-dashboard`.
- **Sidebar**: KGEC Logo, `Dashboard` *(Active pill)*, `Announcements`, `Examinations`, `Results`, `Syllabus`, `Support`.
- **Header**: Dark navy bar with *"Student Dashboard"*, notification bell, and Rahul Dey's profile.
- **Announcements Feed**:
  - Faculty Notices card with *"3 hours ago"* timestamp.
  - Notice text and dual attachments:
    - `Notice_Registration.pdf` with red PDF badge and Download action.
    - Image attachment with thumbnail preview and Download action.
  - Clicking any attachment launches an interactive document viewer.
- **Examination Portal**:
  1. **MCQ Exam** (`Active` bright green badge): Launches full interactive timed MCQ test with question palette, radio selectors, and instant automated scorecard.
  2. **Subjective Type Exam** (`Active` bright green badge): Launches written examination interface with question paper, answer editor, and handwritten script upload.
  3. **Programming Exam** (`Disabled / Muted` badge): Styled in disabled state with *"Coming Soon / Under Development"*.
- **Integrated Views**:
  - **Results**: Semester VI Grade Card with SGPA (9.38) and course breakdown.
  - **Syllabus**: Autonomous curriculum breakdown with PDF download.
  - **Support**: IT Department grievance ticketing system.

---

### 4. 🔀 Floating Screen Navigator Bar
A floating navigator at the bottom center allowing one-click switching between:
- `🔑 Login Screen`
- `👨‍🏫 Teacher Dashboard`
- `🎓 Student Dashboard`

---

## 🚀 Running the Project

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.
