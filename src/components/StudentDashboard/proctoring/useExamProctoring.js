import { useState, useEffect, useCallback, useRef } from 'react';
import { recordViolation, getExamLogs, clearExamLogs } from './proctorLogger';

/**
 * Robust Full-Screen detector supporting:
 * 1. Fullscreen API (document.fullscreenElement)
 * 2. Window dimension check (F11 / Native OS Fullscreen)
 * 3. CSS display-mode media query
 */
export const checkIsFullscreen = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false;

  // 1. API check
  const hasElem = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
  if (hasElem) return true;

  // 2. Dimension check (covers F11 or borderless window fullscreen)
  if (window.screen) {
    const widthDiff = Math.abs(window.innerWidth - window.screen.width);
    const heightDiff = Math.abs(window.innerHeight - window.screen.height);
    if (widthDiff <= 12 && heightDiff <= 12) {
      return true;
    }
  }

  // 3. Media query
  if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) {
    return true;
  }

  return false;
};

/**
 * Active Internet Probe
 * Bypasses virtual network adapters (WSL, VirtualBox, Hyper-V) in Windows
 * by probing high-availability public DNS over HTTPS endpoints with CORS enabled.
 */
export const probeActualInternet = async () => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    await Promise.any([
      fetch(`https://dns.google/resolve?name=example.com&_t=${Date.now()}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        signal: controller.signal
      }),
      fetch(`https://cloudflare-dns.com/dns-query?name=example.com&type=A&_t=${Date.now()}`, {
        headers: { Accept: 'application/dns-json' },
        mode: 'cors',
        cache: 'no-store',
        signal: controller.signal
      })
    ]);

    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('kgec_user') || localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * useExamProctoring
 * Real WAN internet probe & debounced, zero-false-positive violation monitor.
 */
