import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Lock, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  LogOut, 
  FileText,
  KeyRound
} from 'lucide-react';
import { NoticeDetailModal } from '../common/NoticeDetailModal';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { api } from '../../services/api';

export function StudentHeader({ 
  studentName = "Student", 
  announcements: propAnnouncements = [],
  onLogout, 
  onSwitchToTeacher 
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [liveAnnouncements, setLiveAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Directly call the announcements API (identical to teacher dashboard)
  const fetchLatestAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAnnouncements();
      if (data && Array.isArray(data)) {
        const formatted = data.map((item) => ({
          id: item.id,
          author: item.authorName || item.author || "Faculty Notices",
          timeAgo: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently",
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently",
          title: item.title,
          content: item.content,
          attachments: (item.attachments || []).map((att, idx) => ({
            id: att.id || `att-${item.id}-${idx}`,
            type: att.fileType?.toLowerCase() || att.type?.toLowerCase() || 'pdf',
            name: att.fileName || att.name || 'Notice Attachment',
            url: att.fileUrl || att.url,
            size: att.fileSizeBytes ? `${(att.fileSizeBytes / 1024 / 1024).toFixed(1)} MB` : (att.size || '1.4 MB'),
            description: att.description || 'Departmental notice attachment',
          })),
        }));
        setLiveAnnouncements(formatted);
      }
    } catch (err) {
      console.warn("Could not fetch announcements for student header:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync when prop announcements change
  useEffect(() => {
    if (propAnnouncements && propAnnouncements.length > 0) {
      setLiveAnnouncements(propAnnouncements);
    } else {
      fetchLatestAnnouncements();
    }
  }, [propAnnouncements]);

  const sourceNotices = liveAnnouncements.length > 0 ? liveAnnouncements : propAnnouncements;

  // Derive notifications dynamically from real announcements
  const notifications = useMemo(() => {
    return (sourceNotices || []).map((notice) => ({
      id: notice.id,
      rawNotice: notice,
      title: notice.title,
      content: notice.content,
      author: notice.author || notice.authorName,
      date: notice.date || notice.timeAgo,
      attachments: notice.attachments,
      text: notice.title ? `Notice: ${notice.title}` : (notice.content?.slice(0, 65) || "Department Notice"),
      time: notice.timeAgo || notice.date || (notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : "Recently"),
      hasPdf: (notice.attachments || []).some(
        a => (a.fileType || a.type)?.toLowerCase() === 'pdf' || (a.fileName || a.name)?.toLowerCase().endsWith('.pdf')
      )
    }));
  }, [sourceNotices]);

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    setShowProfileMenu(false);
    if (nextState) {
      fetchLatestAnnouncements();
    }
  };

  const handleSelectNotification = (n) => {
    setSelectedNotice(n.rawNotice || n);
    setShowNotifications(false);
  };

  return (
    <div className="w-full flex flex-col shrink-0 select-none">
      {/* Mock Browser Top Window Frame & URL Bar matching screenshot */}
      <div className="bg-[#1e2430] border-b border-slate-700/60 px-4 py-2 flex items-center gap-3 text-xs text-slate-300">
        {/* Window controls (red, yellow, green) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <ArrowLeft className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
          <ArrowRight className="w-3.5 h-3.5 opacity-50 cursor-not-allowed" />
          <RotateCw className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
        </div>

        {/* Address URL input */}
        <div className="flex-1 max-w-2xl mx-auto bg-[#0f141c] text-slate-300 px-3.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-2 border border-slate-700/40">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">kgec.edu.in/portal/student-dashboard</span>
        </div>
      </div>

      {/* Main Student Header Bar */}
      <header className="relative z-30 bg-[#08172c] text-white px-6 sm:px-8 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Student Dashboard
        </h1>

        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={handleToggleNotifications}
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-sm text-slate-900">
                        Department Notices
                      </div>
                      <button
                        onClick={fetchLatestAnnouncements}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Refresh notices"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Bell className="w-7 h-7 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-xs text-slate-700">No New Notifications</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        You're all caught up! New notices and PDF circulars will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 mt-2 max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => handleSelectNotification(n)}
                          className="py-2.5 text-xs text-slate-700 flex items-start gap-2.5 hover:bg-slate-50 p-2 rounded-lg cursor-pointer transition-colors group"
                        >
                          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-blue-600" />
                          <div className="min-w-0 flex-1">
                            <p className="leading-snug text-slate-800 font-semibold group-hover:text-blue-700 transition-colors">
                              {n.text}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <span>{n.time}</span>
                              {n.hasPdf && (
                                <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1 rounded flex items-center gap-0.5">
                                  <FileText className="w-2.5 h-2.5" /> PDF
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Student Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 py-1 px-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden ring-2 ring-white/20">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80"
                  alt="Rahul Dey"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80";
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-white hidden sm:inline-block">
                {studentName}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 z-50 py-2">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="font-bold text-sm text-slate-900">{studentName}</div>
                  <div className="text-xs text-slate-500">KGEC IT Department Student</div>
                </div>

                {/* Change Password Option */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowChangePassword(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer border-b border-slate-100"
                >
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {/* Interactive Notice Details Modal on notification click */}
      <NoticeDetailModal
        isOpen={Boolean(selectedNotice)}
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />
    </div>
  );
}

export default StudentHeader;
