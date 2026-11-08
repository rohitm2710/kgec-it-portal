import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  ShieldCheck, 
  WifiOff, 
  Maximize2,
  Terminal,
  FileCheck
} from 'lucide-react';
import { sampleMcqQuestions } from '../../../data/mockData';
import { useExamProctoring } from '../proctoring/useExamProctoring';
import { ExamGatekeeperOverlay } from '../proctoring/ExamGatekeeperOverlay';
import { ProctorAuditModal } from '../proctoring/ProctorAuditModal';
import { API_BASE } from '../../../services/api';

export function McqExamModal({ isOpen, onClose, examData = null }) {
  if (!isOpen) return null;

  const activeExamId = examData?.examId || 'exam-it602-ca2';
  const activeExamTitle = examData?.title || 'Continuous Assessment (CA-2) - MCQ Examination';
  const durationInSeconds = (Number(examData?.durationMinutes) || 60) * 60;

  const [questions, setQuestions] = useState(() => {
    try {
      const cached = localStorage.getItem(`kgec_cached_mcq_${activeExamId}`);
      return cached ? JSON.parse(cached) : sampleMcqQuestions;
    } catch {
      return sampleMcqQuestions;
    }
  });
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(`kgec_active_mcq_${activeExamId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [freezeReason, setFreezeReason] = useState(null); // 'TIME_EXPIRED' | 'TEACHER_FORCE_STOP' | null

  // Initialize Proctoring Hook
  const proctor = useExamProctoring({
    examId: activeExamId,
    examTitle: activeExamTitle,
    isOpen,
    onFinalSubmit: (submissionMeta) => {
      // Calculate score based on actual loaded questions
      let score = 0;
      questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctAnswer) {
          score++;
        }
      });

      const percent = Math.round((score / questions.length) * 100);
      setScoreResult({
        score,
        total: questions.length,
        percent,
        feedback: percent >= 75 ? 'Excellent! Passed with Distinction.' : 'Good attempt. Passed.',
        violationsCount: submissionMeta?.violationsCount || 0
      });

      try {
        localStorage.removeItem(`kgec_active_mcq_${activeExamId}`);
      } catch (e) {
        console.error(e);
      }
      setIsSubmitted(true);
    }
  });

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
    const fetchQuestionPaper = async () => {
      setIsLoadingQuestions(true);
      try {
        const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${API_BASE}/questions?questionType=MCQ&limit=15`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            const apiFormatted = data.questions.map((q, idx) => {
              // Normalize options array
              let opts = ["Option A", "Option B", "Option C", "Option D"];
              if (Array.isArray(q.mcqOptions) && q.mcqOptions.length > 0) {
                opts = q.mcqOptions.map(o => typeof o === 'string' ? o : (o.text || o.optionText || String(o)));
              }
              return {
                id: q.id || `api_${idx + 1}`,
                question: q.questionText,
                options: opts,
                correctAnswer: q.correctOptionId ? Number(q.correctOptionId) : 0,
                marks: q.defaultMarks ? Number(q.defaultMarks) : 2.0
              };
            });

            // Combine with sample questions if needed so test is complete
            const combined = [...apiFormatted, ...sampleMcqQuestions].slice(0, 6);
            if (isMounted) {
              setQuestions(combined);
              localStorage.setItem('kgec_cached_mcq_paper', JSON.stringify(combined));
            }
          } else {
            if (isMounted) {
              setQuestions(sampleMcqQuestions);
              localStorage.setItem('kgec_cached_mcq_paper', JSON.stringify(sampleMcqQuestions));
            }
          }
        } else {
          if (isMounted) {
            setQuestions(sampleMcqQuestions);
            localStorage.setItem('kgec_cached_mcq_paper', JSON.stringify(sampleMcqQuestions));
          }
        }
      } catch (err) {
        console.warn('Network issue fetching questions, using cached paper:', err);
        if (isMounted) {
          setQuestions(sampleMcqQuestions);
          localStorage.setItem('kgec_cached_mcq_paper', JSON.stringify(sampleMcqQuestions));
        }
      } finally {
        if (isMounted) {
          // Delay briefly (300ms) for smooth UX transition to Pre-Check gatekeeper
          setTimeout(() => {
            if (isMounted) setIsLoadingQuestions(false);
          }, 350);
        }
      }
    };

    fetchQuestionPaper();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Timer countdown: only runs when ACTIVE in full-screen offline mode
  useEffect(() => {
    if (isSubmitted || proctor.stage !== 'ACTIVE') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, proctor.stage]);

  // Persist answers to local storage immediately
  useEffect(() => {
    try {
      localStorage.setItem('kgec_active_mcq_answers', JSON.stringify(selectedAnswers));
    } catch (e) {
      console.error(e);
    }
  }, [selectedAnswers]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx] || sampleMcqQuestions[0];

  const handleSelectOption = (optIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  const handleInitiateSubmit = () => {
    proctor.triggerSubmitPhase();
  };

  const handleCloseModal = () => {
    try {
      setIsSubmitted(false);
      setSelectedAnswers({});
      setScoreResult(null);
      setFreezeReason(null);
      setShowAuditModal(false);
      proctor.exitFullscreen();
    } catch (e) {
      console.warn("MCQ modal close cleanup note:", e);
    } finally {
      onClose();
    }
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
      {/* Proctoring Gatekeeper Overlays (Loading questions, Pre-Check, Fullscreen Violated, Internet Detected, Submission Gate) */}
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

      {/* Main Examination Viewport (Full Screen container) */}
      <div className={`relative w-full h-full sm:h-auto sm:max-h-[94vh] sm:max-w-4xl bg-white sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
        !isSubmitted && proctor.stage !== 'ACTIVE' ? 'pointer-events-none select-none filter blur-[2px]' : ''
      }`}>
        
        {/* Proctored Header Bar */}
        <div className="bg-[#08172c] text-white px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                Proctored MCQ
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {activeExamId}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
              {activeExamTitle}
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Candidate: Rahul Dey (10200122045) • Air-Gapped Session
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status Badges */}
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

        {/* Content Body */}
        {!isSubmitted ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Question Index & Status */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Marks: +{currentQ.marks || 2.0} / -0.5 Negative Marking
                </span>
              </div>

              {/* Question Text */}
              <div className="py-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3 mt-1">
                {currentQ.options.map((option, optIdx) => {
                  const isChecked = selectedAnswers[currentQ.id] === optIdx;

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                        isChecked
                          ? 'border-[#08172c] bg-blue-50/70 ring-1 ring-[#08172c]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'border-[#08172c] bg-[#08172c] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        {String.fromCharCode(65 + optIdx)}. {option}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {/* Question Pills */}
              <div className="hidden sm:flex gap-1.5">
                {questions.map((q, idx) => (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      idx === currentIdx
                        ? 'bg-[#08172c] text-white shadow-xs'
                        : selectedAnswers[q.id] !== undefined
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                  className="px-4 py-2 rounded-lg bg-[#08172c] text-white text-xs font-bold hover:bg-slate-900 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleInitiateSubmit}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Submit Exam
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Submission Result Card */
          <div className="p-8 text-center flex-1 overflow-y-auto flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Exam Completed Successfully!
            </h3>
            <p className="text-slate-600 text-xs mt-1 max-w-md">
              Your Continuous Assessment answers have been transmitted securely to the department server upon reconnecting.
            </p>

            <div className="my-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 w-full max-w-sm">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                Automated Score Report
              </div>
              <div className="text-4xl font-black text-[#08172c] mt-1">
                {scoreResult.score} / {scoreResult.total}
              </div>
              <div className="text-sm font-bold text-emerald-600 mt-1">
                {scoreResult.percent}% Score ({scoreResult.feedback})
              </div>

              {/* Proctoring integrity status in score report */}
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Proctoring Audit:</span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${
                    scoreResult.violationsCount === 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {scoreResult.violationsCount === 0 
                      ? '100% Clean Full-Screen Audit' 
                      : `${scoreResult.violationsCount} Violation Log(s)`}
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
            </div>

            <button
              onClick={handleCloseModal}
              className="px-6 py-2.5 rounded-xl bg-[#08172c] text-white text-xs font-bold hover:bg-slate-900 transition-all cursor-pointer shadow-md"
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
        examId="mcq-ca2-exam"
        violations={proctor.violations}
        onClearLogs={proctor.clearSessionViolations}
      />
    </div>
  );
}

export default McqExamModal;
