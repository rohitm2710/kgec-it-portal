import React, { useState } from 'react';
import { 
  BookOpen, 
  Download, 
  FileText, 
  CheckCircle, 
  Layers, 
  Award, 
  Clock, 
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { curriculumSemesters } from '../../data/officialCurriculum';

export function SyllabusView() {
  const [activeSemIndex, setActiveSemIndex] = useState(3); // Default to Semester VI (index 3)

  const activeSemester = curriculumSemesters[activeSemIndex] || curriculumSemesters[0];

  const theoryCourses = activeSemester.courses.filter(c => c.category === 'Theory' || c.category === 'Mandatory');
  const electiveCourses = activeSemester.courses.filter(c => c.category === 'Elective' || c.category === 'Open Elective');
  const practicalCourses = activeSemester.courses.filter(c => c.category === 'Practical' || c.category === 'Project');

  const getBadgeColor = (type, category) => {
    if (category === 'Practical') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (category === 'Project') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (category === 'Elective' || category === 'Open Elective') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (type.includes('Engineering Science')) return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    if (type.includes('Basic Science')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (type.includes('Humanities')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (type.includes('Mandatory')) return 'bg-slate-200 text-slate-800 border-slate-300';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
              MAKAUT & KGEC Curriculum Structure
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              (Applicable from Academic Session 2018-2019 onwards)
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-[#08172c]" />
            B.Tech in Information Technology Syllabus
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete curriculum structure, course codes, contact hours, and credit distribution
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/IT_Syllabus.pdf"
            download="KGEC_IT_Curriculum_Syllabus.pdf"
            className="px-4 py-2.5 rounded-xl bg-[#08172c] text-white text-xs font-bold hover:bg-slate-900 flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Official PDF
          </a>
          <a
            href="/IT_Syllabus.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Semester Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {curriculumSemesters.map((sem, idx) => {
          const isActive = idx === activeSemIndex;
          return (
            <button
              key={sem.semNumber}
              onClick={() => setActiveSemIndex(idx)}
              className={`px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex flex-col items-start gap-0.5 ${
                isActive
                  ? 'bg-[#08172c] text-white shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="text-sm font-black">{sem.semLabel}</span>
              <span className={`text-[10px] font-normal ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                {sem.yearLabel.split('(')[0].trim()} • {sem.totalCredits} Credits
              </span>
            </button>
          );
        })}
      </div>

      {/* Semester Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Semester Credits</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{activeSemester.totalCredits}</span>
          <span className="text-[11px] text-slate-500">Graduation Weightage</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Core Theory Courses</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{theoryCourses.length}</span>
          <span className="text-[11px] text-slate-500">Lectures & Tutorials</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Elective Offerings</span>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">{electiveCourses.length}</span>
          <span className="text-[11px] text-slate-500">Departmental & Open</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Practicals & Labs</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{practicalCourses.length}</span>
          <span className="text-[11px] text-slate-500">Laboratory & Projects</span>
        </div>
      </div>

      {/* Course Structure Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#08172c]" />
            <h3 className="text-sm font-bold text-slate-900">
              Curriculum Table: {activeSemester.semLabel} ({activeSemester.yearLabel})
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {activeSemester.courses.length} Prescribed Courses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="px-4 py-3 w-12 text-center">Sl.</th>
                <th className="px-4 py-3">Course Type</th>
                <th className="px-4 py-3 w-32">Course Code</th>
                <th className="px-4 py-3">Course Title</th>
                <th className="px-4 py-3 text-center w-28">Hours / Wk<br/><span className="text-[9px] font-normal text-slate-500">(L - T - P)</span></th>
                <th className="px-4 py-3 text-center w-20">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeSemester.courses.map((course) => (
                <tr key={course.code + course.sl} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 text-center font-bold text-slate-500">
                    {course.sl}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getBadgeColor(course.type, course.category)}`}>
                      {course.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                    {course.code}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{course.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{course.category}</div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-600">
                    {course.l} - {course.t} - {course.p}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-extrabold text-slate-800">
                      {course.credits}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
                <td colSpan={4} className="px-4 py-3 text-right text-xs uppercase tracking-wider">
                  Total Semester Credits:
                </td>
                <td colSpan={2} className="px-4 py-3 text-center text-sm font-black text-[#08172c]">
                  {activeSemester.totalCredits} Credits
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SyllabusView;
