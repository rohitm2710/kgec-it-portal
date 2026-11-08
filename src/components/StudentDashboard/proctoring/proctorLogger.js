/**
 * Client-Side Proctoring Violation Logger
 * Optimized to NOT stress or flood the Neon database.
 * Stores violations locally in localStorage and memory.
 */

export function getExamLogs(examId) {
  try {
    const raw = localStorage.getItem(`kgec_exam_logs_${examId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read proctor logs:', err);
    return [];
  }
}

export function recordViolation(examId, type, message, metadata = {}) {
  const timestamp = new Date().toISOString();
  const entry = {
    id: `viol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    examId,
    timestamp,
    timeFormatted: new Date().toLocaleTimeString(),
    type, // 'FULLSCREEN_EXIT' | 'INTERNET_DETECTED_DURING_EXAM' | 'DEVTOOLS_OPEN' | 'WINDOW_BLUR'
    message,
    metadata
  };

  try {
    const logs = getExamLogs(examId);
    logs.push(entry);
    localStorage.setItem(`kgec_exam_logs_${examId}`, JSON.stringify(logs));
    console.warn(`[Proctor Violation Logged] [${type}] at ${entry.timeFormatted}: ${message}`);
  } catch (err) {
    console.error('Failed to persist proctor log:', err);
  }

  return entry;
}

export function clearExamLogs(examId) {
  try {
    localStorage.removeItem(`kgec_exam_logs_${examId}`);
  } catch (err) {
    console.error('Failed to clear proctor logs:', err);
  }
}
