import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  Database,
  Layers,
  BookOpen
} from 'lucide-react';
import { api } from '../../../services/api';
import { curriculumSemesters, allCurriculumCourses, getCourseSyllabusModules } from '../../../data/officialCurriculum';

export function UploadQuestionModal({ isOpen, onClose, onQuestionAdded }) {
  if (!isOpen) return null;

  const [semester, setSemester] = useState('6th Semester');
  const [subject, setSubject] = useState('PCC-CS601');
  const [questionType, setQuestionType] = useState('mcq'); // 'mcq' | 'subjective'
  const [difficulty, setDifficulty] = useState('Medium');
  const [selectedModule, setSelectedModule] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { id: 'A', text: '', isCorrect: true },
    { id: 'B', text: '', isCorrect: false },
    { id: 'C', text: '', isCorrect: false },
    { id: 'D', text: '', isCorrect: false }
  ]);
  const [rubricNotes, setRubricNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for arrow key navigation between Statement, MCQ Options, and SAQ Rubrics
  const questionTextRef = useRef(null);
  const optionRefs = useRef([]);
  const rubricRef = useRef(null);

  const numericSemester = useMemo(() => {
    const match = semester.match(/\d+/);
    return match ? parseInt(match[0], 10) : 6;
  }, [semester]);

  const availableCourses = useMemo(() => {
    const semData = curriculumSemesters.find(s => s.semNumber === numericSemester);
    return semData ? semData.courses : allCurriculumCourses;
  }, [numericSemester]);

  const selectedCourseObj = useMemo(() => {
    return availableCourses.find((c) => c.code === subject) || availableCourses[0];
  }, [availableCourses, subject]);

  // Dynamically derive syllabus modules for the selected subject
  const syllabusModules = useMemo(() => {
    return getCourseSyllabusModules(subject, selectedCourseObj);
  }, [subject, selectedCourseObj]);

  // Auto-set the initial module whenever the subject changes
  useEffect(() => {
    if (syllabusModules && syllabusModules.length > 0) {
      setSelectedModule(syllabusModules[0].title);
    }
  }, [subject, syllabusModules]);

  const handleSemesterChange = (newSem) => {
    setSemester(newSem);
    const match = newSem.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 6;
    const semData = curriculumSemesters.find(s => s.semNumber === num);
    if (semData && semData.courses.length > 0) {
      setSubject(semData.courses[0].code);
    }
  };

  const handleOptionChange = (idx, text) => {
    const updated = [...options];
    updated[idx].text = text;
    setOptions(updated);
  };

  const handleSetCorrect = (idx) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === idx
    }));
    setOptions(updated);
  };

  // Up / Down arrow navigation from Question Statement
  const handleQuestionKeyDown = (e) => {
    const textarea = e.currentTarget;
    const text = textarea.value;
    const pos = textarea.selectionStart;

    if (e.key === 'ArrowDown') {
      const isLastLine = !text.slice(pos).includes('\n');
      const isAtEnd = pos === text.length;

      if (isLastLine || isAtEnd || e.altKey || e.ctrlKey) {
        e.preventDefault();
        if (questionType === 'mcq') {
          optionRefs.current[0]?.focus();
        } else {
          rubricRef.current?.focus();
        }
      }
    } else if (e.key === 'ArrowUp') {
      const isFirstLine = !text.slice(0, pos).includes('\n');
      const isAtStart = pos === 0;

      if (isFirstLine || isAtStart || e.altKey || e.ctrlKey) {
        e.preventDefault();
        if (questionType === 'mcq') {
          const lastIdx = options.length - 1;
          optionRefs.current[lastIdx]?.focus();
        } else {
          rubricRef.current?.focus();
        }
      }
    }
  };

  // Up / Down arrow & Enter navigation between MCQ options
  const handleOptionKeyDown = (idx, e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (idx < options.length - 1) {
        const nextInput = optionRefs.current[idx + 1];
        nextInput?.focus();
        if (nextInput && nextInput.value) {
          nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
        }
      } else {
        // Toggle back to Question Statement from last option
        questionTextRef.current?.focus();
        if (questionTextRef.current) {
          questionTextRef.current.setSelectionRange(0, 0);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx > 0) {
        const prevInput = optionRefs.current[idx - 1];
        prevInput?.focus();
        if (prevInput && prevInput.value) {
          prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
        }
      } else {
        // Toggle back up to Question Statement from first option (Option A)
        questionTextRef.current?.focus();
        if (questionTextRef.current) {
          const len = questionTextRef.current.value.length;
          questionTextRef.current.setSelectionRange(len, len);
        }
      }
    }
  };

  // Up / Down arrow navigation for SAQ / Subjective Rubrics
  const handleRubricKeyDown = (e) => {
    const textarea = e.currentTarget;
    const text = textarea.value;
    const pos = textarea.selectionStart;

    if (e.key === 'ArrowUp') {
      const isFirstLine = !text.slice(0, pos).includes('\n');
      const isAtStart = pos === 0;

      if (isFirstLine || isAtStart || e.altKey || e.ctrlKey) {
        e.preventDefault();
        questionTextRef.current?.focus();
        if (questionTextRef.current) {
          const len = questionTextRef.current.value.length;
          questionTextRef.current.setSelectionRange(len, len);
        }
      }
    } else if (e.key === 'ArrowDown') {
      const isLastLine = !text.slice(pos).includes('\n');
      const isAtEnd = pos === text.length;

      if (isLastLine || isAtEnd || e.altKey || e.ctrlKey) {
        e.preventDefault();
        questionTextRef.current?.focus();
        if (questionTextRef.current) {
          questionTextRef.current.setSelectionRange(0, 0);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Find selected correct option for MCQ
      const correctOption = options.find(o => o.isCorrect)?.id || 'A';
      const semMatch = semester.match(/\d+/);
      const semNum = semMatch ? parseInt(semMatch[0], 10) : 6;

      const payload = {
        subjectId: subject, // backend resolves "IT-601" or UUID automatically
        semester: semNum,
        questionType: questionType === 'mcq' ? 'MCQ' : 'SAQ',
        difficulty: difficulty.split(' ')[0].toUpperCase(), // 'EASY' | 'MEDIUM' | 'HARD'
        unitOrTopic: selectedModule || (syllabusModules[0]?.title || 'General Module'),
        questionText: questionText.trim(),
        mcqOptions: questionType === 'mcq' ? options.map(o => ({ id: o.id, text: o.text || `Option ${o.id}` })) : undefined,
        correctOptionId: questionType === 'mcq' ? correctOption : undefined,
        referenceAnswer: questionType !== 'mcq' ? rubricNotes : undefined,
        gradingRubric: questionType !== 'mcq' ? [{ criterion: 'Core conceptual accuracy', maxWeight: 5 }] : undefined,
        defaultMarks: questionType === 'mcq' ? 1.0 : 5.0,
      };

      const result = await api.createQuestion(payload);

      // Successfully saved to Neon
      setSuccessInfo({
        id: result.question?.id || 'Uploaded',
        text: questionText.slice(0, 50) + (questionText.length > 50 ? '...' : ''),
        time: new Date().toLocaleTimeString(),
        module: payload.unitOrTopic,
      });

      if (onQuestionAdded) {
        onQuestionAdded(result.question || payload);
      }

      // Reset question text and option texts so teacher can upload the next question
      setQuestionText('');
      setRubricNotes('');
      setOptions([
        { id: 'A', text: '', isCorrect: true },
        { id: 'B', text: '', isCorrect: false },
        { id: 'C', text: '', isCorrect: false },
        { id: 'D', text: '', isCorrect: false }
      ]);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload question to Neon database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="shrink-0 bg-[#08172c] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Upload Question to Repository</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-400" />
                  Neon DB
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Connected directly to Neon Postgres Question Bank with syllabus module mapping
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
          {/* Success Banner (Stays visible, does not close window) */}
          {successInfo && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start justify-between gap-3 text-emerald-900 text-xs animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-emerald-950 block text-sm">
                    ✓ Question Successfully Saved to Neon Database!
                  </span>
                  <span className="text-emerald-800 text-xs">
                    "{successInfo.text}" (Recorded at {successInfo.time})
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-emerald-700">
                    <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">{successInfo.module}</span>
                    <span>•</span>
                    <span>Record ID: {successInfo.id}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuccessInfo(null)}
                className="text-emerald-700 hover:text-emerald-950 text-xs font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
              Error: {errorMessage}
            </div>
          )}

          {/* Subject & Semester Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Batch / Semester
              </label>
              <select
                value={semester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#08172c]"
              >
                {curriculumSemesters.map((sem) => (
                  <option key={sem.semNumber} value={`${sem.semNumber}th Semester`}>
                    {sem.semLabel} ({sem.yearLabel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Target Subject / Course ({availableCourses.length})</span>
                <span className="text-[10px] text-slate-400 font-normal">from MAKAUT Syllabus</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#08172c]"
              >
                {availableCourses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}: {c.title} ({c.credits} Cr - {c.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Type, Difficulty & Dynamic Syllabus Module Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Question Format */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Question Format
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuestionType('mcq')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    questionType === 'mcq' ? 'bg-[#08172c] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  MCQ
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionType('subjective')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    questionType === 'subjective' ? 'bg-[#08172c] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Subjective (SAQ)
                </button>
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#08172c]"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            {/* Dynamic Syllabus Module / Unit Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Syllabus Module</span>
                </span>
                <span className="text-[10px] text-cyan-700 font-bold bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-100">
                  {syllabusModules.length} Units
                </span>
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#08172c] truncate"
                title={selectedModule}
              >
                {syllabusModules.map((m) => (
                  <option key={m.id} value={m.title}>
                    {m.title}
                  </option>
                ))}
                <option value="General Course Concepts">General / Combined Topics</option>
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Question Statement / Problem Definition</span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-normal normal-case flex items-center gap-1 border border-blue-100">
                <kbd className="font-mono font-bold bg-white px-1 py-0.2 border border-blue-200 rounded text-[9px]">↑</kbd>
                <kbd className="font-mono font-bold bg-white px-1 py-0.2 border border-blue-200 rounded text-[9px]">↓</kbd>
                <span>Arrow keys toggle statement & options</span>
              </span>
            </label>
            <textarea
              ref={questionTextRef}
              rows={3}
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              onKeyDown={handleQuestionKeyDown}
              placeholder="Enter the question text. Press Down arrow to jump directly to options or model answer."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08172c] leading-relaxed"
            />
          </div>

          {/* If MCQ, Option inputs */}
          {questionType === 'mcq' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Options & Correct Answer Selection (Click letter to set correct)
                </label>
                <span className="text-[10px] text-slate-500 font-normal normal-case">
                  Use <kbd className="font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded border border-slate-200">↓</kbd> / <kbd className="font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded border border-slate-200">↑</kbd> to toggle options
                </span>
              </div>
              {options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetCorrect(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                      opt.isCorrect
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                    title="Click to mark as correct answer"
                  >
                    {opt.id}
                  </button>
                  <input
                    ref={(el) => { optionRefs.current[idx] = el; }}
                    type="text"
                    required
                    placeholder={`Option ${opt.id} text (Press ↓ for next option, ↑ for previous)`}
                    value={opt.text}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOptionKeyDown(idx, e)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08172c] ${
                      opt.isCorrect ? 'border-emerald-400 bg-emerald-50/20 font-semibold' : 'border-slate-300'
                    }`}
                  />
                  {opt.isCorrect && (
                    <span className="text-[11px] font-bold text-emerald-700 px-2 shrink-0">
                      ✓ Correct Answer
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Evaluation Rubrics & Expected Model Answer (SAQ / LAQ)
                </label>
                <span className="text-[10px] text-slate-500 font-normal normal-case">
                  Press <kbd className="font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded border border-slate-200">↑</kbd> to jump back to question statement
                </span>
              </div>
              <textarea
                ref={rubricRef}
                rows={2}
                value={rubricNotes}
                onChange={(e) => setRubricNotes(e.target.value)}
                onKeyDown={handleRubricKeyDown}
                placeholder="Ideal reference answer for OpenRouter AI comparison and rubric criteria... (Press ↑ to return to question statement)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08172c] leading-relaxed"
              />
            </div>
          )}

          {/* Submit buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Window stays open after upload so you can add multiple questions.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close Window
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-[#08172c] hover:bg-slate-900 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Neon...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Save Question to Bank</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default UploadQuestionModal;
