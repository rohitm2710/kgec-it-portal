import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Trash2,
  Search,
  RefreshCw,
  AlertTriangle,
  Lock,
  KeyRound,
  GraduationCap,
  School,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ChevronRight,
  Filter,
  RotateCcw
} from 'lucide-react';
import { api } from '../../services/api';

export function AdminPanelModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('kgec_admin_token'));
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Users data state
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'STUDENT' | 'TEACHER'

  // Confirm delete modal state
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Change password modal state (accessible only inside the panel)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentAdminPass, setCurrentAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [passChangeError, setPassChangeError] = useState('');
  const [isSubmittingPassChange, setIsSubmittingPassChange] = useState(false);

  // Load users from backend
  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.adminGetUsers();
      setUsersList(data.users || []);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setErrorMsg(err.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Handle Passcode Unlock
  const handlePasscodeSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setPasscodeError('Please enter admin password');
      return;
    }

    setIsVerifying(true);
    setPasscodeError('');

    try {
      await api.adminLogin(passcode.trim());
      setIsAuthenticated(true);
      fetchUsers();
    } catch (err) {
      setPasscodeError(err.message || 'Invalid password.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Change Password Submit
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPassChangeError('');

    if (!newAdminPass.trim()) {
      setPassChangeError('Please enter a new password.');
      return;
    }

    if (newAdminPass.trim().length < 3) {
      setPassChangeError('Password must be at least 3 characters.');
      return;
    }

    if (newAdminPass !== confirmAdminPass) {
      setPassChangeError('New passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmittingPassChange(true);

    try {
      const res = await api.adminChangePassword(currentAdminPass.trim(), newAdminPass.trim());
      setActionNotice({
        type: 'success',
        text: res.message || 'Admin password updated successfully in database.',
      });
      setShowChangePasswordModal(false);
      setCurrentAdminPass('');
      setNewAdminPass('');
      setConfirmAdminPass('');
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      setPassChangeError(err.message || 'Failed to change admin password.');
    } finally {
      setIsSubmittingPassChange(false);
    }
  };

  // Grant or Revoke Access
  const handleToggleAccess = async (user, grant) => {
    try {
      const res = await api.adminGrantAccess(user.id, grant);
      // Update local state
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: grant } : u))
      );
      setActionNotice({
        type: grant ? 'success' : 'warning',
        text: grant
          ? `✓ Access GRANTED to ${user.fullName} (${user.role}). Verified as authentic student/faculty.`
          : `Access revoked for ${user.fullName}. Account locked.`,
      });
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  // Confirm delete user
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.adminDeleteUser(userToDelete.id);
      setUsersList((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setActionNotice({
        type: 'deleted',
        text: `Account for ${userToDelete.fullName} (${userToDelete.institutionalId}) has been permanently deleted from database.`,
      });
      setUserToDelete(null);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Emergency Safety Password Reset to 'kgecit'
  const handleResetPassword = async (user) => {
    const confirmReset = window.confirm(
      `Safety Password Reset:\n\nAre you sure you want to reset the password for ${user.fullName} (${user.role}) [${user.institutionalId}] back to the safety default "kgecit"?`
    );
    if (!confirmReset) return;

    try {
      const res = await api.adminResetUserPassword(user.id);
      setActionNotice({
        type: 'success',
        text: `✓ Safety Reset: ${res.message || `Password for ${user.fullName} reset to "kgecit".`}`,
      });
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      alert(`Reset failed: ${err.message}`);
    }
  };

  // KPI counts
  const pendingCount = usersList.filter((u) => !u.isActive).length;
  const studentCount = usersList.filter((u) => u.role === 'STUDENT').length;
  const teacherCount = usersList.filter((u) => u.role === 'TEACHER').length;

  // Filtered list
  const filteredUsers = useMemo(() => {
    let list = usersList;

    if (activeTab === 'PENDING') {
      list = list.filter((u) => !u.isActive);
    } else if (activeTab === 'STUDENT') {
      list = list.filter((u) => u.role === 'STUDENT');
    } else if (activeTab === 'TEACHER') {
      list = list.filter((u) => u.role === 'TEACHER');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.institutionalId?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [usersList, activeTab, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-[#08172c] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Department Admin Control Panel
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  HUMAN VERIFICATION GATEWAY
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Inspect registered students and faculty, delete accounts, and manually grant access.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Refresh user list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Notice Banner */}
        {actionNotice && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : actionNotice.type === 'deleted'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span>{actionNotice.text}</span>
            <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        {!isAuthenticated ? (
          /* ========================================================= */
          /* SCREEN 1: ADMIN PASSCODE AUTHENTICATION                   */
          /* ========================================================= */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-slate-50 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 mb-4 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Admin Authentication Required</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Please enter the institutional Department Admin Password to access user management, account deletions, and access verification controls.
            </p>

            <form onSubmit={handlePasscodeSubmit} className="w-full max-w-sm mt-6 space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="Enter Admin Password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#08172c] bg-white text-slate-800 placeholder-slate-400 shadow-xs"
                />
                {passcodeError && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium">{passcodeError}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#08172c] hover:bg-[#122847] text-white font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Unlock Admin Panel'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ========================================================= */
          /* SCREEN 2: ADMIN USER MANAGEMENT CONSOLE                   */
          /* ========================================================= */
          <div className="flex-1 overflow-y-auto flex flex-col bg-white">
            {/* KPI Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Total Accounts
                </span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  {usersList.length} Registered
                </span>
              </div>

              <div
                onClick={() => setActiveTab('PENDING')}
                className={`p-3 rounded-xl border shadow-2xs cursor-pointer transition-all ${
                  pendingCount > 0
                    ? 'bg-amber-50/70 border-amber-300 hover:bg-amber-50'
                    : 'bg-white border-slate-200'
                }`}
              >
                <span className="text-amber-800 block text-[11px] font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Verification
                </span>
                <span className="text-lg font-extrabold text-amber-700 mt-0.5 block">
                  {pendingCount} Awaiting Access
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> Students
                </span>
                <span className="text-lg font-bold text-blue-900 mt-0.5 block">
                  {studentCount} Enrolled
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-emerald-500" /> Faculty / Teachers
                </span>
                <span className="text-lg font-bold text-emerald-800 mt-0.5 block">
                  {teacherCount} Instructors
                </span>
              </div>
            </div>

            {/* Filter and Search Strip */}
            <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, roll no, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#08172c]"
                />
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({usersList.length})
                </button>
                <button
                  onClick={() => setActiveTab('PENDING')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'PENDING'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-amber-700'
                  }`}
                >
                  <span>Pending</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
                      {pendingCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('STUDENT')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'STUDENT'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-blue-700'
                  }`}
                >
                  Students ({studentCount})
                </button>
                <button
                  onClick={() => setActiveTab('TEACHER')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'TEACHER'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  Teachers ({teacherCount})
                </button>
              </div>

              {/* Admin Actions: Change Password & Lock */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(true);
                    setPassChangeError('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
                  title="Change the Admin Panel password"
                >
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem('kgec_admin_token');
                    setIsAuthenticated(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                >
                  Lock Panel
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                  <p className="text-sm font-medium text-slate-600">Loading registered accounts from database...</p>
                </div>
              ) : errorMsg ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700 max-w-md mx-auto my-8">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                  <h3 className="font-bold text-sm">Failed to Load User Accounts</h3>
                  <p className="text-xs text-rose-600 mt-1">{errorMsg}</p>
                  <button
                    onClick={fetchUsers}
                    className="mt-4 px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No accounts match current filter</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeTab === 'PENDING'
                      ? 'No pending registrations awaiting human verification. All registered students & teachers have access.'
                      : 'Try adjusting your search criteria.'}
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                        <th className="py-3 px-3.5">Roll / Faculty ID</th>
                        <th className="py-3 px-3.5">Name</th>
                        <th className="py-3 px-3 text-center">Role</th>
                        <th className="py-3 px-3 text-center">Batch / Sem</th>
                        <th className="py-3 px-3.5">Email Address</th>
                        <th className="py-3 px-3 text-center">Verification Status</th>
                        <th className="py-3 px-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((user) => {
                        const isPending = !user.isActive;
                        const isStudent = user.role === 'STUDENT';

                        return (
                          <tr
                            key={user.id}
                            className={`transition-colors ${
                              isPending
                                ? 'bg-amber-50/40 hover:bg-amber-50/70'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            {/* ID / Roll */}
                            <td className="py-3 px-3.5 font-mono text-slate-800 font-bold">
                              {user.institutionalId}
                            </td>

                            {/* Name */}
                            <td className="py-3 px-3.5">
                              <span className="font-bold text-slate-900 block">{user.fullName}</span>
                              <span className="text-[10px] text-slate-400">
                                Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                              </span>
                            </td>

                            {/* Role */}
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isStudent
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>

                            {/* Batch / Sem */}
                            <td className="py-3 px-3 text-center text-slate-600 font-medium">
                              {isStudent ? `Sem ${user.semester || 1}` : 'Faculty'}
                            </td>

                            {/* Email */}
                            <td className="py-3 px-3.5 text-slate-600 text-[11px] font-mono">
                              {user.email}
                            </td>

                            {/* Verification Status */}
                            <td className="py-3 px-3 text-center">
                              {isPending ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  Pending Verification
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Access Granted
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isPending ? (
                                  <button
                                    onClick={() => handleToggleAccess(user, true)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                                    title="Verify student and grant portal access"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Grant Access</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleAccess(user, false)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 text-[11px] font-medium transition cursor-pointer"
                                    title="Revoke portal access"
                                  >
                                    <UserX className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Revoke</span>
                                  </button>
                                )}

                                {/* Safety Reset Password to 'kgecit' */}
                                <button
                                  onClick={() => handleResetPassword(user)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-300 bg-amber-50/50 hover:bg-amber-100/80 text-amber-900 text-[11px] font-semibold transition cursor-pointer"
                                  title={`Safety Reset: Reset ${user.fullName}'s password back to "kgecit"`}
                                >
                                  <RotateCcw className="w-3 h-3 text-amber-600" />
                                  <span>Reset to 'kgecit'</span>
                                </button>

                                {/* Delete Account Button */}
                                <button
                                  onClick={() => setUserToDelete(user)}
                                  className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                  title={`Delete account for ${user.fullName}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {isAuthenticated
              ? `Displaying ${filteredUsers.length} user accounts • Human-driven enrollment verification`
              : 'Secure Department Administration Gateway'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#08172c] hover:bg-[#122847] text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Deleting User */}
      {userToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-left">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Permanently Delete Account?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to delete the account for{' '}
              <strong className="text-slate-900">{userToDelete.fullName}</strong> ({userToDelete.role},{' '}
              <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">
                {userToDelete.institutionalId}
              </code>
              )?
            </p>
            <p className="text-[11px] text-rose-600 mt-2 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
              ⚠️ This will permanently remove the account and all related records from the database. This action cannot be undone.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Admin Password Dialog (Accessible only after logging into Admin Panel) */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Admin Password</h3>
                  <p className="text-xs text-slate-500">Update the password for Department Admin Panel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPassChangeError('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passChangeError && (
              <div className="mb-3.5 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {passChangeError}
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password (default: admin)"
                  value={currentAdminPass}
                  onChange={(e) => setCurrentAdminPass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#08172c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Enter new admin password"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#08172c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmAdminPass}
                  onChange={(e) => setConfirmAdminPass(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#08172c]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNewPass}
                    onChange={(e) => setShowNewPass(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                  />
                  <span>Show password</span>
                </label>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPassChangeError('');
                  }}
                  disabled={isSubmittingPassChange}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassChange}
                  className="px-4 py-2 rounded-xl bg-[#08172c] hover:bg-[#122847] text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPassChange ? 'Saving...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanelModal;
