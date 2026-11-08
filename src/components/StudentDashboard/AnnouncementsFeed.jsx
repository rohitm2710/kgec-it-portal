import React from 'react';
import { Download, FileText, ExternalLink, Calendar, Megaphone } from 'lucide-react';

export function AnnouncementsFeed({ announcements = [], onPreviewAttachment }) {
  const noticesList = announcements;

  const handleDownload = (att, e) => {
    e.stopPropagation();
    if (att.url) {
      const a = document.createElement('a');
      a.href = att.url;
      a.download = att.name || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else if (onPreviewAttachment) {
      onPreviewAttachment(att);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Announcements Feed
        </h2>
        <span className="text-xs font-semibold text-slate-500">
          {noticesList.length} Active Notice{noticesList.length === 1 ? '' : 's'}
        </span>
      </div>

      {noticesList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-10 text-center animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Megaphone className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Announcements Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            New departmental notices, circulars, and PDF schedules will appear here once broadcasted by faculty.
          </p>
        </div>
      ) : (
        noticesList.map((notice, index) => (
        <div 
          key={notice.id || index}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 animate-in fade-in"
        >
          {/* Notice Header */}
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{notice.author || "Faculty Notices"}</span>
              {index === 0 && (
                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Latest
                </span>
              )}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {notice.timeAgo || notice.date || "Recently"}
            </span>
          </div>

          {/* Title if present */}
          {notice.title && (
            <h4 className="text-sm font-extrabold text-slate-900 mt-1 mb-1">
              {notice.title}
            </h4>
          )}

          {/* Notice Body */}
          <p className="text-sm text-slate-700 leading-relaxed mt-1 mb-5">
            {notice.content}
          </p>

          {/* Notice Attachments matching screenshot */}
          {notice.attachments && notice.attachments.length > 0 && (
            <div className="space-y-3">
              {notice.attachments.map((att) => {
                const isPdf = att.type?.toLowerCase() === 'pdf' || att.name?.toLowerCase().endsWith('.pdf');

                return (
                  <div
                    key={att.id}
                    onClick={() => onPreviewAttachment(att)}
                    className="group rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 p-3 sm:p-3.5 transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Icon / Thumbnail */}
                      {isPdf ? (
                        <div className="w-10 h-11 rounded-lg bg-red-50 border border-red-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                          <FileText className="w-4 h-4 text-red-600" />
                          <span className="text-[9px] font-black tracking-wider text-red-700 uppercase mt-0.5">
                            PDF
                          </span>
                        </div>
                      ) : (
                        <div className="w-10 h-11 rounded-lg bg-slate-800 text-white flex flex-col items-center justify-center shrink-0 overflow-hidden relative border border-slate-700">
                          <div className="text-[7px] font-mono text-slate-300 uppercase px-1 text-center leading-tight">
                            Schedule
                          </div>
                          <div className="w-full h-1 bg-sky-400 mt-1" />
                          <div className="text-[6px] text-slate-400 mt-0.5">Image</div>
                        </div>
                      )}

                      {/* Attachment metadata */}
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 group-hover:text-blue-900 transition-colors truncate">
                          {isPdf ? att.name : (att.title || att.name)}
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {att.description || `${att.size || 'PDF'} document`}
                        </div>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDownload(att, e)}
                      className="shrink-0 px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Download</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )))}
    </div>
  );
}

export default AnnouncementsFeed;
