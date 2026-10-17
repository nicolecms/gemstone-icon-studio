export type PersistedPhoto = {
  dataUrl: string
  fileName: string
  zoom: number
  rotation: number
  offsetX: number
  offsetY: number
}

const PHOTO_SESSION_KEY = 'gemstone-icon-photo-session'

export function savePhotoSession(photo: PersistedPhoto) {
  try {
    sessionStorage.setItem(PHOTO_SESSION_KEY, JSON.stringify(photo))
    return true
  } catch {
    return false
  }
}

export function readPhotoSession(): PersistedPhoto | null {
  try {
    const value = sessionStorage.getItem(PHOTO_SESSION_KEY)
    return value ? JSON.parse(value) as PersistedPhoto : null
  } catch {
    return null
  }
}

export function clearPhotoSession() {
  try { sessionStorage.removeItem(PHOTO_SESSION_KEY) } catch { /* session storage may be unavailable */ }
}
