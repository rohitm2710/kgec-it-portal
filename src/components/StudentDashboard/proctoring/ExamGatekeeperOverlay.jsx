import React from 'react';
import { 
  ShieldAlert, 
  WifiOff, 
  Wifi, 
  Maximize2, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Send, 
  Terminal, 
  FileCheck, 
  Monitor, 
  Activity,
  Loader2,
  DownloadCloud
} from 'lucide-react';

export function ExamGatekeeperOverlay({
  stage,
  isOnline,
  isCheckingNet,
  isFullscreen,
  isLoadingQuestions = false,
  questionCount = 0,
  enterFullscreen,
  startExam,
  confirmFinalSubmit,
  violations,
  examTitle = 'Continuous Assessment',
  freezeReason = null, // 'TIME_EXPIRED' | 'TEACHER_FORCE_STOP' | null
  onClose
}) {
  // 0. LOADING QUESTIONS FROM API STAGE
  if (isLoadingQuestions) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-[#08172c] flex items-center justify-center mb-4 animate-pulse">
            <DownloadCloud className="w-8 h-8 text-blue-600 animate-bounce" />
          </div>
          <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
            Step 1: Secure Data Transfer
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-2">
            Fetching Question Paper...
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-xs">
            Connecting to the Department Question Bank API and downloading your examination questions before air-gapping...
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Establishing encrypted local cache...</span>
          </div>
        </div>
      </div>
    );
  }

  // 1. PRE-CHECK STAGE (Candidate has questions; must disconnect internet & request full-screen)
  if (stage === 'PRE_CHECK') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-[#08172c] text-white p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                Question Paper Received (Offline Ready)
              </span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer transition-all"
              >
                Cancel & Exit
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
              {examTitle}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              KGEC Department of Information Technology • Pre-Exam Air-Gap Gatekeeper
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-7 space-y-5">
            
            {/* Paper Ready Banner */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-blue-950">
                    Question Paper Loaded from Server API
                  </h4>
                  <p className="text-[11px] text-blue-700">
                    {questionCount > 0 ? `${questionCount} questions` : 'Full question set'} cached locally in secure browser sandbox.
                  </p>
                </div>
              </div>
              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg">
                100% Cached
              </span>
            </div>

            {/* LIVE STATUS SHOWER / DIAGNOSTICS HUD */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Live System Diagnostics Shower
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {isCheckingNet ? 'Active Probe Running...' : 'Hardware Verified'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* Detector 1: Full-Screen Status */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  isFullscreen 
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' 
                    : 'bg-slate-800/70 border-slate-700 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Monitor className="w-4 h-4" /> Full-Screen Detection
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${isFullscreen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  </div>
                  <div className="mt-2 text-sm font-black">
                    {isFullscreen ? '🟢 Full-Screen: DETECTED' : '⚪ Full-Screen: INACTIVE'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isFullscreen 
                      ? 'Display is locked in full-screen.' 
                      : 'Will automatically activate when you start.'}
                  </div>
                </div>

                {/* Detector 2: Actual Internet Status */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  isOnline 
                    ? 'bg-rose-950/70 border-rose-500/60 text-rose-200' 
                    : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      {isOnline ? <Wifi className="w-4 h-4 text-rose-400" /> : <WifiOff className="w-4 h-4 text-emerald-400" />}
                      Actual Internet Detection
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                  </div>
                  <div className="mt-2 text-sm font-black">
                    {isOnline ? '🔴 Internet: CONNECTED (Active)' : '🟢 Internet: OFFLINE (Verified)'}
                  </div>
                  <div className="text-[10px] mt-0.5">
                    {isOnline 
                      ? 'Turn OFF your Wi-Fi or unplug LAN to unlock.' 
                      : 'Air-gap verified! Exam start is unlocked.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Instruction Guidance based on real hardware state */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed transition-all ${
              isOnline 
                ? 'bg-amber-50 border-amber-300 text-amber-900' 
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              {isOnline ? (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Action Required: Turn OFF Internet Connection</strong>
                    Your questions have already been delivered and cached. Please turn off your device Wi-Fi or unplug Ethernet now. The system monitors connection live and unlocks immediately once offline.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Safe Offline Environment Verified!</strong>
                    No internet connection detected. Tap <strong>"Enter Full-Screen & Start Exam"</strong> below to begin your assessment.
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isOnline}
                onClick={startExam}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                  isOnline 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-[#08172c] hover:bg-[#030913] text-white cursor-pointer ring-2 ring-emerald-500 ring-offset-2 animate-pulse'
                }`}
              >
                <Maximize2 className="w-4 h-4" />
                Enter Full-Screen & Start Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE EXAM: FULL-SCREEN VIOLATION BLOCK
  if (stage === 'ACTIVE' && !isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-lg animate-in zoom-in-95 duration-150">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 text-center border-4 border-rose-500 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <span className="bg-rose-100 text-rose-700 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Security Violation Detected
          </span>

          <h2 className="text-2xl font-black text-slate-950 mt-3 tracking-tight">
            EXAM BLOCKED: FULL-SCREEN REQUIRED
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Full-screen mode was exited. In accordance with university proctoring policy, examination questions are <strong>strictly locked and hidden</strong> until full-screen is restored.
          </p>

          {/* Live Status Shower inside lock screen */}
          <div className="my-5 p-4 rounded-2xl bg-slate-900 text-white text-left text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-rose-400" />
                Current System Status Shower
              </span>
              <span className="bg-rose-900/80 text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold">
                {violations.length} Violation Logged
              </span>
            </div>
            <div className="mt-2 space-y-1 text-[11px]">
              <div>• Full-Screen Sensor: <strong className="text-rose-400">NOT DETECTED (Exited)</strong></div>
              <div>• Internet Sensor: <strong className={isOnline ? 'text-rose-400' : 'text-emerald-400'}>{isOnline ? 'ONLINE' : 'OFFLINE (Air-Gapped)'}</strong></div>
              <div className="text-[10px] text-slate-500 mt-1 italic">
                (Logged locally in client audit storage; zero database flood.)
              </div>
            </div>
          </div>

          <button
            onClick={enterFullscreen}
            className="w-full py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ring-2 ring-rose-400 ring-offset-2"
          >
            <Maximize2 className="w-5 h-5" />
            Re-Enter Full-Screen to Resume Exam
          </button>
        </div>
      </div>
    );
  }

  // 3. ACTIVE EXAM: UNEXPECTED INTERNET CONNECTION DETECTED
  if (stage === 'ACTIVE' && isOnline) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-lg animate-in zoom-in-95 duration-150">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 text-center border-4 border-amber-500 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <AlertTriangle className="w-9 h-9" />
          </div>

          <span className="bg-amber-100 text-amber-800 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Air-Gap Security Alert
          </span>

          <h2 className="text-2xl font-black text-slate-950 mt-3 tracking-tight">
            INTERNET CONNECTION DETECTED
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            An active internet connection was detected during this examination. The exam must remain <strong>strictly offline</strong>.
          </p>

          <div className="my-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left">
            <strong>Action Required:</strong> Disconnect from Wi-Fi or unplug Ethernet. The system monitors your connection live and will unlock the questions automatically once offline.
          </div>
        </div>
      </div>
    );
  }

  // 4. SUBMISSION PHASE: AWAITING INTERNET TURN-ON
  if (stage === 'AWAITING_ONLINE') {
    const isTeacherStop = freezeReason === 'TEACHER_FORCE_STOP';
    const isTimeout = freezeReason === 'TIME_EXPIRED';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-lg animate-in fade-in duration-200">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 text-center border-2 border-amber-400 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Wifi className="w-9 h-9" />
          </div>

          <span className={`font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider ${
            isTeacherStop 
              ? 'bg-rose-100 text-rose-800' 
              : isTimeout 
              ? 'bg-amber-100 text-amber-900' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {isTeacherStop 
              ? 'Invigilator Stopped Exam • Zero Extra Time' 
              : isTimeout 
              ? 'Assessment Time Expired • Zero Extra Time' 
              : 'Step 1: Reconnection Phase'}
          </span>

          <h2 className="text-2xl font-black text-slate-950 mt-3 tracking-tight">
            {isTeacherStop 
              ? 'EXAM CONCLUDED: SCREEN FROZEN' 
              : isTimeout 
              ? 'TIME UP: SCREEN FROZEN' 
              : 'Turn ON Internet to Submit'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            {isTeacherStop 
              ? 'The allocated invigilator has forcefully concluded the examination session. All screens and questions are immediately locked with strictly ZERO extra time permitted.' 
              : isTimeout 
              ? 'The official assessment countdown timer has stopped. In accordance with zero-delay regulations, questions and answers are locked with ZERO extra time permitted.' 
              : 'Your answers are stored safely in encrypted local memory.'}
            <br />
            Please <strong>turn ON your internet connection</strong> (connect Wi-Fi or Ethernet) to transmit your assessment immediately.
          </p>

          {/* Live Shower in Submission wait */}
          <div className="my-6 p-4 rounded-2xl bg-slate-900 text-white text-xs text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-300">Live Hardware Connection Sensor</span>
              <span className="text-amber-400 animate-pulse font-mono font-bold">Listening for internet...</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Current Sensor Status: <strong className="text-amber-400">OFFLINE</strong> (Turn ON Wi-Fi to proceed)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. SUBMISSION PHASE: INSTANT ZERO-DELAY SCREEN LOCK
  if (stage === 'READY_TO_TRANSMIT') {
    const isTeacherStop = freezeReason === 'TEACHER_FORCE_STOP';
    const isTimeout = freezeReason === 'TIME_EXPIRED';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-lg animate-in zoom-in-95 duration-100">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 text-center border-4 border-emerald-500 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-9 h-9" />
          </div>

          <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Internet Detected • Zero Extra Time Allowed
          </span>

          <h2 className="text-2xl font-black text-slate-950 mt-3 tracking-tight">
            ANSWERS SEALED: READY TO SUBMIT
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Internet connection detected. In strict compliance with zero-delay proctoring rules, examination questions remain <strong>completely locked and hidden</strong> to prevent unauthorized searches.
          </p>

          {/* Assessment Summary Pill */}
          <div className="my-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                Assessment Data Package
              </span>
              <span className="text-emerald-700 font-bold">Ready to Transmit</span>
            </div>
            <div className="text-[11px] text-slate-600">
              • All student responses sealed in encrypted state.<br />
              • Proctor violations recorded in local audit: <strong>{violations.length}</strong>.<br />
              • Zero-exposure lock enforced at {new Date().toLocaleTimeString()}.
            </div>
          </div>

          <button
            onClick={() => confirmFinalSubmit()}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all cursor-pointer ring-4 ring-emerald-300 ring-offset-2 animate-pulse"
          >
            <Send className="w-5 h-5" />
            SUBMIT ASSESSMENT NOW
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default ExamGatekeeperOverlay;
