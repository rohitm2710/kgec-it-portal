// Mock data for KGEC IT Department Portal

export const initialAnnouncements = [];

export const examModules = [
  {
    id: "upload-question",
    title: "Upload Question",
    badge: "QUESTION BANK",
    badgeColor: "bg-sky-100 text-sky-800",
    icon: "file-plus",
    description: "Add MCQ and subjective questions with difficulty tags to the repository.",
    highlighted: true,
  },
  {
    id: "monitor-exam",
    title: "Monitor Exam",
    badge: "LIVE PROCTOR",
    badgeColor: "bg-rose-100 text-rose-800",
    icon: "eye",
    description: "Monitor live & upcoming exams, edit timing before start, and inspect student violations.",
    highlighted: true,
  },
  {
    id: "check-copies",
    title: "Check Copies (AI + OCR)",
    badge: "DISABLED",
    badgeColor: "bg-slate-100 text-slate-500",
    icon: "clipboard-check",
    description: "Scan scripts via OCR for OpenRouter AI grading or manual marks override (Disabled).",
    highlighted: false,
    disabled: true,
  },
  {
    id: "previous-exams-marks",
    title: "Previous Exams & Marks Ledger",
    badge: "RESULTS & LEDGER",
    badgeColor: "bg-emerald-100 text-emerald-800",
    icon: "file-spreadsheet",
    description: "Concluded departmental exams. Tap any exam to view the complete student marks sheet with AB for absentees.",
    highlighted: true,
  },
  {
    id: "routine-check",
    title: "Routine Maker",
    badge: "DISABLED",
    badgeColor: "bg-slate-100 text-slate-500",
    icon: "calendar",
    description: "Create and publish weekly departmental and exam timetables (Disabled).",
    highlighted: false,
    disabled: true,
  },
  {
    id: "announcements",
    title: "Announcements",
    badge: "BROADCAST",
    badgeColor: "bg-sky-100 text-sky-800",
    icon: "megaphone",
    description: "Send notifications with PDF and Image attachments to all entities.",
    highlighted: false,
  },
  {
    id: "question-archive",
    title: "Question Bank Archive",
    badge: "REPOSITORY",
    badgeColor: "bg-sky-100 text-sky-800",
    icon: "archive",
    description: "Browse and filter saved departmental questions by subject and semester.",
    highlighted: false,
  },
  {
    id: "exam-config",
    title: "Exam Configuration",
    badge: "EXAMS",
    badgeColor: "bg-sky-100 text-sky-800",
    icon: "calendar-settings",
    description: "Set up MCQ and Subjective exam windows for student batches.",
    highlighted: false,
  }
];

export const studentExams = [
  {
    id: "mcq",
    title: "MCQ Exam",
    badge: "Active",
    badgeType: "active",
    icon: "file-text",
    course: "PCC-CS601: Database Management Systems",
    description: "Multiple choice exam about relational calculus, normalization, transaction processing, and SQL optimization.",
    timeLimit: "30 Mins",
    totalQuestions: 15,
    totalMarks: 30,
    status: "Active",
    buttonText: "Start MCQ Test"
  },
  {
    id: "subjective",
    title: "Subjective Type Exam",
    badge: "Active",
    badgeType: "active",
    icon: "file-text",
    course: "PCC-CS602: Computer Networks",
    description: "Written subjective exam on TCP/IP transport protocols, routing algorithms (OSPF, BGP), and network security.",
    timeLimit: "90 Mins",
    totalQuestions: 4,
    totalMarks: 50,
    status: "Active",
    buttonText: "Start Subjective Exam"
  },
  {
    id: "programming",
    title: "Programming Exam",
    badge: "Disabled / Muted",
    badgeType: "disabled",
    icon: "code",
    course: "PEC-IT601B: Distributed Systems",
    description: "Coming Soon / Under Development",
    timeLimit: "120 Mins",
    totalQuestions: 3,
    totalMarks: 100,
    status: "Coming Soon",
    buttonText: "Coming Soon"
  }
];

export const sampleOcrCopies = [
  {
    id: "COPY-101",
    studentName: "Rahul Dey",
    rollNumber: "10200122045",
    subject: "Software Engineering & System Design",
    semester: "6th Semester",
    examType: "Continuous Assessment (CA-2)",
    submissionTime: "Today at 10:45 AM",
    pages: 4,
    aiOcrStatus: "Graded",
    aiScore: 26,
    maxScore: 30,
    confidence: "94.8%",
    aiFeedback: [
      { q: "Q1", rubric: "Architectural Patterns (MVC vs Microservices)", score: "9/10", note: "Accurate contrast of state handling and API gateways. Minor omission on circuit breakers." },
      { q: "Q2", rubric: "Class Diagram & Clean Code Principles", score: "8.5/10", note: "Solid UML notation; clear dependency inversion principle application." },
      { q: "Q3", rubric: "Agile Sprint Estimation & Scrum Ceremonies", score: "8.5/10", note: "Precise story point explanation using Fibonacci sequence." }
    ],
    ocrExtractedText: `[STUDENT COPY OCR TRANSCRIPTION - ROLL: 10200122045]
Section A - Architectural Patterns:
Microservices decouple functionality into distinct deployable units communicating via REST/gRPC. In contrast to monolithic MVC where the Model, View, and Controller share the same runtime and database connection pool, each microservice encapsulates its own bounded context and isolated data store...

Section B - Clean Architecture & Dependency Inversion:
High-level modules should not depend on low-level modules; both should depend on abstractions. Interfaces define the contract, while repository implementations reside in the infrastructure layer...`
  },
  {
    id: "COPY-102",
    studentName: "Ananya Sen",
    rollNumber: "10200122018",
    subject: "Software Engineering & System Design",
    semester: "6th Semester",
    examType: "Continuous Assessment (CA-2)",
    submissionTime: "Today at 10:52 AM",
    pages: 5,
    aiOcrStatus: "Pending Approval",
    aiScore: 28,
    maxScore: 30,
    confidence: "97.2%",
    aiFeedback: [
      { q: "Q1", rubric: "Architectural Patterns (MVC vs Microservices)", score: "10/10", note: "Flawless comparison with clean latency and fault tolerance diagrams." },
      { q: "Q2", rubric: "Class Diagram & Clean Code Principles", score: "9/10", note: "Well defined SOLID principles with exemplary Java syntax." },
      { q: "Q3", rubric: "Agile Sprint Estimation", score: "9/10", note: "Deep understanding of velocity calculations and burndown charts." }
    ],
    ocrExtractedText: `[STUDENT COPY OCR TRANSCRIPTION - ROLL: 10200122018]
Question 1:
A monolithic architecture packages all presentation, business, and persistence layers into a single artifact. In microservice architectures, services are independently scalable, resilient, and polyglot...`
  }
];

