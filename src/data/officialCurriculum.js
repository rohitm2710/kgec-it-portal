// Maulana Abul Kalam Azad University of Technology (MAKAUT) / KGEC
// Official Syllabus Structure for B.Tech in Information Technology
// Extracted from IT.pdf (Applicable Curriculum Structure)

export const curriculumSemesters = [
  {
    semNumber: 3,
    semLabel: "Semester III",
    yearLabel: "Second Year",
    academicYear: 2,
    totalCredits: 22,
    courses: [
      { sl: 1, type: "Engineering Science Course", code: "ESC 301", title: "Analog and Digital Electronics", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 2, type: "Professional Core Courses", code: "PCC-CS301", title: "Data Structure & Algorithms", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 3, type: "Professional Core Courses", code: "PCC-CS302", title: "Computer Organisation", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 4, type: "Basic Science course", code: "BSC 301", title: "Mathematics-III (Differential Calculus)", l: 2, t: 0, p: 0, credits: 2, category: "Theory" },
      { sl: 5, type: "Humanities & Social Sciences", code: "HSMC 301", title: "Economics for Engineers (Humanities-II)", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 6, type: "Professional Core Courses", code: "PCC-CS393", title: "IT Workshop (Sci Lab/MATLAB/Python/R)", l: 0, t: 0, p: 4, credits: 2, category: "Practical" },
      { sl: 7, type: "Engineering Science Course", code: "ESC 391", title: "Analog and Digital Electronics Lab", l: 0, t: 0, p: 4, credits: 2, category: "Practical" },
      { sl: 8, type: "Professional Core Courses", code: "PCC-CS391", title: "Data Structure & Algorithms Lab", l: 0, t: 0, p: 4, credits: 2, category: "Practical" },
      { sl: 9, type: "Professional Core Courses", code: "PCC-CS392", title: "Computer Organisation Lab", l: 0, t: 0, p: 4, credits: 2, category: "Practical" },
    ]
  },
  {
    semNumber: 4,
    semLabel: "Semester IV",
    yearLabel: "Second Year",
    academicYear: 2,
    totalCredits: 21,
    courses: [
      { sl: 1, type: "Professional Core Courses", code: "PCC-CS401", title: "Discrete Mathematics", l: 3, t: 1, p: 0, credits: 4, category: "Theory" },
      { sl: 2, type: "Professional Core Courses", code: "PCC-CS 402", title: "Computer Architecture", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 3, type: "Professional Core Courses", code: "PCC-CS403", title: "Formal Language & Automata Theory", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 4, type: "Professional Core Courses", code: "PCC-CS404", title: "Design & Analysis of Algorithms", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 5, type: "Basic Science courses", code: "BSC 401", title: "Biology", l: 2, t: 1, p: 0, credits: 3, category: "Theory" },
      { sl: 6, type: "Mandatory Courses", code: "MC401", title: "Environmental Sciences", l: 1, t: 0, p: 0, credits: 1, category: "Mandatory" },
      { sl: 7, type: "Engineering Science Course", code: "PCC-CS 492", title: "Computer Architecture Lab", l: 0, t: 0, p: 4, credits: 2, category: "Practical" },
      { sl: 8, type: "Professional Core Courses", code: "PCC-CS494", title: "Design & Analysis of Algorithms Lab", l: 0, t: 0, p: 4, credits: 2, category: "Practical" },
    ]
  },
  {
    semNumber: 5,
    semLabel: "Semester V",
    yearLabel: "Third Year",
    academicYear: 3,
    totalCredits: 24,
    courses: [
      { sl: 1, type: "Engineering Science Course", code: "ESC501", title: "Software Engineering", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 2, type: "Professional Core Courses", code: "PCC-CS501", title: "Compiler Design", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 3, type: "Professional Core Courses", code: "PCC-CS502", title: "Operating Systems", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 4, type: "Professional Core Courses", code: "PCC-CS503", title: "Object Oriented Programming", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 5, type: "Humanities & Social Sciences", code: "HSMC-501", title: "Introduction to Industrial Management (Humanities III)", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 6, type: "Professional Elective Courses", code: "PEC-IT501A", title: "Theory of Computation", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 7, type: "Professional Elective Courses", code: "PEC-IT501B", title: "Artificial Intelligence", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 8, type: "Professional Elective Courses", code: "PEC-IT501C", title: "Advanced Computer Architecture", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 9, type: "Professional Elective Courses", code: "PEC-IT501D", title: "Computer Graphics", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 10, type: "Mandatory Courses", code: "MC-CS501", title: "Constitution of India / Essence of Indian Knowledge Tradition", l: 0, t: 0, p: 0, credits: 0, category: "Mandatory" },
      { sl: 11, type: "Professional Core Courses", code: "ESC-591", title: "Software Engineering Lab", l: 0, t: 0, p: 4, credits: 2, category: "Practical" },
      { sl: 12, type: "Professional Core Courses", code: "PCC-CS592", title: "Operating Systems Lab", l: 0, t: 0, p: 4, credits: 2, category: "Practical" },
      { sl: 13, type: "Professional Core Courses", code: "PCC-CS593", title: "Object Oriented Programming Lab", l: 0, t: 0, p: 4, credits: 2, category: "Practical" },
    ]
  },
  {
    semNumber: 6,
    semLabel: "Semester VI",
    yearLabel: "Third Year",
    academicYear: 3,
    totalCredits: 22,
    courses: [
      { sl: 1, type: "Professional Core Courses", code: "PCC-CS601", title: "Database Management Systems", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 2, type: "Professional Core Courses", code: "PCC-CS602", title: "Computer Networks", l: 3, t: 0, p: 0, credits: 3, category: "Theory" },
      { sl: 3, type: "Professional Elective Courses", code: "PEC-IT601A", title: "Advanced Algorithms", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 4, type: "Professional Elective Courses", code: "PEC-IT601B", title: "Distributed Systems", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 5, type: "Professional Elective Courses", code: "PEC-IT601C", title: "Signals & Systems", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 6, type: "Professional Elective Courses", code: "PEC-IT601D", title: "Image Processing", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 7, type: "Professional Elective Courses", code: "PEC-IT602A", title: "Parallel and Distributed Algorithms", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 8, type: "Professional Elective Courses", code: "PEC-IT602B", title: "Data Warehousing & Data Mining", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 9, type: "Professional Elective Courses", code: "PEC-IT602C", title: "Human Computer Interaction", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 10, type: "Professional Elective Courses", code: "PEC-IT602D", title: "Pattern Recognition", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 11, type: "Open Elective courses", code: "OEC-IT601A", title: "Numerical Methods", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 12, type: "Open Elective courses", code: "OEC-IT601B", title: "Human Resource Development and Organizational Behavior", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 13, type: "Project", code: "PROJ-CS601", title: "Research Methodology", l: 3, t: 0, p: 0, credits: 3, category: "Project" },
      { sl: 14, type: "Professional Core Courses", code: "PCC-CS691", title: "Database Management Systems Lab", l: 0, t: 0, p: 4, credits: 2, category: "Practical" },
      { sl: 15, type: "Professional Core Courses", code: "PCC-CS692", title: "Computer Networks Lab", l: 0, t: 0, p: 4, credits: 2, category: "Practical" },
    ]
  },
  {
    semNumber: 7,
    semLabel: "Semester VII",
    yearLabel: "Fourth Year",
    academicYear: 4,
    totalCredits: 18,
    courses: [
      { sl: 1, type: "Professional Elective Courses", code: "PEC-IT701A", title: "Internet Technology", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 2, type: "Professional Elective Courses", code: "PEC-IT701B", title: "Quantum Computing", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 3, type: "Professional Elective Courses", code: "PEC-IT701C", title: "Cloud Computing", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 4, type: "Professional Elective Courses", code: "PEC-IT701D", title: "Machine Learning", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 5, type: "Professional Elective Courses", code: "PEC-IT702A", title: "Multimedia Technology", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 6, type: "Professional Elective Courses", code: "PEC-IT702B", title: "Neural Networks and Deep Learning", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 7, type: "Professional Elective Courses", code: "PEC-IT702C", title: "Soft Computing", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 8, type: "Professional Elective Courses", code: "PEC-IT702D", title: "Ad-Hoc and Sensor Networks", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 9, type: "Professional Elective Courses", code: "PEC-IT702E", title: "Information Theory and Coding", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 10, type: "Professional Elective Courses", code: "PEC-IT702F", title: "Cyber Security", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 11, type: "Open Elective courses", code: "OEC-IT701A", title: "Operations Research", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 12, type: "Open Elective courses", code: "OEC-IT701B", title: "Introduction to Philosophical Thoughts", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 13, type: "Open Elective courses", code: "OEC-IT701C", title: "Soft Skill & Interpersonal Communication", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 14, type: "Humanities & Social Sciences", code: "HSMC 701", title: "Project Management and Entrepreneurship", l: 2, t: 1, p: 0, credits: 3, category: "Theory" },
      { sl: 15, type: "Project", code: "PROJ-IT781", title: "Project-II", l: 0, t: 0, p: 12, credits: 6, category: "Project" },
    ]
  },
  {
    semNumber: 8,
    semLabel: "Semester VIII",
    yearLabel: "Fourth Year (Summer Industry Internship)",
    academicYear: 4,
    totalCredits: 15,
    courses: [
      { sl: 1, type: "Professional Elective Courses", code: "PEC-IT801A", title: "Signals and Networks", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 2, type: "Professional Elective Courses", code: "PEC-IT801B", title: "Cryptography & Network Security", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 3, type: "Professional Elective Courses", code: "PEC-IT801C", title: "Speech and Natural Language Processing", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 4, type: "Professional Elective Courses", code: "PEC-IT801D", title: "Internet of Things", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 5, type: "Professional Elective Courses", code: "PEC-IT801E", title: "Remote Sensing and GIS", l: 3, t: 0, p: 0, credits: 3, category: "Elective" },
      { sl: 6, type: "Open Elective courses", code: "OEC-IT801A", title: "Big Data Analysis", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 7, type: "Open Elective courses", code: "OEC-IT801B", title: "Cyber Law and Ethics", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 8, type: "Open Elective courses", code: "OEC-IT801C", title: "Mobile Computing", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 9, type: "Open Elective courses", code: "OEC-IT801D", title: "Bioinformatics", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 10, type: "Open Elective courses", code: "OEC-IT801E", title: "Robotics", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 11, type: "Open Elective courses", code: "OEC-IT802A", title: "E-Commerce and ERP", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 12, type: "Open Elective courses", code: "OEC-IT802B", title: "Micro-electronics and VLSI Design", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 13, type: "Open Elective courses", code: "OEC-IT802C", title: "Economic Policies in India", l: 3, t: 0, p: 0, credits: 3, category: "Open Elective" },
      { sl: 14, type: "Project", code: "PROJ-CS881", title: "Project-III", l: 0, t: 0, p: 12, credits: 6, category: "Project" },
    ]
  }
];

