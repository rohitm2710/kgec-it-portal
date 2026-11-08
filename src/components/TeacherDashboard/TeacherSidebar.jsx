import React from 'react';
import { 
  Upload, 
  ClipboardCheck, 
  Calendar, 
  Megaphone, 
  Archive, 
  Settings, 
  FileSpreadsheet, 
  LogOut,
  GraduationCap,
  Lock,
  Eye
} from 'lucide-react';
import { KGECLogo } from '../KGECLogo';

export function TeacherSidebar({ 
  activeNav, 
  setActiveNav, 
  onOpenModule, 
  onLogout,
  onSwitchToStudent
}) {
  const navItems = [
    {
      id: "upload-question",
      label: "Upload Question\n(Question Bank)",
      shortLabel: "Upload Question",
      icon: Upload,
      moduleId: "upload-question",
      disabled: false,
    },
    {
      id: "monitor-exam",
      label: "Monitor Exam\n(Live Proctor)",
      shortLabel: "Monitor Exam",
      icon: Eye,
      moduleId: "monitor-exam",
      disabled: false,
    },
    {
      id: "check-copies",
      label: "Check Copies\n(AI + OCR)",
      shortLabel: "Check Copies (AI + OCR)",
      icon: ClipboardCheck,
      moduleId: "check-copies",
      disabled: true,
    },
    {
      id: "routine-check",
      label: "Routine Maker",
      shortLabel: "Routine Maker",
      icon: Calendar,
      moduleId: "routine-check",
      disabled: true,
    },
    {
      id: "previous-exams-marks",
      label: "Previous Exams\n(Marks Ledger)",
      shortLabel: "Marks Ledger",
      icon: FileSpreadsheet,
      moduleId: "previous-exams-marks",
      disabled: false,
    },
    {
      id: "announcements",
      label: "Announcements",
      shortLabel: "Announcements",
      icon: Megaphone,
      moduleId: "announcements",
      disabled: false,
    }
  ];

  return (
    <aside className="w-64 sm:w-72 bg-[#08172c] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <KGECLogo size="md" light={false} showText={true} />
        </div>

        {/* Navigation list matching screenshot */}
        <nav className="p-4 space-y-2 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isDisabled = Boolean(item.disabled);
            const isActive = activeNav === item.id && !isDisabled;

            return (
              <button
                key={item.id}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    setActiveNav(item.id);
                    if (item.moduleId) {
                      onOpenModule(item.moduleId);
                    }
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
                  isDisabled
                    ? 'opacity-40 text-slate-500 cursor-not-allowed border border-transparent select-none'
                    : isActive
                    ? 'border border-blue-400/50 bg-[#122847] text-white shadow-sm ring-1 ring-blue-500/20 cursor-pointer'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isDisabled ? 'text-slate-500' : isActive ? 'text-white' : 'text-slate-300'
                  }`}>
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="leading-tight truncate">
                    {item.label.split('\n').map((line, idx) => (
                      <div key={idx} className={idx > 0 ? "text-xs text-slate-400 font-normal" : "font-semibold"}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                {isDisabled && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 shrink-0 ml-1">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom Controls */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default TeacherSidebar;
