import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  BookOpen,
  Clock,
  Filter
} from 'lucide-react';
import { API_BASE } from '../../../services/api';

const API_BASE_URL = API_BASE;

export function PreviousExamsMarksModal({ isOpen, onClose, currentUser }) {
  if (!isOpen) return null;

  const [examsList, setExamsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchExamQuery, setSearchExamQuery] = useState('');

  // Selected exam state for the detail ledger view
  const [selectedExam, setSelectedExam] = useState(null);
  const [examLedgerData, setExamLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Detail view search and filter
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'APPEARED' | 'ABSENT'

  // Fetch summary of all previous exams
  const fetchPreviousExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('kgec_auth_token');
      const res = await fetch(`${API_BASE_URL}/exams/ledger/summary`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load exams: ${res.statusText}`);
      }

      const data = await res.json();
      setExamsList(data.exams || []);
    } catch (err) {
      console.error('Error fetching exams summary:', err);
      setError(err.message || 'Could not load exams from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviousExams();
  }, []);

  // Fetch student marks ledger for a selected exam
  const handleSelectExam = async (exam) => {
    setSelectedExam(exam);
    setLoadingLedger(true);
    setSearchStudentQuery('');
    setStatusFilter('ALL');

    try {
      const token = localStorage.getItem('kgec_auth_token');
      const res = await fetch(`${API_BASE_URL}/exams/${exam.id}/marks-ledger`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load ledger: ${res.statusText}`);
      }

      const data = await res.json();
      setExamLedgerData(data);
    } catch (err) {
      console.error('Error fetching exam marks ledger:', err);
      // Fallback: create ledger preview from selectedExam data
      setExamLedgerData({
        exam,
        summary: {
          totalEnrolled: exam.enrolledCount || 0,
          appearedCount: exam.appearedCount || 0,
          absentCount: exam.absentCount || 0,
          classAverage: exam.classAverage || 0,
          highestScore: exam.totalMarks || 30,
          lowestScore: 0,
        },
        ledger: [],
      });
    } finally {
      setLoadingLedger(false);
    }
  };

  // Back to exam list
  const handleBackToList = () => {
    setSelectedExam(null);
    setExamLedgerData(null);
  };

  // Filtered exams list
  const filteredExams = useMemo(() => {
    if (!searchExamQuery.trim()) return examsList;
    const q = searchExamQuery.toLowerCase();
    return examsList.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.subjectCode?.toLowerCase().includes(q) ||
        e.subjectName?.toLowerCase().includes(q)
    );
  }, [examsList, searchExamQuery]);

  // Filtered student roster for detail ledger
  const filteredStudents = useMemo(() => {
    if (!examLedgerData?.ledger) return [];
    let list = examLedgerData.ledger;

    if (statusFilter === 'APPEARED') {
      list = list.filter((s) => s.status === 'APPEARED');
    } else if (statusFilter === 'ABSENT') {
      list = list.filter((s) => s.status === 'ABSENT');
    }

    if (searchStudentQuery.trim()) {
      const q = searchStudentQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.studentName?.toLowerCase().includes(q) ||
          s.studentRoll?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [examLedgerData, statusFilter, searchStudentQuery]);

  // Export CSV
  const handleExportCsv = () => {
    if (!examLedgerData || !examLedgerData.ledger) return;
    const exam = examLedgerData.exam || selectedExam;
    const headers = 'Roll No,Student Name,Semester,Attendance Status,Marks Obtained,Max Marks,Percentage,Grade,Submission Mode\n';
    const rows = examLedgerData.ledger
      .map(
        (s) =>
          `"${s.studentRoll}","${s.studentName}",${s.semester || ''},"${s.status}","${s.marksObtained}",${s.maxMarks},"${s.percentage}","${s.grade}","${s.submissionMode || 'N/A'}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${(exam?.title || 'Exam').replace(/[^a-zA-Z0-9_-]/g, '_')}_Marks_Ledger.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-[#08172c] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {selectedExam ? (
              <button
                onClick={handleBackToList}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
                title="Back to Exam List"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {selectedExam ? selectedExam.title : 'Previous Examinations & Marks Ledger'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {selectedExam ? (selectedExam.subjectCode || 'EXAM LEDGER') : 'RESULTS REGISTRY'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {selectedExam
                  ? `Comprehensive marks sheet for ${selectedExam.subjectName || selectedExam.subjectCode} • Max: ${selectedExam.totalMarks} Marks`
                  : 'Select any conducted exam to inspect complete class marks. Absent students are marked as AB.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!selectedExam && (
              <button
                onClick={fetchPreviousExams}
                disabled={loading}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Refresh exam list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!selectedExam ? (
          /* ========================================================= */
          /* VIEW 1: PREVIOUS EXAMS LIST VIEW                          */
          /* ========================================================= */
          <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50">
            {/* Search Toolbar */}
            <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search exam by title or course code..."
                  value={searchExamQuery}
                  onChange={(e) => setSearchExamQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#08172c] transition-all"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="font-medium text-slate-500">
                  Total Exams: <strong className="text-slate-800">{examsList.length}</strong>
                </span>
                <span className="h-3 w-px bg-slate-300" />
                <span className="text-[11px] text-slate-500 italic">
                  Tap any exam card to view full marks ledger
                </span>
              </div>
            </div>

            {/* Exams Grid */}
            <div className="p-5 flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                  <p className="text-sm font-medium text-slate-600">Loading previous examinations from database...</p>
                </div>
              ) : error ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700 max-w-md mx-auto my-8">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                  <h3 className="font-bold text-sm">Failed to Load Previous Exams</h3>
                  <p className="text-xs text-rose-600 mt-1">{error}</p>
                  <button
                    onClick={fetchPreviousExams}
                    className="mt-4 px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : filteredExams.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-lg mx-auto my-8">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-700">No Previous Exams Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchExamQuery
                      ? `No exams matching "${searchExamQuery}". Try clearing search.`
                      : 'No previous exams are currently in the database. When an exam is configured and conducted, its marks ledger will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExams.map((exam) => {
                    const conductedDate = exam.createdAt
                      ? new Date(exam.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recent';

                    const isSubjective = exam.examCategory === 'SUBJECTIVE_EXAM';

                    return (
                      <div
                        key={exam.id}
                        onClick={() => handleSelectExam(exam)}
                        className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-500/60 p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                      >
                        {/* Top decorative stripe */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity" />

                        <div>
                          {/* Subject Code & Category Badge */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                              {exam.subjectCode || 'PCC-CS601'}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                isSubjective
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              }`}
                            >
                              {isSubjective ? 'Subjective / SAQ' : 'MCQ Exam'}
                            </span>
                          </div>

                          {/* Exam Title */}
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                            {exam.title}
                          </h3>

                          {/* Metadata */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              Sem {exam.semester || 6}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {exam.durationMinutes || 60}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {conductedDate}
                            </span>
                            <span className="ml-auto font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              Max: {exam.totalMarks || 30}
                            </span>
                          </div>
                        </div>

                        {/* Roster & Attendance Stats Bar */}
                        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                              Enrolled
                            </span>
                            <span className="font-extrabold text-slate-800 text-sm">
                              {exam.enrolledCount ?? 0}
                            </span>
                          </div>
                          <div className="bg-emerald-50/80 rounded-xl p-2 border border-emerald-100">
                            <span className="text-emerald-700 block text-[10px] uppercase font-bold tracking-wider">
                              Appeared
                            </span>
                            <span className="font-extrabold text-emerald-800 text-sm">
                              {exam.appearedCount ?? 0}
                            </span>
                          </div>
                          <div className="bg-rose-50/80 rounded-xl p-2 border border-rose-100">
                            <span className="text-rose-700 block text-[10px] uppercase font-bold tracking-wider">
                              Absent (AB)
                            </span>
                            <span className="font-extrabold text-rose-700 text-sm">
                              {exam.absentCount ?? 0}
                            </span>
                          </div>
                        </div>

                        {/* Tap Action Footer */}
                        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-800 pt-1">
                          <span>View Student Marks Ledger</span>
                          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: STUDENT MARKS LEDGER FOR SELECTED EXAM            */
          /* ========================================================= */
          <div className="flex-1 overflow-y-auto flex flex-col bg-white">
            {/* KPI Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Total Enrolled
                </span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  {examLedgerData?.summary?.totalEnrolled ?? selectedExam.enrolledCount ?? 0} Students
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 block text-[11px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Appeared
                </span>
                <span className="text-lg font-bold text-emerald-700 mt-0.5 block">
                  {examLedgerData?.summary?.appearedCount ?? selectedExam.appearedCount ?? 0} Candidates
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-200">
                <span className="text-rose-700 block text-[11px] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Absent (AB)
                </span>
                <span className="text-lg font-bold text-rose-700 mt-0.5 block">
                  {examLedgerData?.summary?.absentCount ?? selectedExam.absentCount ?? 0} Absent
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Class Average
                </span>
                <span className="text-lg font-bold text-blue-900 mt-0.5 block">
                  {examLedgerData?.summary?.classAverage ?? 0} / {selectedExam.totalMarks || 30}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Highest Score
                </span>
                <span className="text-lg font-bold text-amber-700 mt-0.5 block">
                  {examLedgerData?.summary?.highestScore ?? 0} / {selectedExam.totalMarks || 30}
                </span>
              </div>
            </div>

            {/* Filter and Action Toolbar */}
            <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search by Roll or Name */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter student by name or roll..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#08172c]"
                />
              </div>

              {/* Attendance Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({examLedgerData?.summary?.totalEnrolled ?? 0})
                </button>
                <button
                  onClick={() => setStatusFilter('APPEARED')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'APPEARED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  Appeared ({examLedgerData?.summary?.appearedCount ?? 0})
                </button>
                <button
                  onClick={() => setStatusFilter('ABSENT')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'ABSENT'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  Absent AB ({examLedgerData?.summary?.absentCount ?? 0})
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  title="Export marks to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  title="Print marks ledger"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Student Marks Table */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingLedger ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                  <p className="text-sm font-medium text-slate-600">Retrieving student scores & absentee records...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-xs">No student records found matching current search/filter.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                        <th className="py-3 px-3.5">Roll No</th>
                        <th className="py-3 px-3.5">Student Name</th>
                        <th className="py-3 px-3 text-center">Semester</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3.5 text-center">Marks Obtained</th>
                        <th className="py-3 px-3 text-center">Percentage</th>
                        <th className="py-3 px-3 text-center">Grade</th>
                        <th className="py-3 px-3 text-center">Submission Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((s) => {
                        const isAbsent = s.status === 'ABSENT' || s.marksObtained === 'AB';

                        return (
                          <tr
                            key={s.studentRoll || s.studentId}
                            className={`transition-colors ${
                              isAbsent
                                ? 'bg-rose-50/30 hover:bg-rose-50/60'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            {/* Roll No */}
                            <td className="py-3 px-3.5 font-mono text-slate-800 font-semibold">
                              {s.studentRoll}
                            </td>

                            {/* Name */}
                            <td className="py-3 px-3.5 font-bold text-slate-900">
                              {s.studentName}
                            </td>

                            {/* Semester */}
                            <td className="py-3 px-3 text-center text-slate-600 font-medium">
                              Sem {s.semester || selectedExam.semester || 6}
                            </td>

                            {/* Attendance / Status */}
                            <td className="py-3 px-3 text-center">
                              {isAbsent ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  AB (Absent)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Appeared
                                </span>
                              )}
                            </td>

                            {/* Marks Obtained */}
                            <td className="py-3 px-3.5 text-center">
                              {isAbsent ? (
                                <span className="px-3 py-1 rounded-md text-xs font-black bg-rose-100 text-rose-700 border border-rose-300">
                                  AB
                                </span>
                              ) : (
                                <span className="font-extrabold text-slate-900 text-sm">
                                  {s.marksObtained}{' '}
                                  <span className="text-slate-400 text-xs font-normal">
                                    / {s.maxMarks || selectedExam.totalMarks || 30}
                                  </span>
                                </span>
                              )}
                            </td>

                            {/* Percentage */}
                            <td className="py-3 px-3 text-center font-semibold">
                              {isAbsent ? (
                                <span className="font-bold text-rose-600">AB</span>
                              ) : (
                                <span className="text-slate-800 font-bold">{s.percentage}</span>
                              )}
                            </td>

                            {/* Letter Grade */}
                            <td className="py-3 px-3 text-center">
                              {isAbsent ? (
                                <span className="px-2.5 py-0.5 rounded-md font-extrabold text-xs bg-rose-100 text-rose-700 border border-rose-200">
                                  AB
                                </span>
                              ) : (
                                <span
                                  className={`px-2.5 py-0.5 rounded-md font-extrabold text-xs ${
                                    s.grade === 'O' || s.grade === 'A+'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : s.grade === 'A' || s.grade === 'B+'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                      : 'bg-slate-100 text-slate-800 border border-slate-300'
                                  }`}
                                >
                                  {s.grade}
                                </span>
                              )}
                            </td>

                            {/* Submission Info */}
                            <td className="py-3 px-3 text-center text-slate-500 text-[11px]">
                              {isAbsent ? (
                                <span className="text-rose-400 italic">Not Submitted</span>
                              ) : (
                                <span>{s.submissionMode === 'SCANNED_SCRIPT' ? 'OCR Scan' : 'Online Portal'}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {selectedExam
              ? `Displaying ${filteredStudents.length} student entries (Absent candidates clearly marked as AB)`
              : 'KGEC Department of Information Technology • Academic Records'}
          </span>
          <div className="flex items-center gap-2">
            {selectedExam && (
              <button
                onClick={handleBackToList}
                className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
              >
                ← Back to Exams
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#08172c] hover:bg-[#122847] text-white font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviousExamsMarksModal;