export function useExamProctoring({
  examId = 'assessment',
  examTitle = 'Examination',
  isOpen = false,
  onFinalSubmit
}) {
  const [stage, setStage] = useState('PRE_CHECK');

  // Real actual internet status (probed actively)
  const [isOnline, setIsOnline] = useState(true);
  const [isCheckingNet, setIsCheckingNet] = useState(false);

  // Real full-screen status
  const [isFullscreen, setIsFullscreen] = useState(() => checkIsFullscreen());

  // Client-side violation logs for THIS current session
  const [violations, setViolations] = useState([]);
  
  // Guard refs to prevent false violations during layout transitions
  const prevFullscreenRef = useRef(false);
  const fsViolationTimerRef = useRef(null);
  const prevOnlineRef = useRef(false);
  const netViolationCooldownRef = useRef(0);

  // Request full-screen
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
    } catch (err) {
      console.warn('Native fullscreen request blocked or cancelled by user:', err);
    }

    await new Promise((r) => setTimeout(r, 150));
    const fs = checkIsFullscreen();
    setIsFullscreen(fs);
    return fs;
  }, []);

  // Exit full-screen safely
  const exitFullscreen = useCallback(async () => {
    try {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Exit fullscreen error:', err);
    }
    setIsFullscreen(false);
  }, []);

  // 1. Active internet detection (Probing every 700ms)
  useEffect(() => {
    let isMounted = true;

    const checkRealNet = async () => {
      setIsCheckingNet(true);
      const online = await probeActualInternet();
      if (isMounted) {
        setIsOnline(online);
        setIsCheckingNet(false);
      }
    };

    checkRealNet();

    const handleWindowOnline = () => checkRealNet();
    const handleWindowOffline = () => {
      if (isMounted) setIsOnline(false);
    };

    window.addEventListener('online', handleWindowOnline);
    window.addEventListener('offline', handleWindowOffline);

    const intervalId = setInterval(checkRealNet, 700);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleWindowOnline);
      window.removeEventListener('offline', handleWindowOffline);
      clearInterval(intervalId);
    };
  }, []);

  // 2. Continuous real full-screen detection (API + Resize + F11 + fast interval)
  useEffect(() => {
    const updateFsStatus = () => {
      const fs = checkIsFullscreen();
      setIsFullscreen(fs);
    };

    updateFsStatus();

    document.addEventListener('fullscreenchange', updateFsStatus);
    document.addEventListener('webkitfullscreenchange', updateFsStatus);
    document.addEventListener('mozfullscreenchange', updateFsStatus);
    document.addEventListener('MSFullscreenChange', updateFsStatus);
    window.addEventListener('resize', updateFsStatus);

    const pollId = setInterval(updateFsStatus, 300);

    return () => {
      document.removeEventListener('fullscreenchange', updateFsStatus);
      document.removeEventListener('webkitfullscreenchange', updateFsStatus);
      document.removeEventListener('mozfullscreenchange', updateFsStatus);
      document.removeEventListener('MSFullscreenChange', updateFsStatus);
      window.removeEventListener('resize', updateFsStatus);
      clearInterval(pollId);
    };
  }, []);

  // 3. Security violation tracker (DEBOUNCED: Only logs when student genuinely leaves full-screen for > 500ms)
  useEffect(() => {
    if (stage === 'ACTIVE') {
      if (prevFullscreenRef.current && !isFullscreen) {
        // Debounce by 500ms to allow smooth transitions and avoid single-frame layout flickers
        if (!fsViolationTimerRef.current) {
          fsViolationTimerRef.current = setTimeout(() => {
            if (!checkIsFullscreen()) {
              const log = recordViolation(
                examId,
                'FULLSCREEN_EXIT',
                'Candidate exited full-screen mode during active examination.',
                { stage: 'ACTIVE' }
              );
              setViolations((prev) => [...prev, log]);

          // Asynchronously notify backend of live internet violation
          try {
            const user = getStoredUser() || {};
            const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
            fetch('/api/proctor/violations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                examId,
                studentId: user.id || user.roll || user.institutionalId || 'unknown_student',
                studentName: user.name || user.fullName || 'Student',
                studentRoll: user.roll || user.institutionalId || user.id || 'N/A',
                violationType: log.type,
                message: log.message,
              }),
            }).catch(() => {});
          } catch (e) {}
            }
            fsViolationTimerRef.current = null;
          }, 500);
        }
      } else if (isFullscreen) {
        // Full screen recovered within debounce window -> cancel false violation
        if (fsViolationTimerRef.current) {
          clearTimeout(fsViolationTimerRef.current);
          fsViolationTimerRef.current = null;
        }
      }
      prevFullscreenRef.current = isFullscreen;
    } else {
      prevFullscreenRef.current = isFullscreen;
    }
  }, [isFullscreen, stage, examId]);

  // 4. Unexpected Internet detected during active exam (COOLDOWN GUARD: Only logs on transition from offline to online)
  useEffect(() => {
    if (stage === 'ACTIVE') {
      if (!prevOnlineRef.current && isOnline) {
        const now = Date.now();
        if (now - netViolationCooldownRef.current > 10000) {
          netViolationCooldownRef.current = now;
          const log = recordViolation(
            examId,
            'INTERNET_DETECTED_DURING_EXAM',
            'Active internet connection detected while exam was in progress. Air-gap breached.',
            { stage: 'ACTIVE' }
          );
          setViolations((prev) => [...prev, log]);

          // Asynchronously notify backend of live internet violation
          try {
            const user = getStoredUser() || {};
            const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
            fetch('/api/proctor/violations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                examId,
                studentId: user.id || user.roll || user.institutionalId || 'unknown_student',
                studentName: user.name || user.fullName || 'Student',
                studentRoll: user.roll || user.institutionalId || user.id || 'N/A',
                violationType: log.type,
                message: log.message,
              }),
            }).catch(() => {});
          } catch (e) {}
        }
      }
      prevOnlineRef.current = isOnline;
    } else {
      prevOnlineRef.current = isOnline;
    }
  }, [isOnline, stage, examId]);

  // 5. Submission Gatekeeper:
  // When in 'AWAITING_ONLINE' and internet becomes available -> Give NO TIME, immediately lock screen!
  useEffect(() => {
    if (stage === 'AWAITING_ONLINE' && isOnline) {
      setStage('READY_TO_TRANSMIT');
    }
  }, [stage, isOnline]);

  // Reset or initialize when modal is opened / closed
  useEffect(() => {
    if (isOpen) {
      setStage('PRE_CHECK');
      const existingLogs = getExamLogs(examId);
      setViolations(existingLogs);
      setIsFullscreen(checkIsFullscreen());
    } else {
      exitFullscreen();
    }
  }, [isOpen, examId, exitFullscreen]);

  // Action: Start Exam (Must be offline, then requests full-screen)
  const startExam = async () => {
    if (isOnline) {
      alert('Security Policy: You must disconnect your internet connection before starting.');
      return false;
    }

    // Reset violations for this brand-new exam attempt so candidate starts at 0
    clearExamLogs(examId);
    setViolations([]);

    await enterFullscreen();
    setIsFullscreen(true);
    prevFullscreenRef.current = true;
    prevOnlineRef.current = false;
    setStage('ACTIVE');
    return true;
  };

  // Action: Finish exam questions -> Transition to awaiting online
  const triggerSubmitPhase = () => {
    if (isOnline) {
      setStage('READY_TO_TRANSMIT');
    } else {
      setStage('AWAITING_ONLINE');
    }
  };

  // Action: Confirm final submission
  const confirmFinalSubmit = async (payload = {}) => {
    setStage('SUBMITTED');
    await exitFullscreen();

    // If genuine violations occurred during the session, transmit to backend database
    if (violations.length > 0) {
      try {
        const user = getStoredUser() || {};
        const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        for (const v of violations) {
          fetch('/api/proctor/violations', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              examId,
              studentId: user.id || user.roll || user.institutionalId || 'unknown_student',
              studentName: user.name || user.fullName || 'Student',
              studentRoll: user.roll || user.institutionalId || user.id || 'N/A',
              violationType: v.type,
              message: v.message,
            }),
          }).catch(() => {});
        }
      } catch (e) {
        console.warn('Failed to transmit session violations:', e);
      }
    }

    if (onFinalSubmit) {
      onFinalSubmit({
        ...payload,
        violationsCount: violations.length,
        violationsSummary: violations.map((v) => ({ type: v.type, time: v.timeFormatted }))
      });
    }
  };

  // Action: Manually clear violations for testing
  const clearSessionViolations = () => {
    clearExamLogs(examId);
    setViolations([]);
  };

  // Action: Explicitly record a proctoring violation (e.g. CLIPBOARD_PASTE_ATTEMPT in SAQ/LAQ exams)
  const logCustomViolation = useCallback((type, message, metadata = {}) => {
    const log = recordViolation(examId, type, message, metadata);
    setViolations((prev) => [...prev, log]);

    // If online, immediately notify backend
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const user = getStoredUser() || {};
        const token = localStorage.getItem('kgec_auth_token') || localStorage.getItem('token');
        fetch('/api/proctor/violations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            examId,
            studentId: user.id || user.roll || user.institutionalId || 'unknown_student',
            studentName: user.name || user.fullName || 'Student',
            studentRoll: user.roll || user.institutionalId || user.id || 'N/A',
            violationType: type,
            message: message,
          }),
        }).catch(() => {});
      } catch (e) {}
    }

    return log;
  }, [examId]);

  return {
    stage,
    setStage,
    isOnline,
    isCheckingNet,
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    startExam,
    triggerSubmitPhase,
    confirmFinalSubmit,
    clearSessionViolations,
    logCustomViolation,
    violations,
    violationCount: violations.length
  };
}

export default useExamProctoring;
