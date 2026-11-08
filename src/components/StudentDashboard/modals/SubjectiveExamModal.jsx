import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileUp, 
  ShieldCheck, 
  WifiOff, 
  Terminal,
  ShieldAlert,
  ClipboardX
} from 'lucide-react';
import { useExamProctoring } from '../proctoring/useExamProctoring';
import { ExamGatekeeperOverlay } from '../proctoring/ExamGatekeeperOverlay';
import { ProctorAuditModal } from '../proctoring/ProctorAuditModal';
import { API_BASE } from '../../../services/api';

export function SubjectiveExamModal({ isOpen, onClose, examData = null }) {
  if (!isOpen) return null;

  const activeExamId = examData?.examId || 'exam-it601-se';
  const activeExamTitle = examData?.title || 'Continuous Assessment (CA-1) - Software Engineering & System Design';
  const durationInSeconds = (Number(examData?.durationMinutes) || 90) * 60;

  const [questions, setQuestions] = useState([
    {
      id: "q1",
      section: "Section A (LAQ - Long Answer Question)",
      marks: 20,
      text: "Q1. Differentiate between Monolithic MVC architecture and Event-Driven Microservices. Formulate a UML class diagram for an automated script evaluation service implementing the Dependency Inversion Principle. (20 Marks)"
    }
  ]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  const [uploadedFiles, setUploadedFiles] = useState([
    { name: "Rahul_Dey_SE_AnswerScript_p1-4.pdf", size: "3.2 MB" }
  ]);
  const [answerText, setAnswerText] = useState(() => {
    try {
      const saved = localStorage.getItem(`kgec_active_sub_${activeExamId}`);
      return saved || "1. In high-concurrency cloud environments, microservices isolate domain logic behind API gateways...";
    } catch {
      return "1. In high-concurrency cloud environments, microservices isolate domain logic behind API gateways...";
    }
  });
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [proctorMeta, setProctorMeta] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [freezeReason, setFreezeReason] = useState(null); // 'TIME_EXPIRED' | 'TEACHER_FORCE_STOP' | null

  // Anti-Cheat: Disable Clipboard Paste (Ctrl+V) in SAQ/LAQ exams & log as violation
  const [pasteWarning, setPasteWarning] = useState(false);
  const pasteWarningTimerRef = useRef(null);
  const lastPasteViolationRef = useRef(0);

  // Initialize Proctoring Hook
  const proctor = useExamProctoring({
    examId: activeExamId,
    examTitle: activeExamTitle,
    isOpen,
    onFinalSubmit: (meta) => {
      setProctorMeta(meta);
      setIsSubmitted(true);
      try {
        localStorage.removeItem(`kgec_active_sub_${activeExamId}`);
      } catch (e) {
        console.error(e);
      }
    }
  });

  // Handler: Block Ctrl+V / Paste & record official proctoring violation
  const handleBlockedPasteAttempt = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Trigger visual warning alert banner
    setPasteWarning(true);
    if (pasteWarningTimerRef.current) clearTimeout(pasteWarningTimerRef.current);
    pasteWarningTimerRef.current = setTimeout(() => {
      setPasteWarning(false);
    }, 4500);

    // Cooldown guard: 2000ms between consecutive logs to prevent key-mashing flood
    const now = Date.now();
    if (now - lastPasteViolationRef.current > 2000) {
      lastPasteViolationRef.current = now;
      proctor.logCustomViolation(
        'CLIPBOARD_PASTE_ATTEMPT',
        'Candidate attempted unauthorized clipboard paste (Ctrl+V) in Subjective SAQ/LAQ answer editor.',
        { stage: proctor.stage }
      );
    }
  };

  // Global window keydown interceptor for Ctrl+V / Cmd+V / Shift+Insert in SAQ/LAQ exam
  useEffect(() => {
    if (!isOpen || isSubmitted) return;

    const handleGlobalKeyDown = (e) => {
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) ||
        (e.shiftKey && e.key === 'Insert')
      ) {
        handleBlockedPasteAttempt(e);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
      if (pasteWarningTimerRef.current) clearTimeout(pasteWarningTimerRef.current);
    };
  }, [isOpen, isSubmitted]);

  // Polling backend for Teacher "Forcefully Stop Exam" event
  useEffect(() => {
    if (!isOpen || isSubmitted) return;

    const checkTeacherExamStatus = async () => {
      try {
        const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${API_BASE}/proctor/exams/${activeExamId}/status`, { headers });
        if (res.ok) {
          const data = await res.json();
          // If teacher stopped exam or clock expired on server -> freeze immediately!
          if (data.isStopped && proctor.stage === 'ACTIVE') {
            setFreezeReason('TEACHER_FORCE_STOP');
            proctor.triggerSubmitPhase();
          }
        }
      } catch (err) {
        // Air-gapped offline expected; local timers remain active
      }
    };

    const pollId = setInterval(checkTeacherExamStatus, 3000);
    return () => clearInterval(pollId);
  }, [isOpen, activeExamId, isSubmitted, proctor.stage]);

  // Clock tick stops: Screen blocks and forces submission with zero extra time
  useEffect(() => {
    if (proctor.stage === 'ACTIVE' && timeLeft <= 0 && !isSubmitted) {
      setFreezeReason('TIME_EXPIRED');
      proctor.triggerSubmitPhase();
    }
  }, [timeLeft, proctor.stage, isSubmitted]);

  // Step 1: When modal opens, fetch question paper from API while still online
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchSubjectivePaper = async () => {
      setIsLoadingQuestions(true);
      try {
        const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${API_BASE}/questions?questionType=SAQ&limit=5`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            const apiQuestions = data.questions.map((q, idx) => ({
              id: q.id || `sub_q_${idx + 1}`,
              section: `Section ${String.fromCharCode(65 + idx)} (${q.questionType || 'SAQ'})`,
              marks: q.defaultMarks ? Number(q.defaultMarks) : 15,
              text: q.questionText
            }));

            if (isMounted) {
              setQuestions(apiQuestions);
              localStorage.setItem('kgec_cached_subjective_paper', JSON.stringify(apiQuestions));
            }
          }
        }
      } catch (err) {
        console.warn('Network issue fetching subjective questions, using default paper:', err);
      } finally {
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) setIsLoadingQuestions(false);
          }, 350);
        }
      }
    };

    fetchSubjectivePaper();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Timer countdown: only active when inside proctored full-screen offline session
  useEffect(() => {
    if (isSubmitted || proctor.stage !== 'ACTIVE') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, proctor.stage]);

  // Persist written text to local storage offline
  useEffect(() => {
    try {
      localStorage.setItem('kgec_active_subjective_answers', answerText);
    } catch (e) {
      console.error(e);
    }
  }, [answerText]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles(prev => [...prev, { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    proctor.triggerSubmitPhase();
  };

  const handleCloseModal = () => {
    try {
      setIsSubmitted(false);
      setFreezeReason(null);
      setUploadedFiles([]);
      setAnswerText('');
      setShowAuditModal(false);
      proctor.exitFullscreen();
    } catch (e) {
      console.warn("Subjective modal close cleanup note:", e);
    } finally {
      onClose();
    }
  };

  const currentQuestion = questions[0] || {
    section: "Section A (LAQ - Long Answer Question)",
    text: "Q1. Differentiate between Monolithic MVC architecture and Event-Driven Microservices. Formulate a UML class diagram for an automated script evaluation service implementing the Dependency Inversion Principle. (20 Marks)"
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && (isSubmitted || proctor.stage === 'PRE_CHECK')) {
          handleCloseModal();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md"
    >
      {/* Proctoring Gatekeeper Overlays (Loading, Pre-Check, Fullscreen Violated, Internet Detected, Submission Gate) */}
      <ExamGatekeeperOverlay
        stage={proctor.stage}
        isOnline={proctor.isOnline}
        isCheckingNet={proctor.isCheckingNet}
        isFullscreen={proctor.isFullscreen}
        isLoadingQuestions={isLoadingQuestions}
        questionCount={questions.length}
        enterFullscreen={proctor.enterFullscreen}
        startExam={proctor.startExam}
        confirmFinalSubmit={proctor.confirmFinalSubmit}
        violations={proctor.violations}
        examTitle={activeExamTitle}
        freezeReason={freezeReason}
        onClose={handleCloseModal}
      />

      {/* Main Examination Viewport */}
      <div className={`relative w-full h-full sm:h-auto sm:max-h-[94vh] sm:max-w-4xl bg-white sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
        !isSubmitted && proctor.stage !== 'ACTIVE' ? 'pointer-events-none select-none filter blur-[2px]' : ''
      }`}>
        
        {/* Proctored Header Bar */}
        <div className="bg-[#08172c] text-white px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                Proctored SAQ / LAQ
              </span>
              <h2 className="text-sm sm:text-base font-bold">
                {activeExamTitle}
              </h2>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Candidate: Rahul Dey (10200122045) • Air-Gapped Proctored Session
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Security Badges */}
            <div className="hidden md:flex items-center gap-2">
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${
                proctor.isFullscreen 
                  ? 'bg-slate-800/80 text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-950 text-rose-300 border-rose-500/40 animate-pulse'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" /> {proctor.isFullscreen ? 'Full-Screen Active' : 'Full-Screen Inactive'}
              </span>
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${
                !proctor.isOnline 
                  ? 'bg-slate-800/80 text-blue-400 border-blue-500/30' 
                  : 'bg-rose-950 text-rose-300 border-rose-500/40 animate-pulse'
              }`}>
                <WifiOff className="w-3.5 h-3.5" /> {!proctor.isOnline ? 'Air-Gapped (Offline)' : 'Internet Detected'}
              </span>
              {proctor.violationCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAuditModal(true)}
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/40 hover:bg-rose-900 transition-all cursor-pointer"
                  title="Click to view detailed violation audit log"
                >
                  <Terminal className="w-3.5 h-3.5 text-rose-400" />
                  Violations: {proctor.violationCount} (View)
                </button>
              )}
            </div>

            {/* Timer */}
            {!isSubmitted && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 font-mono text-xs sm:text-sm font-bold">
                <Clock className="w-4 h-4 text-red-400" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Exit button (available after submitted or pre-check) */}
            {(isSubmitted || proctor.stage === 'PRE_CHECK') && (
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {/* Question Paper Section */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                {currentQuestion.section}
              </span>
              <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                {currentQuestion.text}
              </h4>
            </div>

            {/* Answer Editor with Anti-Cheat Paste Protection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Written Summary / Architectural Rationale
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-black border border-rose-200 flex items-center gap-1 shadow-2xs">
                    <ClipboardX className="w-3 h-3 text-rose-600" />
                    Ctrl+V Blocked (Monitored)
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    Auto-saved locally (Offline)
                  </span>
                </div>
              </div>

              {/* Paste Blocked Visual Alert Banner */}
              {pasteWarning && (
                <div className="mb-2.5 p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold flex items-center justify-between shadow-xs animate-in slide-in-from-top-1 duration-150">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
                    <span>
                      <strong>Security Policy Violation:</strong> Clipboard paste (Ctrl+V) is strictly disabled in SAQ/LAQ exams. This unauthorized paste attempt has been logged in your official proctoring audit record.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasteWarning(false)}
                    className="text-rose-700 hover:text-rose-950 font-black text-xs ml-3 cursor-pointer shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <textarea
                rows={5}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                onPaste={handleBlockedPasteAttempt}
                onDrop={handleBlockedPasteAttempt}
                onKeyDown={(e) => {
                  if (
                    ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) ||
                    (e.shiftKey && e.key === 'Insert')
                  ) {
                    handleBlockedPasteAttempt(e);
                  }
                }}
                placeholder="Type your textual answer or rationale directly here. Note: Clipboard paste (Ctrl+V) is disabled and monitored as an assessment violation..."
                className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 font-mono leading-relaxed transition-all ${
                  pasteWarning 
                    ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/20' 
                    : 'border-slate-300 focus:ring-[#08172c]'
                }`}
              />
            </div>

            {/* Scanned Script Upload Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Handwritten Answer Paper Upload (AI + OCR Pipeline Ready)
              </label>
              
              <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 text-center bg-slate-50/50 flex flex-col items-center justify-center">
                <FileUp className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  Upload Scanned Answer Scripts (PDF or High-Res JPEG)
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Our OpenRouter AI OCR scanner will automatically extract diagrams and handwriting
                </p>
                <label className="mt-3 inline-block px-4 py-2 rounded-lg bg-[#08172c] text-white text-xs font-bold hover:bg-slate-900 cursor-pointer shadow-xs transition-all">
                  Browse Files
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded File List */}
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-950">{f.name}</span>
                      <span className="text-slate-500 text-[11px]">({f.size})</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      Ready for AI OCR
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Candidate: Rahul Dey (10200122045)
              </span>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Answer Script
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Answer Script Submitted!
            </h3>
            <p className="text-slate-600 text-xs mt-2 max-w-md">
              Your written script has been uploaded and forwarded to the <strong>Teacher Workspace Evaluation Queue</strong> for AI OCR transcription and Dr. S. Roy's grading.
            </p>

            {/* Audit log summary */}
            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 w-full max-w-sm text-left text-xs">
              <div className="flex justify-between items-center text-slate-700 font-bold mb-1">
                <span>Assessment Audit:</span>
                <div className="flex items-center gap-1.5">
                  <span className={proctorMeta?.violationsCount === 0 ? 'text-emerald-700' : 'text-amber-700'}>
                    {proctorMeta?.violationsCount === 0 
                      ? 'Clean Proctoring Session' 
                      : `${proctorMeta?.violationsCount} Logged Events`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(true)}
                    className="ml-1 px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold cursor-pointer transition-all shadow-2xs"
                  >
                    View Logs
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                • Files Transmitted: {uploadedFiles.length} script package(s)<br />
                • Written Content: Verified and cached
              </p>
            </div>

            <button
              onClick={handleCloseModal}
              className="px-6 py-2.5 rounded-xl bg-[#08172c] text-white text-xs font-bold hover:bg-slate-900 cursor-pointer transition-all shadow-md"
            >
              Return to Student Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Proctor Audit Log Modal */}
      <ProctorAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        examId="subjective-se-exam"
        violations={proctor.violations}
        onClearLogs={proctor.clearSessionViolations}
      />
    </div>
  );
}

export default SubjectiveExamModal;
