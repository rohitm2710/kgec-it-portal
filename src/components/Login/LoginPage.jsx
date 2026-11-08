import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Sparkles,
  Check,
  School,
  ShieldCheck,
  UserPlus,
  LogIn,
  Clock,
  AlertTriangle,
  GraduationCap,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { KGECLogo } from '../KGECLogo';
import { api } from '../../services/api';
import { AdminPanelModal } from '../Admin/AdminPanelModal';

export function LoginPage({ onLoginSuccess }) {
  // Navigation mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

  // Sign In State
  const [activeTab, setActiveTab] = useState('teacher'); // 'teacher' | 'student'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPendingApprovalAlert, setIsPendingApprovalAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Registration Form State
  const [regRole, setRegRole] = useState('student'); // 'student' | 'teacher'
  const [regFullName, setRegFullName] = useState('');
  const [regInstitutionalId, setRegInstitutionalId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSemester, setRegSemester] = useState('6');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regErrorMsg, setRegErrorMsg] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [regIsLoading, setRegIsLoading] = useState(false);

  // Admin Modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Check pending users count quietly for the admin badge
  const checkPendingUsers = async () => {
    try {
      const data = await api.adminGetUsers();
      if (data && typeof data.pendingCount === 'number') {
        setPendingCount(data.pendingCount);
      }
    } catch {
      // Quiet fail if offline/not accessible
    }
  };

  useEffect(() => {
    checkPendingUsers();
  }, []);

  // Switch tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setIsPendingApprovalAlert(false);
    setEmail('');
    setPassword('');
  };

  // Sign In submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your Institutional Email / ID and Password');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setIsPendingApprovalAlert(false);

    try {
      const response = await api.login({
        institutionalId: email.trim(),
        password: password,
        role: activeTab.toUpperCase(),
      });

      setIsLoading(false);
      const userData = {
        role: response.user?.role || activeTab,
        name: response.user?.fullName || response.user?.name || email.split('@')[0],
        fullName: response.user?.fullName || response.user?.name || email.split('@')[0],
        email: response.user?.email || email,
        id: response.user?.id || response.user?.institutionalId || email,
        institutionalId: response.user?.institutionalId || email,
        department: 'Information Technology',
        semester: response.user?.semester || null,
        academicYear: response.user?.academicYear || null,
      };

      try {
        localStorage.setItem('kgec_user', JSON.stringify(userData));
      } catch (e) {}

      onLoginSuccess(userData);
    } catch (err) {
      setIsLoading(false);
      const isPending =
        err.isPendingApproval ||
        (err.message &&
          (err.message.includes('Pending') ||
            err.message.includes('verification') ||
            err.message.includes('awaiting')));

      if (isPending) {
        setIsPendingApprovalAlert(true);
        setErrorMsg(
          err.message ||
            'Access Pending Verification: Your account has been registered but is awaiting human verification by the Department Administrator.'
        );
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      }
    }
  };

  // Registration submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegErrorMsg('');
    setRegSuccessMsg('');

    if (!regFullName.trim() || !regInstitutionalId.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegErrorMsg('Please fill in all required fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (regPassword.length < 6) {
      setRegErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setRegIsLoading(true);

    try {
      const res = await api.register({
        fullName: regFullName.trim(),
        institutionalId: regInstitutionalId.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole.toUpperCase(),
        semester: regRole === 'student' ? Number(regSemester) || 1 : null,
      });

      setRegIsLoading(false);
      setRegSuccessMsg(
        res.message ||
          `Registration submitted for ${regFullName}! Your account is now awaiting human verification by the Department Administrator in the Admin Panel.`
      );
      checkPendingUsers();
    } catch (err) {
      setRegIsLoading(false);
      setRegErrorMsg(err.message || 'Failed to submit registration.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#ebf3fc] via-[#f3f7fb] to-[#e4eef8] p-4 sm:p-6 overflow-hidden">
      {/* ========================================================= */}
      {/* CORNER BUTTON: ADMIN PANEL (Top-Right Corner)             */}
      {/* ========================================================= */}
      <button
        type="button"
        onClick={() => setShowAdminModal(true)}
        className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#08172c] hover:bg-[#122847] text-white border border-slate-700/80 shadow-lg backdrop-blur-md text-xs font-semibold transition-all duration-200 hover:scale-105 cursor-pointer group"
        title="Open Department Administrator Console to inspect accounts, verify students, and delete users"
      >
        <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <span className="tracking-wide">Admin Panel</span>
        {pendingCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse" title={`${pendingCount} pending verification`}>
            {pendingCount}
          </span>
        )}
      </button>

      {/* Modern background glows */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-sky-100/40 via-blue-50/20 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />

      {/* Decorative sparkle accent */}
      <div className="absolute bottom-6 right-8 text-sky-400/40 pointer-events-none select-none">
        <Sparkles className="w-8 h-8 fill-sky-200/40 stroke-sky-300/60" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        {/* Top Header with KGEC Crest & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3.5 transform hover:scale-105 transition-transform duration-200">
            <KGECLogo size="lg" light={true} showText={false} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a182d] tracking-tight leading-snug max-w-lg">
            KGEC - Department of Information Technology Portal
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1 tracking-normal">
            Kalyani Government Engineering College
          </p>
        </div>

        {/* Center White Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-300/40 border border-slate-200/80 overflow-hidden backdrop-blur-sm transition-all duration-300">
          {/* Card Inner Header & Auth Mode Tabs (Sign In vs Register) */}
          <div className="pt-5 pb-3 px-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KGECLogo size="sm" light={true} showText={false} />
              <h2 className="text-base font-bold text-[#0a182d] tracking-tight">
                {authMode === 'login' ? 'Institutional Portal Access' : 'Create New Account'}
              </h2>
            </div>

            {/* Toggle Mode Link */}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setErrorMsg('');
                setRegErrorMsg('');
                setRegSuccessMsg('');
                setIsPendingApprovalAlert(false);
              }}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {authMode === 'login' ? (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 sm:p-7">
            {/* ========================================================= */}
            {/* MODE A: SIGN IN FORM                                      */}
            {/* ========================================================= */}
            {authMode === 'login' ? (
              <>
                {/* Segmented Control / Tab Switcher (Teacher vs Student) */}
                <div className="bg-slate-100/90 p-1 rounded-xl flex items-center mb-5 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => handleTabChange('teacher')}
                    className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 text-center cursor-pointer ${
                      activeTab === 'teacher'
                        ? 'bg-[#0b1a30] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Teacher Login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('student')}
                    className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 text-center cursor-pointer ${
                      activeTab === 'student'
                        ? 'bg-[#0b1a30] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Student Login
                  </button>
                </div>

                {/* Pending Verification Notice Alert */}
                {isPendingApprovalAlert ? (
                  <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs shadow-xs">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <strong className="block font-bold">Access Pending Admin Verification</strong>
                        <p className="mt-0.5 text-amber-800 text-[11px] leading-relaxed">
                          Your account is registered but awaiting human verification by the Department Administrator. Once the admin confirms your enrollment and grants access, you will be able to log in.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowAdminModal(true)}
                          className="mt-2 inline-flex items-center gap-1 font-bold text-blue-800 hover:underline text-[11px]"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Open Admin Panel to Grant Access</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : errorMsg ? (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                    {errorMsg}
                  </div>
                ) : null}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                      {activeTab === 'teacher'
                        ? 'Institutional Email'
                        : 'University Roll Number / Institutional Email'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          activeTab === 'teacher'
                            ? 'e.g. s.roy@kgec.edu.in'
                            : 'e.g. 10200122045 or student.name@kgec.edu.in'
                        }
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b1a30] focus:border-transparent text-sm text-slate-800 placeholder:text-slate-400 bg-white transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b1a30] focus:border-transparent text-sm text-slate-800 placeholder:text-slate-400 bg-white transition-all shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me and Forgot Password */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#0b1a30] focus:ring-[#0b1a30] cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">
                        Remember Me
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          `Password recovery link has been dispatched to ${email || 'your registered institutional mailbox'}.`
                        )
                      }
                      className="text-xs sm:text-sm font-semibold text-[#0b1a30] hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-[#0b1a30] hover:bg-[#081527] active:bg-[#050e1b] text-white font-semibold text-sm shadow-md shadow-slate-900/10 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Sign In</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Don't have an account banner */}
                <div className="mt-4 pt-3 text-center border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    New student or faculty?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMsg('');
                      }}
                      className="font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                    >
                      Register New Account →
                    </button>
                  </p>
                </div>
              </>
            ) : (
              /* ========================================================= */
              /* MODE B: REGISTRATION FORM (WITH HUMAN VERIFICATION)       */
              /* ========================================================= */
              <>
                {/* Human Verification Explanation Box */}
                <div className="mb-4 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Human-Driven Verification Policy</strong>
                      <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                        No automated verification codes. Once registered, your account is queued in the Admin Panel for the Department Administrator to manually confirm that you are an authentic student before granting access.
                      </p>
                    </div>
                  </div>
                </div>

                {regSuccessMsg ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="font-bold text-sm">Registration Submitted!</h3>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">{regSuccessMsg}</p>
                    <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setEmail(regEmail || regInstitutionalId);
                          setRegSuccessMsg('');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#0b1a30] text-white font-semibold text-xs transition cursor-pointer"
                      >
                        Return to Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAdminModal(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Open Admin Panel (Grant Access)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {regErrorMsg && (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                        {regErrorMsg}
                      </div>
                    )}

                    {/* Role Selector: Student vs Teacher */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Register As
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegRole('student')}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            regRole === 'student'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <GraduationCap className="w-4 h-4" />
                          <span>Student</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('teacher')}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            regRole === 'teacher'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <School className="w-4 h-4" />
                          <span>Teacher / Faculty</span>
                        </button>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Aniket Sen"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0b1a30]"
                      />
                    </div>

                    {/* Roll No / Faculty ID & Semester */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {regRole === 'student' ? 'Roll Number' : 'Faculty ID'}
                        </label>
                        <input
                          type="text"
                          placeholder={regRole === 'student' ? '10200122099' : 'FAC-IT-055'}
                          value={regInstitutionalId}
                          onChange={(e) => setRegInstitutionalId(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0b1a30]"
                        />
                      </div>

                      {regRole === 'student' ? (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Semester
                          </label>
                          <select
                            value={regSemester}
                            onChange={(e) => setRegSemester(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#0b1a30]"
                          >
                            <option value="1">Sem 1 (1st Yr)</option>
                            <option value="2">Sem 2 (1st Yr)</option>
                            <option value="3">Sem 3 (2nd Yr)</option>
                            <option value="4">Sem 4 (2nd Yr)</option>
                            <option value="5">Sem 5 (3rd Yr)</option>
                            <option value="6">Sem 6 (3rd Yr)</option>
                            <option value="7">Sem 7 (4th Yr)</option>
                            <option value="8">Sem 8 (4th Yr)</option>
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Department
                          </label>
                          <input
                            type="text"
                            value="Information Technology"
                            disabled
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 font-medium"
                          />
                        </div>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Institutional Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. aniket.sen.22@kgec.edu.in"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0b1a30]"
                      />
                    </div>

                    {/* Password & Confirm */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Password
                        </label>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder="Min 6 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0b1a30]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder="Confirm"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0b1a30]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showRegPassword}
                          onChange={(e) => setShowRegPassword(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer"
                        />
                        <span>Show password</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="text-blue-700 hover:underline font-semibold cursor-pointer"
                      >
                        Already registered? Sign In
                      </button>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={regIsLoading}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#0b1a30] hover:bg-[#081527] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {regIsLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span>Submit Registration for Verification</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-7 text-center text-xs text-slate-500 flex flex-col items-center">
          <p>© 2026 Kalyani Government Engineering College • Department of Information Technology</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-slate-400">Secure Institutional Access Gateway v2.4</span>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={showAdminModal}
        onClose={() => {
          setShowAdminModal(false);
          checkPendingUsers();
        }}
      />
    </div>
  );
}

export default LoginPage;