// Flat list of all unique courses for quick lookup and dropdown selectors
export const allCurriculumCourses = curriculumSemesters.flatMap(sem => 
  sem.courses.map(c => ({
    ...c,
    semester: sem.semNumber,
    academicYear: sem.academicYear,
    semLabel: sem.semLabel,
    displayLabel: `${c.code}: ${c.title}`
  }))
);

/**
 * Dynamic Syllabus Units & Modules per Subject
 * Derived from MAKAUT B.Tech IT Course Syllabi
 */
export const courseSyllabusModules = {
  // Semester III
  "PCC-CS301": [
    { id: "Unit 1", title: "Linear Data Structures (Arrays, Stacks, Queues)" },
    { id: "Unit 2", title: "Linked Lists & Dynamic Memory" },
    { id: "Unit 3", title: "Non-Linear Structures (Trees, BST, Heaps)" },
    { id: "Unit 4", title: "Graph Algorithms & Advanced Searching/Sorting" },
  ],
  "PCC-CS302": [
    { id: "Unit 1", title: "Basic Computer Architecture & Instruction Formats" },
    { id: "Unit 2", title: "Arithmetic Logic Unit (Fixed & Floating Point ALU)" },
    { id: "Unit 3", title: "Memory Hierarchy & Cache Organization" },
    { id: "Unit 4", title: "I/O Organization, Interrupts & DMA" },
  ],
  "ESC 301": [
    { id: "Unit 1", title: "Semiconductor Diodes & BJT Circuits" },
    { id: "Unit 2", title: "Operational Amplifiers & Applications" },
    { id: "Unit 3", title: "Combinational Logic Circuits" },
    { id: "Unit 4", title: "Sequential Circuits, Flip-Flops & Counters" },
  ],
  "BSC 301": [
    { id: "Unit 1", title: "Convergence of Sequences & Series" },
    { id: "Unit 2", title: "Multivariate Differential Calculus" },
    { id: "Unit 3", title: "First & Second Order Differential Equations" },
  ],
  "HSMC 301": [
    { id: "Unit 1", title: "Engineering Economics & Decision Making" },
    { id: "Unit 2", title: "Cost Concepts, Break-even & Inflation" },
    { id: "Unit 3", title: "Capital Budgeting & Depreciation Analysis" },
  ],

  // Semester IV
  "PCC-CS401": [
    { id: "Unit 1", title: "Sets, Relations & Mathematical Logic" },
    { id: "Unit 2", title: "Algebraic Structures, Groups & Rings" },
    { id: "Unit 3", title: "Combinatorics & Recurrence Relations" },
    { id: "Unit 4", title: "Graph Theory & Trees" },
  ],
  "PCC-CS 402": [
    { id: "Unit 1", title: "Pipelining & Instruction Level Parallelism" },
    { id: "Unit 2", title: "Memory Hierarchy Design & Multi-level Caches" },
    { id: "Unit 3", title: "Vector, SIMD & GPU Architectures" },
    { id: "Unit 4", title: "Multiprocessors, Interconnection Networks & Cache Coherence" },
  ],
  "PCC-CS403": [
    { id: "Unit 1", title: "Finite Automata & Regular Languages" },
    { id: "Unit 2", title: "Context-Free Grammars & Pushdown Automata" },
    { id: "Unit 3", title: "Turing Machines & Decidability" },
    { id: "Unit 4", title: "Chomsky Hierarchy & Computational Complexity" },
  ],
  "PCC-CS404": [
    { id: "Unit 1", title: "Asymptotic Analysis & Divide-and-Conquer" },
    { id: "Unit 2", title: "Greedy Algorithms & Dynamic Programming" },
    { id: "Unit 3", title: "Graph Algorithms, Backtracking & Branch-and-Bound" },
    { id: "Unit 4", title: "NP-Completeness, P vs NP & Approximation" },
  ],
  "BSC 401": [
    { id: "Unit 1", title: "Biological Macromolecules & Enzymes" },
    { id: "Unit 2", title: "Cellular Structure, Metabolism & Genetics" },
    { id: "Unit 3", title: "Bioinformatics & Computational Biology Tools" },
  ],

  // Semester V
  "ESC501": [
    { id: "Unit 1", title: "Software Process Models & Agile Methodologies" },
    { id: "Unit 2", title: "Software Requirements Engineering & SRS" },
    { id: "Unit 3", title: "Software Architecture & Object-Oriented Design (UML)" },
    { id: "Unit 4", title: "Software Testing, Quality Assurance & Metrics" },
    { id: "Unit 5", title: "Project Management, Estimation & Maintenance" },
  ],
  "PCC-CS501": [
    { id: "Unit 1", title: "Phases of a Compiler & Lexical Analysis" },
    { id: "Unit 2", title: "Syntax Analysis, LL(1) & LR Parsing" },
    { id: "Unit 3", title: "Syntax Directed Translation & Type Checking" },
    { id: "Unit 4", title: "Intermediate Code Generation (Three-Address Code)" },
    { id: "Unit 5", title: "Code Optimization & Target Machine Code Generation" },
  ],
  "PCC-CS502": [
    { id: "Unit 1", title: "Operating System Architecture & System Calls" },
    { id: "Unit 2", title: "Process Scheduling & Multi-threading" },
    { id: "Unit 3", title: "Synchronization, Semaphore & Deadlock Avoidance" },
    { id: "Unit 4", title: "Virtual Memory Management, Paging & Segmentation" },
    { id: "Unit 5", title: "File Systems, Directory Structures & Disk Scheduling" },
  ],
  "PCC-CS503": [
    { id: "Unit 1", title: "OOP Principles, Classes & Encapsulation" },
    { id: "Unit 2", title: "Inheritance, Polymorphism & Interfaces" },
    { id: "Unit 3", title: "Exception Handling & Multi-threading" },
    { id: "Unit 4", title: "Generics, Collections Framework & Streams" },
  ],

  // Semester VI
  "PCC-CS601": [
    { id: "Unit 1", title: "Database Architecture, Data Models & ER Modeling" },
    { id: "Unit 2", title: "Relational Algebra, Tuple Calculus & SQL" },
    { id: "Unit 3", title: "Relational Schema Design & Normalization (1NF to BCNF)" },
    { id: "Unit 4", title: "Transaction Management, ACID & Concurrency Control" },
    { id: "Unit 5", title: "Indexing, B+ Trees & Query Optimization" },
  ],
  "PCC-CS602": [
    { id: "Unit 1", title: "Network Reference Models (OSI, TCP/IP) & Physical Layer" },
    { id: "Unit 2", title: "Data Link Layer, Flow Control & MAC Protocols" },
    { id: "Unit 3", title: "Network Layer Routing (Distance Vector, Link State, IPv4/IPv6)" },
    { id: "Unit 4", title: "Transport Layer Protocols (TCP, UDP & Congestion Control)" },
    { id: "Unit 5", title: "Application Layer Protocols (DNS, HTTP, FTP, Socket API)" },
  ],
  "PEC-IT601A": [
    { id: "Unit 1", title: "Amortized Analysis & Advanced Data Structures" },
    { id: "Unit 2", title: "Network Flow Algorithms & Bipartite Matching" },
    { id: "Unit 3", title: "Randomized Algorithms & Monte Carlo Methods" },
    { id: "Unit 4", title: "String Matching & Computational Geometry" },
  ],
  "PEC-IT601B": [
    { id: "Unit 1", title: "Distributed System Models & Remote Procedure Calls (RPC)" },
    { id: "Unit 2", title: "Clock Synchronization & Logical Clocks (Lamport, Vector)" },
    { id: "Unit 3", title: "Distributed Mutual Exclusion & Election Algorithms" },
    { id: "Unit 4", title: "Distributed Consensus, Paxos & Fault Tolerance" },
  ],
  "PEC-IT602B": [
    { id: "Unit 1", title: "Data Warehousing Architecture & Multidimensional Modeling (OLAP)" },
    { id: "Unit 2", title: "ETL Process & Data Preprocessing" },
    { id: "Unit 3", title: "Association Rule Mining (Apriori, FP-Growth)" },
    { id: "Unit 4", title: "Classification, Decision Trees & Clustering Algorithms" },
  ],

  // Semester VII & VIII Electives
  "PEC-IT701C": [
    { id: "Unit 1", title: "Cloud Architecture Models (IaaS, PaaS, SaaS)" },
    { id: "Unit 2", title: "Virtualization Technologies & Hypervisors" },
    { id: "Unit 3", title: "Cloud Storage, Distributed File Systems & MapReduce" },
    { id: "Unit 4", title: "Cloud Security, IAM & SLA Management" },
  ],
  "PEC-IT701D": [
    { id: "Unit 1", title: "Introduction to Machine Learning & Supervised Learning" },
    { id: "Unit 2", title: "Regression, Classification & Logistic Regression" },
    { id: "Unit 3", title: "Support Vector Machines & Kernel Methods" },
    { id: "Unit 4", title: "Unsupervised Learning, Clustering & Dimensionality Reduction (PCA)" },
    { id: "Unit 5", title: "Ensemble Learning (Random Forests, Gradient Boosting)" },
  ],
  "PEC-IT702F": [
    { id: "Unit 1", title: "Cyber Threats, Vulnerabilities & Security Principles" },
    { id: "Unit 2", title: "Cryptography, Symmetric & Asymmetric Encryption" },
    { id: "Unit 3", title: "Network Security, Firewalls & Intrusion Detection (IDS)" },
    { id: "Unit 4", title: "Web Application Security (OWASP Top 10) & Ethical Hacking" },
  ],
  "PEC-IT801B": [
    { id: "Unit 1", title: "Classical Ciphers & Modern Block Ciphers (AES, DES)" },
    { id: "Unit 2", title: "Public Key Cryptography (RSA, ECC, Diffie-Hellman)" },
    { id: "Unit 3", title: "Cryptographic Hash Functions (SHA-256) & Digital Signatures" },
    { id: "Unit 4", title: "Authentication Protocols (Kerberos, PKI) & Network Security (IPsec, TLS)" },
  ],
  "PEC-IT801D": [
    { id: "Unit 1", title: "IoT Architecture, Sensors & Actuators" },
    { id: "Unit 2", title: "IoT Networking Protocols (MQTT, CoAP, Zigbee, LoRaWAN)" },
    { id: "Unit 3", title: "Edge & Fog Computing for IoT" },
    { id: "Unit 4", title: "IoT Data Analytics & Security Challenges" },
  ],
};

