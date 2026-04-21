# 🏙️ Quesina City — مدينة قويسنا

بوابة مدينة قويسنا الرقمية — تطبيق PWA متكامل للأخبار والخدمات والمطاعم والمزيد.

---

## 📁 هيكل المشروع

```
quesina-city/
├── index.html          ← الصفحة الرئيسية (HTML نظيف)
├── manifest.json       ← إعدادات PWA
├── firebase.json       ← إعدادات Firebase Hosting
├── sw.js               ← Service Worker (PWA offline)
├── .gitignore
├── css/
│   └── style.css       ← كل التصميم
├── js/
│   ├── config.js       ← إعدادات Firebase + قاعدة البيانات المحلية
│   ├── app.js          ← المنطق الأساسي للتطبيق
│   └── sw-register.js  ← تسجيل Service Worker
└── icon-192.svg
└── icon-512.svg
```

---

## 🚀 خطوات الرفع على GitHub + Firebase

### الخطوة 1 — GitHub

1. اذهب إلى [github.com](https://github.com) وسجّل دخول
2. اضغط **New Repository**
3. اسم المشروع: `quesina-city`
4. اتركه **Public**
5. اضغط **Create repository**
6. ارفع كل ملفات المشروع

---

### الخطوة 2 — إنشاء مشروع Firebase

1. اذهب إلى [console.firebase.google.com](https://console.firebase.google.com)
2. اضغط **Add project** → اسمه `quesina-city`
3. من القائمة الجانبية → **Project Settings** ⚙️
4. اختر **Your apps** → اضغط `</>` (Web App)
5. اسمه `Quesina City` → Register App
6. **انسخ الـ firebaseConfig** وافتح ملف `js/config.js`
7. استبدل القيم:

```javascript
const firebaseConfig = {
  apiKey: "الصق هنا",
  authDomain: "الصق هنا",
  projectId: "الصق هنا",
  storageBucket: "الصق هنا",
  messagingSenderId: "الصق هنا",
  appId: "الصق هنا"
};
```

8. في ملف `index.html` — شيل علامة التعليق من سطور Firebase SDK:

```html
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js"></script>
```

9. في `js/config.js` — شيل التعليق من سطور الـ init:

```javascript
firebase.initializeApp(firebaseConfig);
db      = firebase.firestore();
auth    = firebase.auth();
storage = firebase.storage();
```

---

### الخطوة 3 — Firebase Hosting (النشر)

افتح Terminal أو Command Prompt:

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# داخل مجلد المشروع
cd quesina-city

# ربط المشروع
firebase use --add
# اختار مشروعك quesina-city

# نشر التطبيق 🚀
firebase deploy
```

بعد النشر هتحصل على رابط مثل:
`https://quesina-city.web.app`

---

## 🔄 تحديث التطبيق لاحقاً

```bash
firebase deploy
```

---

## 📱 تحويل لـ Android APK (اختياري)

بعد ما التطبيق يشتغل على Firebase، يمكنك استخدام:
- **PWABuilder** (pwabuilder.com) → حوّله APK مجاناً
- **Trusted Web Activity (TWA)** → Google Play Store

---

## 💡 ملاحظات مهمة

- **كلمة مرور الأدمن:** `admin123` — غيّرها من لوحة التحكم
- **رقم الأدمن:** `01000767058`
- **البيانات** محفوظة حالياً في `localStorage` — بعد ربط Firebase ستنتقل لـ Firestore تلقائياً
- **الـ Service Worker** يعمل فقط على HTTPS (Firebase Hosting يوفر هذا تلقائياً)
