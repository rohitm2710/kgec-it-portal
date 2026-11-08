import React from 'react';
import { X, ShieldAlert, Terminal, Trash2, Copy, Check, Clock, AlertTriangle } from 'lucide-react';

export function ProctorAuditModal({ isOpen, onClose, examId, violations = [], onClearLogs }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(violations, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#08172c] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Proctoring Violation Audit Trail</h3>
              <p className="text-xs text-slate-300">
                Storage Key: <code className="text-amber-300 font-mono">kgec_exam_logs_{examId}</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Session Audit Status
              </span>
              <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
                <span className={violations.length === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {violations.length} Violation{violations.length !== 1 ? 's' : ''} Detected
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLogs}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied JSON' : 'Copy Logs'}
              </button>
              {onClearLogs && (
                <button
                  onClick={onClearLogs}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset Logs
                </button>
              )}
            </div>
          </div>

          {/* Log Entry List */}
          {violations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Clean Audit Trail</h4>
              <p className="text-xs text-slate-500 mt-1">No security violations recorded in this assessment attempt.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Chronological Violation Events:
              </span>
              {violations.map((v, idx) => (
                <div
                  key={v.id || idx}
                  className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex items-start gap-3 text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-rose-200/80 text-rose-700 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-rose-900 text-[11px]">
                        #{idx + 1} • {v.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {v.timeFormatted || new Date(v.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs mt-1 leading-snug">
                      {v.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Technical Info Box */}
          <div className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] space-y-1">
            <div className="text-slate-400 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Developer / Proctor Inspection Tip:
            </div>
            <p className="text-[10px] text-slate-400">
              You can also inspect raw violation records anytime in Chrome DevTools Console:
              <br />
              <code className="text-amber-300">
                JSON.parse(localStorage.getItem('kgec_exam_logs_{examId}'))
              </code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#08172c] hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
          >
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProctorAuditModal;