/**
 * Returns dynamic syllabus units specifically for a course code and category
 */
export function getCourseSyllabusModules(courseCode, courseObj) {
  if (!courseCode) {
    return [
      { id: "Unit 1", title: "Unit 1: Fundamentals & Conceptual Architecture" },
      { id: "Unit 2", title: "Unit 2: Core Theoretical Models & Algorithms" },
      { id: "Unit 3", title: "Unit 3: Implementation & Practical Applications" },
      { id: "Unit 4", title: "Unit 4: Advanced Topics & Case Studies" },
    ];
  }

  // Exact match
  if (courseSyllabusModules[courseCode]) {
    return courseSyllabusModules[courseCode];
  }

  // Normalized match without spaces (e.g. 'PCC-CS402' vs 'PCC-CS 402')
  const cleanCode = courseCode.replace(/\s+/g, '').toUpperCase();
  const matchedKey = Object.keys(courseSyllabusModules).find(
    (k) => k.replace(/\s+/g, '').toUpperCase() === cleanCode
  );
  if (matchedKey) {
    return courseSyllabusModules[matchedKey];
  }

  // Dynamic fallback based on credits and course type
  const isLab = courseObj?.category === 'Practical' || courseCode.includes('9');
  const credits = courseObj?.credits || 3;

  if (isLab) {
    return [
      { id: "Unit 1", title: "Lab Module 1: Foundational Experiments & System Setup" },
      { id: "Unit 2", title: "Lab Module 2: Intermediate Implementation & Testing" },
      { id: "Unit 3", title: "Lab Module 3: Advanced Practical Applications" },
      { id: "Unit 4", title: "Lab Module 4: Project Capstone & Mini-Case Study" },
    ];
  }

  // For theory courses
  const unitCount = credits >= 4 ? 5 : credits === 2 ? 3 : 4;
  return Array.from({ length: unitCount }, (_, idx) => ({
    id: `Unit ${idx + 1}`,
    title: `Unit ${idx + 1}: ${courseObj?.title ? courseObj.title + ' - Module ' + (idx + 1) : 'Topic Module ' + (idx + 1)}`
  }));
}
