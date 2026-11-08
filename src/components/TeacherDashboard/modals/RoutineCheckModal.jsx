import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Download, Filter } from 'lucide-react';
import { sampleRoutines } from '../../../data/mockData';

export function RoutineCheckModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('IT 6th Sem');

  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filtered = sampleRoutines.filter((item) => {
    const matchDay = selectedDay === 'All' || item.day === selectedDay;
    const matchBatch = selectedSemester === 'All' || item.batch === selectedSemester;
    return matchDay && matchBatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#08172c] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">IT Department Weekly Academic Routine</h2>
              <p className="text-xs text-slate-300">
                Departmental Lectures, Software Labs, and Seminar Hall Allocations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Day pills */}
          <div className="flex flex-wrap gap-1">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDay === day
                    ? 'bg-[#08172c] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-semibold"
            >
              <option value="IT 6th Sem">IT 6th Semester</option>
              <option value="IT 8th Sem">IT 8th Semester</option>
              <option value="All">All Semesters</option>
            </select>

            <button
              onClick={() => alert("Downloading KGEC IT Department Official Routine PDF...")}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Routine PDF
            </button>
          </div>
        </div>

        {/* Routine Table / List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No classes scheduled for the selected day and batch filter.
            </div>
          ) : (
            filtered.map((slot, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 shrink-0 text-center py-2 px-1 bg-slate-100 rounded-lg">
                    <span className="block text-[11px] font-bold text-slate-500 uppercase">{slot.day}</span>
                    <span className="block text-xs font-extrabold text-[#08172c] mt-0.5">{slot.time.split(' - ')[0]}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{slot.subject}</h4>
                      <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                        {slot.batch}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {slot.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {slot.room}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {slot.faculty}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:self-center">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Confirmed
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Weekly timetable ratified by Academic Committee • KGEC</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#08172c] text-white font-bold hover:bg-slate-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoutineCheckModal;
