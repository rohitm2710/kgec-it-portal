import React from 'react';
import { X, Download, FileText, Calendar, Building, Sparkles, ExternalLink } from 'lucide-react';

export function AttachmentPreviewModal({ attachment, onClose }) {
  if (!attachment) return null;

  const isPdf = attachment.type?.toLowerCase() === 'pdf' || attachment.name?.toLowerCase().endsWith('.pdf');
  const isImage = attachment.type?.toLowerCase() === 'image' || /\.(png|jpe?g|webp)$/i.test(attachment.name || '');

  const handleDownload = () => {
    if (attachment.url) {
      const a = document.createElement('a');
      a.href = attachment.url;
      a.download = attachment.name || 'KGEC_Document.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert(`Initiating download for: ${attachment.name}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#08172c] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isPdf ? (
              <div className="p-1.5 bg-red-500/20 text-red-300 rounded border border-red-500/30">
                <FileText className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                <Calendar className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold truncate max-w-md">{attachment.name}</h3>
              <p className="text-[11px] text-slate-300">{attachment.size || 'Official Department Document'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {attachment.url && (
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Tab
              </a>
            )}
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex items-center justify-center min-h-[50vh]">
          {isPdf ? (
            attachment.url ? (
              <div className="w-full h-full flex flex-col items-center">
                <iframe
                  src={attachment.url}
                  title={attachment.name}
                  className="w-full h-[70vh] rounded-xl border border-slate-300 shadow-inner bg-white"
                />
              </div>
            ) : (
              /* Fallback PDF Document Mock Rendering */
              <div className="w-full max-w-lg bg-white rounded-lg shadow-md border border-slate-300 p-8 text-slate-800 space-y-4 font-serif">
                <div className="text-center border-b pb-4">
                  <div className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Kalyani Government Engineering College
                  </div>
                  <div className="text-xs text-slate-600 font-sans mt-0.5">
                    Department of Information Technology • Examination Office
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans mt-1">
                    Circular Ref: KGEC/IT/2026/EXAM-REG-089
                  </div>
                </div>

                <div className="text-xs leading-relaxed space-y-3 font-sans text-slate-700">
                  <p className="font-bold text-slate-900">
                    SUBJECT: ODD SEMESTER 2026 REGISTRATION & CONTINUOUS ASSESSMENT NOTICE
                  </p>
                  <p>
                    This is to inform all regular students of B.Tech 3rd, 5th, and 7th Semesters that the portal for Continuous Assessment (CA-2) and Practical Continuous Assessment (PCA) registration is open effective immediately.
                  </p>
                  <p>
                    Eligible candidates must review their attendance criteria (minimum 75%) before taking the automated MCQ and subjective exam modules.
                  </p>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono">
                    - Online CA-2 MCQ Exam window: 10:00 AM - 05:00 PM<br />
                    - Subjective Answer Sheet Upload: Max 10MB PDF/JPEG<br />
                    - Grievance Portal: Open until Nov 15, 2026
                  </div>
                </div>

                <div className="pt-6 border-t flex justify-between items-center text-[10px] text-slate-500 font-sans">
                  <span>Countersigned: Head of Department (IT)</span>
                  <span>Controller of Examinations, KGEC</span>
                </div>
              </div>
            )
          ) : isImage && attachment.url ? (
            <div className="w-full flex items-center justify-center p-2">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-h-[70vh] object-contain rounded-xl shadow-lg border border-slate-300 bg-white"
              />
            </div>
          ) : (
            /* Image Preview Mock */
            <div className="w-full max-w-lg bg-white rounded-lg shadow-md border border-slate-300 p-6">
              <div className="flex items-center justify-between pb-3 border-b mb-3">
                <span className="text-xs font-bold text-slate-900">Campus Placement & Technical Interview Drives 2026</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Schedule</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="font-bold text-slate-800">TCS Digital & Prime</span>
                  <span className="text-slate-500">Nov 18, 2026 • 10:00 AM</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="font-bold text-slate-800">Cognizant GenC Next</span>
                  <span className="text-slate-500">Nov 22, 2026 • 11:30 AM</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="font-bold text-slate-800">PwC Acceleration Centers</span>
                  <span className="text-slate-500">Dec 02, 2026 • 02:00 PM</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttachmentPreviewModal;
