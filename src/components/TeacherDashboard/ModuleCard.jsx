import React from 'react';
import { 
  ArrowRight, 
  FileText, 
  ClipboardCheck, 
  Calendar, 
  Megaphone, 
  Archive, 
  Settings, 
  FolderLock,
  Upload,
  BookOpen,
  Lock
} from 'lucide-react';

export function ModuleCard({ module, onOpen }) {
  const isDisabled = Boolean(module.disabled);

  // Map module icon string to Lucide icon
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'file-plus':
      case 'upload':
        return <Upload className="w-5 h-5" />;
      case 'clipboard-check':
        return <ClipboardCheck className="w-5 h-5" />;
      case 'calendar-edit':
      case 'calendar':
        return <Calendar className="w-5 h-5" />;
      case 'megaphone':
        return <Megaphone className="w-5 h-5" />;
      case 'archive':
        return <Archive className="w-5 h-5" />;
      case 'calendar-settings':
        return <Settings className="w-5 h-5" />;
      case 'file-text':
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div
      onClick={() => {
        if (!isDisabled) {
          onOpen(module.id);
        }
      }}
      className={`group relative bg-white rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between ${
        isDisabled
          ? 'opacity-60 bg-slate-50/70 border border-slate-200/90 cursor-not-allowed select-none'
          : module.highlighted
          ? 'border-2 border-[#08172c] shadow-md shadow-slate-300/50 ring-1 ring-[#08172c]/10 cursor-pointer'
          : 'border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 cursor-pointer'
      }`}
    >
      <div>
        {/* Card Header: Dark Square Icon + Pill Badge */}
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs transition-transform duration-200 ${
            isDisabled
              ? 'bg-slate-300 text-slate-600'
              : 'bg-[#08172c] text-white group-hover:scale-105'
          }`}>
            {getIcon(module.icon)}
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            isDisabled
              ? 'bg-slate-100 text-slate-500 border border-slate-200'
              : 'bg-sky-100 text-[#0369a1]'
          }`}>
            {isDisabled ? 'Disabled' : module.badge}
          </span>
        </div>

        {/* Card Title */}
        <h3 className={`text-lg font-bold mt-4 transition-colors ${
          isDisabled ? 'text-slate-500' : 'text-[#0a182d] group-hover:text-blue-900'
        }`}>
          {module.title}
        </h3>

        {/* Card Description */}
        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
          {module.description}
        </p>
      </div>

      {/* Card Action Link */}
      <div className={`pt-5 mt-4 border-t border-slate-100/80 flex items-center gap-1.5 font-bold text-sm ${
        isDisabled
          ? 'text-slate-400'
          : 'text-[#0a182d] group-hover:text-blue-800 transition-colors'
      }`}>
        {isDisabled ? (
          <>
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Disabled</span>
          </>
        ) : (
          <>
            <span>Open module</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
          </>
        )}
      </div>
    </div>
  );
}

export default ModuleCard;
