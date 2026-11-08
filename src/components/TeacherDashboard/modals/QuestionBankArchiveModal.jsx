import React, { useState, useEffect } from 'react';
import { 
  X, 
  Archive, 
  Search, 
  Filter, 
  BookOpen, 
  Download, 
  RotateCw, 
  CheckCircle2, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../../services/api';
import { curriculumSemesters, allCurriculumCourses } from '../../../data/officialCurriculum';

export function QuestionBankArchiveModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const availableSubjects = React.useMemo(() => {
    if (selectedSemester === 'All') {
      return allCurriculumCourses;
    }
    const num = Number(selectedSemester);
    const semData = curriculumSemesters.find(s => s.semNumber === num);
    return semData ? semData.courses : allCurriculumCourses;
  }, [selectedSemester]);

  const handleSemesterFilterChange = (newSem) => {
    setSelectedSemester(newSem);
    setSelectedSubject('All');
  };

  // Fetch questions from Neon API
  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const filters = {};
      if (selectedSemester !== 'All') filters.semester = selectedSemester;
      if (selectedSubject !== 'All') filters.subjectId = selectedSubject;
      if (selectedType !== 'All') filters.questionType = selectedType;
      if (selectedDifficulty !== 'All') filters.difficulty = selectedDifficulty;
      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const res = await api.getQuestions(filters);
      setQuestions(res.questions || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedSemester, selectedSubject, selectedType, selectedDifficulty]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleExpand = (id) => {
    setExpandedQuestionId(expandedQuestionId === id ? null : id);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `KGEC_IT_Question_Bank_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="bg-[#08172c] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Question Bank Archive & Repository</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-400" />
                  Live Neon Postgres
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Browse, filter, and review all departmental examination questions across semesters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchQuestions}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh questions from Neon"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          {/* Row 1: Search Bar & Export */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search questions by keyword, topic, algorithm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08172c]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportJson}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export JSON ({questions.length})</span>
              </button>
            </div>
          </div>

          {/* Row 2: Course/Semester, Subject, Question Type, and Difficulty Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {/* 1. Course / Semester Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Course / Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => handleSemesterFilterChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#08172c]"
              >
                <option value="All">All Semesters</option>
                <option value="3">3rd Semester (2nd Yr)</option>
                <option value="4">4th Semester (2nd Yr)</option>
                <option value="5">5th Semester (3rd Yr)</option>
                <option value="6">6th Semester (3rd Yr)</option>
                <option value="7">7th Semester (4th Yr)</option>
                <option value="8">8th Semester (4th Yr)</option>
              </select>
            </div>

            {/* 2. Subject Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Subject ({availableSubjects.length})
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#08172c]"
              >
                <option value="All">All Subjects ({availableSubjects.length})</option>
                {availableSubjects.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Question Format Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Question Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#08172c]"
              >
                <option value="All">All Types</option>
                <option value="MCQ">MCQ (Multiple Choice)</option>
                <option value="SAQ">SAQ (Short Answer)</option>
                <option value="LAQ">LAQ (Long Answer)</option>
              </select>
            </div>

            {/* 4. Difficulty Level */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#08172c]"
              >
                <option value="All">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Question List View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {isLoading ? (
            <div className="text-center py-16 text-slate-500">
              <RotateCw className="w-8 h-8 animate-spin mx-auto text-[#08172c] mb-2" />
              <p className="text-xs font-bold">Querying Question Bank from Neon Database...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <Archive className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Questions Match Current Filters</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try selecting "All Semesters" or "All Subjects", or use the "Upload Question" module to add new questions to Neon.
              </p>
              <button
                onClick={() => {
                  setSelectedSemester('All');
                  setSelectedSubject('All');
                  setSelectedType('All');
                  setSelectedDifficulty('All');
                  setSearchTerm('');
                }}
                className="mt-4 px-4 py-1.5 rounded-lg bg-[#08172c] text-white text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            questions.map((q, idx) => {
              const isMcq = q.questionType === 'MCQ';
              const isExpanded = expandedQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all p-5"
                >
                  {/* Top Badges Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#08172c] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>

                      {/* Course / Semester Badge */}
                      <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-100">
                        {q.semester ? `${q.semester}th Semester` : 'IT Department'}
                      </span>

                      {/* Subject Code Badge */}
                      <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                        {q.subjectCode || 'IT-601'}
                      </span>

                      {/* Unit / Topic */}
                      {q.unitOrTopic && (
                        <span className="text-[11px] text-slate-500">
                          • {q.unitOrTopic}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Difficulty Pill */}
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          q.difficulty === 'EASY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.difficulty === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {q.difficulty}
                      </span>

                      {/* Question Type Pill */}
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        {q.questionType}
                      </span>

                      {/* Marks Badge */}
                      <span className="text-[11px] font-extrabold text-[#08172c] bg-slate-100 px-2 py-0.5 rounded-md">
                        {Number(q.defaultMarks).toFixed(1)} Marks
                      </span>
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div className="pt-3">
                    <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                      {q.questionText}
                    </h4>
                  </div>

                  {/* MCQ Options Display */}
                  {isMcq && q.mcqOptions && Array.isArray(q.mcqOptions) && (
                    <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.mcqOptions.map((opt) => {
                        const isCorrect = opt.id === q.correctOptionId;
                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                              isCorrect
                                ? 'border-emerald-400 bg-emerald-50/70 text-emerald-950 font-bold'
                                : 'border-slate-200 bg-slate-50/60 text-slate-700 font-medium'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span className="flex-1 truncate">{opt.text}</span>
                            {isCorrect && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Subjective Reference Answer / Rubrics Details */}
                  {!isMcq && (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleExpand(q.id)}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Model Rubric & Answer' : 'View Model Answer & Grading Rubric'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs animate-in fade-in duration-150">
                          {q.referenceAnswer && (
                            <div>
                              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider mb-0.5">
                                Reference Model Answer (AI Ground Truth):
                              </span>
                              <p className="text-slate-700 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-200">
                                {q.referenceAnswer}
                              </p>
                            </div>
                          )}

                          {q.gradingRubric && Array.isArray(q.gradingRubric) && (
                            <div>
                              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider mb-1">
                                Grading Rubric Criteria:
                              </span>
                              <div className="space-y-1.5">
                                {q.gradingRubric.map((r, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                                    <span className="font-semibold text-slate-800">{r.criterion}</span>
                                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                      Weight: {r.maxWeight} Marks
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer metadata */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono">UUID: {q.id}</span>
                    <span>Added {new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Total Available: {questions.length} Questions</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">Live synchronized with Neon Postgres</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#08172c] hover:bg-slate-900 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionBankArchiveModal;
