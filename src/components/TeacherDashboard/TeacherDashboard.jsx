import React, { useState } from 'react';
import { TeacherSidebar } from './TeacherSidebar';
import { TeacherHeader } from './TeacherHeader';
import { ModuleCard } from './ModuleCard';
import { examModules as defaultModules } from '../../data/mockData';

// Modals
import { CheckCopiesModal } from './modals/CheckCopiesModal';
import { UploadQuestionModal } from './modals/UploadQuestionModal';
import { PreviousExamsMarksModal } from './modals/PreviousExamsMarksModal';
import { RoutineCheckModal } from './modals/RoutineCheckModal';
import { AnnouncementsModal } from './modals/AnnouncementsModal';
import { QuestionBankArchiveModal } from './modals/QuestionBankArchiveModal';
import { ExamConfigModal } from './modals/ExamConfigModal';
import { MonitorExamModal } from './modals/MonitorExamModal';

export function TeacherDashboard({ 
  onLogout, 
  onAddAnnouncement, 
  onMarksUpdated,
  announcements = [],
  currentUser
}) {
  const [activeNav, setActiveNav] = useState('upload-question');
  const [activeModal, setActiveModal] = useState(null);
  const [modules, setModules] = useState(defaultModules);

  const handleOpenModule = (moduleId) => {
    setActiveModal(moduleId);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen flex bg-[#f0f4f9] text-slate-800 font-sans antialiased">
      {/* Teacher Sidebar */}
      <TeacherSidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenModule={handleOpenModule}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <TeacherHeader
          teacherName={currentUser?.fullName || currentUser?.name || "Faculty Member"}
          teacherEmail={currentUser?.email}
          announcements={announcements}
          onLogout={onLogout}
        />

        {/* Workspace Modules Grid */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onOpen={handleOpenModule}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Interactive Modals for each Module */}
      <CheckCopiesModal
        isOpen={activeModal === 'check-copies'}
        onClose={handleCloseModal}
        onMarksUpdated={onMarksUpdated}
      />

      <UploadQuestionModal
        isOpen={activeModal === 'upload-question'}
        onClose={handleCloseModal}
      />

      <PreviousExamsMarksModal
        isOpen={activeModal === 'previous-exams-marks'}
        onClose={handleCloseModal}
        currentUser={currentUser}
      />

      <RoutineCheckModal
        isOpen={activeModal === 'routine-check'}
        onClose={handleCloseModal}
      />

      <AnnouncementsModal
        isOpen={activeModal === 'announcements'}
        onClose={handleCloseModal}
        onAddAnnouncement={onAddAnnouncement}
      />

      <QuestionBankArchiveModal
        isOpen={activeModal === 'question-archive'}
        onClose={handleCloseModal}
      />

      <ExamConfigModal
        isOpen={activeModal === 'exam-config'}
        onClose={handleCloseModal}
      />

      <MonitorExamModal
        isOpen={activeModal === 'monitor-exam'}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default TeacherDashboard;
