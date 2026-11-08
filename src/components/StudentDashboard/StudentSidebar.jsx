import React from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  GraduationCap, 
  FileCheck2, 
  BookOpen, 
  HelpCircle,
  LogOut,
  UserCheck
} from 'lucide-react';
import { KGECLogo } from '../KGECLogo';

export function StudentSidebar({ activeTab, setActiveTab, onLogout, onSwitchToTeacher }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'examinations', label: 'Examinations', icon: GraduationCap },
    { id: 'results', label: 'Results', icon: FileCheck2 },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ];

  return (
    <aside className="w-60 sm:w-64 bg-[#08172c] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800 select-none">
      <div>
        {/* Logo Header */}
        <div className="p-6 border-b border-slate-800/80">
          <KGECLogo size="md" light={false} showText={true} />
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sign Out */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default StudentSidebar;
