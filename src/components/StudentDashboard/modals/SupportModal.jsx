import React, { useState } from 'react';
import { X, HelpCircle, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export function SupportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [category, setCategory] = useState('Exam Portal Issue');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#08172c] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">IT Department Support & Grievance Desk</h3>
              <p className="text-[11px] text-slate-300">Submit technical queries or examination score reviews</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-900">Ticket Dispatched!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your ticket reference #KGEC-SUP-982 has been routed to the IT Department administrator.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option>Exam Portal Issue</option>
                <option>AI OCR Script Re-evaluation Request</option>
                <option>Attendance Discrepancy</option>
                <option>Login / Credential Assistance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the problem or requirement with your roll number and subject name..."
                className="w-full p-3 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#08172c] text-white text-xs font-bold hover:bg-slate-900 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Submit Ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SupportModal;
