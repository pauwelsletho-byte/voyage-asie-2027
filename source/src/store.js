// Stockage : Firebase (synchro entre les deux téléphones, hors ligne) ou mode démo local
import { firebaseConfig, TRIP_ID } from "./config.js";

const CHUNK = 700_000; // octets par morceau de fichier (une fiche Firestore fait 1 Mo max)

let impl = null;
export const isDemo = () => !firebaseConfig;

export async function initStore() {
  impl = firebaseConfig ? await firebaseStore() : demoStore();
  return impl;
}
export const store = () => impl;

/* ---------------- Firebase ---------------- */
async function firebaseStore() {
  const { initializeApp } = await import("firebase/app");
  const {
    initializeFirestore, persistentLocalCache, persistentSingleTabManager, CACHE_SIZE_UNLIMITED,
    collection, doc, onSnapshot, setDoc, deleteDoc, getDocs, getDocFromServer, writeBatch, Bytes,
    serverTimestamp,
  } = await import("firebase/firestore");
  const {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signOut, sendPasswordResetEmail,
  } = await import("firebase/auth");

  const app = initializeApp(firebaseConfig);
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager(), cacheSizeBytes: CACHE_SIZE_UNLIMITED }),
  });
  const auth = getAuth(app);
  const base = ["trips", TRIP_ID];
  const col = (name) => collection(db, ...base, name);

  return {
    kind: "firebase",
    onAuth(cb) { return onAuthStateChanged(auth, (u) => cb(u ? { email: u.email } : null)); },
    signIn: (e, p) => signInWithEmailAndPassword(auth, e, p),
    signUp: (e, p) => createUserWithEmailAndPassword(auth, e, p),
    resetPassword: (e) => sendPasswordResetEmail(auth, e),
    signOut: () => signOut(auth),

    subscribe(name, cb) {
      return onSnapshot(col(name), { includeMetadataChanges: true }, (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data(), _pending: d.metadata.hasPendingWrites }));
        cb(items, { fromCache: snap.metadata.fromCache, pending: snap.metadata.hasPendingWrites });
      }, (err) => cb(null, { error: err }));
    },
    put(name, id, data) { return setDoc(doc(db, ...base, name, id), { ...data, updatedAt: Date.now() }, { merge: true }); },
    remove(name, id) { return deleteDoc(doc(db, ...base, name, id)); },

    async seedIfNeeded(seed) {
      try {
        const meta = await getDocFromServer(doc(db, ...base, "meta", "seed"));
        if (meta.exists()) return false;
      } catch { return false; } // hors ligne : on réessaiera plus tard
      const b = writeBatch(db);
      seed.resas.forEach((r) => b.set(doc(db, ...base, "resas", r.id), r));
      (seed.vault || []).forEach((v) => b.set(doc(db, ...base, "vault", v.id), v));
      b.set(doc(db, ...base, "meta", "seed"), { at: serverTimestamp() });
      await b.commit();
      return true;
    },

    async saveFile(file) {
      const id = "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const buf = new Uint8Array(await file.arrayBuffer());
      const n = Math.max(1, Math.ceil(buf.length / CHUNK));
      // morceaux d'abord, puis la fiche du fichier (chaque écriture < 1 Mo)
      for (let i = 0; i < n; i++) {
        await setDoc(doc(db, ...base, "files", id, "chunks", String(i).padStart(3, "0")),
          { i, data: Bytes.fromUint8Array(buf.subarray(i * CHUNK, (i + 1) * CHUNK)) });
      }
      await setDoc(doc(db, ...base, "files", id), { name: file.name, type: file.type, size: buf.length, chunks: n, createdAt: Date.now() });
      return id;
    },
    async loadFile(id, meta) {
      const snap = await getDocs(collection(db, ...base, "files", id, "chunks"));
      const parts = snap.docs.map((d) => d.data()).sort((a, b) => a.i - b.i).map((c) => c.data.toUint8Array());
      if (meta && parts.length < meta.chunks) throw new Error("incomplete");
      return new Blob(parts, { type: meta?.type || "application/octet-stream" });
    },
    async deleteFile(id, meta) {
      const n = meta?.chunks || 0;
      for (let i = 0; i < n; i++) await deleteDoc(doc(db, ...base, "files", id, "chunks", String(i).padStart(3, "0")));
      await deleteDoc(doc(db, ...base, "files", id));
    },
    // Télécharge tous les billets dans le cache du téléphone pour le hors-ligne
    async prefetchFiles(files) {
      for (const f of files) { try { await getDocs(collection(db, ...base, "files", f.id, "chunks")); } catch {} }
    },
  };
}

/* ---------------- Démo (sans Firebase, données dans ce navigateur) ---------------- */
function demoStore() {
  const KEY = "voyage-asie-demo";
  const subs = {};
  let state;
  const load = () => { try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { state = {}; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
  load();
  const emit = (name) => (subs[name] || []).forEach((cb) => cb(Object.entries(state[name] || {}).map(([id, v]) => ({ id, ...v })), { fromCache: true }));
  const fileCache = new Map();

  return {
    kind: "demo",
    onAuth(cb) { cb({ email: "démo" }); return () => {}; },
    signIn: async () => {}, signUp: async () => {}, resetPassword: async () => {}, signOut: async () => {},
    subscribe(name, cb) { (subs[name] ||= []).push(cb); setTimeout(() => emit(name)); return () => {}; },
    async put(name, id, data) { state[name] ||= {}; state[name][id] = { ...(state[name][id] || {}), ...data, updatedAt: Date.now() }; save(); emit(name); },
    async remove(name, id) { if (state[name]) delete state[name][id]; save(); emit(name); },
    async seedIfNeeded(seed) {
      if (!state.meta?.seedVault && seed.vault) { state.vault ||= {}; seed.vault.forEach((v) => (state.vault[v.id] ||= v)); state.meta = { ...(state.meta || {}), seedVault: true }; save(); emit("vault"); }
      if (state.meta?.seed) return false;
      state.resas ||= {}; seed.resas.forEach((r) => (state.resas[r.id] = r));
      state.meta = { ...(state.meta || {}), seed: { at: Date.now() } }; save(); emit("resas"); return true;
    },
    async saveFile(file) {
      const id = "f" + Date.now().toString(36);
      fileCache.set(id, file);
      state.files ||= {}; state.files[id] = { name: file.name, type: file.type, size: file.size, chunks: 1, createdAt: Date.now(), demo: true };
      save(); emit("files"); return id;
    },
    async loadFile(id) { const f = fileCache.get(id); if (!f) throw new Error("Fichier non conservé en mode démo"); return f; },
    async deleteFile(id) { fileCache.delete(id); if (state.files) delete state.files[id]; save(); emit("files"); },
    async prefetchFiles() {},
  };
}
