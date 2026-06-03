const KEYS = {
  USER: 'mathwiz_user',
  ANSWERS: 'mathwiz_answers',
  PENDING_SYNC: 'mathwiz_pending_sync',
  VERSION: 'mathwiz_version',
  EXAM_PROGRESS: 'mathwiz_exam_progress',
}

function safeGet(key) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function saveUser(user) {
  return safeSet(KEYS.USER, user)
}

export function getUser() {
  return safeGet(KEYS.USER)
}

export function clearUser() {
  try { localStorage.removeItem(KEYS.USER) } catch {}
}

export function saveExamAnswers(examData) {
  safeSet(KEYS.ANSWERS, examData)
  addToPendingSync(examData)
}

export function getExamAnswers() {
  return safeGet(KEYS.ANSWERS)
}

function addToPendingSync(examData) {
  const pending = safeGet(KEYS.PENDING_SYNC) || []
  pending.push({
    ...examData,
    savedAt: Date.now(),
    synced: false,
  })
  safeSet(KEYS.PENDING_SYNC, pending)
}

export function getPendingSync() {
  return safeGet(KEYS.PENDING_SYNC) || []
}

export function markSynced(savedAt) {
  const pending = safeGet(KEYS.PENDING_SYNC) || []
  const updated = pending.map((item) =>
    item.savedAt === savedAt ? { ...item, synced: true } : item
  )
  safeSet(KEYS.PENDING_SYNC, updated.filter((i) => !i.synced))
}

export function clearPendingSync() {
  try { localStorage.removeItem(KEYS.PENDING_SYNC) } catch {}
}

export function saveExamProgress(progress) {
  return safeSet(KEYS.EXAM_PROGRESS, progress)
}

export function getExamProgress() {
  return safeGet(KEYS.EXAM_PROGRESS)
}

export function clearExamProgress() {
  try { localStorage.removeItem(KEYS.EXAM_PROGRESS) } catch {}
}

export function checkVersionAndReload(currentVersion) {
  const storedVersion = safeGet(KEYS.VERSION)
  if (storedVersion && storedVersion !== currentVersion) {
    safeSet(KEYS.VERSION, currentVersion)
    clearExamProgress()
    try {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name))
        }).catch(() => {})
      }
    } catch {}
    window.location.reload()
    return true
  }
  safeSet(KEYS.VERSION, currentVersion)
  return false
}
