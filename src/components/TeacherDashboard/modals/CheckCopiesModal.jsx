import React, { useState } from 'react';
import { 
  X, 
  Bot, 
  CheckCircle, 
  FileSearch, 
  Sparkles, 
  Sliders, 
  RefreshCw, 
  Eye, 
  Save, 
  AlertTriangle 
} from 'lucide-react';
import { sampleOcrCopies } from '../../../data/mockData';

export function CheckCopiesModal({ isOpen, onClose, onMarksUpdated }) {
  if (!isOpen) return null;

  const [selectedCopyIndex, setSelectedCopyIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('grading'); // 'grading' | 'ocr' | 'script'
  const [copies, setCopies] = useState(sampleOcrCopies);
  const currentCopy = copies[selectedCopyIndex];

  const [manualScore, setManualScore] = useState(currentCopy.aiScore);
  const [feedbackNote, setFeedbackNote] = useState("AI evaluation approved with instructor validation.");
  const [isSaved, setIsSaved] = useState(false);

  const handleSelectCopy = (index) => {
    setSelectedCopyIndex(index);
    setManualScore(copies[index].aiScore);
    setIsSaved(false);
  };

  const handleApprove = () => {
    const updated = [...copies];
    updated[selectedCopyIndex].aiScore = manualScore;
    updated[selectedCopyIndex].aiOcrStatus = "Instructor Verified & Published";
    setCopies(updated);
    setIsSaved(true);
    if (onMarksUpdated) {
      onMarksUpdated({
        studentRoll: currentCopy.rollNumber,
        newScore: manualScore
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar */}
        <div className="bg-[#08172c] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Check Copies (AI + OCR Evaluation)</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  OpenRouter AI Engine Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automated optical handwriting recognition with LLM rubric grading & instructor override
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

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Left Script Queue Sidebar (4 cols) */}
          <div className="md:col-span-4 bg-slate-50/70 p-4 flex flex-col h-full overflow-y-auto">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Submitted Answer Scripts ({copies.length})
            </div>
            <div className="space-y-2.5">
              {copies.map((copy, idx) => (
                <div
                  key={copy.id}
                  onClick={() => handleSelectCopy(idx)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                    selectedCopyIndex === idx
                      ? 'bg-white border-[#08172c] shadow-sm ring-1 ring-[#08172c]/20'
                      : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{copy.studentName}</span>
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {copy.aiScore}/{copy.maxScore}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Roll: {copy.rollNumber}</div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-400">{copy.pages} Pages • OCR {copy.confidence}</span>
                    <span className="font-semibold text-emerald-600">{copy.aiOcrStatus}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Grading Config Card */}
            <div className="mt-auto pt-4 border-t border-slate-200">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900">
                <div className="font-bold flex items-center gap-1.5 text-blue-950 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Model: Claude 3.5 Sonnet / DeepSeek
                </div>
                Prompt: Departmental strict rubric matching with partial grading for clean architectural diagrams.
              </div>
            </div>
          </div>

          {/* Right Detailed Evaluation View (8 cols) */}
          <div className="md:col-span-8 p-6 flex flex-col h-full overflow-y-auto bg-white">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>{currentCopy.studentName}</span>
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {currentCopy.rollNumber}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentCopy.subject} • {currentCopy.examType} ({currentCopy.semester})
                </p>
              </div>

              {/* View mode toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('grading')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeTab === 'grading' ? 'bg-[#08172c] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AI Rubric
                </button>
                <button
                  onClick={() => setActiveTab('ocr')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeTab === 'ocr' ? 'bg-[#08172c] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Extracted OCR
                </button>
                <button
                  onClick={() => setActiveTab('script')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeTab === 'script' ? 'bg-[#08172c] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Scanned Copy
                </button>
              </div>
            </div>

            {/* Dynamic Tab Contents */}
            <div className="py-4 flex-1">
              {activeTab === 'grading' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                        AI Recommended Score
                      </div>
                      <div className="text-2xl font-black text-emerald-950 mt-0.5">
                        {currentCopy.aiScore} <span className="text-sm font-normal text-slate-500">/ {currentCopy.maxScore}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-emerald-700">OCR Recognition Confidence</div>
                      <div className="text-lg font-bold text-emerald-900">{currentCopy.confidence}</div>
                    </div>
                  </div>

                  {/* Section by Section Rubrics */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Question-Wise AI Assessment Breakdown
                    </div>
                    {currentCopy.aiFeedback.map((item, i) => (
                      <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#08172c]">{item.q}: {item.rubric}</span>
                          <span className="font-bold text-xs bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full">
                            Score: {item.score}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.note}</p>
                      </div>
                    ))}
                  </div>

                  {/* Faculty Manual Marks Override */}
                  <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-[#08172c] flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-blue-700" />
                        Faculty Manual Override & Adjustments
                      </div>
                      <span className="text-base font-extrabold text-[#08172c]">
                        {manualScore} / {currentCopy.maxScore}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={currentCopy.maxScore}
                      value={manualScore}
                      onChange={(e) => setManualScore(Number(e.target.value))}
                      className="w-full accent-[#08172c] cursor-pointer"
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Instructor Evaluation Note / Feedback to Student
                      </label>
                      <input
                        type="text"
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ocr' && (
                <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
                  {currentCopy.ocrExtractedText}
                </div>
              )}

              {activeTab === 'script' && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-100 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md border border-slate-300">
                    <div className="border-b border-slate-200 pb-2 mb-4 text-left">
                      <div className="text-xs font-bold text-slate-800">KALYANI GOVERNMENT ENGINEERING COLLEGE</div>
                      <div className="text-[11px] text-slate-500">Continuous Assessment Answer Sheet • IT Dept</div>
                      <div className="text-[11px] font-mono mt-1 text-slate-700 font-bold">
                        Roll: {currentCopy.rollNumber} | Name: {currentCopy.studentName}
                      </div>
                    </div>
                    <div className="text-left font-serif text-slate-700 italic text-sm space-y-3">
                      <p className="border-b border-dotted border-slate-300 pb-2">
                        Ans 1. Architectural patterns govern high-level subsystem organization. Microservices encapsulate distinct business domains...
                      </p>
                      <p className="border-b border-dotted border-slate-300 pb-2">
                        Ans 2. In clean code, dependency inversion ensures high-level policies do not depend on low-level database details...
                      </p>
                      <div className="h-24 bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">
                        [Scanned Hand-Drawn Architecture Diagram #1]
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {isSaved ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Marks published to student ledger!
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Ready to confirm evaluation and update Student Marks Ledger.
                </span>
              )}

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-lg bg-[#08172c] hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Approve & Record Marks ({manualScore}/30)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckCopiesModal;
