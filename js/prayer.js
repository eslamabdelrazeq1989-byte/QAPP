// ══════════════════════════════════════════════
// QUESINA CITY — prayer.js
// مواقيت الصلاة لمدينة قويسنا + أذان المنشاوي
// إحداثيات قويسنا: 30.5167°N, 30.9167°E
// الطريقة المصرية — الهيئة المصرية العامة للمساحة
// ══════════════════════════════════════════════

const PRAYER_CONFIG = {
  lat: 30.5167,
  lng: 30.9167,
  names:  ['الفجر','الشروق','الظهر','العصر','المغرب','العشاء'],
  keys:   ['fajr','sunrise','dhuhr','asr','maghrib','isha'],
  emojis: ['🌙','🌅','☀️','🌤️','🌇','🌃'],
  colors: ['#1a237e','#e65100','#f9a825','#ef6c00','#880e4f','#0d47a1'],
  svgIcons: {
    fajr: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#1a237e"/>
      <path d="M20 8 C14 8 9 13 9 20 C9 27 14 32 20 32 C20 32 20 20 20 20 Z" fill="#5c6bc0" opacity="0.8"/>
      <path d="M20 8 C26 8 31 13 31 20 C31 27 26 32 20 32 C20 32 20 20 20 20 Z" fill="#3949ab" opacity="0.6"/>
      <path d="M14 18 Q17 14 20 18 Q23 22 26 18" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <circle cx="26" cy="11" r="2" fill="#f9a825"/>
      <line x1="8" y1="28" x2="32" y2="28" stroke="#5c6bc0" stroke-width="1" opacity="0.5"/>
      <line x1="6" y1="31" x2="34" y2="31" stroke="#3949ab" stroke-width="1" opacity="0.3"/>
    </svg>`,
    sunrise: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#e65100"/>
      <circle cx="20" cy="26" r="7" fill="#ff8f00" opacity="0.9"/>
      <line x1="20" y1="10" x2="20" y2="13" stroke="#ffcc80" stroke-width="2" stroke-linecap="round"/>
      <line x1="11" y1="17" x2="13.5" y2="18.5" stroke="#ffcc80" stroke-width="2" stroke-linecap="round"/>
      <line x1="29" y1="17" x2="26.5" y2="18.5" stroke="#ffcc80" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="26" x2="32" y2="26" stroke="#ffcc80" stroke-width="1.5" opacity="0.6"/>
      <path d="M10 30 Q20 22 30 30" stroke="#ffcc80" stroke-width="1" fill="none" opacity="0.5"/>
    </svg>`,
    dhuhr: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#f57f17"/>
      <circle cx="20" cy="20" r="8" fill="#ffee58"/>
      <line x1="20" y1="8" x2="20" y2="11" stroke="#fff9c4" stroke-width="2" stroke-linecap="round"/>
      <line x1="20" y1="29" x2="20" y2="32" stroke="#fff9c4" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="20" x2="11" y2="20" stroke="#fff9c4" stroke-width="2" stroke-linecap="round"/>
      <line x1="29" y1="20" x2="32" y2="20" stroke="#fff9c4" stroke-width="2" stroke-linecap="round"/>
      <line x1="11.5" y1="11.5" x2="13.6" y2="13.6" stroke="#fff9c4" stroke-width="2" stroke-linecap="round"/>
      <line x1="26.4" y1="26.4" x2="28.5" y2="28.5" stroke="#fff9c4" stroke-width="2" stroke-linecap="round"/>
      <line x1="28.5" y1="11.5" x2="26.4" y2="13.6" stroke="#fff9c4" stroke-width="2" stroke-linecap="round"/>
      <line x1="13.6" y1="26.4" x2="11.5" y2="28.5" stroke="#fff9c4" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    asr: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#e64a19"/>
      <circle cx="26" cy="20" r="7" fill="#ff7043" opacity="0.9"/>
      <path d="M8 20 Q14 16 20 20 Q26 24 32 20" stroke="#ffccbc" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <line x1="8" y1="26" x2="32" y2="26" stroke="#ffccbc" stroke-width="1" opacity="0.5"/>
      <line x1="8" y1="30" x2="32" y2="30" stroke="#ffccbc" stroke-width="1" opacity="0.3"/>
      <line x1="26" y1="8" x2="26" y2="11" stroke="#ffccbc" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    </svg>`,
    maghrib: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#880e4f"/>
      <circle cx="20" cy="28" r="6" fill="#e91e63" opacity="0.8"/>
      <path d="M8 22 Q14 18 20 22 Q26 26 32 22" stroke="#f48fb1" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M6 26 Q13 21 20 26 Q27 31 34 26" stroke="#f48fb1" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.5"/>
      <circle cx="13" cy="12" r="1.5" fill="#f8bbd0" opacity="0.8"/>
      <circle cx="28" cy="10" r="1" fill="#f8bbd0" opacity="0.6"/>
      <circle cx="22" cy="14" r="1" fill="#f8bbd0" opacity="0.5"/>
    </svg>`,
    isha: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#0d47a1"/>
      <path d="M22 10 C17 10 13 14 13 19 C13 24 17 28 22 28 C19 28 16 25 16 19 C16 13 19 10 22 10 Z" fill="#90caf9" opacity="0.9"/>
      <circle cx="28" cy="13" r="1.5" fill="white" opacity="0.9"/>
      <circle cx="14" cy="15" r="1" fill="white" opacity="0.7"/>
      <circle cx="31" cy="22" r="1" fill="white" opacity="0.6"/>
      <circle cx="11" cy="25" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="25" cy="28" r="1" fill="white" opacity="0.4"/>
    </svg>`
  },
  azanUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3'
};

function calcPrayerTimes(date) {
  const D2R = Math.PI / 180;
  const R2D = 180 / Math.PI;
  const lat = PRAYER_CONFIG.lat;
  const lng = PRAYER_CONFIG.lng;
  const tz  = -date.getTimezoneOffset() / 60;

  const jd = (function(y,m,d){
    if(m<=2){y--;m+=12;}
    const A=Math.floor(y/100), B=2-A+Math.floor(A/4);
    return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;
  })(date.getFullYear(), date.getMonth()+1, date.getDate());

  const T   = (jd - 2451545) / 36525;
  const L0  = 280.46646 + 36000.76983*T;
  const M   = (357.52911 + 35999.05029*T) * D2R;
  const C   = (1.914602 - 0.004817*T)*Math.sin(M) + 0.019993*Math.sin(2*M);
  const lon = L0 + C;
  const eps = (23.439291 - 0.013004*T) * D2R;
  const RA  = R2D * Math.atan2(Math.cos(eps)*Math.sin(lon*D2R), Math.cos(lon*D2R)) / 15;
  const Dec = R2D * Math.asin(Math.sin(eps)*Math.sin(lon*D2R));
  const EqT = 4*(((L0-0.0057183-RA*15)%360+360)%360);
  const noon = 12 + tz - lng/15 - EqT/60;

  function ha(angle){
    const a = (Math.sin(angle*D2R)-Math.sin(lat*D2R)*Math.sin(Dec*D2R))/(Math.cos(lat*D2R)*Math.cos(Dec*D2R));
    return Math.abs(a)>1 ? null : R2D*Math.acos(a)/15;
  }
  function asrHA(){
    const md = Math.abs(lat-Dec);
    const a  = (Math.sin(R2D*Math.atan(1/(1+Math.tan(md*D2R)))*D2R)-Math.sin(lat*D2R)*Math.sin(Dec*D2R))/(Math.cos(lat*D2R)*Math.cos(Dec*D2R));
    return Math.abs(a)>1 ? null : R2D*Math.acos(a)/15;
  }
  function fmt(h){
    if(h===null||isNaN(h)) return '--:--';
    h=((h%24)+24)%24;
    return String(Math.floor(h)).padStart(2,'0')+':'+String(Math.floor((h%1)*60)).padStart(2,'0');
  }

  const fajrHA    = ha(-19.5);
  const sunriseHA = ha(-0.8333);
  const asrH      = asrHA();
  const maghribHA = ha(-0.8333);
  const ishaHA    = ha(-17.5);

  return {
    fajr:    fmt(fajrHA    ? noon-fajrHA    : null),
    sunrise: fmt(sunriseHA ? noon-sunriseHA : null),
    dhuhr:   fmt(noon),
    asr:     fmt(asrH      ? noon+asrH      : null),
    maghrib: fmt(maghribHA ? noon+maghribHA : null),
    isha:    fmt(ishaHA    ? noon+ishaHA    : null)
  };
}

function toMin(t){ if(!t||t==='--:--') return -1; const[h,m]=t.split(':').map(Number); return h*60+m; }

let prayerSettings = { azanEnabled:true, notifEnabled:true, lastDate:'' };
try{ const s=localStorage.getItem('q_prayer'); if(s) Object.assign(prayerSettings,JSON.parse(s)); }catch(e){}
function savePrayerSettings(){ try{localStorage.setItem('q_prayer',JSON.stringify(prayerSettings));}catch(e){} }

let _azanAudio = null;
function playAzan(){
  if(!prayerSettings.azanEnabled) return;
  try{
    if(_azanAudio){ _azanAudio.pause(); _azanAudio=null; }
    _azanAudio = new Audio(PRAYER_CONFIG.azanUrl);
    _azanAudio.volume = 1.0;
    _azanAudio.play().catch(()=>{});
  }catch(e){}
}
function stopAzan(){
  if(_azanAudio){ _azanAudio.pause(); _azanAudio.currentTime=0; _azanAudio=null; }
}
function testAzan(){
  try{
    stopAzan();
    _azanAudio = new Audio(PRAYER_CONFIG.azanUrl);
    _azanAudio.volume = 1.0;
    _azanAudio.play()
      .then(()=>showToast('🔊 الأذان يعزف...'))
      .catch(()=>showToast('⚠️ فعّل الصوت من إعدادات متصفحك'));
  }catch(e){ showToast('⚠️ خطأ في تشغيل الأذان'); }
}

function requestNotifPerm(){
  if('Notification' in window && Notification.permission==='default'){
    Notification.requestPermission().then(p=>{
      if(p==='granted') showToast('✅ تم تفعيل الإشعارات');
      else showToast('⚠️ فعّل الإشعارات من إعدادات المتصفح');
    });
  }
}
function sendPrayerNotif(name, emoji){
  if(!prayerSettings.notifEnabled) return;
  if('Notification' in window && Notification.permission==='granted'){
    new Notification(emoji+' حان وقت '+name, {
      body: 'حان وقت صلاة '+name+' في مدينة قويسنا 🕌',
      icon: '/icon-192.svg', badge: '/icon-192.svg', dir:'rtl', lang:'ar'
    });
  }
  try{ if(typeof addToNotifCenter==='function') addToNotifCenter({text: emoji+' حان وقت صلاة '+name, icon:'🕌', type:'صلاة'}); }catch(e){}
}

function toggleAzanSound(enabled){
  prayerSettings.azanEnabled = enabled;
  savePrayerSettings();
  updateToggles();
  showToast(enabled ? '🔊 الأذان مفعّل' : '🔇 الأذان متوقف');
  if(!enabled) stopAzan();
}
function togglePrayerNotif(enabled){
  prayerSettings.notifEnabled = enabled;
  savePrayerSettings();
  updateToggles();
  if(enabled){ requestNotifPerm(); showToast('🔔 إشعارات الصلاة مفعّلة'); }
  else showToast('🔕 إشعارات الصلاة متوقفة');
}
function updateToggles(){
  const at=document.getElementById('azanToggle');
  const nt=document.getElementById('notifToggle');
  if(at){ at.checked=prayerSettings.azanEnabled; at.parentElement.querySelector('.tgl-track').style.background=prayerSettings.azanEnabled?'#1a237e':'#ccc'; }
  if(nt){ nt.checked=prayerSettings.notifEnabled; nt.parentElement.querySelector('.tgl-track').style.background=prayerSettings.notifEnabled?'#1a237e':'#ccc'; }
}

function renderPrayerSection(){
  const el = document.getElementById('s-prayer');
  if(!el) return;

  const now    = new Date();
  const times  = calcPrayerTimes(now);
  const keys   = PRAYER_CONFIG.keys;
  const names  = PRAYER_CONFIG.names;
  const emojis = PRAYER_CONFIG.emojis;
  const nowMin = now.getHours()*60+now.getMinutes();

  let nextIdx=0;
  for(let i=0;i<keys.length;i++){ if(toMin(times[keys[i]])>nowMin){nextIdx=i;break;} }
  if(toMin(times[keys[nextIdx]])<=nowMin) nextIdx=0;

  const diff  = toMin(times[keys[nextIdx]])>nowMin ? toMin(times[keys[nextIdx]])-nowMin : toMin(times[keys[nextIdx]])+1440-nowMin;
  const dh    = Math.floor(diff/60), dm=diff%60;
  const dateStr = now.toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  function toggleHTML(id, enabled, onchange){
    return `<label style="position:relative;display:inline-block;width:46px;height:26px;cursor:pointer;flex-shrink:0">
      <input type="checkbox" id="${id}" ${enabled?'checked':''} onchange="${onchange}(this.checked)" style="opacity:0;width:0;height:0;position:absolute">
      <span class="tgl-track" style="position:absolute;inset:0;background:${enabled?'#1a237e':'#ccc'};border-radius:26px;transition:.3s;display:block">
        <span style="position:absolute;top:3px;${enabled?'right':'left'}:3px;width:20px;height:20px;background:#fff;border-radius:50%;transition:.3s;display:block"></span>
      </span>
    </label>`;
  }

  el.innerHTML = `
    <div class="slbl">مواقيت الصلاة 🕌</div>

    <div style="background:linear-gradient(135deg,#1a237e,#283593);border-radius:20px;padding:20px 16px;margin-bottom:14px;color:#fff;position:relative;overflow:hidden">
      <div style="position:absolute;top:-40px;left:-40px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none"></div>
      <div style="position:absolute;bottom:-50px;right:-30px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.03);pointer-events:none"></div>
      <div style="font-size:10px;color:rgba(255,255,255,.55);font-weight:700;margin-bottom:2px">📅 ${dateStr}</div>
      <div style="font-size:10px;color:rgba(255,255,255,.45);margin-bottom:14px">📍 قويسنا — المنوفية</div>
      <div style="font-size:11px;color:rgba(255,255,255,.7);margin-bottom:6px;font-weight:700">الصلاة القادمة</div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
        <div style="width:58px;height:58px;flex-shrink:0">${PRAYER_CONFIG.svgIcons[keys[nextIdx]]||''}</div>
        <div>
          <div style="font-size:24px;font-weight:900">${names[nextIdx]}</div>
          <div style="font-size:32px;font-weight:900;color:#f9a825;line-height:1">${times[keys[nextIdx]]}</div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,.13);border-radius:10px;padding:8px 14px;font-size:12px;font-weight:800;display:inline-block">
        ⏰ بعد ${dh>0?dh+' ساعة و':''}${dm} دقيقة
      </div>
    </div>

    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1.5px solid rgba(26,35,126,.1);margin-bottom:14px;box-shadow:0 2px 10px rgba(26,35,126,.06)">
      <div style="background:linear-gradient(135deg,#1a237e,#283593);padding:12px 16px">
        <div style="font-size:13px;font-weight:800;color:#fff">🕐 مواقيت الصلاة اليوم</div>
      </div>
      ${keys.map((k,i)=>{
        const t = times[k];
        const isNext = i===nextIdx;
        const isPast = toMin(t)<nowMin && !isNext;
        const isSunrise = k==='sunrise';
        return `<div style="display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid #f5f5f5;background:${isNext?'rgba(26,35,126,.06)':'#fff'};border-right:${isNext?'3px solid #1a237e':'3px solid transparent'};transition:.2s">
          <div style="width:38px;height:38px;margin-left:12px;flex-shrink:0;opacity:${isPast?'0.35':'1'};filter:${isPast?'grayscale(0.5)':'none'}">${PRAYER_CONFIG.svgIcons[k]||''}</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:${isNext?'900':'700'};color:${isNext?'#1a237e':isPast?'#bbb':'#1a1a1a'}">${names[i]}</div>
            ${isNext?'<div style="font-size:9px;color:#3949ab;font-weight:800">← الصلاة القادمة</div>':''}
            ${isSunrise?'<div style="font-size:9px;color:#9a9a9a">بدون أذان</div>':''}
          </div>
          <div style="font-size:17px;font-weight:900;color:${isNext?'#1a237e':isPast?'#bbb':'#283593'};font-variant-numeric:tabular-nums">${t}</div>
        </div>`;
      }).join('')}
    </div>

    <div style="background:#fff;border-radius:16px;padding:14px;margin-bottom:14px;border:1.5px solid rgba(26,35,126,.1);box-shadow:0 2px 10px rgba(26,35,126,.06)">
      <div style="font-size:13px;font-weight:800;color:#1a237e;margin-bottom:12px">⚙️ الإعدادات</div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #f5f5f5">
        <div>
          <div style="font-size:13px;font-weight:700;color:#1a1a1a">🔊 أذان المنشاوي</div>
          <div style="font-size:10px;color:#9a9a9a">يعزف تلقائياً عند كل أذان</div>
        </div>
        ${toggleHTML('azanToggle', prayerSettings.azanEnabled, 'toggleAzanSound')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #f5f5f5">
        <div>
          <div style="font-size:13px;font-weight:700;color:#1a1a1a">🔔 إشعارات الصلاة</div>
          <div style="font-size:10px;color:#9a9a9a">تنبيه قبل الأذان بـ 5 دقائق</div>
        </div>
        ${toggleHTML('notifToggle', prayerSettings.notifEnabled, 'togglePrayerNotif')}
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button onclick="testAzan()" style="flex:1;background:linear-gradient(135deg,#1a237e,#283593);color:#fff;border:none;border-radius:10px;padding:11px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">
          ▶️ تجربة الأذان
        </button>
        <button onclick="stopAzan()" style="background:rgba(198,40,40,.1);color:#c62828;border:1.5px solid rgba(198,40,40,.2);border-radius:10px;padding:11px 14px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">
          ⏹️ إيقاف
        </button>
      </div>
    </div>

    <div style="background:#fff;border-radius:16px;padding:14px;margin-bottom:14px;border:1.5px solid rgba(26,35,126,.1)">
      <div style="font-size:12px;font-weight:800;color:#1a237e;margin-bottom:12px">✅ صلوات اليوم</div>
      <div style="display:flex;justify-content:space-around">
        ${['fajr','dhuhr','asr','maghrib','isha'].map(k=>{
          const idx = keys.indexOf(k);
          const done = toMin(times[k])<nowMin;
          return `<div style="text-align:center;flex:1">
            <div style="width:38px;height:38px;margin:0 auto 5px;transition:.3s">
              ${done
                ? '<div style="width:38px;height:38px;border-radius:50%;background:#1a237e;display:flex;align-items:center;justify-content:center;font-size:16px">✅</div>'
                : (PRAYER_CONFIG.svgIcons[k]||'')
              }
            </div>
            <div style="font-size:9px;font-weight:800;color:${done?'#1a237e':'#aaa'}">${names[idx]}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="page-copyright">مواقيت الصلاة — قويسنا 🕌<br>الطريقة المصرية — تتحدث يومياً تلقائياً</div>
  `;
}

function updateHomePrayerWidget(){
  const w = document.getElementById('homePrayerWidget');
  if(!w) return;
  const now    = new Date();
  const times  = calcPrayerTimes(now);
  const keys   = PRAYER_CONFIG.keys;
  const nowMin = now.getHours()*60+now.getMinutes();

  let ni=0;
  for(let i=0;i<keys.length;i++){ if(toMin(times[keys[i]])>nowMin){ni=i;break;} }

  const name  = PRAYER_CONFIG.names[ni];
  const time  = times[keys[ni]];
  const diff  = toMin(time)>nowMin ? toMin(time)-nowMin : toMin(time)+1440-nowMin;
  const dh=Math.floor(diff/60), dm=diff%60;

  const prayerKeys = ['fajr','dhuhr','asr','maghrib','isha'];
  const miniRow = prayerKeys.map(k=>{
    const idx = keys.indexOf(k);
    const isPast = toMin(times[k])<nowMin;
    const isNext = idx===ni;
    return `<div style="text-align:center;flex:1">
      <div style="font-size:10px;color:${isNext?'#f9a825':isPast?'rgba(255,255,255,.35)':'rgba(255,255,255,.8)'};font-weight:${isNext?'900':'700'}">${PRAYER_CONFIG.names[idx]}</div>
      <div style="font-size:11px;font-weight:900;color:${isNext?'#f9a825':isPast?'rgba(255,255,255,.35)':'#fff'}">${times[k]}</div>
    </div>`;
  }).join('');

  w.innerHTML = `
    <div onclick="goTo('prayer')" style="background:linear-gradient(135deg,#1a237e,#283593);border-radius:16px;padding:14px;cursor:pointer;box-shadow:0 4px 16px rgba(26,35,126,.25)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:44px;height:44px;flex-shrink:0">${PRAYER_CONFIG.svgIcons[keys[ni]]||''}</div>
        <div style="flex:1">
          <div style="font-size:10px;color:rgba(255,255,255,.65);font-weight:700">الصلاة القادمة</div>
          <div style="font-size:16px;font-weight:900;color:#fff">${name} — <span style="color:#f9a825">${time}</span></div>
          <div style="font-size:10px;color:rgba(255,255,255,.6);margin-top:1px">⏰ بعد ${dh>0?dh+' س و':''}${dm} دقيقة</div>
        </div>
        <div style="color:rgba(255,255,255,.4);font-size:16px;padding:6px">←</div>
      </div>
      <div style="background:rgba(255,255,255,.1);border-radius:10px;padding:8px 6px;display:flex;gap:4px">
        ${miniRow}
      </div>
    </div>
  `;
}

let _prayerInterval = null;
let _firedToday = new Set();

function startPrayerScheduler(){
  if(_prayerInterval) clearInterval(_prayerInterval);

  const todayStr = new Date().toDateString();
  if(prayerSettings.lastDate !== todayStr){
    prayerSettings.lastDate = todayStr;
    savePrayerSettings();
    _firedToday.clear();
    try{ localStorage.removeItem('q_prayer_fired'); }catch(e){}
  } else {
    try{
      const f=localStorage.getItem('q_prayer_fired');
      if(f) _firedToday = new Set(JSON.parse(f));
    }catch(e){}
  }

  _prayerInterval = setInterval(()=>{
    const now    = new Date();
    const nowMin = now.getHours()*60+now.getMinutes();
    const nowSec = now.getSeconds();
    const today  = now.toDateString();
    const times  = calcPrayerTimes(now);

    if(today !== prayerSettings.lastDate){
      prayerSettings.lastDate = today;
      savePrayerSettings();
      _firedToday.clear();
      try{ localStorage.removeItem('q_prayer_fired'); }catch(e){}
    }

    if(nowSec < 15) updateHomePrayerWidget();

    const pSec = document.getElementById('s-prayer');
    if(pSec && pSec.classList.contains('active') && nowSec < 15){
      renderPrayerSection();
    }

    PRAYER_CONFIG.keys.forEach((k,i)=>{
      if(k==='sunrise') return;
      const t = toMin(times[k]);
      if(t<0) return;
      const dayKey = today+'_'+k;

      if(!_firedToday.has(dayKey+'_pre') && nowMin===t-5){
        if(prayerSettings.notifEnabled) sendPrayerNotif(PRAYER_CONFIG.names[i], PRAYER_CONFIG.emojis[i]);
        showToast('⏰ بعد 5 دقائق — صلاة '+PRAYER_CONFIG.names[i]);
        _firedToday.add(dayKey+'_pre');
        try{ localStorage.setItem('q_prayer_fired',JSON.stringify([..._firedToday])); }catch(e){}
      }

      if(!_firedToday.has(dayKey) && nowMin===t){
        playAzan();
        sendPrayerNotif(PRAYER_CONFIG.names[i], PRAYER_CONFIG.emojis[i]);
        showToast(PRAYER_CONFIG.emojis[i]+' حان وقت صلاة '+PRAYER_CONFIG.names[i]);
        _firedToday.add(dayKey);
        try{ localStorage.setItem('q_prayer_fired',JSON.stringify([..._firedToday])); }catch(e){}
      }
    });
  }, 5000);
}

window.addEventListener('load', ()=>{
  setTimeout(()=>{
    updateHomePrayerWidget();
    startPrayerScheduler();
    if(prayerSettings.notifEnabled) requestNotifPerm();
  }, 1200);
});
