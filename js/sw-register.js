// ══════════════════════════════════════════════
// QUESINA CITY — sw-register.js
// Service Worker Registration
// ══════════════════════════════════════════════

// PWA: Service Worker — only register if page is served over HTTPS or localhost
// Blob URL SW registration fails on iOS Safari (SecurityError) — skip silently
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isSecure) {
      // Not HTTPS — SW won't work, skip silently (no error)
      console.log('ℹ️ SW skipped: requires HTTPS');
      return;
    }
    // Try to register sw.js if it exists (for hosted deployments)
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(() => console.log('✅ SW registered'))
      .catch(() => {
        // sw.js not found (local file) — that's fine, skip silently
        console.log('ℹ️ SW not available (local mode)');
      });
  });
}

// PWA: Install prompt (Add to Home Screen)
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  // Show install banner after 10 seconds if not already installed
  setTimeout(() => {
    if (deferredInstallPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
      showInstallBanner();
    }
  }, 10000);
});

function showInstallBanner() {
  if (document.getElementById('pwaBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'pwaBanner';
  banner.style.cssText = 'position:fixed;bottom:72px;left:50%;transform:translateX(-50%);' +
    'background:#1a1a1a;color:#fff;border-radius:14px;padding:10px 16px;' +
    'display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);' +
    'max-width:360px;width:90%;animation:fadeUp .3s ease';
  banner.innerHTML =
    '<span style="font-size:22px">🌆</span>' +
    '<div style="flex:1"><div style="font-size:12px;font-weight:800">أضف التطبيق لشاشتك الرئيسية</div>' +
    '<div style="font-size:10px;color:rgba(255,255,255,.7)">تصفّح أسرع بدون نت</div></div>' +
    '<button onclick="installPWA()" style="background:#E85D04;color:#fff;border:none;border-radius:8px;' +
    'padding:6px 12px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;white-space:nowrap">تثبيت</button>' +
    '<button onclick="document.getElementById(\'pwaBanner\').remove()" style="background:transparent;' +
    'border:none;color:rgba(255,255,255,.6);font-size:18px;cursor:pointer;padding:0 4px">✕</button>';
  document.body.appendChild(banner);
}

function installPWA() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.then(choice => {
    if (choice.outcome === 'accepted') showToast('✅ تم تثبيت التطبيق!');
    deferredInstallPrompt = null;
    const b = document.getElementById('pwaBanner');
    if (b) b.remove();
  });
}

// Handle shortcuts from URL params
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const sec = params.get('section');
  if (sec && typeof goTo === 'function') goTo(sec);
});


function changeAdminPassFromSettings(){
  const p1=(document.getElementById('newAdminPass').value||'').trim();
  const p2=(document.getElementById('newAdminPassConf').value||'').trim();
  if(!p1||p1.length<6){showToast('⚠️ كلمة المرور ٦ أحرف على الأقل');return;}
  if(p1!==p2){showToast('❌ كلمتا المرور غير متطابقتين');return;}
  setAdminPassword(p1);
  document.getElementById('newAdminPass').value='';
  document.getElementById('newAdminPassConf').value='';
}
/* ══════════════════════════════════════════════════════════
   QDB PERSISTENCE — Real-time sync for all sections
══════════════════════════════════════════════════════════ */

function persistAllRestaurantsToQDB(){
  // Collect all restaurant card data
  const cards = document.querySelectorAll('#foodList .card[data-rest-id]');
  const data = {};
  cards.forEach(card=>{
    const id = card.dataset.restId;
    if(!id) return;
    data[id] = {
      id, name: card.querySelector('.cnm')?.textContent||'',
      type: card.querySelector('.csub')?.textContent||'',
      phone: card.dataset.phone||card.querySelector('.cnm')?.dataset.phone||'',
      wa: card.dataset.wa||'', addr: card.dataset.addr||'',
      hours: card.dataset.hours||'', fb: card.dataset.fb||'',
      discount: card.dataset.discount||'',
      status: card.querySelector('.rst-status')?.textContent||'مفتوح',
      cat: card.dataset.cat||''
    };
  });
  QDB.set('restaurants', data);
}

function renderAllRestaurants(data){
  if(!data) return;
  Object.entries(data).forEach(([id, d])=>{
    const card = document.querySelector('[data-rest-id="'+id+'"]');
    if(!card) return;
    const nm = card.querySelector('.cnm');
    const sub = card.querySelector('.csub');
    const st = card.querySelector('.rst-status');
    if(nm && d.name) nm.textContent = d.name;
    if(sub && d.type) sub.textContent = d.type;
    if(d.discount) card.dataset.discount = d.discount;
    if(d.phone) { card.dataset.phone=d.phone; if(nm) nm.dataset.phone=d.phone; }
    if(d.addr) card.dataset.addr = d.addr;
    if(d.hours) card.dataset.hours = d.hours;
    if(st && d.status){
      st.textContent = d.status;
      st.className = 'rst-status rst-'+(d.status==='مفتوح'?'open':d.status==='مشغول'?'busy':'closed');
    }
  });
}

function persistMedicalsToQDB(){
  const cards = document.querySelectorAll('#medList .card');
  const data = {};
  cards.forEach((card,i)=>{
    const id = card.id || 'med_'+i;
    data[id] = {
      id, name: card.querySelector('.cnm')?.textContent||'',
      sub: card.querySelector('.csub')?.textContent||'',
      cat: card.dataset.cat||''
    };
  });
  QDB.set('medicals', data);
}

function persistShopsToQDB(){
  const cards = document.querySelectorAll('#shopList .card');
  const data = {};
  cards.forEach((card,i)=>{
    const id = card.id||'shop_'+i;
    data[id]={id,name:card.querySelector('.cnm')?.textContent||'',sub:card.querySelector('.csub')?.textContent||'',cat:card.dataset.cat||''};
  });
  QDB.set('shops', data);
}

