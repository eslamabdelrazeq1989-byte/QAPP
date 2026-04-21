// ══════════════════════════════════════════════
// QUWAYSNA CITY — config.js  v5.1 (Safe Init)
// ══════════════════════════════════════════════

const firebaseConfig = {
  apiKey: "AIzaSyAhpB01l_jPULEeKnsxb45i85BKC0EaeNI",
  authDomain: "q-app-52b72.firebaseapp.com",
  projectId: "q-app-52b72",
  storageBucket: "q-app-52b72.firebasestorage.app",
  messagingSenderId: "110758160125",
  appId: "1:110758160125:web:33ecb7d27993dd312a4094",
  measurementId: "G-E3VYMTNCG8"
};

// ── FIREBASE INIT (محمي من الأخطاء) ──
let _firebaseApp = null;
let _db          = null;
let _auth        = null;
let _storage     = null;
let _firebaseOK  = false;

try {
  _firebaseApp = firebase.initializeApp(firebaseConfig);
  _firebaseOK  = true;
} catch(e) {
  console.warn('Firebase init error:', e);
}

try { _db      = firebase.firestore(); } catch(e) { console.warn('Firestore N/A:', e); }
try { _auth    = firebase.auth();      } catch(e) { console.warn('Auth N/A:', e); }
try { _storage = firebase.storage();   } catch(e) { console.warn('Storage N/A:', e); }

// متغيرات عامة (نفس الأسماء القديمة)
const db      = _db;
const auth    = _auth;
const storage = _storage;

// ══ ADMIN CONFIG ══
const ADMIN_PHONES      = ['01000767058', '201000767058'];
const SUPER_ADMIN_EMAIL = 'admin@quesina.com';
const SUPER_ADMIN_PASS  = 'admin123';
let currentUser     = null;
let currentRole     = null;
let currentVendorId = null;

// ══════════════════════════════════════════════
// QDB — قاعدة بيانات حقيقية مع Firestore
// نفس الـ API القديمة → app.js مش محتاج تغيير
// ══════════════════════════════════════════════
const FIRESTORE_COL = 'app_data';

const QDB = {
  _listeners: {},
  _cache: {},
  _realtime: {},

  // ── قراءة من الكاش أو localStorage ──
  get(key) {
    if (this._cache[key] !== undefined) return this._cache[key];
    try {
      const v = localStorage.getItem('qdb_' + key);
      if (v) return JSON.parse(v);
    } catch(e) {}
    return null;
  },

  // ── كتابة في Firestore + كاش محلي ──
  set(key, val) {
    // حفظ فوري محلي (UI يتحدث فوراً)
    this._cache[key] = val;
    try { localStorage.setItem('qdb_' + key, JSON.stringify(val)); } catch(e) {}

    // تشغيل الـ listeners
    if (this._listeners[key]) {
      this._listeners[key].forEach(fn => { try { fn(val); } catch(e) {} });
    }

    // حفظ في Firestore في الخلفية (لو متاح)
    if (_db) {
      _db.collection(FIRESTORE_COL).doc(key)
        .set({ data: val, updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .catch(err => console.warn('QDB.set error:', key, err));
    }
  },

  // ── استماع real-time ──
  on(key, fn) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
    this._startListener(key);
  },

  _startListener(key) {
    if (!_db || this._realtime[key]) return;
    this._realtime[key] = _db.collection(FIRESTORE_COL).doc(key)
      .onSnapshot(snap => {
        if (!snap.exists) return;
        const val = snap.data().data;
        this._cache[key] = val;
        try { localStorage.setItem('qdb_' + key, JSON.stringify(val)); } catch(e) {}
        if (this._listeners[key]) {
          this._listeners[key].forEach(cb => { try { cb(val); } catch(e) {} });
        }
      }, err => console.warn('QDB listener error:', key, err));
  },

  // ── حذف ──
  del(key) {
    delete this._cache[key];
    try { localStorage.removeItem('qdb_' + key); } catch(e) {}
    if (_db) {
      _db.collection(FIRESTORE_COL).doc(key).delete().catch(e => {});
    }
  },

  // ── تحميل البيانات من Firestore عند فتح التطبيق ──
  async loadAll() {
    if (!_db) { console.warn('QDB: Firestore غير متاح، يعمل بـ localStorage فقط'); return; }
    const keys = ['restaurants','news','medicals','shops','crafts','vendors','users','admin_config','appointments','ratings','jobs','education'];
    const promises = keys.map(async key => {
      try {
        const snap = await _db.collection(FIRESTORE_COL).doc(key).get();
        if (snap.exists) {
          const val = snap.data().data;
          this._cache[key] = val;
          try { localStorage.setItem('qdb_' + key, JSON.stringify(val)); } catch(e) {}
        }
      } catch(e) { console.warn('QDB.loadAll error:', key, e); }
    });
    await Promise.all(promises);
    console.log('✅ QDB: تم تحميل البيانات من Firebase');
  },

  // ── Real-time للكولكشنز الرئيسية ──
  startRealtime() {
    if (!_db) return;
    ['restaurants','news','medicals','shops','crafts','admin_config'].forEach(key => {
      if (this._realtime[key]) return;
      this._realtime[key] = _db.collection(FIRESTORE_COL).doc(key)
        .onSnapshot(snap => {
          if (!snap.exists) return;
          const val = snap.data().data;
          if (JSON.stringify(this._cache[key]) === JSON.stringify(val)) return;
          this._cache[key] = val;
          try { localStorage.setItem('qdb_' + key, JSON.stringify(val)); } catch(e) {}
          try { if (key==='restaurants' && typeof renderAllRestaurants==='function') renderAllRestaurants(val); } catch(e) {}
          try { if (key==='news'        && typeof renderAllNews==='function')        renderAllNews(val); }        catch(e) {}
          try { if (key==='medicals'    && typeof renderAllMedicals==='function')    renderAllMedicals(val); }    catch(e) {}
          try { if (key==='shops'       && typeof renderAllShops==='function')       renderAllShops(val); }       catch(e) {}
          if (this._listeners[key]) {
            this._listeners[key].forEach(fn => { try { fn(val); } catch(e) {} });
          }
        }, err => console.warn('Realtime error:', key, err));
    });
    console.log('🔴 QDB: Real-time مفعّل');
  }
};

// ── تشغيل عند فتح الصفحة ──
document.addEventListener('DOMContentLoaded', () => {
  QDB.loadAll().then(() => QDB.startRealtime()).catch(e => {
    console.warn('QDB init failed, using localStorage only:', e);
    QDB.startRealtime();
  });
});
