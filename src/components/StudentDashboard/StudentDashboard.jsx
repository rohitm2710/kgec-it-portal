import React, { useState } from 'react';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { AnnouncementsFeed } from './AnnouncementsFeed';
import { ExaminationPortal } from './ExaminationPortal';
import { ResultsView } from './ResultsView';
import { SyllabusView } from './SyllabusView';

// Modals
import { McqExamModal } from './modals/McqExamModal';
import { SubjectiveExamModal } from './modals/SubjectiveExamModal';
import { AttachmentPreviewModal } from './modals/AttachmentPreviewModal';
import { SupportModal } from './modals/SupportModal';

export function StudentDashboard({ 
  onLogout, 
  announcements,
  currentUser
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'announcements' | 'examinations' | 'results' | 'syllabus' | 'support'
  const [activeExamModal, setActiveExamModal] = useState(null); // 'mcq' | 'subjective' | null
  const [selectedExamData, setSelectedExamData] = useState(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [showSupport, setShowSupport] = useState(false);

  const handleTabChange = (tabId) => {
    if (tabId === 'support') {
      setShowSupport(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const handleStartExam = (examType, examData = null) => {
    setSelectedExamData(examData);
    setActiveExamModal(examType);
  };

  return (
    <div className="min-h-screen flex bg-[#f0f4f9] text-slate-800 font-sans antialiased">
      {/* Student Sidebar */}
      <StudentSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header with Browser URL bar & Student Header */}
        <StudentHeader
          studentName={currentUser?.fullName || currentUser?.name || "Student"}
          announcements={announcements}
          onLogout={onLogout}
        />

        {/* Dashboard Content Container */}
        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Announcements Feed Section */}
              <AnnouncementsFeed
                announcements={announcements}
                onPreviewAttachment={(att) => setPreviewAttachment(att)}
              />

              {/* Examination Portal Section */}
              <ExaminationPortal onStartExam={handleStartExam} currentUser={currentUser} />
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <AnnouncementsFeed
                announcements={announcements}
                onPreviewAttachment={(att) => setPreviewAttachment(att)}
              />
            </div>
          )}

          {activeTab === 'examinations' && (
            <div>
              <ExaminationPortal onStartExam={handleStartExam} currentUser={currentUser} />
            </div>
          )}

          {activeTab === 'results' && (
            <ResultsView />
          )}

          {activeTab === 'syllabus' && (
            <SyllabusView />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <McqExamModal
        isOpen={activeExamModal === 'mcq'}
        examData={selectedExamData}
        onClose={() => {
          setActiveExamModal(null);
          setSelectedExamData(null);
        }}
      />

      <SubjectiveExamModal
        isOpen={activeExamModal === 'subjective'}
        examData={selectedExamData}
        onClose={() => {
          setActiveExamModal(null);
          setSelectedExamData(null);
        }}
      />

      <AttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />

      <SupportModal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
      />
    </div>
  );
}

export default StudentDashboard;
