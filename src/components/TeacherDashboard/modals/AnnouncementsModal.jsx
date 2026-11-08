import React, { useState, useRef } from 'react';
import { 
  X, 
  Megaphone, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  Send, 
  CheckCircle2, 
  Upload, 
  Trash2, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

export function AnnouncementsModal({ isOpen, onClose, onAddAnnouncement }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('All IT Students & Faculty');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selections from local machine (PDFs, Images)
  const processFiles = (files) => {
    setErrorMsg('');
    const fileList = Array.from(files);

    fileList.forEach((file) => {
      // Check size (Max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds 25MB limit.`);
        return;
      }

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name: file.name,
            type: isPdf ? 'pdf' : (isImg ? 'image' : 'other'),
            size: file.size < 1024 * 1024 
              ? `${(file.size / 1024).toFixed(1)} KB` 
              : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            sizeBytes: file.size,
            url: dataUrl,
            description: isPdf ? 'Departmental PDF Document' : 'Visual Notice Attachment'
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileInputChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAttachPresetSyllabus = () => {
    // Add official IT Syllabus PDF as a pre-packaged attachment
    setUploadedFiles((prev) => [
      ...prev,
      {
        id: `att-preset-${Date.now()}`,
        name: 'KGEC_IT_Curriculum_Syllabus.pdf',
        type: 'pdf',
        size: '1.8 MB',
        sizeBytes: 1887436,
        url: '/IT_Syllabus.pdf',
        description: 'Official MAKAUT & KGEC B.Tech IT 4-Year Curriculum Structure'
      }
    ]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg('Please enter notice content.');
      return;
    }

    const newNotice = {
      id: `ann-${Date.now()}`,
      author: "Faculty Notices (Dr. S. Roy)",
      timeAgo: "Just now",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: title.trim() || "Departmental Notice",
      content: content.trim(),
      attachments: uploadedFiles
    };

    if (onAddAnnouncement) {
      onAddAnnouncement(newNotice);
    }

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#08172c] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-300">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Broadcast Department Notice</h2>
              <p className="text-xs text-slate-300">
                Dispatches urgent notifications to Student & Faculty portals with direct PDF attachment upload
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-6 overflow-y-auto space-y-4">
          {isSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              Notice with {uploadedFiles.length} attachment(s) successfully broadcasted!
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-medium"
              >
                <option>All IT Students & Faculty</option>
                <option>IT 2nd Year (3rd & 4th Sem)</option>
                <option>IT 3rd Year (5th & 6th Sem)</option>
                <option>IT Final Year (7th & 8th Sem)</option>
                <option>All Engineering Departments</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Notice Subject / Title
              </label>
              <input
                type="text"
                placeholder="e.g. End-Semester Examination Registration & Circular"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08172c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notice Description / Content
            </label>
            <textarea
              rows={3}
              required
              placeholder="Dear Students, please find the registration notice, rules, and guidelines attached below."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08172c]"
            />
          </div>

          {/* PDF & File Upload Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-600" />
                <span>PDF & Document Attachments ({uploadedFiles.length})</span>
              </label>

              <button
                type="button"
                onClick={handleAttachPresetSyllabus}
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                + Quick Attach Official Syllabus PDF
              </button>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/60' 
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf,image/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 mb-2">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drag & drop PDF files here
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports PDF notices, routines, and images (up to 25MB each)
              </p>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 mt-2">
                {uploadedFiles.map((file) => {
                  const isPdf = file.type === 'pdf';
                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-2xs animate-in fade-in"
                    >
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
                          <p className="text-xs font-bold text-slate-900 truncate max-w-sm">
                            {file.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {file.size} • {isPdf ? 'Ready to attach' : 'Image attachment'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#08172c] hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Broadcast Notice ({uploadedFiles.length} file{uploadedFiles.length === 1 ? '' : 's'})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnnouncementsModal;
