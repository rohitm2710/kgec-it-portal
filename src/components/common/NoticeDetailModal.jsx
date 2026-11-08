import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Megaphone, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Calendar, 
  User, 
  Paperclip,
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export function NoticeDetailModal({ isOpen, notice, onClose }) {
  if (!isOpen || !notice) return null;

  const [activePreviewUrl, setActivePreviewUrl] = useState(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActivePreviewUrl(null);
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const title = notice.title || "Departmental Notice";
  const content = notice.content || "No additional text provided for this notice.";
  const author = notice.author || notice.authorName || "Faculty Notices";
  const dateStr = notice.timeAgo || (notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : (notice.date || "Recently"));
  
  // Normalize attachments
  const attachments = (notice.attachments || []).map((att, idx) => ({
    id: att.id || `att-${idx}`,
    name: att.fileName || att.name || "Attachment",
    type: (att.fileType || att.type || "pdf").toLowerCase(),
    url: att.fileUrl || att.url || null,
    size: att.fileSizeBytes ? `${(att.fileSizeBytes / 1024 / 1024).toFixed(1)} MB` : (att.size || "1.4 MB"),
    description: att.description || ""
  }));

  const handleDownloadAttachment = (att, e) => {
    e.stopPropagation();
    if (att.url) {
      const a = document.createElement('a');
      a.href = att.url;
      a.download = att.name || 'KGEC_Notice_Document.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert(`Initiating download for: ${att.name}`);
    }
  };

  const togglePreview = (att) => {
    if (activePreviewUrl === att.url) {
      setActivePreviewUrl(null);
    } else {
      setActivePreviewUrl(att.url);
    }
  };

  const handleBackdropClick = () => {
    setActivePreviewUrl(null);
    onClose();
  };

  // Use React Portal to render directly under document.body
  // This guarantees that no parent transform, filter, or backdrop-filter can distort positioning
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[88vh] flex flex-col my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Always visible with shrink-0 */}
        <div className="shrink-0 bg-[#08172c] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-300 shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-400/20">
                Official Department Notice
              </span>
              <h3 className="text-base font-bold truncate mt-1 text-white">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBackdropClick}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-3"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable with min-h-0 */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-5">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-100 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold">
              <User className="w-3.5 h-3.5 text-slate-500" />
              {author}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-100">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {dateStr}
            </span>

            {attachments.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 text-red-800 font-semibold border border-red-100">
                <Paperclip className="w-3.5 h-3.5 text-red-600" />
                {attachments.length} Document Attachment{attachments.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {/* Notice Title */}
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
              {title}
            </h2>
          </div>

          {/* Notice Full Text */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Attached Files Section */}
          {attachments.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-600" />
                Attached Documents & PDFs ({attachments.length})
              </h4>

              <div className="space-y-2">
                {attachments.map((att) => {
                  const isPdf = att.type === 'pdf' || att.name.toLowerCase().endsWith('.pdf');
                  const isPreviewing = activePreviewUrl === att.url && att.url;

                  return (
                    <div key={att.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                      <div className="p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {isPdf ? (
                            <div className="w-9 h-10 rounded-lg bg-red-50 border border-red-200 flex flex-col items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-red-600" />
                              <span className="text-[8px] font-black text-red-700 uppercase">PDF</span>
                            </div>
                          ) : (
                            <div className="w-9 h-10 rounded-lg bg-blue-50 border border-blue-200 flex flex-col items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-[8px] font-black text-blue-700 uppercase">IMG</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {att.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {att.size} • {isPdf ? 'Official PDF Circular' : 'Visual Attachment'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {att.url && (
                            <button
                              type="button"
                              onClick={() => togglePreview(att)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>{isPreviewing ? 'Hide Preview' : 'Preview'}</span>
                              {isPreviewing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleDownloadAttachment(att, e)}
                            className="px-3 py-1.5 rounded-lg bg-[#08172c] hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable in-modal preview */}
                      {isPreviewing && (
                        <div className="border-t border-slate-200 p-3 bg-slate-100 animate-in fade-in">
                          {isPdf ? (
                            <iframe
                              src={att.url}
                              title={att.name}
                              className="w-full h-80 rounded-lg border border-slate-300 bg-white"
                            />
                          ) : (
                            <div className="flex justify-center bg-white p-2 rounded-lg border border-slate-300">
                              <img
                                src={att.url}
                                alt={att.name}
                                className="max-h-80 object-contain rounded"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Always visible with shrink-0 */}
        <div className="shrink-0 p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Kalyani Government Engineering College • IT Department Portal</span>
          <button
            type="button"
            onClick={handleBackdropClick}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default NoticeDetailModal;