// ── Admin password management ──
function setAdminPassword(newPass){
  if(!newPass||newPass.length<6){showToast('⚠️ كلمة المرور ٦ أحرف على الأقل');return;}
  const config = QDB.get('admin_config')||{};
  config.password = newPass;
  config.phone = '01000767058';
  QDB.set('admin_config', config);
  showToast('✅ تم تغيير كلمة مرور المدير');
}

// Auto-persist on load after 2s
setTimeout(()=>{
  try{ persistAllRestaurantsToQDB(); }catch(e){}
  try{ persistMedicalsToQDB(); }catch(e){}
  try{ persistShopsToQDB(); }catch(e){}
},2000);


/* ══ BOOKING SYSTEM CONTROL ══ */
let bookingEnabled = true;
try { bookingEnabled = localStorage.getItem('quesina_booking') !== 'false'; } catch(e) {}

function setBookingEnabled(enabled){
  bookingEnabled = enabled;
  try { localStorage.setItem('quesina_booking', enabled ? 'true' : 'false'); } catch(e) {}
  const badge = document.getElementById('bookingStatusBadge');
  if(badge){
    badge.textContent = enabled ? '✅ مفعّل' : '🔒 مغلق';
    badge.style.background = enabled ? 'rgba(46,125,50,.15)' : 'rgba(198,40,40,.12)';
    badge.style.color = enabled ? '#2e7d32' : '#c62828';
  }
  showToast(enabled ? '✅ تم تفعيل نظام الحجز' : '🔒 تم إغلاق نظام الحجز');
  // Update booking section visibility in open detail pages
  const bookSec = document.querySelector('#medDetailPage .booking-section');
  if(bookSec) bookSec.style.display = enabled ? 'block' : 'none';
}

/* ══ DELIVERY FEE CONTROL ══ */
let deliveryFee = 20;
try {
  const saved = localStorage.getItem('quesina_delivery_fee');
  if(saved) deliveryFee = parseInt(saved) || 20;
} catch(e) {}

function saveDeliveryFee(){
  const inp = document.getElementById('deliveryFeeInput');
  if(!inp) return;
  const val = parseInt(inp.value);
  if(isNaN(val) || val < 0){ showToast('⚠️ أدخل مبلغ صحيح'); return; }
  deliveryFee = val;
  try { localStorage.setItem('quesina_delivery_fee', String(val)); } catch(e) {}
  // Update all fee displays
  const feeNote = document.getElementById('deliveryFeeNote');
  if(feeNote) feeNote.textContent = '🛵 رسوم التوصيل: ' + val + ' جنيه للمشوار — تُضاف لقيمة طلبك';
  const cartDlv = document.getElementById('cartDeliveryDisplay');
  if(cartDlv) cartDlv.textContent = val + ' جنيه';
  showToast('✅ تم تحديث رسوم التوصيل إلى ' + val + ' جنيه');
}

// Apply saved delivery fee on load
window.addEventListener('load', () => {
  const inp = document.getElementById('deliveryFeeInput');
  if(inp) inp.value = deliveryFee;
  const feeNote = document.getElementById('deliveryFeeNote');
  if(feeNote) feeNote.textContent = '🛵 رسوم التوصيل: ' + deliveryFee + ' جنيه للمشوار — تُضاف لقيمة طلبك';
  // Apply booking state badge
  const badge = document.getElementById('bookingStatusBadge');
  if(badge){
    badge.textContent = bookingEnabled ? '✅ مفعّل' : '🔒 مغلق';
    badge.style.background = bookingEnabled ? 'rgba(46,125,50,.15)' : 'rgba(198,40,40,.12)';
    badge.style.color = bookingEnabled ? '#2e7d32' : '#c62828';
  }
});


/* ══ FAVOURITES ══ */
let userFavs=new Set();
try{const _fs=localStorage.getItem('quesina_favs');if(_fs)userFavs=new Set(JSON.parse(_fs));}catch(e){}
function toggleFav(btn,e){
  if(e)e.stopPropagation();
  const card=btn.closest('.card,.jc,.mkc,.nc');
  const name=(card&&card.querySelector('.cnm,.ntit,.mktit,.jt')?.textContent)||'';
  if(!name)return;
  if(userFavs.has(name)){userFavs.delete(name);btn.innerHTML='♡';btn.style.color='rgba(90,48,32,.3)';}
  else{userFavs.add(name);btn.innerHTML='♥';btn.style.color='#e53935';}
  try{localStorage.setItem('quesina_favs',JSON.stringify([...userFavs]));}catch(e){}
  showToast(userFavs.has(name)?'❤️ أُضيف للمفضلة':'💔 حُذف من المفضلة');
}

/* ══ ADD FAV BUTTONS TO CARDS ON LOAD ══ */
function initFavButtons(){
  document.querySelectorAll('#foodList .card, #medList .card, #shopList .card, #craftList .card, #jobsList .jc, #marketList .mkc').forEach(card=>{
    if(card.querySelector('.fav-btn'))return;
    const btn=document.createElement('button');
    btn.className='fav-btn';
    btn.innerHTML='♡';
    btn.style.cssText='position:absolute;top:10px;left:10px;background:transparent;border:none;cursor:pointer;font-size:20px;color:rgba(90,48,32,.3);z-index:5;padding:0;line-height:1';
    btn.onclick=function(e){e.stopPropagation();toggleFav(this,e);};
    card.style.position='relative';
    card.appendChild(btn);
  });
}
window.addEventListener('load',()=>setTimeout(initFavButtons,500));
document.addEventListener('DOMContentLoaded',()=>setTimeout(initFavButtons,200));
