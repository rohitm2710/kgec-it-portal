import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Code2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  CalendarX, 
  Lock, 
  Play, 
  AlertCircle, 
  ShieldCheck, 
  WifiOff, 
  Maximize2, 
  RefreshCw,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { API_BASE } from '../../services/api';

export function ExaminationPortal({ onStartExam, currentUser }) {
  const [selectedSemester, setSelectedSemester] = useState(() => {
    if (currentUser?.semester) return Number(currentUser.semester);
    try {
      const raw = localStorage.getItem('kgec_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u.semester) return Number(u.semester);
      }
    } catch {}
    return 6;
  });
  const [scheduledExams, setScheduledExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Fetch real student schedule from proctor API (strictly reflects database)
  const fetchSchedule = async (sem = selectedSemester) => {
    try {
      const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_BASE}/proctor/student-schedule?semester=${sem}&academicYear=3`, { headers });
      if (res.ok) {
        const data = await res.json();
        setScheduledExams(data.exams || []);
      } else {
        setScheduledExams([]);
      }
    } catch (err) {
      console.warn("API schedule fetch error:", err);
      setScheduledExams([]);
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchSchedule(selectedSemester);

    // Continuous polling every 3 seconds to catch teacher's "Start Exam" or "Stop Exam" trigger live
    const pollInterval = setInterval(() => {
      fetchSchedule(selectedSemester);
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [selectedSemester]);

  // Local seconds ticking for active live exams
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setScheduledExams(prev => prev.map(exam => {
        if (exam.status === "LIVE" && exam.secondsRemaining > 0) {
          return {
            ...exam,
            secondsRemaining: exam.secondsRemaining - 1
          };
        }
        return exam;
      }));
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  const formatSeconds = (secs) => {
    if (!secs || secs <= 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartExamClick = (exam) => {
    const examType = exam.examCategory === 'SUBJECTIVE_EXAM' ? 'subjective' : 'mcq';
    onStartExam(examType, exam);
  };

  return (
    <div className="w-full mt-8 space-y-6">
      {/* Top Header Row with System Status & Semester Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Department Proctoring Engine • Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Examination Portal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict full-screen enforcement & air-gapped offline proctoring for continuous assessments.
          </p>
        </div>

        {/* Semester / Curriculum Selector with Demo Toggle */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl self-stretch sm:self-auto">
          <span className="text-xs font-bold text-slate-500 pl-2">Semester:</span>
          <button
            onClick={() => setSelectedSemester(6)}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              selectedSemester === 6
                ? 'bg-[#08172c] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Sem 6 (Scheduled Exams)
          </button>
          <button
            onClick={() => setSelectedSemester(4)}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              selectedSemester === 4
                ? 'bg-[#08172c] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Sem 4 (No Ongoing Exam)
          </button>
          <button
            onClick={() => fetchSchedule(selectedSemester)}
            title="Refresh examination schedule"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* STATE A: NO ONGOING EXAM (EMPTY STATE) */}
      {scheduledExams.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mb-5 shadow-inner">
            <CalendarX className="w-10 h-10 text-slate-400 stroke-[1.5]" />
          </div>

          <span className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider border border-slate-200">
            Curriculum Status
          </span>

          <h3 className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
            No Ongoing Exam
          </h3>

          <p className="text-sm text-slate-600 mt-2 max-w-lg leading-relaxed">
            There are currently no active or scheduled examinations for Semester {selectedSemester} (Academic Year 3). 
            When your allocated course faculty schedules an assessment, it will appear here automatically with syllabus details.
          </p>

          {/* Department Guidelines Box */}
          <div className="mt-6 max-w-md w-full bg-slate-50 rounded-2xl border border-slate-200/80 p-4 text-left text-xs space-y-2">
            <div className="font-extrabold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Department Examination Protocol
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              • Pre-exam question paper will be downloaded automatically when an exam starts.
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              • Full-screen and air-gapped offline disconnection are strictly verified prior to test initiation.
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              • Allocated teachers initiate the live countdown timer from the Department Proctor Console.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSelectedSemester(6)}
              className="py-2.5 px-5 rounded-xl bg-[#08172c] hover:bg-[#040d1a] text-white font-bold text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
            >
              Switch to Semester 6 to View Scheduled Exams
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* STATE B & C: SCHEDULED UPCOMING EXAMS WINDOW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Scheduled Examinations for Semester {selectedSemester} ({scheduledExams.length} Total)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Auto-syncs every 3s
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {scheduledExams.map((exam) => {
              const isLive = exam.status === 'LIVE';
              const isCompleted = exam.status === 'COMPLETED' || exam.status === 'STOPPED';
              const isUpcoming = exam.status === 'UPCOMING';

              return (
                <div
                  key={exam.examId}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isLive 
                      ? 'border-emerald-500 ring-2 ring-emerald-400/40' 
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Top Row: Subject Code + Live/Upcoming Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-800 text-xs font-black px-2.5 py-1 rounded-md border border-slate-200">
                          {exam.subjectCode || 'IT-EXAM'}
                        </span>
                        <span className="text-xs font-extrabold text-slate-600">
                          {exam.examCategory === 'SUBJECTIVE_EXAM' ? 'Subjective / Written' : 'MCQ Proctored'}
                        </span>
                      </div>

                      {/* Status Badges */}
                      {isLive && (
                        <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-slate-950" />
                          🔴 Live Assessment Started
                        </span>
                      )}

                      {isUpcoming && (
                        <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          Waiting for Teacher
                        </span>
                      )}

                      {isCompleted && (
                        <span className="bg-slate-200 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-md">
                          Concluded / Closed
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-black text-slate-900 mt-4 tracking-tight leading-snug">
                      {exam.title}
                    </h3>

                    {/* Subject Full Name */}
                    <div className="text-xs font-semibold text-slate-500 mt-1">
                      {exam.subjectName}
                    </div>

                    {/* Scheduled Timing & Metadata Box */}
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          Timing:
                        </span>
                        <span className="font-mono font-semibold">
                          {exam.scheduledStartTime ? new Date(exam.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '02:30 PM'} 
                          {' – '}
                          {exam.scheduledEndTime ? new Date(exam.scheduledEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '03:30 PM'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Duration & Marks:
                        </span>
                        <span className="font-semibold">
                          {exam.durationMinutes || 60} Mins • Total {exam.totalMarks || 50} Marks
                        </span>
                      </div>

                      {exam.coveredModules && exam.coveredModules.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600 text-[11px]">
                          <span className="font-bold">Covered Units:</span>
                          <span className="font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                            {exam.coveredModules.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Proctoring Protocol Badges */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                        <Maximize2 className="w-3 h-3 text-emerald-600" /> Mandatory Full-Screen
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                        <WifiOff className="w-3 h-3 text-emerald-600" /> Air-Gapped Offline Mode
                      </span>
                    </div>

                    {/* Live Clock Shower when Live */}
                    {isLive && (
                      <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-emerald-700 animate-spin" />
                          Live Assessment Clock:
                        </span>
                        <span className="font-mono text-sm font-black text-emerald-700">
                          {formatSeconds(exam.secondsRemaining)} remaining
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button Row */}
                  <div className="pt-6 mt-4">
                    {/* IF LIVE: Active join button */}
                    {isLive && (
                      <button
                        onClick={() => handleStartExamClick(exam)}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/20 cursor-pointer text-center flex items-center justify-center gap-2 animate-pulse"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Start / Join {exam.examCategory === 'SUBJECTIVE_EXAM' ? 'Subjective' : 'MCQ'} Exam Now
                      </button>
                    )}

                    {/* IF UPCOMING: Waiting for teacher to start exam */}
                    {isUpcoming && (
                      <div className="space-y-2">
                        <button
                          disabled
                          className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-500 font-extrabold text-xs sm:text-sm cursor-not-allowed text-center flex items-center justify-center gap-2 shadow-none select-none"
                        >
                          <Lock className="w-4 h-4 text-slate-400" />
                          Waiting for Teacher to Start Exam
                        </button>
                        <p className="text-[11px] text-center text-slate-500">
                          Allocated teacher must open the "Monitor Exam" module and click <strong>"Start Exam"</strong> to open this session.
                        </p>
                      </div>
                    )}

                    {/* IF COMPLETED OR STOPPED: Disabled */}
                    {isCompleted && (
                      <button
                        disabled
                        className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs sm:text-sm cursor-not-allowed text-center select-none"
                      >
                        Examination Concluded & Locked
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Muted Card: Programming Exam (Disabled / Muted) */}
      <div className="bg-[#f8fafc] rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-slate-200 text-slate-400 rounded-xl">
            <Code2 className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-slate-400">
                Programming Assessment (Compiler Sandbox)
              </h4>
              <span className="bg-slate-200 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded-md">
                Disabled / In Development
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated unit-test execution engine and code grading currently under development.
            </p>
          </div>
        </div>
        <button
          disabled
          className="py-2 px-4 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed self-end md:self-auto"
        >
          Coming Soon
        </button>
      </div>
    </div>
  );
}

export default ExaminationPortal;