export const sampleRoutines = [
  { day: "Monday", time: "10:00 - 11:00 AM", subject: "PCC-CS601: Database Management Systems", room: "Room 204", faculty: "Dr. S. Roy", batch: "IT 6th Sem" },
  { day: "Monday", time: "11:00 - 01:00 PM", subject: "PCC-CS691: DBMS Laboratory", room: "Software Lab 3", faculty: "Prof. P. Das", batch: "IT 6th Sem" },
  { day: "Tuesday", time: "10:00 - 11:00 AM", subject: "PCC-CS602: Computer Networks", room: "Room 204", faculty: "Dr. S. Roy", batch: "IT 6th Sem" },
  { day: "Tuesday", time: "02:00 - 04:00 PM", subject: "PCC-CS692: Computer Networks Lab", room: "Software Lab 2", faculty: "Prof. A. Banerjee", batch: "IT 6th Sem" },
  { day: "Wednesday", time: "11:00 - 12:00 PM", subject: "PEC-IT601B: Distributed Systems", room: "Room 204", faculty: "Prof. A. Banerjee", batch: "IT 6th Sem" },
  { day: "Thursday", time: "10:00 - 12:00 PM", subject: "PEC-IT801B: Cryptography & Network Security", room: "Room 205", faculty: "Dr. M. Chatterjee", batch: "IT 8th Sem" },
  { day: "Friday", time: "02:00 - 05:00 PM", subject: "PROJ-CS881: Project-III Evaluation", room: "Seminar Hall", faculty: "All IT Faculty", batch: "IT 8th Sem" }
];

export const sampleMarksLedger = [
  { roll: "10200122045", name: "Rahul Dey", ca1: 24, ca2: 26, pca1: 38, attendance: "92%", total: "88/100", grade: "A+" },
  { roll: "10200122018", name: "Ananya Sen", ca1: 25, ca2: 28, pca1: 39, attendance: "96%", total: "92/100", grade: "O" },
  { roll: "10200122032", name: "Debanjan Saha", ca1: 21, ca2: 22, pca1: 34, attendance: "85%", total: "77/100", grade: "A" },
  { roll: "10200122009", name: "Priya Mukherjee", ca1: 23, ca2: 25, pca1: 37, attendance: "91%", total: "85/100", grade: "A+" },
  { roll: "10200122051", name: "Subhadip Ghosh", ca1: 19, ca2: 20, pca1: 31, attendance: "78%", total: "70/100", grade: "B+" }
];

export const sampleMcqQuestions = [
  {
    id: 1,
    question: "Which architectural pattern is best suited for high concurrency and loose coupling in large-scale distributed systems?",
    options: [
      "Monolithic Client-Server",
      "Event-Driven Microservices with Message Queues",
      "Layered Single Process Architecture",
      "Peer-to-Peer without State Management"
    ],
    correctAnswer: 1,
    explanation: "Event-driven microservices decouple publishers and consumers, allowing asynchronous processing and horizontal scalability."
  },
  {
    id: 2,
    question: "In relational database design, what does the Third Normal Form (3NF) strictly eliminate?",
    options: [
      "Partial dependencies on composite keys",
      "Transitive functional dependencies",
      "Repeating groups and non-atomic values",
      "Foreign key constraints"
    ],
    correctAnswer: 1,
    explanation: "3NF requires a relation to be in 2NF and have no non-prime attribute transitively dependent on any candidate key."
  },
  {
    id: 3,
    question: "What is the primary role of an OCR pre-processing step before feeding hand-written examination scripts into an LLM grader?",
    options: [
      "Compressing JPEG images into zip archives",
      "Binarization, deskewing, and segmenting lines for accurate character tokenization",
      "Deleting misspelled words automatically",
      "Translating handwritten notes to audio waveforms"
    ],
    correctAnswer: 1,
    explanation: "Deskewing and binarization maximize optical character recognition fidelity by improving contrast and structural alignment."
  },
  {
    id: 4,
    question: "Which of the following HTTP response status codes indicates that the server cannot process the request due to client validation failure?",
    options: [
      "200 OK",
      "301 Moved Permanently",
      "422 Unprocessable Entity",
      "502 Bad Gateway"
    ],
    correctAnswer: 2,
    explanation: "HTTP 422 indicates semantic errors in the payload even if syntax is valid."
  }
];
