import React from 'react';
import { Award, CheckCircle, Download, FileSpreadsheet } from 'lucide-react';

export function ResultsView() {
  const courses = [
    { code: "IT-601", name: "Software Engineering & System Design", credits: 4, caMarks: "26/30", endSem: "62/70", grade: "A+", points: 9.0 },
    { code: "IT-602", name: "Web Technology & Cloud Architecture", credits: 4, caMarks: "28/30", endSem: "65/70", grade: "O", points: 10.0 },
    { code: "IT-603", name: "Computer Networks & Distributed Systems", credits: 4, caMarks: "24/30", endSem: "58/70", grade: "A", points: 8.0 },
    { code: "IT-691", name: "Software Engineering Lab", credits: 2, caMarks: "38/40", endSem: "55/60", grade: "O", points: 10.0 },
    { code: "IT-692", name: "Web Technology Laboratory", credits: 2, caMarks: "39/40", endSem: "57/60", grade: "O", points: 10.0 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Academic Performance Record
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Semester VI Grade Card
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Student: Rahul Dey • Roll: 10200122045 • Reg No: 2022-045-KGEC
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Semester SGPA</span>
            <span className="text-2xl font-black text-emerald-950">9.38</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">Cumulative CGPA</span>
            <span className="text-2xl font-black text-blue-950">8.94</span>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Enrolled Courses & Evaluated Grades</h3>
          <button
            onClick={() => alert("Downloading Official Provisional Marksheet PDF...")}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Download Marksheet PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Subject Title</th>
                <th className="py-3 px-4 text-center">Credits</th>
                <th className="py-3 px-4 text-center">CA Marks</th>
                <th className="py-3 px-4 text-center">End Sem</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Credit Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c) => (
                <tr key={c.code} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{c.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">{c.credits}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-blue-900">{c.caMarks}</td>
                  <td className="py-3.5 px-4 text-center text-slate-700">{c.endSem}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full font-extrabold bg-emerald-100 text-emerald-800">
                      {c.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">{c.points.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ResultsView;
