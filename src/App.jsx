import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/Login/LoginPage';
import { TeacherDashboard } from './components/TeacherDashboard/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard/StudentDashboard';
import { initialAnnouncements } from './data/mockData';
import { api } from './services/api';

// Helper: Restore persistent user session synchronously from localStorage on initial render / page reload
function getStoredAuth() {
  try {
    const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
    const rawUser = localStorage.getItem('kgec_user') || localStorage.getItem('user');
    if (token && rawUser) {
      const user = JSON.parse(rawUser);
      if (user && user.role) {
        return {
          user,
          view: user.role.toLowerCase() === 'teacher' ? 'teacher' : 'student'
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached session:', err);
  }
  return { user: null, view: 'login' };
}

export function App() {
  // Restore authentication state synchronously on page reload
  const savedAuth = getStoredAuth();
  const [currentView, setCurrentView] = useState(savedAuth.view);
  const [currentUser, setCurrentUser] = useState(savedAuth.user);
  const [announcements, setAnnouncements] = useState([]);

  // Verify and refresh persistent session with backend on mount
  useEffect(() => {
    async function restoreAndVerifySession() {
      const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
      if (!token) return;

      try {
        const data = await api.getMe();
        if (data && data.user) {
          const u = data.user;
          const updatedUser = {
            id: u.id,
            fullName: u.fullName || u.name,
            name: u.fullName || u.name,
            email: u.email,
            institutionalId: u.institutionalId,
            role: (u.role || '').toLowerCase(),
            academicYear: u.academicYear,
            semester: u.semester,
          };
          setCurrentUser(updatedUser);
          localStorage.setItem('kgec_user', JSON.stringify(updatedUser));
          setCurrentView(updatedUser.role === 'teacher' ? 'teacher' : 'student');
        }
      } catch (err) {
        console.warn('Background session verification fallback:', err);
      }
    }

    restoreAndVerifySession();
  }, []);

  // Sync announcements with backend on mount
  useEffect(() => {
    async function fetchAnnouncements() {
      const data = await api.getAnnouncements();
      if (data && data.length > 0) {
        const formatted = data.map((item) => ({
          id: item.id,
          author: item.authorName || "Faculty Notices",
          timeAgo: "3 hours ago",
          date: new Date(item.createdAt).toLocaleDateString(),
          title: item.title,
          content: item.content,
          attachments: (item.attachments || []).map((att, idx) => ({
            id: `att-${item.id}-${idx}`,
            type: att.fileType?.toLowerCase() || 'pdf',
            name: att.fileName,
            url: att.fileUrl,
            size: att.fileSizeBytes ? `${(att.fileSizeBytes / 1024 / 1024).toFixed(1)} MB` : '1.4 MB',
            description: att.description || 'Departmental notice attachment',
          })),
        }));
        setAnnouncements(formatted);
      }
    }
    fetchAnnouncements();
  }, []);

  // Handle authenticated login from LoginPage
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('kgec_user', JSON.stringify(userData));
    } catch (e) {}

    if (userData.role?.toLowerCase() === 'teacher') {
      setCurrentView('teacher');
    } else {
      setCurrentView('student');
    }
  };

  // Secure logout back to login page (clears all persistent tokens and user state)
  const handleLogout = () => {
    localStorage.removeItem('kgec_auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('kgec_user');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentView('login');
  };

  // Broadcast announcement from teacher dashboard to student feed & backend
  const handleAddAnnouncement = async (newNotice) => {
    setAnnouncements((prev) => [newNotice, ...prev]);
    try {
      await api.createAnnouncement({
        title: newNotice.title,
        content: newNotice.content,
        attachments: newNotice.attachments?.map((att) => ({
          fileName: att.name,
          fileUrl: att.url || `/assets/${att.name}`,
          fileType: att.type?.toUpperCase() === 'IMAGE' ? 'IMAGE' : 'PDF',
          fileSizeBytes: att.sizeBytes,
        })),
      });
    } catch (err) {
      console.warn('Backend announcement sync fallback:', err);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans">
      {/* Strict Role-Based View Access with Session Persistence */}
      {currentView === 'login' && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {currentView === 'teacher' && (
        <TeacherDashboard
          onLogout={handleLogout}
          onAddAnnouncement={handleAddAnnouncement}
          announcements={announcements}
          currentUser={currentUser}
        />
      )}

      {currentView === 'student' && (
        <StudentDashboard
          onLogout={handleLogout}
          announcements={announcements}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

export default App;
