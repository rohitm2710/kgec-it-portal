import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Eye, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Edit3, 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Search, 
  ArrowLeft, 
  RefreshCw, 
  Database, 
  Terminal, 
  UserCheck,
  Maximize2,
  WifiOff,
  BookOpen,
  Save,
  Check,
  Play,
  Square,
  Timer,
  Share2,
  Users,
  UserPlus
} from 'lucide-react';
import { api, API_BASE } from '../../../services/api';

export function MonitorExamModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [selectedExam, setSelectedExam] = useState(null);
  const [searchStudent, setSearchStudent] = useState('');
  const [filterViolationOnly, setFilterViolationOnly] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  // Editing state for upcoming exam timing
  const [editingExamId, setEditingExamId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    startTime: '',
    durationMinutes: 60,
    totalMarks: 50
  });
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Collaborative Proctoring / Share Monitoring State
  const [sharingModalExam, setSharingModalExam] = useState(null);
  const [facultyTeachers, setFacultyTeachers] = useState([]);
  const [selectedTeacherToShare, setSelectedTeacherToShare] = useState('');
  const [sharedTeachersList, setSharedTeachersList] = useState([]);
  const [isLoadingSharing, setIsLoadingSharing] = useState(false);
  const [shareSuccessMsg, setShareSuccessMsg] = useState('');
  const [shareErrorMsg, setShareErrorMsg] = useState('');

  // Local state for exams (strictly synced with database)
  const [examsList, setExamsList] = useState([]);

  // Students roster for the currently selected exam (strictly loaded from database)
  const [studentsRoster, setStudentsRoster] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Fetch real exam data from backend (strictly reflects database)
  const fetchProctorExams = async () => {
    try {
      const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/proctor/exams`, { headers });
      if (res.ok) {
        const data = await res.json();
        setExamsList(data.exams || []);
      } else {
        setExamsList([]);
      }
    } catch (e) {
      console.warn('Proctor API load note:', e);
      setExamsList([]);
    }
  };

  // Fetch real student roster for the selected exam directly from database
  const fetchExamStudents = async (examId) => {
    if (!examId) return;
    setIsLoadingStudents(true);
    try {
      const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/proctor/exams/${examId}/students`, { headers });
      if (res.ok) {
        const data = await res.json();
        setStudentsRoster(data.students || []);
      } else {
        setStudentsRoster([]);
      }
    } catch (e) {
      console.warn('Failed to load students roster for exam:', e);
      setStudentsRoster([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchProctorExams();
  }, [isOpen]);

  // Synchronize student roster whenever a teacher selects an exam
  useEffect(() => {
    if (selectedExam && selectedExam.examId) {
      fetchExamStudents(selectedExam.examId);
    } else {
      setStudentsRoster([]);
    }
  }, [selectedExam?.examId]);

  // Live timer tick-down for active exams
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setExamsList(prev => prev.map(exam => {
        if (exam.status === "LIVE" && exam.secondsRemaining > 0) {
          const nextRemaining = exam.secondsRemaining - 1;
          if (nextRemaining === 0) {
            return {
              ...exam,
              status: "COMPLETED",
              secondsRemaining: 0,
              canEditTiming: false
            };
          }
          return {
            ...exam,
            secondsRemaining: nextRemaining
          };
        }
        return exam;
      }));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const formatSeconds = (secs) => {
    if (!secs || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // TEACHER ACTION: START EXAM MANUALLY
  const handleTeacherStartExam = async (examId, title) => {
    try {
      const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await fetch(`${API_BASE}/proctor/exams/${examId}/start`, {
        method: 'POST',
        headers
      });
    } catch (err) {
      console.warn('Backend start exam call failed, activating locally:', err);
    }

    // Set exam status to LIVE
    setExamsList(prev => prev.map(e => {
      if (e.examId === examId) {
        return {
          ...e,
          status: "LIVE",
          canEditTiming: false,
          secondsRemaining: (e.durationMinutes || 60) * 60,
          activeNow: e.totalEnrolled || 0
        };
      }
      return e;
    }));

    setToastMessage(`Exam "${title}" started! Clock is now ticking for all students.`);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // TEACHER ACTION: FORCEFULLY STOP EXAM
  const handleTeacherForceStopExam = async (examId, title) => {
    const confirmStop = window.confirm(
      `Are you sure you want to FORCEFULLY STOP the examination for "${title}"?\n\n` +
      `• All student screens will be immediately frozen and locked.\n` +
      `• Zero extra time will be permitted.\n` +
      `• Students will be directed to submit their answers immediately.`
    );
    if (!confirmStop) return;

    try {
      const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await fetch(`${API_BASE}/proctor/exams/${examId}/stop`, {
        method: 'POST',
        headers
      });
    } catch (err) {
      console.warn('Backend stop call failed, updating locally:', err);
    }

    setExamsList(prev => prev.map(e => {
      if (e.examId === examId) {
        return {
          ...e,
          status: "COMPLETED",
          canEditTiming: false,
          secondsRemaining: 0,
          activeNow: 0
        };
      }
      return e;
    }));

    setToastMessage(`Exam "${title}" forcefully stopped. All student screens blocked.`);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Trigger Edit Timing form for upcoming exam
  const handleOpenEditTiming = (exam) => {
    if (!exam.canEditTiming) {
      alert("Action Blocked: Exam has already started or ended. Timing and configuration are permanently locked.");
      return;
    }

    setEditingExamId(exam.examId);
    setEditFormData({
      title: exam.title,
      startTime: exam.scheduledStartTime ? new Date(exam.scheduledStartTime).toISOString().slice(0, 16) : '',
      durationMinutes: exam.durationMinutes || 60,
      totalMarks: exam.totalMarks || 50
    });
  };

  // Save updated timing for upcoming exam
  const handleSaveTiming = async (e) => {
    e.preventDefault();
    if (!editingExamId) return;

    try {
      const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const res = await fetch(`${API_BASE}/proctor/exams/${editingExamId}/schedule`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          title: editFormData.title,
          scheduledStartTime: editFormData.startTime ? new Date(editFormData.startTime).toISOString() : undefined,
          durationMinutes: Number(editFormData.durationMinutes),
          totalMarks: Number(editFormData.totalMarks)
        })
      });

      if (res.status === 403) {
        alert("Action Blocked: The exam has already started! Editing is permanently locked.");
        setEditingExamId(null);
        return;
      }
    } catch (err) {
      console.warn('API update failed, updating local state:', err);
    }

    setExamsList(prev => prev.map(exam => {
      if (exam.examId === editingExamId) {
        const newStart = editFormData.startTime ? new Date(editFormData.startTime).toISOString() : exam.scheduledStartTime;
        const newDuration = Number(editFormData.durationMinutes);
        const newEnd = new Date(new Date(newStart).getTime() + newDuration * 60000).toISOString();
        return {
          ...exam,
          title: editFormData.title,
          scheduledStartTime: newStart,
          scheduledEndTime: newEnd,
          durationMinutes: newDuration,
          totalMarks: Number(editFormData.totalMarks).toFixed(2)
        };
      }
      return exam;
    }));

    setSaveSuccessMessage("Timing and exam details updated successfully!");
    setTimeout(() => {
      setSaveSuccessMessage('');
      setEditingExamId(null);
    }, 1200);
  };

  // TEACHER ACTION: Acknowledge all logs and permanently delete completed exam from database
  const handleAcknowledgeAndDeleteExam = async (examId, title) => {
    const confirmed = window.confirm(
      `Acknowledge & Delete Concluded Exam from Database?\n\n` +
      `Exam: "${title}"\n\n` +
      `• All proctoring violation logs will be acknowledged.\n` +
      `• The exam details and routine will be permanently removed from the database.\n` +
      `• Database storage will be completely freed.`
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_BASE}/proctor/exams/${examId}/acknowledge-and-delete`, {
        method: 'POST',
        headers
      });

      if (res.ok) {
        setExamsList(prev => prev.filter(e => e.examId !== examId));
        if (selectedExam?.examId === examId) {
          setSelectedExam(null);
        }
        setToastMessage(`Exam "${title}" and all logs deleted from database. Storage freed.`);
        setTimeout(() => setToastMessage(''), 4500);
      }
    } catch (e) {
      console.warn("Failed to delete completed exam:", e);
    }
  };

  // Mark as Seen and DELETE logs of that student (freeing up database space)
  const handleMarkAsSeenAndDeleteLogs = async (studentId, studentName) => {
    let wasExamPurged = false;
    try {
      const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_BASE}/proctor/students/${studentId}/violations?examId=${selectedExam?.examId || ''}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        wasExamPurged = !!data?.examPurged;
      }
    } catch (e) {
      console.warn(e);
    }

    if (wasExamPurged) {
      // Exam was complete and all logs are now acknowledged -> Purged from DB!
      setExamsList(prev => prev.filter(e => e.examId !== selectedExam?.examId));
      setSelectedExam(null);
      setToastMessage(`All logs acknowledged for concluded exam "${selectedExam?.title}". Exam details deleted from database.`);
      setTimeout(() => setToastMessage(''), 5000);
      return;
    }

    setStudentsRoster(prev => prev.map(s => {
      if (s.studentId === studentId || s.studentRoll === studentId) {
        return {
          ...s,
          violations: [],
          status: 'ACTIVE_AIR_GAPPED',
          statusLabel: 'Taking Exam (Clean)'
        };
      }
      return s;
    }));

    setExamsList(prev => prev.map(e => {
      if (e.examId === selectedExam?.examId) {
        return {
          ...e,
          flaggedViolationsCount: Math.max(0, (e.flaggedViolationsCount || 1) - 1)
        };
      }
      return e;
    }));

    setToastMessage(`Logs for ${studentName} marked as seen and deleted from database. Storage freed.`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // FACULTY SHARING HANDLERS
  const handleOpenShareModal = async (exam) => {
    setSharingModalExam(exam);
    setSelectedTeacherToShare('');
    setShareSuccessMsg('');
    setShareErrorMsg('');
    setIsLoadingSharing(true);

    try {
      const teachersRes = await api.getProctorTeachers();
      setFacultyTeachers(teachersRes.teachers || []);

      const sharedRes = await api.getExamSharedTeachers(exam.examId);
      setSharedTeachersList(sharedRes.sharedTeachers || []);
    } catch (err) {
      console.warn("Failed to load teachers for sharing:", err);
      setShareErrorMsg(err.message || 'Could not load faculty list.');
    } finally {
      setIsLoadingSharing(false);
    }
  };

  const handleGrantShareAccess = async () => {
    if (!selectedTeacherToShare || !sharingModalExam) return;
    setIsLoadingSharing(true);
    setShareSuccessMsg('');
    setShareErrorMsg('');

    try {
      const res = await api.shareExamMonitor(sharingModalExam.examId, selectedTeacherToShare);
      setShareSuccessMsg(res.message || 'Access granted successfully!');
      setSelectedTeacherToShare('');

      // Refresh shared teachers list
      const sharedRes = await api.getExamSharedTeachers(sharingModalExam.examId);
      setSharedTeachersList(sharedRes.sharedTeachers || []);

      // Update local exam in examsList
      setExamsList(prev => prev.map(e => {
        if (e.examId === sharingModalExam.examId) {
          return {
            ...e,
            sharedWithTeacherIds: res.sharedWithTeacherIds || [...(e.sharedWithTeacherIds || []), selectedTeacherToShare]
          };
        }
        return e;
      }));

      setTimeout(() => setShareSuccessMsg(''), 4000);
    } catch (err) {
      setShareErrorMsg(err.message || 'Failed to grant monitor access.');
    } finally {
      setIsLoadingSharing(false);
    }
  };

  const handleRevokeShareAccess = async (teacherId) => {
    if (!teacherId || !sharingModalExam) return;
    setIsLoadingSharing(true);
    setShareSuccessMsg('');
    setShareErrorMsg('');

    try {
      const res = await api.revokeExamMonitor(sharingModalExam.examId, teacherId);
      setShareSuccessMsg(res.message || 'Access revoked.');

      // Refresh shared teachers list
      const sharedRes = await api.getExamSharedTeachers(sharingModalExam.examId);
      setSharedTeachersList(sharedRes.sharedTeachers || []);

      // Update local exam in examsList
      setExamsList(prev => prev.map(e => {
        if (e.examId === sharingModalExam.examId) {
          return {
            ...e,
            sharedWithTeacherIds: res.sharedWithTeacherIds || (e.sharedWithTeacherIds || []).filter(id => id !== teacherId)
          };
        }
        return e;
      }));

      setTimeout(() => setShareSuccessMsg(''), 3000);
    } catch (err) {
      setShareErrorMsg(err.message || 'Failed to revoke monitor access.');
    } finally {
      setIsLoadingSharing(false);
    }
  };

  const filteredStudents = studentsRoster.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchStudent.toLowerCase()) || 
                          s.studentRoll.includes(searchStudent);
    if (!matchesSearch) return false;
    if (filterViolationOnly) {
      return s.violations.length > 0;
    }
    return true;
  });

  const totalFlaggedInRoster = studentsRoster.filter(s => s.violations.length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="bg-[#08172c] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                  Teacher Invigilation Console
                </span>
                <h2 className="text-base sm:text-lg font-bold">Monitor Exam & Live Invigilator Hub</h2>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Launch exams, monitor live countdowns, force-stop sessions, and audit student violations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-inner animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage('')} className="text-emerald-100 hover:text-white text-xs cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Body: View 1 (Horizontal Exams List) OR View 2 (Student Proctor Monitor) */}
        {!selectedExam ? (
          <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
            {/* Module Overview Banner */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Configured & Upcoming Examinations</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tap <strong>"Start Exam"</strong> to open the test session and start the live student countdown clock. You can also edit timing beforehand or force-stop live exams.
                </p>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-mono">
                <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                  {examsList.filter(e => e.status === 'UPCOMING').length} Upcoming
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {examsList.filter(e => e.status === 'LIVE').length} Live Now
                </span>
              </div>
            </div>

            {/* HORIZONTAL CARDS LIST */}
            {examsList.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-slate-400 stroke-[1.5]" />
                </div>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-slate-200 tracking-wider">
                  Database Status
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-3 tracking-tight">
                  No Scheduled Examinations in Database
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md leading-relaxed">
                  There are currently no active or upcoming examinations in the database. When department faculty generate an assessment blueprint or schedule an exam routine, it will appear here for live monitoring and invigilation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
              {examsList.map((exam) => {
                const isUpcoming = exam.status === "UPCOMING";
                const isLive = exam.status === "LIVE";
                const isCompleted = exam.status === "COMPLETED";

                return (
                  <div
                    key={exam.examId}
                    className={`bg-white rounded-2xl border transition-all p-5 shadow-2xs hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                      isLive 
                        ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-emerald-50/20' 
                        : isUpcoming 
                        ? 'border-slate-200 hover:border-blue-300' 
                        : 'border-slate-200 opacity-80'
                    }`}
                  >
                    {/* Left: Exam Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        {isUpcoming && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" /> Upcoming • Ready to Start
                          </span>
                        )}
                        {isLive && (
                          <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1.5 animate-pulse shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-slate-950" />
                            Live Exam Active
                          </span>
                        )}
                        {isCompleted && (
                          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">
                            Exam Concluded
                          </span>
                        )}

                        {/* Live Ticking Countdown Badge */}
                        {isLive && (
                          <span className="bg-rose-950 text-rose-300 border border-rose-500/50 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-xs">
                            <Timer className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                            Time Remaining: {formatSeconds(exam.secondsRemaining)}
                          </span>
                        )}

                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {exam.subjectCode}
                        </span>

                        {/* Creator / Ownership Badge */}
                        {exam.isOwner ? (
                          <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-indigo-600" /> Owner (You)
                          </span>
                        ) : exam.isShared ? (
                          <span className="bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Users className="w-3 h-3 text-purple-600" /> Co-Proctor (Shared by {exam.creatorName})
                          </span>
                        ) : null}

                        <span className="text-xs text-slate-500">
                          Sem {exam.semester} • Year {exam.academicYear}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {exam.examCategory === 'MCQ_EXAM' ? 'MCQ Type' : 'Subjective SAQ/LAQ'}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {exam.title}
                      </h4>

                      {/* Meta Row: Timing, Duration, Marks, Modules */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(exam.scheduledStartTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(exam.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({exam.durationMinutes} Mins)
                        </span>
                        <span className="font-semibold text-slate-700">
                          Total Marks: {exam.totalMarks}
                        </span>
                        {exam.coveredModules && exam.coveredModules.length > 0 && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            Units: {exam.coveredModules.join(', ')}
                          </span>
                        )}
                      </div>

                      {/* Live Proctor Snapshot Pill */}
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[11px] text-slate-600">
                          Enrolled: <strong className="text-slate-900">{exam.totalEnrolled}</strong>
                        </span>
                        <span className="text-[11px] text-slate-600">
                          Active: <strong className={isLive ? "text-emerald-700 font-bold" : "text-slate-900"}>{exam.activeNow}</strong>
                        </span>
                        {exam.flaggedViolationsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            {exam.flaggedViolationsCount} Student(s) Flagged
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            0 Violations (Clean)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions (Teacher Start/Stop controls + Timing Editor + Monitor Students) */}
                    <div className="flex sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      
                      {/* TEACHER TRIGGER: START EXAM (For Upcoming) OR FORCE STOP (For Live) */}
                      {isUpcoming && (
                        <button
                          onClick={() => handleTeacherStartExam(exam.examId, exam.title)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all animate-pulse"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start Exam (Open for Students)
                        </button>
                      )}

                      {isLive && (
                        <button
                          onClick={() => handleTeacherForceStopExam(exam.examId, exam.title)}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          Forcefully Stop Exam (Conclude)
                        </button>
                      )}

                      {/* Timing Button: Edit if upcoming, Locked if live/completed */}
                      {exam.canEditTiming ? (
                        <button
                          onClick={() => handleOpenEditTiming(exam)}
                          className="px-4 py-2 rounded-xl border border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          Edit Timing & Details
                        </button>
                      ) : isCompleted ? (
                        exam.canDelete ? (
                          <button
                            onClick={() => handleAcknowledgeAndDeleteExam(exam.examId, exam.title)}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            title="Exam is complete. Acknowledge all logs and permanently delete exam details from database to free storage."
                          >
                            <Trash2 className="w-3.5 h-3.5 text-white" />
                            {exam.flaggedViolationsCount === 0 
                              ? "Acknowledge & Delete Concluded Exam" 
                              : `Acknowledge All Logs & Delete Exam (${exam.flaggedViolationsCount})`}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic px-2 py-1 select-none">
                            Completed (Owner can delete)
                          </span>
                        )
                      ) : (
                        <button
                          disabled
                          title="Exam has already started or ended. Timing and configuration are permanently locked."
                          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none border border-slate-200"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          Timing Locked (Started)
                        </button>
                      )}

                      {/* Share Monitoring Access Button (Owner only) */}
                      {exam.canManageAccess && (
                        <button
                          onClick={() => handleOpenShareModal(exam)}
                          className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                          title="Share monitoring access with other faculty members"
                        >
                          <Share2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>Share Monitor</span>
                          {Array.isArray(exam.sharedWithTeacherIds) && exam.sharedWithTeacherIds.length > 0 && (
                            <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-0.5">
                              {exam.sharedWithTeacherIds.length}
                            </span>
                          )}
                        </button>
                      )}

                      {/* Monitor Students View Button */}
                      <button
                        onClick={() => setSelectedExam(exam)}
                        className="px-4 py-2 rounded-xl bg-[#08172c] hover:bg-[#030a14] active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Monitor Students ({exam.flaggedViolationsCount})
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* EDIT TIMING MODAL (Only for Upcoming Exams) */}
            {editingExamId && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                        <Edit3 className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Edit Upcoming Exam Schedule</h3>
                    </div>
                    <button
                      onClick={() => setEditingExamId(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {saveSuccessMessage && (
                    <div className="my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      {saveSuccessMessage}
                    </div>
                  )}

                  <form onSubmit={handleSaveTiming} className="space-y-4 mt-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Exam Title
                      </label>
                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        required
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-[#08172c] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Scheduled Start Time
                        </label>
                        <input
                          type="datetime-local"
                          value={editFormData.startTime}
                          onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                          required
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-[#08172c] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          min="15"
                          max="240"
                          value={editFormData.durationMinutes}
                          onChange={(e) => setEditFormData({ ...editFormData, durationMinutes: e.target.value })}
                          required
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-[#08172c] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Total Marks
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={editFormData.totalMarks}
                        onChange={(e) => setEditFormData({ ...editFormData, totalMarks: e.target.value })}
                        required
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-[#08172c] focus:outline-none"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      Note: Once you click "Start Exam" or when the start time begins, timing and parameters are locked permanently.
                    </p>

                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingExamId(null)}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#08172c] hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* SHARE MONITORING ACCESS MODAL (Owner only) */}
            {sharingModalExam && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Share Monitor Access</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-xs sm:max-w-sm">
                          {sharingModalExam.title}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSharingModalExam(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Feedback Messages */}
                  {shareSuccessMsg && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{shareSuccessMsg}</span>
                    </div>
                  )}
                  {shareErrorMsg && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{shareErrorMsg}</span>
                    </div>
                  )}

                  {/* Grant Access Section */}
                  <div className="mt-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <UserPlus className="w-4 h-4 text-purple-600" />
                      <span>Select Faculty Member to Grant Co-Monitoring Access</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Select a colleague from the IT Department. They will be granted live invigilation and monitoring access for this test.
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch gap-2">
                      <select
                        value={selectedTeacherToShare}
                        onChange={(e) => setSelectedTeacherToShare(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                      >
                        <option value="">-- Choose Faculty Member --</option>
                        {facultyTeachers
                          .filter(t => !sharedTeachersList.some(st => st.id === t.id))
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.fullName} ({t.email})
                            </option>
                          ))}
                      </select>

                      <button
                        onClick={handleGrantShareAccess}
                        disabled={!selectedTeacherToShare || isLoadingSharing}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0"
                      >
                        {isLoadingSharing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5" />
                        )}
                        <span>Grant Access</span>
                      </button>
                    </div>
                  </div>

                  {/* Currently Shared Teachers List */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        Active Co-Proctors ({sharedTeachersList.length})
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Only you (Owner) can revoke access
                      </span>
                    </div>

                    {sharedTeachersList.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-50/80 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        No colleagues have been granted access yet. You are currently the sole proctor for this test.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto rounded-xl border border-slate-200">
                        {sharedTeachersList.map((teacher) => (
                          <div key={teacher.id} className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{teacher.fullName}</p>
                              <p className="text-[11px] text-slate-500 font-mono truncate">{teacher.email}</p>
                              {teacher.institutionalId && (
                                <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-semibold">
                                  {teacher.institutionalId}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleRevokeShareAccess(teacher.id)}
                              disabled={isLoadingSharing}
                              className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 hover:border-transparent transition-all cursor-pointer flex items-center gap-1 shrink-0"
                              title="Revoke access"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Done Button */}
                  <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setSharingModalExam(null)}
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: STUDENT PROCTORING & VIOLATION LOGS MONITOR */
          <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
            {/* Header with Back button and Exam Context */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedExam(null)}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4" /> All Exams
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                      {selectedExam.subjectCode}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {selectedExam.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live Proctoring Feed • Academic Year {selectedExam.academicYear} • Sem {selectedExam.semester}
                  </p>
                </div>
              </div>

              {/* Quick KPI Badges & Stop / Delete Actions */}
              <div className="flex items-center gap-2">
                {selectedExam.status === "LIVE" && (
                  <button
                    onClick={() => handleTeacherForceStopExam(selectedExam.examId, selectedExam.title)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Force Stop Exam
                  </button>
                )}
                {selectedExam.status === "COMPLETED" && (
                  <button
                    onClick={() => handleAcknowledgeAndDeleteExam(selectedExam.examId, selectedExam.title)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    title="Acknowledge all logs and permanently delete this concluded exam from database"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Acknowledge & Delete Exam from DB
                  </button>
                )}
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                  Enrolled: <strong>{studentsRoster.length}</strong>
                </span>
                <span className={`px-3 py-1.5 rounded-xl border text-xs font-bold shadow-2xs ${
                  totalFlaggedInRoster > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  Flagged: <strong>{totalFlaggedInRoster} Students</strong>
                </span>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by name or roll number..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08172c]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterViolationOnly(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !filterViolationOnly 
                      ? 'bg-[#08172c] text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({studentsRoster.length})
                </button>
                <button
                  onClick={() => setFilterViolationOnly(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterViolationOnly 
                      ? 'bg-rose-600 text-white shadow-2xs' 
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Flagged Only ({totalFlaggedInRoster})
                </button>
              </div>
            </div>

            {/* STUDENTS CARDS LIST */}
            <div className="space-y-3">
              {isLoadingStudents ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                  <div className="w-8 h-8 mx-auto border-2 border-[#08172c] border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs font-bold text-slate-700">Loading enrolled students from database...</p>
                </div>
              ) : studentsRoster.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                  <UserCheck className="w-10 h-10 mx-auto text-slate-400 mb-2 stroke-[1.5]" />
                  <h4 className="text-sm font-bold text-slate-900">No Students Enrolled</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    There are currently no active students found in the database enrolled for Semester {selectedExam.semester || 'N/A'}.
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                  <UserCheck className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No students match your filter criteria.</p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const hasViolations = student.violations && student.violations.length > 0;
                  const isExpanded = expandedStudentId === student.studentId;

                  return (
                    <div
                      key={student.studentId}
                      className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                        hasViolations 
                          ? 'border-rose-300 ring-1 ring-rose-500/20' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Main Student Row */}
                      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                            hasViolations 
                              ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {student.studentName.split(' ').map(n => n[0]).join('')}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-slate-900">
                                {student.studentName}
                              </h4>
                              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                Roll: {student.studentRoll}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-xs">
                              <span className="flex items-center gap-1 text-[11px] text-slate-600">
                                <span className={`w-2 h-2 rounded-full ${
                                  student.status === 'ACTIVE_AIR_GAPPED' ? 'bg-emerald-500 animate-pulse' :
                                  student.status === 'FULLSCREEN_BREACHED' ? 'bg-rose-500 animate-ping' : 'bg-blue-500'
                                }`} />
                                {student.statusLabel}
                              </span>

                              {hasViolations ? (
                                <span className="text-[11px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  {student.violations.length} Violation{student.violations.length !== 1 ? 's' : ''} Logged
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Clean (0 Violations)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Expand Window & Mark as Seen (Free Space) */}
                        <div className="flex items-center gap-2">
                          {hasViolations && (
                            <button
                              onClick={() => setExpandedStudentId(isExpanded ? null : student.studentId)}
                              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isExpanded 
                                  ? 'bg-slate-900 text-white border-slate-900' 
                                  : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <Terminal className="w-3.5 h-3.5 text-blue-500" />
                              {isExpanded ? 'Collapse Logs' : 'Expand Window (View Logs)'}
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          )}

                          {hasViolations ? (
                            <button
                              onClick={() => handleMarkAsSeenAndDeleteLogs(student.studentId, student.studentName)}
                              title="Mark logs as seen and permanently purge from DB to free up storage space"
                              className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 active:scale-[0.98] text-rose-700 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              Mark as Seen & Free Space
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                              No Logs to Clear
                            </span>
                          )}
                        </div>
                      </div>

                      {/* EXPANDED WINDOW (Detailed Audit Logs for this Student) */}
                      {isExpanded && hasViolations && (
                        <div className="border-t border-slate-100 bg-slate-900 text-white p-5 space-y-3 animate-in slide-in-from-top-2 duration-150">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                              <Terminal className="w-4 h-4 text-rose-400" />
                              Detailed Client Proctoring Audit Log for {student.studentName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Storage Key: kgec_exam_logs_{selectedExam.examId}_{student.studentId}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {student.violations.map((viol, vIdx) => (
                              <div
                                key={viol.id || vIdx}
                                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-3 text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-rose-400 text-[11px]">
                                      #{vIdx + 1} • {viol.type}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {viol.timeFormatted}
                                    </span>
                                  </div>
                                  <p className="text-slate-300 text-xs mt-1">
                                    {viol.message}
                                  </p>
                                </div>

                                <span className="bg-rose-950 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/30 shrink-0">
                                  Logged
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">
                              Teacher Action: Marking as seen will purge these {student.violations.length} records from the database permanently.
                            </span>
                            <button
                              onClick={() => handleMarkAsSeenAndDeleteLogs(student.studentId, student.studentName)}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Confirm: Mark as Seen & Free Storage
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Invigilation Engine: Live Ticking Synced • Single-Click Force Stop & Space Cleanup</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#08172c] hover:bg-slate-900 text-white font-bold text-xs cursor-pointer transition-all shadow-2xs"
          >
            Close Proctor Hub
          </button>
        </div>

      </div>
    </div>
  );
}

export default MonitorExamModal;
