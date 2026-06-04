export function requestFullscreen() {
  const el = document.documentElement
  try {
    const p = el.requestFullscreen
      ? el.requestFullscreen()
      : el.webkitRequestFullscreen
        ? el.webkitRequestFullscreen()
        : el.mozRequestFullScreen
          ? el.mozRequestFullScreen()
          : el.msRequestFullscreen
            ? el.msRequestFullscreen()
            : null
    if (p && p.then) {
      p.then(() => lockLandscape()).catch(() => {})
    } else {
      lockLandscape()
    }
  } catch {}
}

function lockLandscape() {
  try {
    const so = screen.orientation
    if (so && so.lock) {
      so.lock('landscape').catch(() => {})
    }
  } catch {}
}

export function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  } catch {}
}

export function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  )
}

export function toggleFullscreen() {
  if (isFullscreen()) {
    exitFullscreen()
  } else {
    requestFullscreen()
  }
}
