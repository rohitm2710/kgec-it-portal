import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Settings, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Layers, 
  Check, 
  Database, 
  Sliders, 
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileQuestion,
  ListFilter,
  Plus
} from 'lucide-react';
import { api } from '../../../services/api';
import { curriculumSemesters, allCurriculumCourses, getCourseSyllabusModules } from '../../../data/officialCurriculum';

export function ExamConfigModal({ isOpen, onClose, onExamConfigured }) {
  if (!isOpen) return null;

  // 1. Basic Exam Meta
  const [examTitle, setExamTitle] = useState('Continuous Assessment (CA-2)');
  const [selectedSemester, setSelectedSemester] = useState('6th Semester');
  const [selectedSubject, setSelectedSubject] = useState('PCC-CS601');
  const [examType, setExamType] = useState('MCQ'); // 'MCQ' | 'SAQ_LAQ'

  // 2. Timing & Window
  const [examDate, setExamDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTimeStr, setStartTimeStr] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Semester & Courses resolution
  const numericSemester = useMemo(() => {
    const match = selectedSemester.match(/\d+/);
    return match ? parseInt(match[0], 10) : 6;
  }, [selectedSemester]);

  const availableCourses = useMemo(() => {
    const semData = curriculumSemesters.find((s) => s.semNumber === numericSemester);
    return semData ? semData.courses : allCurriculumCourses;
  }, [numericSemester]);

  const selectedCourseObj = useMemo(() => {
    return availableCourses.find((c) => c.code === selectedSubject) || availableCourses[0];
  }, [availableCourses, selectedSubject]);

  // 3. Dynamic Syllabus Units / Modules from MAKAUT IT Syllabus
  const dynamicSyllabusModules = useMemo(() => {
    return getCourseSyllabusModules(selectedSubject, selectedCourseObj);
  }, [selectedSubject, selectedCourseObj]);

  const [customUnits, setCustomUnits] = useState([]);
  const [newCustomUnitTitle, setNewCustomUnitTitle] = useState('');
  const [showAddCustomUnit, setShowAddCustomUnit] = useState(false);

  const allAvailableUnits = useMemo(() => {
    return [...dynamicSyllabusModules, ...customUnits];
  }, [dynamicSyllabusModules, customUnits]);

  // Selected units (defaults to all units of the active course)
  const [coveredUnits, setCoveredUnits] = useState(() => dynamicSyllabusModules.map(u => u.id));

  // Reset covered units and custom units whenever subject changes
  useEffect(() => {
    const units = getCourseSyllabusModules(selectedSubject, selectedCourseObj);
    setCoveredUnits(units.map(u => u.id));
    setCustomUnits([]);
  }, [selectedSubject]);

  // 4. Question Distribution & Difficulty Breakdown
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [easyCount, setEasyCount] = useState(4);
  const [mediumCount, setMediumCount] = useState(4);
  const [hardCount, setHardCount] = useState(2);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-set default marks when exam type changes
  useEffect(() => {
    if (examType === 'MCQ') {
      setMarksPerQuestion(1);
    } else {
      setMarksPerQuestion(5);
    }
  }, [examType]);

  const handleSemesterChange = (newSem) => {
    setSelectedSemester(newSem);
    const match = newSem.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 6;
    const semData = curriculumSemesters.find((s) => s.semNumber === num);
    if (semData && semData.courses.length > 0) {
      setSelectedSubject(semData.courses[0].code);
    }
  };

  // Toggle unit selection
  const handleToggleUnit = (unitId) => {
    if (coveredUnits.includes(unitId)) {
      if (coveredUnits.length === 1) return; // Keep at least one selected
      setCoveredUnits(coveredUnits.filter((u) => u !== unitId));
    } else {
      setCoveredUnits([...coveredUnits, unitId]);
    }
  };

  const handleSelectAllUnits = () => {
    setCoveredUnits(allAvailableUnits.map(u => u.id));
  };

  const handleAddCustomUnit = (e) => {
    e.preventDefault();
    if (!newCustomUnitTitle.trim()) return;
    const nextUnitNum = allAvailableUnits.length + 1;
    const customId = `Unit ${nextUnitNum}`;
    const newUnit = {
      id: customId,
      title: `${customId}: ${newCustomUnitTitle.trim()}`
    };
    setCustomUnits([...customUnits, newUnit]);
    setCoveredUnits([...coveredUnits, customId]);
    setNewCustomUnitTitle('');
    setShowAddCustomUnit(false);
  };

  // Calculation of scheduled window
  const scheduledWindow = useMemo(() => {
    try {
      const [hours, mins] = startTimeStr.split(':').map(Number);
      const start = new Date(`${examDate}T${startTimeStr}:00`);
      const end = new Date(start.getTime() + Number(durationMinutes) * 60 * 1000);
      const preAlert = new Date(start.getTime() - 10 * 60 * 1000);

      const formatTime = (d) => {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      };

      const formatDate = (d) => {
        return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      };

      return {
        startDate: formatDate(start),
        startTime: formatTime(start),
        endTime: formatTime(end),
        preAlertTime: formatTime(preAlert),
        isoStart: start.toISOString(),
        isoEnd: end.toISOString(),
      };
    } catch {
      return null;
    }
  }, [examDate, startTimeStr, durationMinutes]);

  // Balance calculation (Easy + Medium + Hard = Total)
  const currentTotalAllocated = Number(easyCount) + Number(mediumCount) + Number(hardCount);
  const isBalanced = currentTotalAllocated === Number(totalQuestions);
  const balanceDifference = Number(totalQuestions) - currentTotalAllocated;

  const handleAutoBalance = () => {
    const total = Number(totalQuestions) || 10;
    const easy = Math.floor(total * 0.4);
    const hard = Math.floor(total * 0.2);
    const medium = total - easy - hard;
    setEasyCount(easy);
    setMediumCount(medium);
    setHardCount(hard);
  };

  const computedTotalMarks = Number(totalQuestions) * Number(marksPerQuestion);

  // Submit Exam Configuration
  const handleSaveConfiguration = async (e) => {
    e.preventDefault();
    if (!isBalanced) {
      setErrorMessage(`Please balance the question counts! Sum of Easy (${easyCount}) + Medium (${mediumCount}) + Hard (${hardCount}) must equal Total Questions (${totalQuestions}).`);
      return;
    }

    if (coveredUnits.length === 0) {
      setErrorMessage("Please select at least one syllabus Unit/Module to be covered.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        title: examTitle.trim(),
        semester: numericSemester,
        subjectId: selectedSubject,
        examType, // 'MCQ' or 'SAQ_LAQ'
        startTime: scheduledWindow?.isoStart || new Date().toISOString(),
        durationMinutes: Number(durationMinutes),
        coveredModules: coveredUnits,
        totalQuestions: Number(totalQuestions),
        easyCount: Number(easyCount),
        mediumCount: Number(mediumCount),
        hardCount: Number(hardCount),
        marksPerQuestion: Number(marksPerQuestion),
      };

      const result = await api.configureExam(payload);

      setSuccessInfo({
        examId: result.exam?.id || 'EXAM-CONFIG-SAVED',
        title: examTitle,
        subject: selectedCourseObj?.title || selectedSubject,
        semester: `${numericSemester}th Semester`,
        format: examType === 'MCQ' ? 'MCQ (Auto-Graded)' : 'SAQ / LAQ (Subjective)',
        window: `${scheduledWindow?.startDate} • ${scheduledWindow?.startTime} - ${scheduledWindow?.endTime}`,
        totalQuestions: totalQuestions,
        breakdown: `${easyCount} Easy, ${mediumCount} Medium, ${hardCount} Hard`,
        coveredUnits: coveredUnits.join(', '),
      });

      if (onExamConfigured) {
        onExamConfigured(result);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save exam configuration to database.');
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
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="shrink-0 bg-[#08172c] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Exam Configuration & Blueprint Designer
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/20">
                  Neon DB Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Dynamic syllabus units, exam timing, question format, and difficulty distribution
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSaveConfiguration} className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
          {/* Success Banner */}
          {successInfo && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs animate-in fade-in space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-extrabold text-emerald-950 block text-sm">
                    ✓ Exam Parameters Locked & Scheduled in Neon Database!
                  </span>
                  <p className="text-emerald-800 text-xs mt-0.5">
                    <strong>{successInfo.title}</strong> for <strong>{successInfo.semester}</strong> ({successInfo.subject})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-200/80 font-mono text-[11px] text-emerald-800">
                    <div>Format: <span className="font-bold">{successInfo.format}</span></div>
                    <div>Window: <span className="font-bold">{successInfo.window}</span></div>
                    <div>Questions: <span className="font-bold">{successInfo.totalQuestions} ({successInfo.breakdown})</span></div>
                    <div className="col-span-2 sm:col-span-3">Coverage: <span className="font-bold">{successInfo.coveredUnits}</span></div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessInfo(null)}
                  className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Semester, Subject & Exam Title */}
          <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-600" />
                <span>1. Semester & Subject Assignment</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">MAKAUT IT Curriculum</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Semester Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Academic Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#08172c]"
                >
                  {curriculumSemesters.map((s) => (
                    <option key={s.semNumber} value={`${s.semNumber}th Semester`}>
                      {s.semLabel} ({s.yearLabel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Subject Course ({availableCourses.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Official Syllabus</span>
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#08172c]"
                >
                  {availableCourses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}: {c.title} ({c.credits} Cr)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exam Title & Designation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Exam Title / Assessment Label
              </label>
              <input
                type="text"
                required
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g. Continuous Assessment (CA-2) - Database Management Systems"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08172c]"
              />
            </div>
          </div>

          {/* Section 2: Question Paper Format (MCQ vs SAQ/LAQ) */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FileQuestion className="w-4 h-4 text-cyan-600" />
                <span>2. Question Paper Format</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Evaluation Mode</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExamType('MCQ')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  examType === 'MCQ'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                  examType === 'MCQ' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  MCQ
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Multiple Choice (MCQ)</span>
                    {examType === 'MCQ' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Auto-graded objective questions with single correct choice option. (1 mark each default).
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExamType('SAQ_LAQ')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  examType === 'SAQ_LAQ'
                    ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                  examType === 'SAQ_LAQ' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  SAQ
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Subjective (SAQ / LAQ)</span>
                    {examType === 'SAQ_LAQ' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Short & Long Answer questions evaluated via OpenRouter AI rubric with faculty manual marks override.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Exam Timing & Duration Window */}
          <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-600" />
                <span>3. Exam Timing & Schedule Window</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Auto-closes on expiry</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                />
              </div>

              {/* Duration Minutes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="240"
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                />
              </div>
            </div>

            {/* Quick Chips for Duration */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Quick duration:</span>
              {[30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    Number(durationMinutes) === mins
                      ? 'bg-[#08172c] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Live Scheduled Window Preview */}
            {scheduledWindow && (
              <div className="p-3 bg-cyan-50/80 border border-cyan-200 rounded-xl text-xs text-cyan-900 flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <div>
                    <strong>Scheduled Window:</strong> {scheduledWindow.startDate} from <strong>{scheduledWindow.startTime}</strong> to <strong>{scheduledWindow.endTime}</strong> ({durationMinutes} minutes)
                  </div>
                  <div className="text-[11px] text-cyan-700 mt-0.5">
                    🔔 Student Pre-Exam Gatekeeper alert will automatically trigger at <strong>{scheduledWindow.preAlertTime}</strong> (10 mins prior).
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Dynamic Syllabus Modules / Units Covered */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-600" />
                  <span>4. Dynamic Syllabus Modules & Coverage</span>
                </h3>
                <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100/70 border border-cyan-200 px-2 py-0.5 rounded-full">
                  {coveredUnits.length} of {allAvailableUnits.length} Selected
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAllUnits}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomUnit(!showAddCustomUnit)}
                  className="text-xs text-purple-600 hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Custom Unit</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Units dynamically mapped for <strong className="text-slate-800">{selectedCourseObj?.code}: {selectedCourseObj?.title}</strong> ({allAvailableUnits.length} syllabus modules available):
            </p>

            {/* Custom Unit Input Box */}
            {showAddCustomUnit && (
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center gap-2 animate-in fade-in">
                <input
                  type="text"
                  placeholder="Enter custom unit name or topic (e.g. Special Topics in NoSQL)..."
                  value={newCustomUnitTitle}
                  onChange={(e) => setNewCustomUnitTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomUnit}
                  className="px-3 py-1.5 bg-purple-700 text-white rounded-lg text-xs font-bold hover:bg-purple-800 cursor-pointer"
                >
                  Add Unit
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomUnit(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dynamic Units Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allAvailableUnits.map((u) => {
                const isSelected = coveredUnits.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleToggleUnit(u.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-[#08172c] text-white border-[#08172c] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-cyan-400 text-[#08172c]' : 'border border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isSelected ? 'bg-white/20 text-cyan-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.id}
                        </span>
                      </div>
                      <p className={`text-xs font-semibold mt-1 leading-snug line-clamp-2 ${
                        isSelected ? 'text-white' : 'text-slate-800'
                      }`} title={u.title}>
                        {u.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Question Difficulty Distribution (Easy, Medium, Hard) */}
          <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ListFilter className="w-4 h-4 text-cyan-600" />
                  <span>5. Question Difficulty Distribution & Blueprint</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAutoBalance}
                className="text-xs text-purple-600 hover:underline font-bold cursor-pointer flex items-center gap-1"
                title="Automatically distribute questions (40% Easy, 40% Medium, 20% Hard)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Balance Ratio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Total Questions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={totalQuestions}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTotalQuestions(val);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                />
              </div>

              {/* Easy Questions */}
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-1 flex items-center justify-between">
                  <span>Easy Questions</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">EASY</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalQuestions}
                  required
                  value={easyCount}
                  onChange={(e) => setEasyCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-300 text-xs font-bold text-emerald-950 bg-emerald-50/30"
                />
              </div>

              {/* Medium Questions */}
              <div>
                <label className="block text-xs font-bold text-amber-700 mb-1 flex items-center justify-between">
                  <span>Medium Questions</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">MEDIUM</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalQuestions}
                  required
                  value={mediumCount}
                  onChange={(e) => setMediumCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs font-bold text-amber-950 bg-amber-50/30"
                />
              </div>

              {/* Hard Questions */}
              <div>
                <label className="block text-xs font-bold text-red-700 mb-1 flex items-center justify-between">
                  <span>Hard Questions</span>
                  <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-bold">HARD</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalQuestions}
                  required
                  value={hardCount}
                  onChange={(e) => setHardCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-red-300 text-xs font-bold text-red-950 bg-red-50/30"
                />
              </div>
            </div>

            {/* Validation & Balance Status */}
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              isBalanced
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>
                  {isBalanced ? (
                    <span><strong>Perfect Difficulty Distribution:</strong> {easyCount} Easy + {mediumCount} Medium + {hardCount} Hard = {totalQuestions} Total Questions.</span>
                  ) : (
                    <span>Allocated <strong>{currentTotalAllocated}</strong> of <strong>{totalQuestions}</strong> questions ({balanceDifference > 0 ? `${balanceDifference} remaining to assign` : `${Math.abs(balanceDifference)} excess questions`}).</span>
                  )}
                </span>
              </div>

              {!isBalanced && (
                <button
                  type="button"
                  onClick={handleAutoBalance}
                  className="px-2.5 py-1 bg-amber-200/70 hover:bg-amber-200 text-amber-950 rounded-lg text-xs font-bold cursor-pointer shrink-0"
                >
                  Auto-Balance
                </button>
              )}
            </div>

            {/* Total Marks Preview */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
              <span>Marks per question: <strong>{marksPerQuestion} mark{marksPerQuestion > 1 ? 's' : ''}</strong></span>
              <span className="font-extrabold text-slate-900 text-sm">
                Total Exam Marks: <span className="text-cyan-700">{computedTotalMarks} Marks</span>
              </span>
            </div>
          </div>

          {/* Modal Footer / Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Exam configuration and difficulty blueprint will be saved directly into Neon database.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !isBalanced}
                className="px-5 py-2.5 rounded-xl bg-[#08172c] hover:bg-slate-900 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving to Neon...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Save & Schedule Exam Blueprint</span>
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

export default ExamConfigModal;
