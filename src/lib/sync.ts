// Cross-device realtime sync via Cloud Firestore.
// The whole app state lives in a single document: families/{syncCode}.
// The sync code is a long random secret shared between family devices.

import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import type { AppState } from './types'

const firebaseConfig = {
  apiKey: 'AIzaSyCv-5E6mJp7E1ZbAyIshutYWXuIVL0R3Uk',
  authDomain: 'izhaki-properties.firebaseapp.com',
  projectId: 'izhaki-properties',
  storageBucket: 'izhaki-properties.firebasestorage.app',
  messagingSenderId: '612129056260',
  appId: '1:612129056260:web:b3228e253f06603437f751',
}

export const SYNC_CODE_KEY = 'gal-properties-sync-code'
const CLIENT_ID_KEY = 'gal-properties-client-id'

function clientId(): string {
  let c = localStorage.getItem(CLIENT_ID_KEY)
  if (!c) {
    c = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(CLIENT_ID_KEY, c)
  }
  return c
}

let app: FirebaseApp | null = null
let dbRef: Firestore | null = null

function db(): Firestore {
  if (!dbRef) {
    app = initializeApp(firebaseConfig)
    dbRef = getFirestore(app)
  }
  return dbRef
}

export function getSyncCode(): string | null {
  return localStorage.getItem(SYNC_CODE_KEY)
}

export function saveSyncCode(code: string) {
  localStorage.setItem(SYNC_CODE_KEY, code)
}

export function clearSyncCode() {
  localStorage.removeItem(SYNC_CODE_KEY)
}

export function generateSyncCode(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
  const arr = new Uint32Array(24)
  crypto.getRandomValues(arr)
  return Array.from(arr, (n) => alphabet[n % alphabet.length]).join('')
}

let unsub: Unsubscribe | null = null
let activeCode: string | null = null
let pushTimer: number | null = null
let lastPushedJson: string | null = null

export interface SyncCallbacks {
  onRemoteState: (state: AppState) => void
  onStatus?: (status: 'connected' | 'error') => void
}

/** Start listening. If the remote doc doesn't exist yet, pushes `initial`. */
export function startSync(code: string, initial: AppState, cb: SyncCallbacks) {
  stopSync()
  activeCode = code
  const ref = doc(db(), 'families', code)
  unsub = onSnapshot(
    ref,
    (snap) => {
      cb.onStatus?.('connected')
      if (!snap.exists()) {
        // First device on this code: seed the cloud with our state.
        pushState(initial, true)
        return
      }
      const d = snap.data() as { data?: string; clientId?: string }
      if (!d.data || d.clientId === clientId()) return
      if (d.data === lastPushedJson) return
      try {
        const remote = JSON.parse(d.data) as AppState
        lastPushedJson = d.data // applying remote; don't echo it back
        cb.onRemoteState(remote)
      } catch {
        /* corrupt remote; ignore */
      }
    },
    () => cb.onStatus?.('error'),
  )
}

export function stopSync() {
  if (unsub) unsub()
  unsub = null
  activeCode = null
  if (pushTimer) window.clearTimeout(pushTimer)
  pushTimer = null
  lastPushedJson = null
}

/** Debounced write of local state to the cloud. */
export function pushState(state: AppState, immediate = false) {
  if (!activeCode) return
  const json = JSON.stringify(state)
  if (json === lastPushedJson) return
  const code = activeCode
  const write = () => {
    lastPushedJson = json
    setDoc(doc(db(), 'families', code), {
      data: json,
      clientId: clientId(),
      updatedAt: Date.now(),
    }).catch(() => {
      lastPushedJson = null // retry on next change
    })
  }
  if (pushTimer) window.clearTimeout(pushTimer)
  if (immediate) write()
  else pushTimer = window.setTimeout(write, 700)
}
