// ══════════════════════════════════════════════
// QUESINA CITY — app.js
// Main Application Logic
// ══════════════════════════════════════════════

/* NAV */
const SECS=['home','news','food','transport','medical','market','craftsmen','education','jobs','zaman','sport','services','persons','history','delivery','shops','about','prayer'];
const BNIDS=['home','news','food','medical','delivery'];
let deliveryOn=true,selectedAgent=0;

/* ── Early declarations for new features (used across scripts) ── */
let appliedCoupon=null;
let pushEnabled=false;
const couponsDB={
  'QUESINA10':{discount:10,type:'percent',desc:'خصم ١٠٪ على أي طلب',uses:100,used:0},
  'WELCOME20':{discount:20,type:'percent',desc:'خصم ٢٠٪ للمستخدمين الجدد',uses:50,used:0},
  'FREE5':{discount:5,type:'fixed',desc:'خصم ٥ جنيه من قيمة الطلب',uses:200,used:0},
};
const pendingOrdersQueue=[];
window.ratingsDB={};
try{const _rs=localStorage.getItem('quesina_ratings');if(_rs)window.ratingsDB=JSON.parse(_rs);}catch(_e){}
const secBannerData={medical:[],market:[],craftsmen:[],education:[],jobs:[],delivery:[],shops:[]};
const secBannerIdx={medical:0,market:0,craftsmen:0,education:0,jobs:0,delivery:0,shops:0};
const secBannerTimers={};

function goTo(id){
  if(id==='delivery'&&!deliveryOn){showToast('قسم التوصيل غير متاح حالياً');return}
  SECS.forEach(s=>{const el=document.getElementById('s-'+s);if(el)el.classList.toggle('active',s===id)});
  BNIDS.forEach(n=>{const b=document.getElementById('bn-'+n);if(b)b.classList.toggle('active',n===id)});
  const mb=document.getElementById('bn-more');if(mb)mb.classList.toggle('active',!BNIDS.includes(id)&&id!=='home');
  document.getElementById('moreDrawer').classList.remove('open');
  document.getElementById('mc').scrollTop=0;
  const adsSlider=document.getElementById('adsSlider');
  const nbEl=document.getElementById('nb');
  const emergBtn=document.querySelector('.femerg');
  if(id==='home'){
    if(adsSlider)adsSlider.style.display='';
    if(nbEl)nbEl.style.display='';
    if(emergBtn)emergBtn.style.display='';
  } else {
    if(adsSlider)adsSlider.style.display='none';
    if(nbEl)nbEl.style.display='none';
    if(emergBtn)emergBtn.style.display='none';
  }
  if(id==='home')renderHomeNews();
  if(id==='prayer' && typeof renderPrayerSection==='function') renderPrayerSection();
}
function toggleMore(){document.getElementById('moreDrawer').classList.toggle('open')}

/* ADMIN */
function refreshCouponRestListOnOpen(){
  setTimeout(()=>{
    if(typeof refreshCouponRestList==='function') refreshCouponRestList();
  },300);
}
function openAdmin(){
  if(currentRole!=='admin'){showToast('⛔ غير مصرح');return;}
  document.getElementById('admOv').classList.add('open');
}
function closeAdmin(){document.getElementById('admOv').classList.remove('open')}
function admTab(id,btn){
  document.querySelectorAll('.atc').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.atab').forEach(b=>b.classList.remove('active'));
  document.getElementById(id).classList.add('active');btn.classList.add('active');
  if(id==='t-medical')setTimeout(refreshMedAdminList,50);
  if(id==='t-food')setTimeout(refreshRestAdminList,50);
  if(id==='t-settings')setTimeout(refreshCouponRestList,100);
}
document.getElementById('admOv').addEventListener('click',function(e){if(e.target===this)closeAdmin()});

/* INNER PAGES */
function closeIP(id){
  document.getElementById(id).classList.remove('open');
  // When closing restaurant page, clear any unapplied coupon display
  if(id==='restDetailPage'){
    if(typeof appliedCoupon!=='undefined'&&appliedCoupon){
      // Only clear if cart is empty (user left without ordering)
      if(cart.items.length===0){
        appliedCoupon=null;
        const inp=document.getElementById('couponInput');if(inp)inp.value='';
        const fb=document.getElementById('couponFeedback');if(fb){fb.textContent='';fb.style.color='';}
        if(typeof updateCartWithCoupon==='function')updateCartWithCoupon();
      }
    }
  }
}

function openNewsDetail(d){
  const isEn = (typeof currentLang !== 'undefined') && currentLang === 'en';
  const title = (isEn && d.en_title) ? d.en_title : d.title;
  const body  = (isEn && d.en_body)  ? d.en_body  : d.body;
  document.getElementById('ndTitle').textContent=title;
  const catLabels={أخبار:'News',تعليم:'Education',صحة:'Health',رياضة:'Sports',اقتصاد:'Economy',محلي:'Local'};
  const catDisplay = isEn ? (catLabels[d.cat]||d.cat) : d.cat;
  document.getElementById('ndCatLabel').textContent=catDisplay;
  // Category badge with color
  const catColors={أخبار:{bg:'#e8f5e9',color:'#2e7d32',icon:'📰'},تعليم:{bg:'#e3f2fd',color:'#1565c0',icon:'🏫'},صحة:{bg:'#fce4ec',color:'#c62828',icon:'🏥'},رياضة:{bg:'#f3e5f5',color:'#6a1b9a',icon:'⚽'},اقتصاد:{bg:'#fff8e1',color:'#e65100',icon:'💰'},محلي:{bg:'rgba(232,93,4,.1)',color:'#E85D04',icon:'📍'}};
  const cc=catColors[d.cat]||{bg:'rgba(232,93,4,.1)',color:'#E85D04',icon:'📰'};
  const badge=document.getElementById('ndCatBadge');
  badge.textContent=cc.icon+' '+catDisplay;
  badge.style.background=cc.bg; badge.style.color=cc.color;
  // Hero wrap color based on category
  const heroWrap=document.getElementById('ndImgWrap');
  const heroColors={أخبار:'linear-gradient(135deg,#2e7d32,#43a047)',تعليم:'linear-gradient(135deg,#1565c0,#1976d2)',صحة:'linear-gradient(135deg,#c62828,#ef5350)',رياضة:'linear-gradient(135deg,#6a1b9a,#8e24aa)',اقتصاد:'linear-gradient(135deg,#e65100,#ff7043)',محلي:'linear-gradient(135deg,#E85D04,#DC2F02)'};
  if(heroWrap) heroWrap.style.background=heroColors[d.cat]||'linear-gradient(135deg,#E85D04,#DC2F02)';
  document.getElementById('ndDate').textContent='📅 '+d.date;
  document.getElementById('ndBody').innerHTML=(body||'').replace(/\n/g,'<br>');
  const img=document.getElementById('ndImg');
  const ph=document.getElementById('ndImgPh');
  if(d.img){img.src=d.img;img.style.display='block';if(ph)ph.style.display='none';}
  else{img.style.display='none';if(ph){ph.style.display='block';ph.textContent=cc.icon;}}
  // Store current news for share
  window._currentNews={...d,_displayTitle:title,_displayBody:body};
  document.getElementById('newsDetailPage').classList.add('open');
}
function shareNews(){
  const d=window._currentNews||{};
  const txt=(d.title||'')+'\n'+(d.body||'').substring(0,100)+'...\n— مدينة قويسنا';
  if(navigator.share){navigator.share({title:d.title,text:txt});}
  else{navigator.clipboard&&navigator.clipboard.writeText(txt);showToast('📋 تم نسخ الخبر');}
}

function openRestDetail(card){
  try{
    const nmEl=card.querySelector('.cnm');if(!nmEl)return;
    const nm=nmEl.textContent;
    const sub=card.querySelector('.csub')?card.querySelector('.csub').textContent:'';
    const starsEl=card.querySelector('.stars-d');
    const rating=card.dataset.rating||(starsEl?starsEl.textContent:'');
    const status=card.querySelector('.rst-status')?card.querySelector('.rst-status').textContent:'مفتوح';
    const fbLink=card.dataset.fb||'';
    const ph=card.dataset.phone||nmEl.dataset.phone||'';
    const wa=card.dataset.wa||ph;
    // Update detail page
    document.getElementById('rdName').textContent=nm;
    document.getElementById('rdFullName').textContent=nm;
    document.getElementById('rdSub').textContent=sub;
    document.getElementById('rdRating').textContent='⭐ '+rating;
    document.getElementById('rdAddr').textContent=card.dataset.addr||'قويسنا';
    document.getElementById('rdHours').textContent=card.dataset.hours||'—';
    // Status badge
    const sbEl=document.getElementById('rdStatusBadge');
    const isClosed=status==='مغلق';
    const isBusy=status==='مشغول';
    const sColor=isClosed?'#ef9a9a':isBusy?'var(--gold)':'var(--g4)';
    const sBg=isClosed?'rgba(198,40,40,.15)':isBusy?'rgba(249,168,37,.1)':'rgba(67,160,71,.15)';
    sbEl.innerHTML=`<span style="background:${sBg};color:${sColor};border-radius:8px;padding:3px 8px;font-size:11px;font-weight:700">${status}</span>`;
    // Buttons - use restaurant's own phone
    const rdCallEl=document.getElementById('rdCall');
    rdCallEl.href=ph?'tel:'+ph:'#';
    rdCallEl.dataset.phone=ph;
    document.getElementById('rdWA').href=wa?'https://wa.me/2'+wa.replace(/^0/,'')+'?text=طلب من '+nm:'#';
    document.getElementById('rdMap').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(nm+' قويسنا');
    const fbBtn=document.getElementById('rdFB');
    if(fbLink){fbBtn.href=fbLink;fbBtn.style.display='inline-flex';}else{fbBtn.style.display='none';}
    // Discount
    const discount=card.dataset.discount||'';
    const discBadge=document.getElementById('rdDiscountBadge');
    if(discount){document.getElementById('rdDiscountText').textContent=discount;discBadge.style.display='flex';}
    else discBadge.style.display='none';
    // Hero/Logo overrides from admin edits
    const id=card.dataset.restId;
    window.currentOpenRestId=id;
    window.currentOpenRestName=nm;
    const heroOverride=window.restHeroOverrides&&id?window.restHeroOverrides[id]:null;
    const logoOverride=window.restLogoOverrides&&id?window.restLogoOverrides[id]:null;
    if(heroOverride){
      document.getElementById('rdHeroImg').src=heroOverride;
      document.getElementById('rdHeroImg').style.display='block';
      document.getElementById('rdHeroPh').style.display='none';
    } else {
      document.getElementById('rdHeroImg').style.display='none';
      document.getElementById('rdHeroPh').style.display='flex';
    }
    if(logoOverride){
      const lw=document.getElementById('rdLogoWrap');
      if(lw){lw.innerHTML=`<img src="${logoOverride}" style="width:100%;height:100%;object-fit:cover;border-radius:12px"/>`;}
    }
    // Closed msg
    document.getElementById('rdClosedMsg').style.display=isClosed?'block':'none';
    document.getElementById('cartRestName').textContent='الطلب من: '+nm;
    cart.restWA=wa; cart.restName=nm;
    // Reset coupon when switching restaurant — coupon is per-restaurant
    if(typeof appliedCoupon!=='undefined'&&appliedCoupon){
      appliedCoupon=null;
      const inp=document.getElementById('couponInput');if(inp)inp.value='';
      const fb=document.getElementById('couponFeedback');if(fb){fb.textContent='';fb.style.color='';}
      updateCartWithCoupon&&updateCartWithCoupon();
    }
    // Build menu from card data
    buildRestMenu(card,nm);
    document.getElementById('restDetailPage').classList.add('open');
    updateRdCartTotal();
  }catch(e){console.error(e);showToast('⚠️ خطأ في فتح المطعم');}
}

// Store current doctor data for booking
window._currentDoctor = null;
window._selectedDay = '';
window._selectedTime = '';

function openMedDetail(d){
  window._currentDoctor = d;
  window._selectedDay = '';
  window._selectedTime = '';
  document.getElementById('mdTitle').textContent=d.name;
  document.getElementById('mdName').textContent=d.name;
  document.getElementById('mdSub').textContent=d.sub||'';
  document.getElementById('mdAddr').textContent=d.addr||'قويسنا';
  document.getElementById('mdHours').textContent=d.hours||'يرجى الاتصال';
  const priceEl=document.getElementById('mdPrice');
  if(priceEl) priceEl.textContent=d.price||'—';
  const mdCallEl=document.getElementById('mdCall');
  if(mdCallEl){mdCallEl.href='tel:'+(d.phone||'');mdCallEl.dataset.phone=d.phone||'';}
  const waEl=document.getElementById('mdWA');
  if(waEl) waEl.href=d.phone?'https://wa.me/2'+d.phone.replace(/^0/,'')+'?text=أريد حجز موعد في '+encodeURIComponent(d.name):'#';
  const mapEl=document.getElementById('mdMap');
  if(mapEl) mapEl.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(d.name+' قويسنا');
  // Prefill patient info if logged in
  if(currentUser&&currentUser.displayName){
    const nameEl=document.getElementById('mdPatientName');
    if(nameEl&&!nameEl.value) nameEl.value=currentUser.displayName;
  }
  if(currentUser&&currentUser.phoneNumber){
    const phEl=document.getElementById('mdPatientPhone');
    if(phEl&&!phEl.value) phEl.value=currentUser.phoneNumber;
  }
  // Build day slots (next 7 days)
  buildDaySlots();
  // Reset booking
  const conf=document.getElementById('mdBookingConfirm');
  if(conf) conf.style.display='none';
  // Apply booking toggle state — per-clinic (uid from card id)
  const bkSec = document.querySelector('#medDetailPage .booking-section');
  if(bkSec){
    // Find the card uid by matching name
    let clinicOpen = true;
    try{
      const cb = JSON.parse(localStorage.getItem('quesina_clinic_booking')||'{}');
      // Find card by name match
      document.querySelectorAll('#medList .card').forEach(card=>{
        const nm = card.querySelector('.cnm')?.textContent||'';
        if(nm===d.name && cb[card.id]===false) clinicOpen=false;
      });
    }catch(e){}
    bkSec.style.display = clinicOpen ? 'block' : 'none';
    if(!clinicOpen){
      // Show closed message
      let closedMsg = bkSec.previousElementSibling;
      if(!closedMsg||!closedMsg.id||closedMsg.id!=='bkClosedNote'){
        const msg=document.createElement('div');
        msg.id='bkClosedNote';
        msg.style.cssText='background:rgba(198,40,40,.08);border:1px solid rgba(198,40,40,.2);border-radius:12px;padding:12px;margin-bottom:10px;font-size:12px;color:#c62828;font-weight:700;text-align:center';
        msg.textContent='🔒 الحجز الإلكتروني مغلق حالياً — تواصل مباشرة عبر الاتصال أو واتساب';
        bkSec.parentNode.insertBefore(msg,bkSec);
      }
    } else {
      const old=document.getElementById('bkClosedNote');
      if(old)old.remove();
    }
  }
  document.getElementById('medDetailPage').classList.add('open');
}

function buildDaySlots(){
  const container=document.getElementById('mdDaySlots');
  const timeContainer=document.getElementById('mdTimeSlots');
  if(!container)return;
  container.innerHTML='';
  if(timeContainer) timeContainer.innerHTML='';
  const days=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const now=new Date();
  for(let i=0;i<7;i++){
    const d=new Date(now); d.setDate(now.getDate()+i);
    const dayName=days[d.getDay()];
    const dateStr=d.toLocaleDateString('ar-EG',{month:'short',day:'numeric'});
    const btn=document.createElement('button');
    btn.style.cssText='min-width:62px;padding:8px 4px;border-radius:12px;border:1.5px solid rgba(232,93,4,.2);background:#fff;cursor:pointer;font-family:inherit;text-align:center;transition:all .15s;flex-shrink:0';
    btn.innerHTML='<div style="font-size:11px;font-weight:800;color:#1a1a1a">'+dayName+'</div><div style="font-size:10px;color:var(--t3);margin-top:2px">'+dateStr+'</div>';
    const dayKey=d.toISOString().slice(0,10);
    btn.onclick=()=>{
      container.querySelectorAll('button').forEach(b=>{ b.style.background='#fff'; b.style.borderColor='rgba(232,93,4,.2)'; b.querySelector('div').style.color='#1a1a1a'; });
      btn.style.background='var(--orange)'; btn.style.borderColor='var(--orange)';
      btn.querySelector('div').style.color='#fff'; btn.querySelectorAll('div')[1].style.color='rgba(255,255,255,.8)';
      window._selectedDay=dayKey+' ('+dayName+')';
      buildTimeSlots();
    };
    container.appendChild(btn);
  }
}

function buildTimeSlots(){
  const container=document.getElementById('mdTimeSlots');
  if(!container)return;
  container.innerHTML='';
  const times=['٩:٠٠ص','٩:٣٠ص','١٠:٠٠ص','١٠:٣٠ص','١١:٠٠ص','١١:٣٠ص','١٢:٠٠م','١٢:٣٠م','١:٠٠م','١:٣٠م','٢:٠٠م','٢:٣٠م','٥:٠٠م','٥:٣٠م','٦:٠٠م','٦:٣٠م','٧:٠٠م'];
  // Check booked slots for this doctor+day
  const appts=QDB.get('appointments')||{};
  const docName=(window._currentDoctor||{}).name||'';
  const booked=Object.values(appts).filter(a=>a.doctor===docName&&a.day===window._selectedDay).map(a=>a.time);
  times.forEach(t=>{
    const isBooked=booked.includes(t);
    const btn=document.createElement('button');
    btn.style.cssText='padding:7px 12px;border-radius:10px;border:1.5px solid '+(isBooked?'#e0e0e0':'rgba(232,93,4,.25)')+';background:'+(isBooked?'#f5f5f5':'#fff')+';color:'+(isBooked?'#bbb':'var(--orange)')+';font-size:12px;font-weight:700;cursor:'+(isBooked?'not-allowed':'pointer')+';font-family:inherit;transition:all .15s';
    btn.textContent=t+(isBooked?' ✗':'');
    btn.disabled=isBooked;
    btn.onclick=()=>{
      container.querySelectorAll('button:not(:disabled)').forEach(b=>{ b.style.background='#fff'; b.style.color='var(--orange)'; b.style.borderColor='rgba(232,93,4,.25)'; });
      btn.style.background='var(--orange)'; btn.style.color='#fff'; btn.style.borderColor='var(--orange)';
      window._selectedTime=t;
    };
    container.appendChild(btn);
  });
}

function confirmAppointment(){
  const name=(document.getElementById('mdPatientName').value||'').trim();
  const phone=(document.getElementById('mdPatientPhone').value||'').trim();
  const note=(document.getElementById('mdPatientNote').value||'').trim();
  const day=window._selectedDay||'';
  const time=window._selectedTime||'';
  const doc=window._currentDoctor||{};
  if(!name){showToast('⚠️ اكتب اسمك');return;}
  if(!phone){showToast('⚠️ اكتب رقم هاتفك');return;}
  if(!day){showToast('⚠️ اختر اليوم');return;}
  if(!time){showToast('⚠️ اختر وقت الكشف');return;}
  // Save appointment to QDB
  const appts=QDB.get('appointments')||{};
  const apptId='appt_'+Date.now();
  appts[apptId]={id:apptId,doctor:doc.name,docPhone:doc.phone,patient:name,patientPhone:phone,day,time,note,status:'pending',createdAt:new Date().toISOString()};
  QDB.set('appointments',appts);
  // Send via WhatsApp
  const docWA=doc.phone?'2'+doc.phone.replace(/^0/,''):'201000767058';
  const msg=encodeURIComponent(
    '📅 طلب حجز موعد — '+doc.name+'\n'+'━━━━━━━━━━━━━━\n'+
    '👤 المريض: '+name+'\n📱 الهاتف: '+phone+'\n'+'📆 اليوم: '+day+'\n'+'⏰ الوقت: '+time+(note?'\n📝 '+note:'')+'\n'+'━━━━━━━━━━━━━━\n'+'يرجى التأكيد على واتساب'
  );
  window.open('https://wa.me/'+docWA+'?text='+msg,'_blank');
  // Show confirmation
  const conf=document.getElementById('mdBookingConfirm');
  if(conf){conf.textContent='✅ تم إرسال طلب الحجز! سيتم تأكيده من العيادة على واتساب';conf.style.display='block';}
  // Mark time as booked in UI
  document.getElementById('mdTimeSlots').querySelectorAll('button').forEach(b=>{if(b.textContent.startsWith(time)){b.disabled=true;b.style.background='#f5f5f5';b.style.color='#bbb';b.textContent=time+' ✓';}});
  window._selectedTime='';
  showToast('✅ تم إرسال طلب الحجز بنجاح!');
}

function openCraftDetail(card){
  try{
    const nmEl=card.querySelector('.cnm');
    if(!nmEl)return;
    const nm=nmEl.textContent;
    const sub=card.querySelector('.csub')?card.querySelector('.csub').textContent:'';
    const starsEl=card.querySelector('.stars-d');
    const stars=starsEl?starsEl.textContent:'';
    const avEl=card.querySelector('.avon,.avoff');
    const av=avEl?avEl.textContent:'متاح';
    // Get phone: from card data-phone, then cnm data-phone, then regex in sub
    const ph=card.dataset.phone||nmEl.dataset.phone||sub.match(/0[12][0-9]{8,9}/)?.[0]||'';
    document.getElementById('cdTitle').textContent=nm;
    document.getElementById('cdName').textContent=nm;
    document.getElementById('cdSub').textContent=sub.replace(' • '+(ph||''),'').trim();
    document.getElementById('cdStars').textContent=stars;
    document.getElementById('cdJobs').textContent='—';
    document.getElementById('cdAvail').innerHTML=av==='متاح الآن'||av==='متاح'?
      `<span class="avon" data-ar="متاح الآن" data-en="Available Now">${av}</span>`:`<span class="avoff" data-ar="مشغول" data-en="Busy">${av}</span>`;
    const cdCallEl=document.getElementById('cdCall');
    if(ph){
      cdCallEl.href='tel:'+ph;
      cdCallEl.style.display='inline-flex';
      document.getElementById('cdWA').href='https://wa.me/2'+ph.replace(/^0/,'')+'?text=مرحباً، أريد التواصل مع '+nm;
      document.getElementById('cdWA').style.display='inline-flex';
    } else {
      cdCallEl.removeAttribute('href');
      document.getElementById('cdWA').removeAttribute('href');
    }
    document.getElementById('craftDetailPage').classList.add('open');
    // Per-craftsman booking check
    const cdBkSec = document.querySelector('#craftDetailPage .booking-section');
    if(cdBkSec){
      const craftId = card.id || card.dataset.craftId || '';
      let craftBkOpen = true;
      try{
        const cb = JSON.parse(localStorage.getItem('quesina_clinic_booking')||'{}');
        if(cb[craftId]===false) craftBkOpen = false;
      }catch(e){}
      cdBkSec.style.display = craftBkOpen ? 'block' : 'none';
      const oldNote = document.getElementById('cdBkClosedNote');
      if(!craftBkOpen){
        if(!oldNote){
          const msg=document.createElement('div');
          msg.id='cdBkClosedNote';
          msg.style.cssText='background:rgba(198,40,40,.08);border:1px solid rgba(198,40,40,.2);border-radius:12px;padding:12px;margin-bottom:10px;font-size:12px;color:#c62828;font-weight:700;text-align:center';
          msg.textContent='🔒 الحجز مغلق حالياً — تواصل مباشرة';
          cdBkSec.parentNode.insertBefore(msg,cdBkSec);
        }
      } else { if(oldNote)oldNote.remove(); }
    }
  }catch(e){showToast('⚠️ خطأ في فتح البيانات');}
}

function openMarketDetail(d){
  document.getElementById('mkdTitle').textContent=d.title;
  document.getElementById('mkdName').textContent=d.title;
  document.getElementById('mkdPrice').textContent=d.price;
  document.getElementById('mkdSeller').textContent=d.seller+' • '+d.cat;
  document.getElementById('mkdDesc').textContent=d.desc;
  document.getElementById('mkdWA').href='https://wa.me/2'+d.phone.replace(/^0/,'')+'?text=مهتم بـ '+d.title;
  const img=document.getElementById('mkdImg');
  if(d.img){img.src=d.img;img.style.display='block'}else{img.style.display='none'}
  document.getElementById('marketDetailPage').classList.add('open');
}

function openEduDetail(d){
  document.getElementById('edTitle').textContent=d.name;
  document.getElementById('edName').textContent=d.name;
  document.getElementById('edSub').textContent=d.sub;
  document.getElementById('edAddr').textContent=d.addr;
  document.getElementById('edHours').textContent=d.hours;
  document.getElementById('edDesc').textContent=d.desc;
  const edCallEl=document.getElementById('edCall');
  edCallEl.href='tel:'+d.phone;
  edCallEl.dataset.phone=d.phone;
  document.getElementById('edWA').href='https://wa.me/2'+d.phone.replace(/^0/,'')+'?text=استفسار عن '+d.name;
  const img=document.getElementById('edImg');
  if(d.img){img.src=d.img;img.style.display='block'}else{img.style.display='none'}
  document.getElementById('eduDetailPage').classList.add('open');
}

function openJobDetail(d){
  document.getElementById('jdTitle').textContent=d.title;
  document.getElementById('jdCompany').textContent=d.company;
  document.getElementById('jdSalary').textContent=d.salary;
  document.getElementById('jdType').textContent=d.type;
  document.getElementById('jdAddr').textContent=d.addr;
  document.getElementById('jdDesc').textContent=d.desc;
  document.getElementById('jdCall').href='tel:'+d.phone;
  document.getElementById('jobDetailPage').classList.add('open');
}

function openArtDetail(d){
  document.getElementById('adTitle').textContent=d.title||d.era||d.label||'مقال';
  document.getElementById('adLabel').textContent=d.era||d.label||'';
  document.getElementById('adName').textContent=d.title;
  document.getElementById('adBody').textContent=d.body;
  const img=document.getElementById('adImg');
  if(d.img){img.src=d.img;img.style.display='block'}else{img.style.display='none'}
  document.getElementById('artDetailPage').classList.add('open');
}

/* CART */
let cart={items:[],restName:'',restWA:''};
function addCart(name,price,e){
  e&&e.stopPropagation();
  const existing=cart.items.find(i=>i.name===name);
  if(existing)existing.qty++;
  else cart.items.push({name,price,qty:1});
  updateCartUI();
  showToast('✅ أُضيف '+name+' للسلة');
}
function updateCartUI(){
  const count=cart.items.reduce((a,i)=>a+i.qty,0);
  const fab=document.getElementById('cartFab');
  document.getElementById('cartCount').textContent=count;
  fab.classList.toggle('show',count>0);
  const sub=cart.items.reduce((a,i)=>a+(i.price*i.qty),0);
  document.getElementById('cartSubtotal').textContent=sub+' جنيه';
  // Update rdCartTotal too
  const rdTot=document.getElementById('rdCartTotal');
  if(rdTot)rdTot.textContent=sub+' جنيه';
  const wrap=document.getElementById('cartItems');
  wrap.innerHTML='';
  cart.items.forEach((item,idx)=>{
    const div=document.createElement('div');div.className='cart-item';
    div.innerHTML=`<div class="ci-name">${item.name}</div><div class="ci-qty"><button class="ci-qty-btn" onclick="chgQty(${idx},-1)">−</button><span class="ci-qty-num">${item.qty}</span><button class="ci-qty-btn" onclick="chgQty(${idx},1)">+</button></div><div class="ci-price">${item.price*item.qty} جنيه</div>`;
    wrap.appendChild(div);
  });
  // Apply coupon discount if exists
  if(typeof updateCartWithCoupon==='function')updateCartWithCoupon();
  else {const _dlvFee=typeof deliveryFee!=='undefined'?deliveryFee:20;document.getElementById('cartTotal').textContent=(sub+_dlvFee)+' جنيه';const _dlvDis=document.getElementById('cartDeliveryDisplay');if(_dlvDis)_dlvDis.textContent=_dlvFee+' جنيه';}
}
function chgQty(idx,delta){
  cart.items[idx].qty+=delta;
  if(cart.items[idx].qty<=0)cart.items.splice(idx,1);
  updateCartUI();
}
function openCart(){document.getElementById('cartPanel').classList.add('open')}
function clearCart(){cart.items=[];updateCartUI();closeIP('cartPanel')}
function sendCartOrder(){
  const name=document.getElementById('cName').value.trim();
  const phone=document.getElementById('cPhone').value.trim();
  const addr=document.getElementById('cAddr').value.trim();
  const cnote=document.getElementById('cNote')?document.getElementById('cNote').value.trim():'';
  if(!name||!phone||!addr){showToast('⚠️ اكمل بياناتك');return;}
  if(cart.items.length===0){showToast('⚠️ السلة فارغة');return;}
  const sub=cart.items.reduce((a,i)=>a+(i.price*i.qty),0);
  // Apply coupon
  let discount=0;
  if(typeof appliedCoupon!=='undefined'&&appliedCoupon){
    discount=appliedCoupon.type==='percent'?Math.round(sub*appliedCoupon.discount/100):appliedCoupon.discount;
    if(couponsDB[appliedCoupon.code])couponsDB[appliedCoupon.code].used++;
  }
  const total=Math.max(0,sub-discount)+(typeof deliveryFee!=='undefined'?deliveryFee:20);
  const itemsTxt=cart.items.map(i=>`${i.name}×${i.qty}`).join('، ');
  const couponLine=appliedCoupon?`\n🏷️ كوبون: ${appliedCoupon.code} (خصم ${discount} جنيه)`:'';
  const msg=encodeURIComponent(`🛒 طلب جديد من تطبيق قويسنا\n━━━━━━━━━━━━━━\n👤 الاسم: ${name}\n📱 الهاتف: ${phone}\n📍 العنوان: ${addr}\n━━━━━━━━━━━━━━\n🧾 تفاصيل الطلب:\n${cart.items.map(i=>`• ${i.name} ×${i.qty} = ${i.price*i.qty} جنيه`).join('\n')}\n━━━━━━━━━━━━━━\n💵 قيمة الطلب: ${sub} جنيه${couponLine}\n🛵 رسوم التوصيل: 20 جنيه\n💰 الإجمالي: ${total} جنيه${cnote?'\n📝 ملاحظة: '+cnote:''}`);
  window.open('https://wa.me/201000767058?text='+msg,'_blank');
  // Add to live orders queue
  if(typeof addOrderToQueue==='function'){
    addOrderToQueue({name,phone,addr,items:itemsTxt,total,coupon:appliedCoupon?.code||''});
  }
  addOrderToAdmin(name,phone,addr,cart.items,sub);
  // Route order copy to vendor dashboard
  if(typeof routeOrderToVendor==='function'){
    routeOrderToVendor({customerName:name,customerPhone:phone,customerAddr:addr,items:itemsTxt,total,restId:window.currentOpenRestId||''});
  }
  // ── Vendor WhatsApp notification ──
  const restId  =window.currentOpenRestId||'';
  const restName=cart.restName||'';
  const restWA  =cart.restWA||'';
  const itemsDetail=cart.items.map(i=>`• ${i.name} ×${i.qty} = ${i.price*i.qty} جنيه`).join('\n');
  const orderDetails=`👤 العميل: ${name}\n📱 ${phone}\n📍 ${addr}\n━━━━━━━━━━━━━━\n${itemsDetail}\n💰 الإجمالي: ${total} جنيه${appliedCoupon?'\n🏷️ كوبون: '+appliedCoupon.code:''}`;
  // Reset coupon
  appliedCoupon=null;
  const inp=document.getElementById('couponInput');if(inp)inp.value='';
  const fb=document.getElementById('couponFeedback');if(fb)fb.textContent='';
  clearCart();showToast('✅ تم إرسال طلبك!');
  // Notify vendor separately (after cart cleared, small delay)
  if(restId&&restWA&&restWA!=='01000767058'){
    setTimeout(()=>{
      if(confirm(`📩 إرسال إشعار واتساب للمطعم (${restName})؟`)){
        if(window.vendorWA)window.vendorWA[restId]=restWA;
        if(typeof sendWhatsAppToVendor==='function')sendWhatsAppToVendor(restId,restName,orderDetails);
      }
    },1500);
  }
}
function addOrderToAdmin(name,phone,addr,items,sub){
  const list=document.getElementById('admOrdersList');
  const empty=list.querySelector('[style*="color:var(--t3)"]');if(empty)empty.remove();
  const txt=items.map(i=>`${i.name}×${i.qty}`).join('، ');
  list.insertAdjacentHTML('afterbegin',`<div class="oitem"><div class="oitxt"><b>${name}</b><br><small style="color:var(--t3)">${phone} • ${addr}</small><br><small>${txt}</small><br><small style="color:var(--gold)">الإجمالي: ${sub+20} جنيه (منها ٢٠ عمولة)</small></div><span class="obdg obn" onclick="cycleOrder(this)">جديد</span></div>`);
  const n=parseInt(document.getElementById('stOrders').textContent)+1;
  document.getElementById('stOrders').textContent=n;
}
function cycleOrder(el){
  const s=[{c:'obn',t:'جديد'},{c:'obp',t:'جاري'},{c:'obd',t:'تم'}];
  const i=s.findIndex(x=>el.classList.contains(x.c));const n=s[(i+1)%s.length];
  s.forEach(x=>el.classList.remove(x.c));el.classList.add(n.c);el.textContent=n.t;
}

/* MARKET SOLD / DELETE */
function markSold(id){
  const el=document.getElementById(id);
  if(el){
    let badge=el.querySelector('.mkbdg');
    if(badge){badge.textContent='مباع';badge.className='mkbdg tr';badge.style.background='rgba(198,40,40,.3)';}
    el.style.opacity='0.6';
  }
  showToast('✅ تم وضع علامة مباع');
}
function deleteMarketItem(id){
  const el=document.getElementById(id);if(el)el.remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  showToast('🗑️ تم حذف الإعلان');
}
/* DELIVERY */
function selectAgent(idx,card){
  selectedAgent=idx;
  document.querySelectorAll('#deliveryAgentList .card').forEach((c,i)=>{
    const isSelected=(card&&c===card)||(card===undefined&&i===idx);
    c.style.border=isSelected?'2px solid var(--g2)':'1px solid var(--bd)';
    const mk=c.querySelector('.tag.tg');if(mk)mk.remove();
    if(isSelected){const cm=c.querySelector('.cmeta');if(cm)cm.insertAdjacentHTML('beforeend','<span class="tag tg" data-ar="✅ محدد" data-en="✅ Selected">✅ محدد</span>');}
  });
  if(card)selectedAgent=Array.from(document.querySelectorAll('#deliveryAgentList .card')).indexOf(card);
}
function submitOrder(){
  const name=document.getElementById('dName').value.trim();
  const phone=document.getElementById('dPhone').value.trim();
  const addr=document.getElementById('dAddr').value.trim();
  const rest=document.getElementById('dRest').value;
  const note=document.getElementById('dNote').value.trim();
  if(!name||!phone||!addr||!rest){showToast('⚠️ اكمل بيانات الطلب');return}
  const agentEl=document.getElementById('dagent-'+selectedAgent);
  const agent=agentEl?agentEl.querySelector('.cnm').textContent:'';
  const msg=encodeURIComponent(`🛵 طلب توصيل — قويسنا
━━━━━━━━━━━━━━
👤 الاسم: ${name}
📱 الهاتف: ${phone}
📍 العنوان: ${addr}
━━━━━━━━━━━━━━
🍽️ المطعم: ${rest}
📝 الطلب: ${note}
🛵 المندوب: ${agent}
💰 رسوم التوصيل: 20 جنيه`);
  window.open('https://wa.me/201000767058?text='+msg,'_blank');
  addOrderToAdmin(name,phone,addr,[{name:rest,qty:1}],0);
  ['dName','dPhone','dAddr','dNote'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('dRest').value='';
  showToast('✅ تم إرسال طلبك! 🛵');
}

/* FOOD CATEGORY MANAGER */
function addFoodCat(){
  const val=document.getElementById('aFoodCat-new')?document.getElementById('aFoodCat-new').value.trim():'';
  if(!val){showToast('⚠️ اكتب اسم القسم');return}
  const chips=document.getElementById('foodCatChips');
  if(chips){
    const btn=document.createElement('button');
    btn.className='chip';btn.textContent=val;
    btn.setAttribute('onclick',`filterChip(this,'foodList','${val}')`);
    chips.appendChild(btn);
  }
  // Add to type input suggestion (just show in field)
  const typeInp=document.getElementById('aR-type');
  if(typeInp&&!typeInp.value)typeInp.value=val;
  document.getElementById('aFoodCat-new').value='';
  showToast('✅ تم إضافة قسم '+val);
}
/* RESTAURANT ADMIN LIST BUILDER */
/* ══ NEW RESTAURANT ADMIN DASHBOARD FUNCTIONS ══ */
let currentEditRestId = null;

function showAddRestForm(){
  document.getElementById('restAdminListView').style.display='none';
  document.getElementById('restAddFormView').style.display='block';
  document.getElementById('restEditorView').style.display='none';
}
function hideAddRestForm(){
  document.getElementById('restAdminListView').style.display='block';
  document.getElementById('restAddFormView').style.display='none';
  document.getElementById('restEditorView').style.display='none';
}
function closeRestEditor(){
  document.getElementById('restAdminListView').style.display='block';
  document.getElementById('restAddFormView').style.display='none';
  document.getElementById('restEditorView').style.display='none';
  currentEditRestId=null;
}
function openRestEditor(id){
  currentEditRestId=id;
  document.getElementById('restAdminListView').style.display='none';
  document.getElementById('restAddFormView').style.display='none';
  document.getElementById('restEditorView').style.display='block';
  // Load data from card
  const card=document.querySelector(`[data-rest-id="${id}"]`)||document.querySelector(`#foodList .card:nth-child(${parseInt(id)+1})`);
  let nm='المطعم',type='',phone='',addr='';
  if(card){
    const nmEl=card.querySelector('.cnm');
    const sbEl=card.querySelector('.csub');
    nm=nmEl?nmEl.textContent:nm;
    type=sbEl?sbEl.textContent:'';
    phone=nmEl?nmEl.dataset.phone||'':'';
    addr=card.querySelector('.cloc')?card.querySelector('.cloc').textContent:'';
  }
  document.getElementById('restEditorTitle').textContent='تعديل: '+nm;
  document.getElementById('edit-R-name').value=nm;
  document.getElementById('edit-R-type').value=type;
  document.getElementById('edit-R-phone').value=phone;
  document.getElementById('edit-R-wa').value=phone;
  document.getElementById('edit-R-addr').value=addr;
  // Load existing menu items for this restaurant
  loadEditorMenuItems(id);
  switchRestTab('info');
}
function switchRestTab(tab){
  ['info','menu','photos','danger'].forEach(t=>{
    const c=document.getElementById('retab-content-'+t);
    const b=document.getElementById('retab-'+t);
    if(c)c.style.display=t===tab?'block':'none';
    if(b){
      b.style.background=t===tab?'var(--g2)':'transparent';
      b.style.color=t===tab?'#fff':'var(--t3)';
    }
  });
}
function adminSetStatus(status){
  if(currentEditRestId===null)return;
  setRestStatus('',status,currentEditRestId);
  showToast('✅ تم تغيير الحالة إلى '+status);
  // Update badge in list
  const badge=document.getElementById('rst-status-badge-'+currentEditRestId);
  if(badge){
    badge.textContent=status;
    badge.className='rst-status '+(status==='مفتوح'?'rst-open':status==='مشغول'?'rst-busy':'rst-closed');
  }
}
function saveRestInfo(){
  const id=currentEditRestId;
  if(id===null){showToast('⚠️ لم يتم تحديد مطعم');return;}
  const nm=document.getElementById('edit-R-name').value.trim();
  const type=document.getElementById('edit-R-type').value.trim();
  const phone=document.getElementById('edit-R-phone').value.trim();
  const wa=document.getElementById('edit-R-wa').value.trim();
  const addr=document.getElementById('edit-R-addr').value.trim();
  const fb=document.getElementById('edit-R-fb').value.trim();
  const rating=document.getElementById('edit-R-rating').value.trim();
  const discount=document.getElementById('edit-R-discount').value.trim();
  const openT=document.getElementById('edit-R-open').value;
  const closeT=document.getElementById('edit-R-close').value;
  if(!nm){showToast('⚠️ اكتب اسم المطعم');return;}
  // Find and update card
  const card=document.querySelector(`[data-rest-id="${id}"]`);
  if(card){
    const nmEl=card.querySelector('.cnm');
    const sbEl=card.querySelector('.csub');
    if(nmEl){nmEl.textContent=nm;nmEl.dataset.phone=phone;}
    if(sbEl)sbEl.textContent=type;
    // Persist to card dataset so openRestDetail reads correctly
    if(fb)card.dataset.fb=fb;
    card.dataset.discount=discount; // always update (even if empty to clear)
    if(addr)card.dataset.addr=addr;
    if(phone)card.dataset.phone=phone;
    if(wa)card.dataset.wa=wa;
    // Update location
    const locEl=card.querySelector('.cloc');
    if(locEl&&addr)locEl.textContent=addr;
    // Update rating
    if(rating){const rEl=card.querySelector('.stars-d');if(rEl)rEl.textContent='★ '+rating;}
    // Auto-add to promo banner if discount set
    if(discount){
      const existing=promoBannerData.findIndex(p=>p.restId===String(id));
      const promoEntry={title:nm+' — '+discount,sub:'عرض خاص لفترة محدودة',label:'🏷️ خصم',bg:'linear-gradient(135deg,#E85D04,#DC2F02)',link:'',restId:String(id)};
      if(existing>=0)promoBannerData[existing]=promoEntry;
      else promoBannerData.unshift(promoEntry);
      renderPromoBanner();renderPromoAdminList();
    }
  }
  // Update hours
  if(openT&&closeT){restHours[id]={open:openT,close:closeT};checkRestAutoStatus(id);}
  // Update admin card title
  const adminCard=document.querySelector(`#admRestList .rest-admin-card[onclick="openRestEditor(${id})"] div:nth-child(2) div:first-child`);
  if(adminCard)adminCard.textContent=nm;
  document.getElementById('restEditorTitle').textContent='تعديل: '+nm;
  // Save to QDB for real-time sync
  persistAllRestaurantsToQDB();
  showToast('✅ تم حفظ بيانات '+nm);
}
function loadEditorMenuItems(id){
  const wrap=document.getElementById('editorMenuItemsList');
  if(!wrap)return;
  wrap.innerHTML='';
  const menus=window.restaurantMenus||{};
  const items=menus[id]||[];
  if(!items.length){
    wrap.innerHTML='<div style="font-size:11px;color:var(--t3);text-align:center;padding:10px">لا توجد أصناف بعد. أضف من الفورم أعلاه</div>';
    return;
  }
  items.forEach((item,idx)=>{
    wrap.insertAdjacentHTML('beforeend',
      `<div id="menu-item-editor-${id}-${idx}" style="background:var(--s3);border-radius:9px;padding:8px 10px;margin-bottom:6px;border:1px solid var(--bd)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          ${item.img?`<img src="${item.img}" style="width:44px;height:44px;border-radius:7px;object-fit:cover;flex-shrink:0"/>`:'<div style="width:44px;height:44px;border-radius:7px;background:var(--orange-light);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🍽️</div>'}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:800;color:var(--t1)">${item.name}</div>
            <div style="font-size:10px;color:var(--t3)">${item.section||''} • <span style="color:var(--orange);font-weight:700">${item.price||''}</span></div>
            ${item.desc?`<div style="font-size:10px;color:var(--t3)">${item.desc}</div>`:''}
          </div>
        </div>
        <div id="menu-edit-form-${id}-${idx}" style="display:none;background:var(--s4);border-radius:8px;padding:8px;margin-bottom:6px">
          <div class="arow" style="margin-bottom:5px"><div><label class="albl">القسم</label><input type="text" id="edit-mSec-${id}-${idx}" value="${item.section||''}" style="width:100%;background:#fff;border:1.5px solid var(--bd2);border-radius:7px;padding:7px;font-size:11px;color:var(--t1);font-family:inherit;direction:rtl;outline:none"/></div><div><label class="albl">الاسم</label><input type="text" id="edit-mName-${id}-${idx}" value="${item.name||''}" style="width:100%;background:#fff;border:1.5px solid var(--bd2);border-radius:7px;padding:7px;font-size:11px;color:var(--t1);font-family:inherit;direction:rtl;outline:none"/></div></div>
          <div class="arow" style="margin-bottom:5px"><div><label class="albl">الوصف</label><input type="text" id="edit-mDesc-${id}-${idx}" value="${item.desc||''}" style="width:100%;background:#fff;border:1.5px solid var(--bd2);border-radius:7px;padding:7px;font-size:11px;color:var(--t1);font-family:inherit;direction:rtl;outline:none"/></div><div><label class="albl">السعر</label><input type="text" id="edit-mPrice-${id}-${idx}" value="${item.price||''}" style="width:100%;background:#fff;border:1.5px solid var(--bd2);border-radius:7px;padding:7px;font-size:11px;color:var(--t1);font-family:inherit;direction:rtl;outline:none"/></div></div>
          <div class="imgup" onclick="document.getElementById('edit-mImg-${id}-${idx}').click()" style="margin-bottom:5px"><div style="font-size:10px;color:var(--t3)">📷 تغيير صورة الطبق</div><input type="file" id="edit-mImg-${id}-${idx}" accept="image/*" onchange="updateMenuItemImg(${id},${idx},this)"/></div>
          <div style="display:flex;gap:5px">
            <button onclick="saveMenuItemEdit(${id},${idx})" style="flex:1;background:linear-gradient(135deg,var(--orange),var(--g1));color:#fff;border:none;border-radius:7px;padding:8px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit">💾 حفظ</button>
            <button onclick="document.getElementById('menu-edit-form-${id}-${idx}').style.display='none'" style="flex:1;background:var(--s3);border:1px solid var(--bd2);color:var(--t2);border-radius:7px;padding:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">إلغاء</button>
          </div>
        </div>
        <div style="display:flex;gap:5px">
          <button onclick="document.getElementById('menu-edit-form-${id}-${idx}').style.display=document.getElementById('menu-edit-form-${id}-${idx}').style.display==='none'?'block':'none'" style="flex:1;background:var(--orange-light);border:1px solid var(--orange-mid);color:var(--orange);border-radius:7px;padding:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">✏️ تعديل</button>
          <button onclick="deleteEditorMenuItem(${id},${idx})" style="background:rgba(198,40,40,.1);border:1px solid rgba(198,40,40,.2);color:#c62828;border-radius:7px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;border:none">🗑️</button>
        </div>
      </div>`
    );
  });
}
function deleteEditorMenuItem(restId,idx){
  if(!window.restaurantMenus||!window.restaurantMenus[restId])return;
  window.restaurantMenus[restId].splice(idx,1);
  loadEditorMenuItems(restId);
  showToast('🗑️ تم حذف الصنف');
}
function saveMenuItemEdit(restId,idx){
  if(!window.restaurantMenus||!window.restaurantMenus[restId])return;
  const item=window.restaurantMenus[restId][idx];
  if(!item)return;
  const sec=document.getElementById(`edit-mSec-${restId}-${idx}`)?.value.trim()||item.section;
  const name=document.getElementById(`edit-mName-${restId}-${idx}`)?.value.trim()||item.name;
  const desc=document.getElementById(`edit-mDesc-${restId}-${idx}`)?.value.trim()||item.desc;
  const price=document.getElementById(`edit-mPrice-${restId}-${idx}`)?.value.trim()||item.price;
  if(!name){showToast('⚠️ اكتب اسم الصنف');return;}
  window.restaurantMenus[restId][idx]={...item,section:sec,name,desc,price};
  // Also update restaurant detail page menu items
  document.querySelectorAll(`.menu-item-v2`).forEach(mi=>{
    const nm=mi.querySelector('.mi2-name');
    const pr=mi.querySelector('.mi2-price');
    const ds=mi.querySelector('.mi2-desc');
    if(nm&&nm.textContent===item.name){
      nm.textContent=name;
      if(pr)pr.textContent=price;
      if(ds)ds.textContent=desc;
    }
  });
  loadEditorMenuItems(restId);
  showToast('✅ تم تعديل '+name);
}
function updateMenuItemImg(restId,idx,input){
  if(!input.files||!input.files[0])return;
  const reader=new FileReader();
  reader.onload=e=>{
    if(!window.restaurantMenus||!window.restaurantMenus[restId])return;
    window.restaurantMenus[restId][idx].img=e.target.result;
    loadEditorMenuItems(restId);
    showToast('✅ تم تحديث صورة الطبق');
  };
  reader.readAsDataURL(input.files[0]);
}
function saveMenuItemFromEditor(){
  const id=currentEditRestId;
  if(id===null){showToast('⚠️ لم يتم تحديد مطعم');return;}
  const sec=document.getElementById('mSec').value.trim();
  const name=document.getElementById('mName').value.trim();
  const desc=document.getElementById('mDesc').value.trim();
  const price=document.getElementById('mPrice').value.trim();
  if(!name||!price){showToast('⚠️ اكتب اسم الصنف والسعر');return;}
  // Read image
  const imgFile=document.getElementById('mImg');
  const imgPrev=document.getElementById('mImgPrev');
  const imgSrc=imgPrev&&imgPrev.src&&imgPrev.src!==window.location.href?imgPrev.src:'';
  if(!window.restaurantMenus)window.restaurantMenus={};
  if(!window.restaurantMenus[id])window.restaurantMenus[id]=[];
  window.restaurantMenus[id].push({section:sec,name,desc,price,img:imgSrc});
  // Also call original saveMenuItem for compatibility
  document.getElementById('mSec').value=sec;
  document.getElementById('mName').value=name;
  document.getElementById('mDesc').value=desc;
  document.getElementById('mPrice').value=price;
  currentVendorId=id;
  saveMenuItem();
  // Reset form
  document.getElementById('mSec').value='';
  document.getElementById('mName').value='';
  document.getElementById('mDesc').value='';
  document.getElementById('mPrice').value='';
  document.getElementById('mImgPrev').src='';
  document.getElementById('mImgPrev').style.display='none';
  loadEditorMenuItems(id);
  showToast('✅ تم إضافة الصنف للمنيو');
}
function setRestHeroFromEditor(input){
  if(!input.files||!input.files[0])return;
  const id=currentEditRestId;
  const reader=new FileReader();
  reader.onload=e=>{
    // Update hero image in detail page when opened
    window.restHeroOverrides=window.restHeroOverrides||{};
    window.restHeroOverrides[id]=e.target.result;
    showToast('✅ تم تحديث صورة الغلاف');
  };
  reader.readAsDataURL(input.files[0]);
}
function setRestLogoFromEditor(input){
  if(!input.files||!input.files[0])return;
  const id=currentEditRestId;
  const reader=new FileReader();
  reader.onload=e=>{
    document.getElementById('edit-logo-prev').src=e.target.result;
    document.getElementById('edit-logo-prev').style.display='block';
    window.restLogoOverrides=window.restLogoOverrides||{};
    window.restLogoOverrides[id]=e.target.result;
    // Update thumbnail in food list card
    const thumb=document.getElementById('rt-'+id);
    if(thumb){thumb.innerHTML=`<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover"/>`;thumb.style.background='transparent';}
    // Also update any card that has data-rest-id matching
    const card=document.querySelector(`#foodList .card[data-rest-id="${id}"]`);
    if(card){const ct=card.querySelector('.cthumb');if(ct&&!ct.id){ct.innerHTML=`<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover"/>`;ct.style.background='transparent';}}
    // Update medical/craftsmen/education sections too using same pattern
    ['medList','craftList','admEduList','shopList'].forEach(listId=>{
      const listEl=document.getElementById(listId);if(!listEl)return;
      // These sections use data-logo-id or similar — skip, only food uses rest-id
    });
    showToast('✅ تم تحديث اللوجو');
  };
  reader.readAsDataURL(input.files[0]);
}
function toggleRestVisFromEditor(){
  if(currentEditRestId===null)return;
  toggleRestVis(currentEditRestId);
}
function deleteRestFromEditor(){
  if(currentEditRestId===null)return;
  if(!confirm('⚠️ هل أنت متأكد من حذف هذا المطعم نهائياً؟\nلا يمكن التراجع عن هذه العملية.'))return;
  const id=currentEditRestId;
  // Remove from food list - try by data-rest-id first
  let card=document.querySelector(`#foodList .card[data-rest-id="${id}"]`);
  if(!card){
    // Try numeric index fallback
    const num=parseInt(id);
    if(!isNaN(num)){const cards=document.querySelectorAll('#foodList .card');if(cards[num])card=cards[num];}
  }
  if(card)card.remove();
  // Remove from admin rest list
  const admCard=document.querySelector(`#admRestList [onclick*="openRestEditor('${id}')"]`) ||
                document.querySelector(`#admRestList [onclick*="openRestEditor(${id})"]`);
  if(admCard)admCard.closest('.rest-admin-card')?.remove()||admCard.remove();
  // Update counter
  const n=parseInt(document.getElementById('stRest').textContent||'0')-1;
  document.getElementById('stRest').textContent=Math.max(0,n);
  // Go back to list
  document.getElementById('restEditorView').style.display='none';
  document.getElementById('restAdminListView').style.display='block';
  currentEditRestId=null;
  showToast('🗑️ تم حذف المطعم بنجاح');
  setTimeout(()=>{try{persistAllRestaurantsToQDB();}catch(e){}},300);
}

function refreshRestAdminList(){
  const list=document.getElementById('admRestList');
  if(!list)return;
  list.innerHTML='';
  const emojis=['🍽️','🍜','☕','🍔','🍕','🥙','🍣'];
  document.querySelectorAll('#foodList .card').forEach((card,idx)=>{
    const nmEl=card.querySelector('.cnm');if(!nmEl)return;
    const nm=nmEl.textContent;
    const sbEl=card.querySelector('.csub');
    const type=sbEl?sbEl.textContent:'';
    const rid=card.dataset.restId||idx;
    const statusEl=document.getElementById('rst-status-'+rid);
    const status=statusEl?statusEl.textContent:'مفتوح';
    const statusCls=status==='مفتوح'?'rst-open':status==='مشغول'?'rst-busy':'rst-closed';
    const emoji=emojis[idx%emojis.length];
    list.insertAdjacentHTML('beforeend',
      `<div class="rest-admin-card" onclick="openRestEditor('${rid}')" style="background:var(--s2);border:1px solid var(--bd2);border-radius:12px;padding:11px 13px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='var(--s3)'" onmouseout="this.style.background='var(--s2)'">
        <div style="width:40px;height:40px;border-radius:10px;background:var(--s4);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${emoji}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:800;color:var(--t1)">${nm}</div>
          <div style="font-size:11px;color:var(--t3);margin-top:2px">${type||'مطعم'} • اضغط للتعديل</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <span id="rst-status-badge-${rid}" class="rst-status ${statusCls}">${status}</span>
          <span style="font-size:10px;color:var(--gold)">← تعديل</span>
        </div>
      </div>`
    );
  });
}
/* ══ END NEW RESTAURANT ADMIN FUNCTIONS ══ */


/* RESTAURANT HOURS + AUTO STATUS */
const restHours={}; // id -> {open:'HH:MM', close:'HH:MM'}
function setRestHours(id){
  const open=prompt('وقت الفتح (مثال: 10:00):','10:00');
  if(!open)return;
  const close=prompt('وقت الإغلاق (مثال: 23:00):','23:00');
  if(!close)return;
  restHours[id]={open,close};
  checkRestAutoStatus(id);
  showToast('✅ تم حفظ مواعيد المطعم — سيتحكم فيها تلقائياً');
}
function checkRestAutoStatus(id){
  if(!restHours[id])return;
  const now=new Date();
  const [oh,om]=restHours[id].open.split(':').map(Number);
  const [ch,cm]=restHours[id].close.split(':').map(Number);
  const openMins=oh*60+om;
  const closeMins=ch*60+cm;
  const nowMins=now.getHours()*60+now.getMinutes();
  const isOpen=closeMins>openMins?nowMins>=openMins&&nowMins<closeMins:nowMins>=openMins||nowMins<closeMins;
  setRestStatus('auto',isOpen?'مفتوح':'مغلق',id);
}
function deleteRest(id,btn){
  // Find by data-rest-id first, then by index
  let card=document.querySelector(`#foodList .card[data-rest-id="${id}"]`);
  if(!card){const cards=document.querySelectorAll('#foodList .card');if(cards[id])card=cards[id];}
  if(card)card.remove();
  const ali=btn?btn.closest('.ali'):null;if(ali)ali.remove();
  // Remove from admin list if exists
  const admCard=document.querySelector(`#admRestList [onclick*="openRestEditor('${id}')"]`);
  if(admCard)admCard.closest('.rest-admin-card')?.remove();
  const n=parseInt(document.getElementById('stRest').textContent)-1;
  document.getElementById('stRest').textContent=Math.max(0,n);
  showToast('🗑️ تم حذف المطعم');
  setTimeout(()=>{try{persistAllRestaurantsToQDB();}catch(e){}},300);
}
// Check all restaurants auto-status every minute
setInterval(()=>{Object.keys(restHours).forEach(id=>checkRestAutoStatus(parseInt(id)))},60000);
/* RESTAURANT STATUS */
function setRestStatus(name,status,id){
  const el=document.getElementById('rst-status-'+id);
  if(!el)return;
  el.className='rst-status '+(status==='مفتوح'?'rst-open':status==='مشغول'?'rst-busy':'rst-closed');
  el.textContent=status;
  showToast('✅ '+name+' — '+status);
}
function toggleRestVis(id){
  const cards=document.querySelectorAll('#foodList .card');
  if(cards[id]){
    const hidden=cards[id].style.display==='none';
    cards[id].style.display=hidden?'':'none';
    showToast(hidden?'✅ تم إظهار المطعم':'✅ تم إخفاء المطعم');
  }
}

/* MENU ADD */
let menuTargetRest=0;
function addMenuToRest(id){
  menuTargetRest=id;
  const names=['مطعم الشاطر','كشري العمدة','كافيه النيل'];
  document.getElementById('menuRestName').textContent=names[id]||'المطعم';
  document.getElementById('menuAddForm').style.display='block';
}
function saveMenuItem(){
  const sec=document.getElementById('mSec').value.trim();
  const name=document.getElementById('mName').value.trim();
  const desc=document.getElementById('mDesc').value.trim();
  const price=document.getElementById('mPrice').value.trim();
  const prev=document.getElementById('mImgPrev');
  if(!name){showToast('⚠️ اكتب اسم الصنف');return}
  const wrap=document.getElementById('rdMenuWrap');
  // Find or create section
  let secHdr=null;
  wrap.querySelectorAll('.menu-sec-hdr span').forEach(el=>{if(el.textContent.includes(sec))secHdr=el.closest('.menu-sec-hdr')});
  if(!secHdr&&sec){
    const h=document.createElement('div');h.className='menu-sec-hdr';h.innerHTML=`<span>🍽️ ${sec}</span>`;
    wrap.appendChild(h);
  }
  const imgHTML=prev&&prev.style.display!=='none'?`<img src="${prev.src}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;margin-left:6px"/>`:'';
  const mi=document.createElement('div');mi.className='menu-item';
  mi.innerHTML=`${imgHTML}<div class="mi-left"><div class="mi-name">${name}</div><div class="mi-desc">${desc}</div></div><div class="mi-right"><div class="mi-price">${price}</div><button class="add-cart-btn" onclick="addCart('${name}',${parseInt(price)||0},event)">+ سلة</button></div>`;
  wrap.appendChild(mi);
  ['mSec','mName','mDesc','mPrice'].forEach(id=>document.getElementById(id).value='');
  if(prev)prev.style.display='none';
  showToast('✅ تم إضافة الصنف للمنيو');
}

/* CRAFT STATUS */
function setCraftStatus(id,status){
  const el=document.getElementById('cs-'+id);
  if(!el)return;
  el.className=status==='متاح'?'avon':'avoff';
  el.textContent=status==='متاح'?'متاح الآن':status;
  showToast('✅ تم تغيير الحالة');
}
function toggleCraftVis(id){
  const cards=document.querySelectorAll('#craftList .card');
  if(cards[id]){const h=cards[id].style.display==='none';cards[id].style.display=h?'':'none';showToast(h?'✅ تم الإظهار':'✅ تم الإخفاء')}
}

/* AGENTS */
function setAgentSt(id,status){
  // support both numeric id (dagent-N) and full string id
  const card=document.getElementById('dagent-'+id)||document.getElementById(id);if(!card)return;
  const avEl=card.querySelector('.avon,.avoff');
  if(avEl){avEl.className=status==='متاح'?'avon':'avoff';avEl.textContent=status==='متاح'?'متاح':status}
  showToast('✅ تم تغيير حالة المندوب');
}
function toggleAgentVis(id){
  const card=document.getElementById('dagent-'+id);if(!card)return;
  const h=card.style.display==='none';card.style.display=h?'':'none';showToast(h?'✅ تم الإظهار':'✅ تم الإخفاء');
}
function addAgent(){
  const name=document.getElementById('aAg-name').value.trim();
  const phone=document.getElementById('aAg-phone').value.trim();
  if(!name){showToast('⚠️ اكتب اسم المندوب');return}
  const agId='dagent-'+Date.now();
  const agIdx=document.querySelectorAll('#deliveryAgentList .card').length;
  const list=document.getElementById('deliveryAgentList');
  list.insertAdjacentHTML('beforeend',`<div class="card" id="${agId}" onclick="selectAgent(${agIdx},this)" data-agent-idx="${agIdx}"><div class="crow"><div class="cthumb" style="background:#142b1c;font-size:28px;display:flex;align-items:center;justify-content:center">🛵</div><div class="cinfo"><div class="cnm">${name}</div><div class="csub">متاح • ٢٠ جنيه/مشوار${phone?' — '+phone:''}</div><div class="cmeta"><span class="avon" data-ar="متاح الآن" data-en="Available Now" id="av-${agId}">متاح</span></div></div></div></div>`);
  // Add to delivery restaurant select
  const dRest=document.getElementById('dRest');
  // just keep existing options
  document.getElementById('admAgentList').insertAdjacentHTML('afterbegin',`<div class="ali" id="adm-${agId}"><span class="alinm">${name}</span><div class="alibtns"><span class="asi asi-h" onclick="setAgentSt('${agId}','متاح')">متاح</span><span class="asi asi-busy" onclick="setAgentSt('${agId}','مشغول')">مشغول</span><span class="asi asi-d" onclick="deleteAgentItem('${agId}')">حذف</span></div></div>`);
  ['aAg-name','aAg-phone'].forEach(i=>document.getElementById(i).value='');
  showToast('✅ تم إضافة المندوب');
}

/* EDIT SERVICE */
function editService(id,name,phone){
  const el=document.getElementById(id);if(el)el.remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  document.getElementById('aSV-name').value=name;
  document.getElementById('aSV-phone').value=phone;
  admTab('t-services',document.querySelector('[onclick*="t-services"]'));
  openAdmin();showToast('✏️ عدّل الخدمة وأضفها من جديد');
}
/* DELETE CRAFTSMAN */
function deleteCraftsman(id,btn){
  const cards=document.querySelectorAll('#craftList .card');
  if(cards[id])cards[id].remove();
  const ali=btn.closest('.ali');if(ali)ali.remove();
  showToast('🗑️ تم حذف الأسطى');
}
/* DELETE AGENT */
function deleteAgentItem(id){
  const el=document.getElementById(id);if(el)el.remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  showToast('🗑️ تم حذف المندوب');
}
/* RATING */
function doRate(el,val,type){
  const map={rest:'restSR',med:'medSR',craft:'craftSR'};
  document.querySelectorAll('#'+map[type]+' span').forEach((s,i)=>s.classList.toggle('on',i<val));
  showToast('شكراً! تقييمك '+val+' ★');
}

/* LOGO */
function chgLogo(input){
  if(input.files&&input.files[0]){
    const r=new FileReader();r.onload=e=>{
      const src=e.target.result;
      // Header logo
      const img=document.getElementById('logoImg');img.src=src;img.style.display='block';
      document.getElementById('logoSvg').style.display='none';
      // Profile page logo
      applyLogoToProfile(src);
      // Auth page logo
      applyLogoToAuth(src);
      // Save to localStorage for persistence
      try{localStorage.setItem('quesina_app_logo',src);}catch(ex){}
    };r.readAsDataURL(input.files[0]);
  }
}
function applyLogoToProfile(src){
  const wrap=document.getElementById('profileAppLogo');
  if(!wrap)return;
  wrap.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:10px"/>`;
}
function applyLogoToAuth(src){
  const wrap=document.getElementById('authAppLogoWrap');
  if(!wrap)return;
  wrap.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:14px"/>`;
}
// Restore logo on load
window.addEventListener('load',()=>{
  try{
    const saved=localStorage.getItem('quesina_app_logo');
    if(saved){
      const img=document.getElementById('logoImg');if(img){img.src=saved;img.style.display='block';}
      const sv=document.getElementById('logoSvg');if(sv)sv.style.display='none';
      applyLogoToProfile(saved);
      applyLogoToAuth(saved);
    }
  }catch(ex){}
});

/* NOTIF */
function toggleNotif(){
  // Open full notification center
  const page=document.getElementById('notifCenterPage');
  if(page){
    page.style.display='flex';
    loadNotifCenter();
  } else {
    const p=document.getElementById('notifPanel');
    if(p)p.style.display=p.style.display==='none'?'block':'none';
  }
  document.getElementById('ndot').style.display='none';
}
// ══ NOTIFICATION CENTER ══
let allNotifications=[];
try{allNotifications=JSON.parse(localStorage.getItem('quesina_notif_center')||'[]');}catch(e){}
let notifFilter='';

function addToNotifCenter(notif){
  allNotifications.unshift({...notif,id:'nc_'+Date.now(),read:false,ts:new Date().toLocaleTimeString('ar-EG')});
  if(allNotifications.length>100)allNotifications=allNotifications.slice(0,100);
  try{localStorage.setItem('quesina_notif_center',JSON.stringify(allNotifications));}catch(e){}
  updateNotifBadge();
}

function updateNotifBadge(){
  const unread=allNotifications.filter(n=>!n.read).length;
  const dot=document.getElementById('ndot');
  if(dot)dot.style.display=unread>0?'block':'none';
}

function loadNotifCenter(){
  const list=document.getElementById('notifCenterList');
  if(!list)return;
  const filtered=notifFilter?allNotifications.filter(n=>n.text&&n.text.includes(notifFilter)):allNotifications;
  if(!filtered.length){
    list.innerHTML='<div style="text-align:center;padding:40px 20px;color:#bbb"><div style="font-size:48px;margin-bottom:12px">🔔</div><div style="font-size:14px;font-weight:700">لا توجد إشعارات</div></div>';
    return;
  }
  list.innerHTML='';
  filtered.forEach(n=>{
    const iconMap={'طلب':'📦','كهرباء':'⚡','مياه':'💧','عرض':'🏷️','خبر':'📰','حجز':'📅'};
    const ico=Object.keys(iconMap).find(k=>n.text&&n.text.includes(k));
    const icon=ico?iconMap[ico]:(n.icon||'🔔');
    list.insertAdjacentHTML('beforeend',`
      <div onclick="markNotifRead('${n.id}')" style="background:${n.read?'#fff':'#fff8f2'};border-radius:14px;padding:12px 14px;margin-bottom:8px;display:flex;gap:10px;align-items:flex-start;box-shadow:0 2px 8px rgba(0,0,0,.05);border:${n.read?'1px solid #f0f0f0':'1.5px solid rgba(232,93,4,.15)'};cursor:pointer">
        <div style="width:40px;height:40px;border-radius:50%;background:${n.read?'#f5f5f5':'rgba(232,93,4,.1)'};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:${n.read?'600':'800'};color:#1a1a1a;line-height:1.4">${n.text||''}</div>
          <div style="font-size:10px;color:#aaa;margin-top:4px">⏰ ${n.ts||''}</div>
        </div>
        ${!n.read?'<div style="width:8px;height:8px;border-radius:50%;background:#E85D04;flex-shrink:0;margin-top:4px"></div>':''}
      </div>`);
  });
  // Mark all as read
  allNotifications.forEach(n=>n.read=true);
  try{localStorage.setItem('quesina_notif_center',JSON.stringify(allNotifications));}catch(e){}
  updateNotifBadge();
}

function filterNotifs(type){
  notifFilter=type;
  ['all','orders','power','offers'].forEach(k=>{
    const b=document.getElementById('nf-'+k);
    if(b){b.style.color=b.id===('nf-'+(type===''?'all':type==='طلب'?'orders':type==='كهرباء'?'power':'offers'))?'#E85D04':'#9a9a9a';
    b.style.borderBottomColor=b.id===('nf-'+(type===''?'all':type==='طلب'?'orders':type==='كهرباء'?'power':'offers'))?'#E85D04':'transparent';}
  });
  loadNotifCenter();
}

function clearAllNotifs(){
  allNotifications=[];
  try{localStorage.removeItem('quesina_notif_center');}catch(e){}
  updateNotifBadge();
  loadNotifCenter();
  showToast('✅ تم مسح كل الإشعارات');
}

function markNotifRead(id){
  const n=allNotifications.find(x=>x.id===id);
  if(n)n.read=true;
  try{localStorage.setItem('quesina_notif_center',JSON.stringify(allNotifications));}catch(e){}
}

function openNotifCenter(){
  const page=document.getElementById('notifCenterPage');
  if(page){page.style.display='flex';loadNotifCenter();}
}

function sendNotif(){
  const type=document.getElementById('aNt-type').value;
  const text=document.getElementById('aNt-text').value.trim();
  const expiry=document.getElementById('aNt-expiry').value;
  if(!text){showToast('⚠️ اكتب نص الإشعار');return}
  if(expiry&&new Date(expiry)<new Date()){showToast('⚠️ تاريخ الانتهاء في الماضي');return}
  const notifId='notif-'+Date.now();
  const expiryLabel=expiry?'<div style="font-size:10px;color:var(--gold);margin-top:1px">ينتهي: '+new Date(expiry).toLocaleString('ar-EG')+'</div>':'';
  document.getElementById('nbtxt').textContent=type+' '+text;
  document.getElementById('nb').classList.add('show');
  document.getElementById('ndot').style.display='block';
  const notifDiv=document.createElement('div');
  notifDiv.id=notifId;
  notifDiv.style.cssText='display:flex;gap:8px;padding:8px;background:rgba(232,93,4,.05);border-radius:8px;margin-bottom:6px';
  notifDiv.innerHTML=`<span style="font-size:18px">${type.split(' ')[0]}</span><div style="flex:1"><div style="font-size:12px;color:#1a1a1a;font-weight:600">${text}</div><div style="font-size:10px;color:var(--t3);margin-top:2px">الآن</div>${expiryLabel}</div>`;
  document.getElementById('notifList').insertBefore(notifDiv,document.getElementById('notifList').firstChild);
  document.getElementById('admNotifList').insertAdjacentHTML('afterbegin',`<div class="ali" id="adm-${notifId}"><span class="alinm">${text}</span><div class="alibtns"><span class="asi asi-d" onclick="deleteNotif('${notifId}')">حذف</span></div></div>`);
  document.getElementById('aNt-text').value='';
  document.getElementById('aNt-expiry').value='';
  if(expiry){const ms=new Date(expiry)-new Date();if(ms>0)setTimeout(()=>deleteNotif(notifId),ms);}
  // Add to notification center
  if(typeof addToNotifCenter==='function'){
    addToNotifCenter({text:type+' '+text,icon:type.split(' ')[0],type:'admin'});
  }
  showToast('📢 تم الإشعار');
}
function deleteNotif(id){
  const el=document.getElementById(id);if(el)el.remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  if(!document.getElementById('notifList').children.length){
    document.getElementById('nb').classList.remove('show');
    document.getElementById('ndot').style.display='none';
  }
  showToast('🗑️ تم حذف الإشعار');
}

/* EMERGENCY */
function toggleEmerg(){document.getElementById('epanel').classList.toggle('open')}
document.addEventListener('click',function(e){const p=document.getElementById('epanel');const b=document.querySelector('.femerg');if(!p.contains(e.target)&&!b.contains(e.target))p.classList.remove('open')});

/* ADS SLIDER */
let adsCur=0;
function slideAds(){
  const track=document.getElementById('adsTrack');const slides=track.querySelectorAll('.ads-slide');
  if(slides.length<2)return;
  adsCur=(adsCur+1)%slides.length;
  track.style.transform=`translateX(${adsCur*100}%)`;
  document.querySelectorAll('.ads-dot').forEach((d,i)=>d.classList.toggle('active',i===adsCur));
}
function initAds(){
  const slides=document.getElementById('adsTrack').querySelectorAll('.ads-slide');
  const dots=document.getElementById('adsDots');
  dots.innerHTML=[...slides].map((_,i)=>`<div class="ads-dot${i===0?' active':''}"></div>`).join('');
}
function addAd(){
  const text=document.getElementById('aAd-text').value.trim();
  const prev=document.getElementById('aAd-prev');
  if(!text&&(!prev||prev.style.display==='none')){showToast('⚠️ أضف نص أو صورة');return}
  const track=document.getElementById('adsTrack');
  const slide=document.createElement('div');slide.className='ads-slide';
  if(prev&&prev.style.display!=='none'){
    slide.innerHTML=`<img src="${prev.src}" style="width:100%;height:100%;object-fit:cover;border-radius:10px"/>`;
  } else {
    slide.innerHTML=`<div class="ads-placeholder" onclick="contactAd()"><div style="font-size:24px">📢</div><div style="font-weight:800;font-size:13px">${text}</div></div>`;
  }
  const adId='ad-'+Date.now();
  slide.id=adId;
  track.appendChild(slide);
  document.getElementById('admAdList').insertAdjacentHTML('afterbegin',`<div class="ali" id="adm-${adId}"><span class="alinm">${text||'إعلان بصورة'}</span><div class="alibtns"><span class="asi asi-ok" onclick="editAdItem('${adId}','${text}')">تعديل</span><span class="asi asi-d" onclick="deleteAdItem('${adId}')">حذف</span></div></div>`);
  document.getElementById('aAd-text').value='';
  if(prev)prev.style.display='none';
  // handle expiry
  const adExpiry=document.getElementById('aAd-expiry')?document.getElementById('aAd-expiry').value:'';
  if(adExpiry){const ms=new Date(adExpiry)-new Date();if(ms>0)setTimeout(()=>{const s=document.getElementById(adId);if(s)s.remove();initAds();},ms);}
  initAds();
  showToast('✅ إعلان تم إضافته');
}
function contactAd(){window.open('https://wa.me/201000767058?text=أريد الإعلان في تطبيق Quesina City','_blank')}
setInterval(slideAds,4000);
// Swipe support for ads slider
(function(){
  let sx=0,sy=0;
  const sl=document.getElementById('adsSlider');
  if(!sl)return;
  sl.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  sl.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-sx;
    const dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>40){
      const track=document.getElementById('adsTrack');
      const slides=track.querySelectorAll('.ads-slide');
      if(slides.length<2)return;
      if(dx<0)adsCur=(adsCur+1)%slides.length;
      else adsCur=(adsCur-1+slides.length)%slides.length;
      track.style.transform=`translateX(${adsCur*100}%)`;
      document.querySelectorAll('.ads-dot').forEach((d,i)=>d.classList.toggle('active',i===adsCur));
    }
  },{passive:true});
})();

/* AD DELETE / EDIT */
function deleteAdItem(id){
  const el=document.getElementById(id);if(el)el.remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  initAds();showToast('🗑️ تم حذف الإعلان');
}
function editAdItem(id,text){
  deleteAdItem(id);
  document.getElementById('aAd-text').value=text||'';
  admTab('t-ads',document.querySelector('[onclick*="t-ads"]'));
  openAdmin();showToast('✏️ عدّل الإعلان وأضفه من جديد');
}
/* FILTER */
function filterChip(btn,lid,cat){
  btn.closest('.chips').querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));btn.classList.add('active');
  document.querySelectorAll('#'+lid+' [data-cat]').forEach(el=>{el.style.display=(!cat||el.dataset.cat===cat)?'':'none'});
}
function filterTxt(q,lid,cls){
  document.querySelectorAll('#'+lid+' .'+cls).forEach(el=>{
    const parent=el.closest('[data-cat]')||el.closest('.jc')||el.closest('.card');
    if(parent)parent.style.display=el.textContent.includes(q)?'':'none';
  });
}

/* ED TABS */
function showEdTab(tab){
  ['centers','teachers','nursery','library','books'].forEach(t=>{const el=document.getElementById('edTab-'+t);if(el)el.style.display=t===tab?'block':'none'});
  document.querySelectorAll('#s-education .chip').forEach((c,i)=>c.classList.toggle('active',['centers','teachers','nursery','library','books'][i]===tab));
}

/* SPORT */
function showSportTab(tab){
  document.getElementById('sportTab-results').style.display=tab==='results'?'block':'none';
  document.getElementById('sportTab-table').style.display=tab==='table'?'block':'none';
  document.querySelectorAll('#s-sport .chip').forEach((c,i)=>c.classList.toggle('active',['results','table'][i]===tab));
}
function addResult(){
  const t1=document.getElementById('aS-t1').value.trim();const t2=document.getElementById('aS-t2').value.trim();
  const g1=parseInt(document.getElementById('aS-g1').value)||0;const g2=parseInt(document.getElementById('aS-g2').value)||0;
  if(!t1||!t2){showToast('⚠️ أدخل الفريقين');return}
  const win=g1>g2?'فوز ✅':g1<g2?'خسارة ❌':'تعادل 🤝';
  document.getElementById('resultsList').insertAdjacentHTML('afterbegin',`<div class="result-card"><div class="res-team">${t1}</div><div class="res-score"><div class="res-sc">${g1} - ${g2}</div><div class="res-lbl">${win}</div></div><div class="res-team">${t2}</div></div>`);
  ['aS-t1','aS-t2','aS-g1','aS-g2'].forEach(id=>document.getElementById(id).value='');
  showToast('✅ تم إضافة النتيجة');
}
function addLeagueRow(){
  const name=document.getElementById('aST-name').value.trim();
  const p=document.getElementById('aST-p').value||'0';const w=document.getElementById('aST-w').value||'0';
  const d=document.getElementById('aST-d').value||'0';const l=document.getElementById('aST-l').value||'0';
  const pts=document.getElementById('aST-pts').value||'0';const gf=document.getElementById('aST-gf').value||'0';const ga=document.getElementById('aST-ga').value||'0';
  const promo=document.getElementById('aST-promo').checked;
  if(!name){showToast('⚠️ اكتب اسم الفريق');return}
  const tbody=document.getElementById('leagueTbody');const rank=tbody.querySelectorAll('tr').length+1;
  const tr=document.createElement('tr');if(promo)tr.className='promo';
  tr.innerHTML=`<td>${rank}</td><td>${name}</td><td>${p}</td><td>${w}</td><td>${d}</td><td>${l}</td><td>${gf}</td><td>${ga}</td><td>${pts}</td>`;
  tbody.appendChild(tr);
  ['aST-name','aST-p','aST-w','aST-d','aST-l','aST-pts','aST-gf','aST-ga'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('aST-promo').checked=false;
  showToast('✅ تم إضافة الفريق');
}
function clearLeague(){document.getElementById('leagueTbody').innerHTML='';showToast('🗑️ تم مسح الجدول')}
function saveLeagueNote(){
  const note=document.getElementById('aLeagueNote').value.trim();
  document.getElementById('leagueNote').textContent=note;
  showToast('✅ تم حفظ الملاحظة');
}

/* JOB STATUS */
function markJobUnavailable(id){
  const el=document.getElementById(id);
  if(el){
    let badge=el.querySelector('.tag.tg');
    if(badge){badge.textContent='ليس متاحاً';badge.className='tag tr';}
    el.style.opacity='0.5';
  }
  showToast('✅ تم وضع ليس متاحاً');
}
function deleteJobItem(id){
  const el=document.getElementById(id);if(el)el.remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  showToast('🗑️ تم حذف الوظيفة');
}
/* EDIT TRANSPORT */
function editTransport(id,num,dest,dep,price,type){
  const el=document.getElementById(id);if(el)el.remove();
  document.getElementById('aT-num').value=num;
  document.getElementById('aT-dest').value=dest;
  document.getElementById('aT-dep').value=dep;
  document.getElementById('aT-price').value=price;
  document.getElementById('aT-type').value=type;
  admTab('t-transport',document.querySelector('[onclick*="t-transport"]'));
  openAdmin();showToast('✏️ عدّل بيانات الرحلة وأضفها من جديد');
}
/* ADD CONTENT */
function addNews(){
  const title=document.getElementById('aN-title').value.trim();const cat=document.getElementById('aN-cat').value;
  const date=document.getElementById('aN-date').value||'الآن';const body=document.getElementById('aN-body').value.trim();
  const en_title=(document.getElementById('aN-title-en')?.value||'').trim();
  const en_body=(document.getElementById('aN-body-en')?.value||'').trim();
  const prev=document.getElementById('aN-prev');const imgSrc=prev&&prev.style.display!=='none'?prev.src:'';
  if(!title){showToast('⚠️ اكتب عنوان الخبر');return}
  const clsMap={أخبار:'ncg',رياضة:'ncb',تعليم:'ncb',صحة:'ncr'};const cls=clsMap[cat]||'ncg';
  const nc=document.createElement('div');nc.className='nc';nc.dataset.cat=cat;
  const d={title,cat,date,body,img:imgSrc};
  if(en_title) d.en_title=en_title;
  if(en_body)  d.en_body=en_body;
  const newsId='news-'+Date.now();
  nc.id=newsId;
  nc.setAttribute('onclick',`openNewsDetail(${JSON.stringify(d)})`);
  nc.innerHTML=`<div class="nth">${imgSrc?`<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover"/>`:`<svg width="34" height="34" viewBox="0 0 34 34" fill="none"><rect x="3" y="5" width="28" height="24" rx="5" fill="#1a3d22" stroke="#43a047" stroke-width="1"/><rect x="7" y="11" width="20" height="3" rx="1.5" fill="#66bb6a"/></svg>`}</div><div class="nbdy"><span class="ncat ${cls}">${cat}</span><div class="ntit">${title}</div><div class="ndt">${date}</div></div>`;
  document.getElementById('newsList').insertBefore(nc,document.getElementById('newsList').firstChild);
  document.getElementById('admNewsList').insertAdjacentHTML('afterbegin',`<div class="rest-admin-card" onclick="openNewsEdit('${newsId}','${title.replace(/'/g,"\\'")}','${cat}','${date}','')" style="background:var(--s2);border:1px solid var(--bd2);border-radius:12px;padding:11px 13px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:10px"><div style="width:40px;height:40px;border-radius:10px;background:var(--orange-light);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">📰</div><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${title}</div><div style="font-size:11px;color:var(--t3)">${cat} • اضغط للتعديل</div></div><span style="font-size:10px;color:var(--orange);flex-shrink:0">← تعديل</span></div>`);
  const n=parseInt(document.getElementById('stNews').textContent)+1;document.getElementById('stNews').textContent=n;
  ['aN-title','aN-title-en','aN-body','aN-body-en','aN-date'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  if(prev)prev.style.display='none';
  showToast('✅ تم إضافة الخبر');askPushNotif('الأخبار',title);closeAdmin();goTo('news');
}
function addRestaurant(){
  const name=document.getElementById('aR-name').value.trim();const type=document.getElementById('aR-type').value.trim();
  const phone=document.getElementById('aR-phone').value.trim();const wa=document.getElementById('aR-wa').value.trim()||phone;
  const addr=document.getElementById('aR-addr').value.trim();const prev=document.getElementById('aR-prev');
  const imgSrc=prev&&prev.style.display!=='none'?prev.src:'';
  const openTime=document.getElementById('aR-open')?document.getElementById('aR-open').value:'';
  const closeTime=document.getElementById('aR-close')?document.getElementById('aR-close').value:'';
  const fbUrl=document.getElementById('aR-fb')?document.getElementById('aR-fb').value.trim():'';
  const rating=document.getElementById('aR-rating')?document.getElementById('aR-rating').value.trim():'';
  const discount=document.getElementById('aR-discount')?document.getElementById('aR-discount').value.trim():'';
  if(!name){showToast('⚠️ اكتب اسم المطعم');return}
  const newId=document.querySelectorAll('#foodList .card').length;
  const card=document.createElement('div');card.className='card';card.dataset.cat=type;card.dataset.restId=newId;
  card.setAttribute('onclick','openRestDetail(this)');
  if(fbUrl)card.dataset.fb=fbUrl;
  if(rating)card.dataset.rating=rating;
  if(discount)card.dataset.discount=discount;
  const fbBadge=fbUrl?`<a class="rest-fb-badge" href="${fbUrl}" target="_blank" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>`:'';
  const thumb=imgSrc?`<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover"/>`:`<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" fill="#1a3d22" stroke="#43a047" stroke-width="1"/></svg>`;
  card.innerHTML=`<div class="crow"><div class="cthumb" id="rt-${newId}">${thumb}</div><div class="cinfo"><div class="cnm">${name}</div><div class="csub">${type||'متنوع'}</div><div class="cmeta"><span class="stars-d">★★★★ جديد</span><span class="rst-status rst-open" id="rst-status-${newId}">مفتوح</span>${fbBadge}</div></div></div><div class="abtns"><a class="bc" href="tel:${phone}">📞 اتصل</a><a class="bw" href="https://wa.me/2${wa.replace(/^0/,'')}?text=طلب من ${name}" target="_blank">📩 طلب</a></div>`;
  document.getElementById('foodList').insertBefore(card,document.getElementById('foodList').firstChild);
  refreshRestAdminList();
  if(openTime&&closeTime)restHours[newId]={open:openTime,close:closeTime};
  const n=parseInt(document.getElementById('stRest').textContent)+1;document.getElementById('stRest').textContent=n;
  ['aR-name','aR-type','aR-phone','aR-wa','aR-addr','aR-fb','aR-rating'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  if(document.getElementById('aR-open'))document.getElementById('aR-open').value='10:00';
  if(document.getElementById('aR-close'))document.getElementById('aR-close').value='23:00';
  if(prev)prev.style.display='none';
  showToast('✅ تم إضافة المطعم');askPushNotif('المطاعم',name);setTimeout(refreshCouponRestList,400);closeAdmin();goTo('food');
}
/* ══ MEDICAL EDIT FUNCTIONS ══ */
let currentEditMedId=null, currentEditCraftId=null, currentEditTransId=null, currentEditMktId=null;

function openMedEdit(uid,name,spec,phone,hours,addr,price){
  currentEditMedId=uid;
  document.getElementById('medListView').style.display='none';
  document.getElementById('medEditView').style.display='block';
  document.getElementById('medEditTitle').textContent='تعديل: '+name;
  document.getElementById('eM-name').value=name||'';
  document.getElementById('eM-spec').value=spec||'';
  document.getElementById('eM-phone').value=phone||'';
  document.getElementById('eM-hours').value=hours||'';
  document.getElementById('eM-addr').value=addr||'';
  document.getElementById('eM-price').value=price||'';
  document.getElementById('eM-uid').value=uid||'';
}
function saveMedEdit(){
  const uid=document.getElementById('eM-uid').value;
  const name=document.getElementById('eM-name').value.trim();
  const spec=document.getElementById('eM-spec').value.trim();
  const phone=document.getElementById('eM-phone').value.trim();
  const hours=document.getElementById('eM-hours').value.trim();
  const addr=document.getElementById('eM-addr').value.trim();
  const price=document.getElementById('eM-price').value.trim();
  if(!name){showToast('⚠️ اكتب الاسم');return;}
  // Update card - try by id, then by data-med-id
  const card=document.getElementById(uid)||document.querySelector(`[data-med-id="${uid}"]`);
  if(card){
    const nmEl=card.querySelector('.cnm');const subEl=card.querySelector('.csub');
    if(nmEl)nmEl.textContent=name;
    if(subEl)subEl.textContent=spec+(price?' — كشف: '+price:'')+(hours?' • '+hours:'');
    const phA=card.querySelector('a[href^="tel"]');if(phA&&phone)phA.href='tel:'+phone;
    // Update onclick to reflect new data
    const d={name,sub:spec+(price?' — كشف: '+price:''),phone,addr,hours};
    card.setAttribute('onclick','openMedDetail('+JSON.stringify(d)+')');
  }
  // Update admin card
  const ac=document.querySelector(`[onclick*="openMedEdit('${uid}'"]`);
  if(ac){const nm=ac.querySelector('div[style*="font-weight:800"]');if(nm)nm.textContent=name;}
  document.getElementById('medListView').style.display='block';
  document.getElementById('medEditView').style.display='none';
  showToast('✅ تم حفظ بيانات '+name);
}
function deleteMedFromEdit(){
  const uid=document.getElementById('eM-uid').value;
  if(!confirm('حذف نهائياً؟'))return;
  const card=document.getElementById(uid)||document.querySelector(`[data-med-id="${uid}"]`);
  if(card)card.closest('.card')?.remove()||card.remove();
  const ac=document.querySelector(`[onclick*="openMedEdit('${uid}'"]`);
  if(ac)ac.closest('.rest-admin-card')?.remove()||ac.remove();
  document.getElementById('medListView').style.display='block';
  document.getElementById('medEditView').style.display='none';
  showToast('🗑️ تم الحذف');
}
function refreshMedAdminList(){
  const list=document.getElementById('admMedList');if(!list)return;
  list.innerHTML='';
  let clinicBooking={};
  try{const s=localStorage.getItem('quesina_clinic_booking');if(s)clinicBooking=JSON.parse(s);}catch(e){}
  document.querySelectorAll('#medList .card').forEach(card=>{
    const uid=card.id||('med-'+Math.random().toString(36).substr(2,6));
    if(!card.id)card.id=uid;
    const nm=card.querySelector('.cnm')?.textContent?.trim()||'';
    const sub=card.querySelector('.csub')?.textContent?.trim()||'';
    const bkOn=clinicBooking[uid]!==false;
    list.insertAdjacentHTML('beforeend',
      `<div style="background:var(--s2);border:1px solid var(--bd2);border-radius:12px;padding:11px 13px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;cursor:pointer" onclick="openMedEditById('${uid}')">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--orange-light);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🏥</div>
          <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${nm}</div><div style="font-size:11px;color:var(--t3)">${sub||'عيادة'}</div></div>
          <span style="font-size:10px;color:var(--orange);flex-shrink:0">تعديل ←</span>
        </div>
        <div style="display:flex;gap:6px">
          <button onclick="setClinicBooking('${uid}',true)" style="flex:1;background:${bkOn?'rgba(46,125,50,.2)':'rgba(46,125,50,.06)'};border:1.5px solid ${bkOn?'rgba(46,125,50,.5)':'rgba(46,125,50,.2)'};color:#2e7d32;border-radius:8px;padding:6px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit">✅ تفعيل الحجز</button>
          <button onclick="setClinicBooking('${uid}',false)" style="flex:1;background:${!bkOn?'rgba(198,40,40,.18)':'rgba(198,40,40,.05)'};border:1.5px solid ${!bkOn?'rgba(198,40,40,.5)':'rgba(198,40,40,.15)'};color:#c62828;border-radius:8px;padding:6px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit">🔒 إغلاق الحجز</button>
        </div>
      </div>`);
  });
}

function setClinicBooking(uid,enabled){
  let cb={};
  try{const s=localStorage.getItem('quesina_clinic_booking');if(s)cb=JSON.parse(s);}catch(e){}
  cb[uid]=enabled;
  try{localStorage.setItem('quesina_clinic_booking',JSON.stringify(cb));}catch(e){}
  refreshMedAdminList();
  showToast(enabled?'✅ تم تفعيل الحجز':'🔒 تم إغلاق الحجز');
}
function openMedEditById(uid){
  const card=document.getElementById(uid);
  if(!card){showToast('⚠️ لم يتم إيجاد البيانات');return;}
  const nm=card.querySelector('.cnm')?.textContent||'';
  const sub=card.querySelector('.csub')?.textContent||'';
  const phEl=card.querySelector('a[href^="tel"]');
  const phone=phEl?phEl.href.replace('tel:',''):'';
  // Extract data from onclick attr
  let d={};
  try{const oc=card.getAttribute('onclick')||'';const m=oc.match(/openMedDetail\((\{.*?\})\)/s);if(m)d=JSON.parse(m[1]);}catch(e){}
  openMedEdit(uid, nm, d.sub||sub, phone||d.phone, d.hours||'', d.addr||'', (d.sub||'').match(/كشف:\s*(.+)/)?.[1]||'');
}

/* ══ CRAFT EDIT FUNCTIONS ══ */
function openCraftEdit(uid,name,spec,phone,addr,status){
  currentEditCraftId=uid;
  document.getElementById('craftListView').style.display='none';
  document.getElementById('craftEditView').style.display='block';
  document.getElementById('craftEditTitle').textContent='تعديل: '+name;
  document.getElementById('eC-name').value=name||'';
  document.getElementById('eC-spec').value=spec||'';
  document.getElementById('eC-phone').value=phone||'';
  document.getElementById('eC-uid').value=uid||'';
}
function adminSetCraftStatus(status){
  const uid=currentEditCraftId;if(!uid)return;
  const badge=document.querySelector(`[onclick*="openCraftEdit('${uid}'"] .rst-status`);
  if(badge){badge.textContent=status;badge.className='rst-status '+(status==='متاح'?'rst-open':status==='مشغول'?'rst-busy':'rst-closed');}
  showToast('✅ تم تغيير الحالة إلى '+status);
}
function saveCraftEdit(){
  const uid=document.getElementById('eC-uid').value;
  const name=document.getElementById('eC-name').value.trim();
  const spec=document.getElementById('eC-spec').value.trim();
  const phone=document.getElementById('eC-phone').value.trim();
  if(!name){showToast('⚠️ اكتب الاسم');return;}
  // Update in craftList
  const card=document.querySelector(`[data-craft-id="${uid}"]`);
  if(card){const nm=card.querySelector('.cnm');if(nm)nm.textContent=name;}
  document.getElementById('craftListView').style.display='block';
  document.getElementById('craftEditView').style.display='none';
  showToast('✅ تم حفظ بيانات '+name);
}
function deleteCraftFromEdit(){
  const uid=document.getElementById('eC-uid').value;
  if(!confirm('حذف نهائياً؟'))return;
  const card=document.querySelector(`[data-craft-id="${uid}"]`);
  if(card)card.closest('.card')?.remove()||card.remove();
  document.getElementById('craftListView').style.display='block';
  document.getElementById('craftEditView').style.display='none';
  showToast('🗑️ تم الحذف');
}

/* ══ TRANSPORT EDIT FUNCTIONS ══ */
function openTransEdit(uid,num,dest,dep,price,type){
  currentEditTransId=uid;
  document.getElementById('transListView').style.display='none';
  document.getElementById('transEditView').style.display='block';
  document.getElementById('eT-num').value=num||'';
  document.getElementById('eT-dest').value=dest||'';
  document.getElementById('eT-dep').value=dep||'';
  document.getElementById('eT-price').value=price||'';
  document.getElementById('eT-uid').value=uid||'';
  const typeEl=document.getElementById('eT-type');
  if(typeEl&&type){for(let i=0;i<typeEl.options.length;i++){if(typeEl.options[i].value===type){typeEl.selectedIndex=i;break;}}}
}
function saveTransEdit(){
  const uid=document.getElementById('eT-uid').value;
  const num=document.getElementById('eT-num').value.trim();
  const dest=document.getElementById('eT-dest').value.trim();
  const dep=document.getElementById('eT-dep').value.trim();
  const price=document.getElementById('eT-price').value.trim();
  if(!num){showToast('⚠️ اكتب رقم الرحلة');return;}
  // Update admin card
  const card=document.querySelector(`[onclick*="openTransEdit('${uid}'"]`);
  if(card){
    const nm=card.querySelector('div:nth-child(2) div:first-child');if(nm)nm.textContent=num+' — '+dest;
    const sub=card.querySelector('div:nth-child(2) div:nth-child(2)');if(sub)sub.textContent=dep+' • '+price+' جنيه';
  }
  // Update transport card in UI
  const trCard=document.getElementById(uid);
  if(trCard){const nm=trCard.querySelector('.trnum');if(nm)nm.textContent=num+'→'+dest+' '+dep;}
  document.getElementById('transListView').style.display='block';
  document.getElementById('transEditView').style.display='none';
  showToast('✅ تم حفظ بيانات الرحلة');
}
function deleteTransFromEdit(){
  const uid=document.getElementById('eT-uid').value;
  if(!confirm('حذف نهائياً؟'))return;
  // Try direct ID first
  const card=document.getElementById(uid);
  if(card){card.remove();}
  else{
    // Static: uid like 'adm-tr-0' → transport card is 'tr-static-N'
    const m=uid.match(/adm-tr-(\d+)/);
    if(m){const tc=document.getElementById('tr-static-'+m[1]);if(tc)tc.remove();}
  }
  // Remove admin card
  const acard=document.querySelector(`[onclick*="openTransEdit('${uid}'"]`);
  if(acard)acard.closest('.rest-admin-card')?.remove()||acard.remove();
  document.getElementById('transListView').style.display='block';
  document.getElementById('transEditView').style.display='none';
  showToast('🗑️ تم الحذف');
}

/* ══ MARKET EDIT FUNCTIONS ══ */
function openMktEdit(uid,title,price,cat,phone){
  currentEditMktId=uid;
  document.getElementById('mktListView').style.display='none';
  document.getElementById('mktEditView').style.display='block';
  document.getElementById('eMk-title').value=title||'';
  document.getElementById('eMk-price').value=price||'';
  document.getElementById('eMk-phone').value=phone||'';
  document.getElementById('eMk-uid').value=uid||'';
  const catEl=document.getElementById('eMk-cat');
  if(catEl&&cat){for(let i=0;i<catEl.options.length;i++){if(catEl.options[i].value===cat){catEl.selectedIndex=i;break;}}}
}
function adminSetMktStatus(status){
  const uid=document.getElementById('eMk-uid').value;
  if(!uid){showToast('⚠️ لا يوجد منتج محدد');return;}
  window._pendingMktStatus=status;
  const card=document.getElementById(uid);
  if(card){
    // Update badge
    const badge=card.querySelector('.mkbdg');
    if(badge){
      if(status==='مباع'){badge.textContent='مباع';badge.style.background='rgba(198,40,40,.55)';badge.style.color='#fff';}
      else if(status==='غير متاح'){badge.textContent='غير متاح';badge.style.background='rgba(80,80,80,.7)';badge.style.color='#fff';}
      else{badge.textContent='متاح';badge.style.background='rgba(67,160,71,.3)';badge.style.color='#fff';}
    }
    // Overlay opacity
    card.style.opacity=(status==='مباع'||status==='غير متاح')?'0.55':'1';
    // Disable click if sold/unavailable
    if(status==='مباع'||status==='غير متاح'){card.style.pointerEvents='none';}
    else{card.style.pointerEvents='';}
  }
  showToast('✅ تم تغيير الحالة إلى '+status);
}
function saveMktEdit(){
  const uid=document.getElementById('eMk-uid').value;
  const title=document.getElementById('eMk-title').value.trim();
  const price=document.getElementById('eMk-price').value.trim();
  const phone=document.getElementById('eMk-phone').value.trim();
  if(!title){showToast('⚠️ اكتب اسم المنتج');return;}
  // Update admin card text
  const adminCard=document.querySelector(`[onclick*="openMktEdit('${uid}'"]`);
  if(adminCard){
    const nm=adminCard.querySelector('div:nth-child(2) div:first-child');if(nm)nm.textContent=title;
    const sub=adminCard.querySelector('div:nth-child(2) div:nth-child(2)');if(sub&&price)sub.textContent=price;
  }
  // Update market card
  const mCard=document.getElementById(uid);
  if(mCard){
    const t=mCard.querySelector('.mktit');if(t)t.textContent=title;
    const p=mCard.querySelector('.mkpr');if(p&&price)p.textContent=price;
    // Apply pending status if set
    const st=window._pendingMktStatus||'';
    if(st){
      const badge=mCard.querySelector('.mkbdg');
      if(badge){
        if(st==='مباع'){badge.textContent='مباع';badge.style.background='rgba(198,40,40,.55)';badge.style.color='#fff';}
        else if(st==='غير متاح'){badge.textContent='غير متاح';badge.style.background='rgba(80,80,80,.7)';badge.style.color='#fff';}
        else{badge.textContent='متاح';badge.style.background='';badge.style.color='';}
      }
      mCard.style.opacity=(st==='مباع'||st==='غير متاح')?'0.55':'1';
      mCard.style.pointerEvents=(st==='مباع'||st==='غير متاح')?'none':'';
    }
    // Update phone in onclick detail
    if(phone){
      const oc=mCard.getAttribute('onclick')||'';
      const updated=oc.replace(/phone:'[^']*'/,`phone:'${phone}'`);
      if(updated!==oc)mCard.setAttribute('onclick',updated);
    }
  }
  window._pendingMktStatus=null;
  document.getElementById('mktListView').style.display='block';
  document.getElementById('mktEditView').style.display='none';
  showToast('✅ تم حفظ بيانات المنتج');
}
function deleteMktFromEdit(){
  const uid=document.getElementById('eMk-uid').value;
  if(!confirm('حذف نهائياً؟'))return;
  // Try direct ID (works for both static mkt-s-N and dynamic mkt-TIMESTAMP)
  const c=document.getElementById(uid);if(c)c.remove();
  const ac=document.querySelector(`[onclick*="openMktEdit('${uid}'"]`);if(ac)ac.closest('.rest-admin-card')?.remove()||ac.remove();
  document.getElementById('mktListView').style.display='block';
  document.getElementById('mktEditView').style.display='none';
  showToast('🗑️ تم الحذف');
}

/* ══ MENU ITEM EDIT (existing items) ══ */
function openMenuItemEdit(restId, itemIdx){
  const menus=window.restaurantMenus||{};
  const items=menus[restId]||[];
  const item=items[itemIdx];
  if(!item)return;
  currentEditRestId=restId;
  document.getElementById('restAdminListView').style.display='none';
  document.getElementById('restEditorView').style.display='block';
  switchRestTab('menu');
  document.getElementById('mSec').value=item.section||'';
  document.getElementById('mName').value=item.name||'';
  document.getElementById('mDesc').value=item.desc||'';
  document.getElementById('mPrice').value=item.price||'';
  window._editingMenuIdx=itemIdx;
  admTab('t-food',document.querySelector('[onclick*="t-food"]'));
  openAdmin();
}

/* ══ NEWS EDIT FUNCTIONS ══ */
function openNewsEdit(uid,title,cat,date,body){
  document.getElementById('newsListView').style.display='none';
  document.getElementById('newsEditView').style.display='block';
  document.getElementById('newsEditTitle').textContent='تعديل: '+(title.length>20?title.substring(0,20)+'...':title);
  document.getElementById('eN-title').value=title||'';
  document.getElementById('eN-date').value=date||'';
  document.getElementById('eN-body').value=body||'';
  document.getElementById('eN-uid').value=uid||'';
  const catEl=document.getElementById('eN-cat');
  if(catEl&&cat){for(let i=0;i<catEl.options.length;i++){if(catEl.options[i].value===cat||catEl.options[i].text===cat){catEl.selectedIndex=i;break;}}}
}
function saveNewsEdit(){
  const uid=document.getElementById('eN-uid').value;
  const title=document.getElementById('eN-title').value.trim();
  const date=document.getElementById('eN-date').value.trim();
  const body=document.getElementById('eN-body').value.trim();
  if(!title){showToast('⚠️ اكتب عنوان الخبر');return;}
  // Update news card in UI
  const nc=document.getElementById(uid);
  if(nc){const t=nc.querySelector('.ntit');if(t)t.textContent=title;}
  // Update admin card
  const ac=document.querySelector(`[onclick*="openNewsEdit('${uid}'"]`);
  if(ac){const nm=ac.querySelector('div:nth-child(2) div:first-child');if(nm)nm.textContent=title;}
  document.getElementById('newsListView').style.display='block';
  document.getElementById('newsEditView').style.display='none';
  showToast('✅ تم حفظ الخبر');
}
function deleteNewsFromEdit(){
  const uid=document.getElementById('eN-uid').value;
  if(!confirm('حذف الخبر نهائياً؟'))return;
  // Try by ID first, then by static mapping
  let nc=document.getElementById(uid);
  if(nc){nc.closest('.nc')?.remove()||nc.remove();}
  else{
    // static news: uid is like 'news-s-0'
    const map={'news-s-0':0,'news-s-1':1};
    const cards=document.querySelectorAll('#newsList .nc');
    const idx=map[uid];
    if(idx!==undefined&&cards[idx])cards[idx].remove();
  }
  const ac=document.querySelector(`[onclick*="openNewsEdit('${uid}'"]`);if(ac)ac.remove();
  const n=parseInt(document.getElementById('stNews').textContent||'0')-1;
  document.getElementById('stNews').textContent=Math.max(0,n);
  document.getElementById('newsListView').style.display='block';
  document.getElementById('newsEditView').style.display='none';
  renderHomeNews();showToast('🗑️ تم حذف الخبر');
}
function addNewsFromPanel(){
  addNews();
  document.getElementById('newsListView').style.display='block';
  document.getElementById('newsAddView').style.display='none';
}

/* ══ ADS EDIT FUNCTIONS ══ */
function openAdEdit(uid,text,img){
  document.getElementById('adsListView').style.display='none';
  document.getElementById('adsEditView').style.display='block';
  document.getElementById('eAd-text').value=text||'';
  document.getElementById('eAd-uid').value=uid||'';
}
function saveAdEdit(){
  const uid=document.getElementById('eAd-uid').value;
  const text=document.getElementById('eAd-text').value.trim();
  if(!text){showToast('⚠️ اكتب نص الإعلان');return;}
  const ac=document.querySelector(`[onclick*="openAdEdit('${uid}'"]`);
  if(ac){const nm=ac.querySelector('div:nth-child(2) div:first-child');if(nm)nm.textContent=text;}
  document.getElementById('adsListView').style.display='block';
  document.getElementById('adsEditView').style.display='none';
  showToast('✅ تم حفظ الإعلان');
}
function deleteAdFromEdit(){
  const uid=document.getElementById('eAd-uid').value;
  if(!confirm('حذف الإعلان نهائياً؟'))return;
  const ac=document.querySelector(`[onclick*="openAdEdit('${uid}'"]`);if(ac)ac.remove();
  document.getElementById('adsListView').style.display='block';
  document.getElementById('adsEditView').style.display='none';
  showToast('🗑️ تم حذف الإعلان');
}

/* ══ AGENT EDIT FUNCTIONS ══ */
let currentEditAgentId=null;
function openAgentEdit(uid,name,phone,status){
  currentEditAgentId=uid;
  document.getElementById('agentListView').style.display='none';
  document.getElementById('agentEditView').style.display='block';
  document.getElementById('agentEditTitle').textContent='تعديل: '+name;
  document.getElementById('eAg-name').value=name||'';
  document.getElementById('eAg-phone').value=phone||'';
  document.getElementById('eAg-uid').value=uid||'';
}
function adminSetAgentStatus(status){
  const uid=currentEditAgentId;if(!uid)return;
  const badge=document.querySelector(`[onclick*="openAgentEdit('${uid}'"] .rst-status`);
  if(badge){badge.textContent=status;badge.className='rst-status '+(status==='متاح'?'rst-open':status==='مشغول'?'rst-busy':'rst-closed');}
  showToast('✅ تم تغيير الحالة إلى '+status);
}
function saveAgentEdit(){
  const uid=document.getElementById('eAg-uid').value;
  const name=document.getElementById('eAg-name').value.trim();
  const phone=document.getElementById('eAg-phone').value.trim();
  if(!name){showToast('⚠️ اكتب الاسم');return;}
  const ac=document.querySelector(`[onclick*="openAgentEdit('${uid}'"]`);
  if(ac){const nm=ac.querySelector('div:nth-child(2) div:first-child');if(nm)nm.textContent=name+' — مندوب';}
  document.getElementById('agentListView').style.display='block';
  document.getElementById('agentEditView').style.display='none';
  showToast('✅ تم حفظ بيانات المندوب');
}
function deleteAgentFromEdit(){
  const uid=document.getElementById('eAg-uid').value;
  if(!confirm('حذف المندوب نهائياً؟'))return;
  const ac=document.querySelector(`[onclick*="openAgentEdit('${uid}'"]`);if(ac)ac.remove();
  document.getElementById('agentListView').style.display='block';
  document.getElementById('agentEditView').style.display='none';
  showToast('🗑️ تم الحذف');
}


function addMedical(){
  const name=document.getElementById('aM-name').value.trim();
  const spec=document.getElementById('aM-spec').value;
  const phone=document.getElementById('aM-phone').value.trim();
  const hours=document.getElementById('aM-hours').value.trim();
  const addr=document.getElementById('aM-addr').value.trim();
  const priceEl=document.getElementById('aM-price');
  const price=priceEl?priceEl.value.trim():'';
  const prevEl=document.getElementById('aM-prev');
  const imgSrc=prevEl&&prevEl.style.display!=='none'&&prevEl.src&&prevEl.src!==window.location.href?prevEl.src:'';

  if(!name){showToast('⚠️ اكتب الاسم');return}
  const medId='med-'+Date.now();
  const catType=spec==='مستشفى'?'مستشفى':spec==='صيدلية'?'صيدلية':'عيادة';
  const d={name,sub:spec+(price?' — كشف: '+price:''),phone,addr,hours};
  const card=document.createElement('div');
  card.className='card';card.id=medId;card.dataset.cat=catType;
  card.setAttribute('onclick','openMedDetail('+JSON.stringify(d)+')');
  const iconBg=catType==='مستشفى'?'#3d0d0d':catType==='صيدلية'?'#0d2318':'#0d1a35';
  const iconColor=catType==='مستشفى'?'#ef5350':catType==='صيدلية'?'#43a047':'#1565c0';
  const tagCls=catType==='مستشفى'?'tr':catType==='صيدلية'?'tg':'tb';
  const thumbHTML=imgSrc?`<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover"/>`:`<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="10" r="5" fill="${iconBg}" stroke="${iconColor}" stroke-width="1.5"/><path d="M5 24 Q13 17 21 24" fill="${iconBg}"/></svg>`;
  card.innerHTML=`<div class="crow"><div class="cthumb" style="background:${imgSrc?'transparent':iconBg}">${thumbHTML}</div><div class="cinfo"><div class="cnm">${name}</div><div class="csub">${spec}${price?' • كشف: '+price:''}</div><div class="cmeta"><span class="tag ${tagCls}">${catType}</span>${hours?'<span class="tag tgr">'+hours+'</span>':''}</div></div></div>`;
  document.getElementById('medList').insertBefore(card,document.getElementById('medList').firstChild);
  document.getElementById('admMedList').insertAdjacentHTML('afterbegin',
    `<div class="rest-admin-card" onclick="openMedEditById('${medId}')" style="background:var(--s2);border:1px solid var(--bd2);border-radius:12px;padding:11px 13px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:10px">
      <div style="width:40px;height:40px;border-radius:10px;background:${imgSrc?'transparent':iconBg};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden">${imgSrc?`<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover"/>`:'🏥'}</div>
      <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div><div style="font-size:11px;color:var(--t3)">${spec} • اضغط للتعديل</div></div>
      <span style="font-size:10px;color:var(--orange);flex-shrink:0">← تعديل</span>
    </div>`
  );
  ['aM-name','aM-phone','aM-hours','aM-addr','aM-price'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  if(prevEl){prevEl.src='';prevEl.style.display='none';}
  showToast('✅ تم إضافة للدليل الطبي');closeAdmin();goTo('medical');
}
function editMedItem(id){
  const card=document.getElementById(id);if(!card)return;
  const nm=card.querySelector('.cnm');
  const sb=card.querySelector('.csub');
  if(nm)document.getElementById('aM-name').value=nm.textContent;
  card.remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  admTab('t-medical',document.querySelector('[onclick*="t-medical"]'));
  openAdmin();showToast('✏️ عدّل البيانات وأضف من جديد');
}
function addCraftsman(){
  const name=document.getElementById('aC-name').value.trim();
  const specSel=document.getElementById('aC-spec');
  const customSpec=document.getElementById('aC-spec-custom')?document.getElementById('aC-spec-custom').value.trim():'';
  const spec=specSel.value==='أخرى'&&customSpec?customSpec:specSel.value;
  const phone=document.getElementById('aC-phone').value.trim();
  if(!name){showToast('⚠️ اكتب الاسم');return}
  const uid='craft-'+Date.now();
  const card=document.createElement('div');card.className='card';card.dataset.cat=spec;card.dataset.craftId=uid;card.id=uid;
  card.setAttribute('onclick','openCraftDetail(this)');
  card.innerHTML=`<div class="crow"><div class="cthumb" style="background:#fffde6"><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="10" r="5" fill="#1a1800" stroke="#fdd835" stroke-width="1"/><path d="M5 24 Q13 17 21 24" fill="#1a1400"/></svg></div><div class="cinfo"><div class="cnm" data-phone="${phone}">${name}</div><div class="csub">${spec}${phone?' • '+phone:''}</div><div class="cmeta"><span class="avon" data-ar="متاح الآن" data-en="Available Now" id="cs-${uid}">متاح الآن</span></div></div></div>`;
  card.dataset.phone=phone;
  document.getElementById('craftList').insertBefore(card,document.getElementById('craftList').firstChild);
  document.getElementById('admCraftList').insertAdjacentHTML('afterbegin',`<div class="ali" id="adm-${uid}"><span class="alinm">${name} — ${spec}</span><div class="alibtns"><span class="asi asi-h" onclick="setCraftStatusById('${uid}','متاح')">متاح</span><span class="asi asi-busy" onclick="setCraftStatusById('${uid}','مشغول')">مشغول</span><span class="asi asi-off" onclick="setCraftStatusById('${uid}','غير متاح')">غير متاح</span><span class="asi asi-d" onclick="deleteCraftById('${uid}')">حذف</span></div></div>`);
  ['aC-name','aC-phone'].forEach(id=>document.getElementById(id).value='');
  if(document.getElementById('aC-spec-custom'))document.getElementById('aC-spec-custom').value='';
  showToast('✅ تم إضافة الأسطى');closeAdmin();goTo('craftsmen');
}
function addCraftCat(){
  const val=document.getElementById('aCat-new')?document.getElementById('aCat-new').value.trim():'';
  if(!val){showToast('⚠️ اكتب اسم التصنيف');return}
  // Add chip to craftsmen section
  const chips=document.querySelector('#s-craftsmen .chips');
  if(chips){
    const btn=document.createElement('button');
    btn.className='chip';
    btn.textContent=val;
    btn.setAttribute('onclick',`filterChip(this,'craftList','${val}')`);
    chips.appendChild(btn);
  }
  // Add to spec select
  const sel=document.getElementById('aC-spec');
  if(sel){
    const opt=document.createElement('option');
    opt.value=val;opt.textContent=val;opt.style.background='#fff';
    sel.insertBefore(opt,sel.lastElementChild);
  }
  document.getElementById('aCat-new').value='';
  showToast('✅ تم إضافة تصنيف '+val);
}
function editCraftById(uid){
  const card=document.getElementById(uid);if(!card)return;
  const nm=card.querySelector('.cnm');
  const sb=card.querySelector('.csub');
  if(nm)document.getElementById('aC-name').value=nm.textContent;
  if(sb){
    const parts=sb.textContent.split(' • ');
    document.getElementById('aC-phone').value=parts[1]||'';
  }
  card.remove();
  const adm=document.getElementById('adm-'+uid);if(adm)adm.remove();
  admTab('t-craft',document.querySelector('[onclick*="t-craft"]'));
  openAdmin();showToast('✏️ عدّل البيانات وأضف من جديد');
}
function setCraftStatusById(uid,status){
  const el=document.getElementById('cs-'+uid);
  if(el){el.className=status==='متاح'?'avon':'avoff';el.textContent=status==='متاح'?'متاح الآن':status;}
  showToast('✅ تم تغيير الحالة');
}
function deleteCraftById(uid){
  const el=document.getElementById(uid);if(el)el.remove();
  const adm=document.getElementById('adm-'+uid);if(adm)adm.remove();
  showToast('🗑️ تم حذف الأسطى');
}
function addTransport(){
  const num=document.getElementById('aT-num').value.trim();const dest=document.getElementById('aT-dest').value.trim();
  const dep=document.getElementById('aT-dep').value.trim();const price=document.getElementById('aT-price').value.trim();const type=document.getElementById('aT-type').value;
  if(!num){showToast('⚠️ اكتب رقم الرحلة');return}
  const el=document.createElement('div');el.className='trc';el.dataset.cat=type;
  el.innerHTML=`<div class="trh"><span class="trnum">${num} — ${dest}</span><span class="tag tg" data-ar="متاح" data-en="Available">متاح</span></div><div class="trbdy"><div class="trtimes"><div class="trt"><div class="ttl" data-ar="المغادرة" data-en="Departure">المغادرة</div><div class="ttv">${dep}</div></div><div class="trt"><div class="ttl">الوجهة</div><div class="ttv">${dest}</div></div><div class="trt"><div class="ttl" data-ar="السعر" data-en="Price">السعر</div><div class="ttv">${price}</div></div></div></div>`;
  document.getElementById('transList').insertBefore(el,document.getElementById('transList').firstChild);
  const transId='trans-'+Date.now();
  el.id=transId;
  document.getElementById('admTransList').insertAdjacentHTML('afterbegin',`<div class="ali"><span class="alinm">${num}→${dest} ${dep}</span><div class="alibtns"><span class="asi asi-ok" onclick="editTransport('${transId}','${num}','${dest}','${dep}','${price}','${type}')">تعديل</span><span class="asi asi-d" onclick="document.getElementById('${transId}').remove();this.closest('.ali').remove()">حذف</span></div></div>`);
  ['aT-num','aT-dest','aT-dep','aT-price'].forEach(id=>document.getElementById(id).value='');
  showToast('✅ تم إضافة الرحلة');closeAdmin();goTo('transport');
}
function addMarketDirect(){
  const title=document.getElementById('aMk-title').value.trim();const price=document.getElementById('aMk-price').value.trim();
  const cat=document.getElementById('aMk-cat').value;const desc=document.getElementById('aMk-desc').value.trim();const phone=document.getElementById('aMk-phone').value.trim();
  const prev=document.getElementById('aMk-prev');const imgSrc=prev&&prev.style.display!=='none'?prev.src:'';
  if(!title){showToast('⚠️ اكتب اسم المنتج');return}
  const d={title,price,cat,desc,seller:'الآن',phone,img:imgSrc};
  const mkc=document.createElement('div');mkc.className='mkc';mkc.dataset.cat=cat;
  mkc.setAttribute('onclick',`openMarketDetail(${JSON.stringify(d)})`);
  const imgHTML=imgSrc?`<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover"/>`:`<span style="font-size:48px">🛒</span>`;
  mkc.innerHTML=`<div class="mki">${imgHTML}<span class="mkbdg tgr" style="position:absolute;top:8px;right:8px;background:rgba(255,255,255,.12)">${cat}</span></div><div class="mkb"><div class="mktit">${title}</div><div class="mkpr">${price}</div><div class="mksl">الآن</div></div>`;
  const mktId='mkt-'+Date.now();
  mkc.id=mktId;
  document.getElementById('marketList').insertBefore(mkc,document.getElementById('marketList').firstChild);
  document.getElementById('admMktPend').insertAdjacentHTML('afterbegin',`<div class="ali" id="adm-${mktId}"><span class="alinm">${title}</span><div class="alibtns"><span class="asi asi-busy" onclick="markSold('${mktId}')">مباع</span><span class="asi asi-d" onclick="deleteMarketItem('${mktId}')">حذف</span></div></div>`);
  ['aMk-title','aMk-price','aMk-desc','aMk-phone'].forEach(id=>document.getElementById(id).value='');
  if(prev)prev.style.display='none';
  showToast('✅ تم نشر الإعلان');askPushNotif('السوق',title);closeAdmin();goTo('market');
}
function addJobDirect(){
  const title=document.getElementById('aJ-title').value.trim();const company=document.getElementById('aJ-company').value.trim();
  const salary=document.getElementById('aJ-salary').value.trim();const addr=document.getElementById('aJ-addr').value.trim();
  const desc=document.getElementById('aJ-desc').value.trim();const phone=document.getElementById('aJ-phone').value.trim();
  if(!title){showToast('⚠️ اكتب المسمى الوظيفي');return}
  const d={title,company,salary,type:'دوام كامل',phone,desc,addr};
  const jc=document.createElement('div');jc.className='jc';jc.setAttribute('onclick',`openJobDetail(${JSON.stringify(d)})`);
  jc.innerHTML=`<div class="jt">${title}</div><div class="jco">${company}</div><div style="display:flex;gap:5px;flex-wrap:wrap"><span class="tag tg" data-ar="دوام كامل" data-en="Full Time">دوام كامل</span><span class="tag tgo">${salary}</span></div>`;
  document.getElementById('jobsList').insertBefore(jc,document.getElementById('jobsList').firstChild);
  const jobId='job-'+Date.now();
  jc.id=jobId;
  // Add to new card-style admin list
  const adl=document.getElementById('admJobList');
  if(adl)adl.insertAdjacentHTML('afterbegin',
    `<div id="adm-${jobId}" class="rest-admin-card" onclick="openJobAdminEdit('${jobId}','${title.replace(/'/g,"\\'")}','${company.replace(/'/g,"\\'")}','${salary}','${phone}','${addr}','${desc.replace(/'/g,"\\'")}')" style="background:var(--s2);border:1px solid var(--bd2);border-radius:12px;padding:11px 13px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:10px">
      <div style="width:40px;height:40px;border-radius:10px;background:var(--orange-light);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">💼</div>
      <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800;color:var(--t1)">${title}</div><div style="font-size:11px;color:var(--t3)">${company} • اضغط للتعديل</div></div>
      <span style="font-size:10px;color:var(--orange);flex-shrink:0">← تعديل</span>
    </div>`);
  ['aJ-title','aJ-company','aJ-salary','aJ-addr','aJ-desc','aJ-phone'].forEach(id=>document.getElementById(id).value='');
  showToast('✅ تم إضافة الوظيفة');askPushNotif('الوظائف',title);closeAdmin();goTo('jobs');
}
function addEdu(){
  const type=document.getElementById('aEd-type').value;const name=document.getElementById('aEd-name').value.trim();
  const sub=document.getElementById('aEd-sub').value.trim();const phone=document.getElementById('aEd-phone').value.trim();
  const addr=document.getElementById('aEd-addr').value.trim();const hours=document.getElementById('aEd-hours').value.trim();
  const desc=document.getElementById('aEd-desc').value.trim();const prev=document.getElementById('aEd-prev');const imgSrc=prev&&prev.style.display!=='none'?prev.src:'';
  if(!name){showToast('⚠️ اكتب الاسم');return}
  const d={type,name,sub,phone,addr,hours,desc,img:imgSrc};
  const card=document.createElement('div');card.className='card';card.setAttribute('onclick',`openEduDetail(${JSON.stringify(d)})`);
  card.innerHTML=`<div class="crow"><div class="cthumb" style="background:#e6f4ea">${imgSrc?`<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover"/>`:`<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="14" width="20" height="9" rx="2" fill="#1a3d22"/><polygon points="13,3 3,14 23,14" fill="#142b1c" stroke="#43a047" stroke-width="1"/></svg>`}</div><div class="cinfo"><div class="cnm">${name}</div><div class="csub">${sub}</div><div class="cmeta"><span class="tag tg">${type}</span></div></div></div>`;
  const targetMap={'سنتر':'edTab-centers','مدرس':'edTab-teachers','حضانة':'edTab-nursery','مكتبة':'edTab-library'};
  const target=targetMap[type]||'edTab-centers';
  document.getElementById(target).insertBefore(card,document.getElementById(target).firstChild);
  const eduId='edu-'+Date.now();
  card.id=eduId;
  document.getElementById('admEduList').insertAdjacentHTML('afterbegin',`<div class="rest-admin-card" onclick="openEduEdit('${eduId}','${name.replace(/'/g,"\'")}','${sub.replace(/'/g,"\'")}','${phone}','${addr.replace(/'/g,"\'")}','${hours}','${type}')" style="background:var(--s2);border:1px solid var(--bd2);border-radius:12px;padding:11px 13px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:10px"><div style="width:40px;height:40px;border-radius:10px;background:rgba(21,101,192,.12);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${type==='مدرس'?'👨‍🏫':'📚'}</div><div style="flex:1"><div style="font-size:13px;font-weight:800;color:var(--t1)">${name}</div><div style="font-size:11px;color:var(--t3)">${sub||type} • اضغط للتعديل</div></div><span style="font-size:10px;color:var(--orange)">← تعديل</span></div>`);
  ['aEd-name','aEd-sub','aEd-phone','aEd-addr','aEd-hours','aEd-desc'].forEach(id=>document.getElementById(id).value='');
  if(prev)prev.style.display='none';
  document.getElementById('eduAddView').style.display='none';
  document.getElementById('eduListView').style.display='block';
  const tabMap={'سنتر':'centers','مدرس':'teachers','حضانة':'nursery','مكتبة':'library'};
  showToast('✅ تم إضافة '+type);
}
function addZaman(){
  const era=document.getElementById('aZ-era').value.trim();const title=document.getElementById('aZ-title').value.trim();
  const body=document.getElementById('aZ-body').value.trim();const prev=document.getElementById('aZ-prev');const imgSrc=prev&&prev.style.display!=='none'?prev.src:'';
  if(!title){showToast('⚠️ اكتب العنوان');return}
  const d={type:'zaman',era,title,body,img:imgSrc};
  const zc=document.createElement('div');zc.className='zc';zc.setAttribute('onclick',`openArtDetail(${JSON.stringify(d)})`);
  const imgHTML=imgSrc?`<img class="zc-img" src="${imgSrc}"/>`:'';
  zc.innerHTML=`${imgHTML}<div class="zc-body"><div class="zera">${era}</div><div class="ztit">${title}</div><div class="ztxt">${body.substring(0,80)}...</div></div>`;
  document.getElementById('zamanList').insertBefore(zc,document.getElementById('zamanList').firstChild);
  document.getElementById('admZamanList').insertAdjacentHTML('afterbegin',`<div class="ali"><span class="alinm">${title}</span><div class="alibtns"><span class="asi asi-d" onclick="this.closest('.ali').remove()">حذف</span></div></div>`);
  ['aZ-era','aZ-title','aZ-body'].forEach(id=>document.getElementById(id).value='');if(prev)prev.style.display='none';
  showToast('✅ تم إضافة الحكاية');closeAdmin();goTo('zaman');
}
function addService(){
  const name=document.getElementById('aSV-name').value.trim();const phone=document.getElementById('aSV-phone').value.trim();
  if(!name){showToast('⚠️ اكتب الاسم');return}
  document.getElementById('servicesList').insertAdjacentHTML('beforeend',`<div class="svc"><div class="svico" style="background:#e6f4ea"><svg viewBox="0 0 24 24" stroke="#66bb6a" fill="none" width="21" height="21" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/></svg></div><div class="svnm">${name}</div><div class="svph"><a href="tel:${phone}" style="color:var(--g4);text-decoration:none">${phone}</a></div></div>`);
  const svcId='svc-'+Date.now();
  const svcEl=document.getElementById('servicesList').lastElementChild;
  if(svcEl)svcEl.id=svcId;
  document.getElementById('admSvcList').insertAdjacentHTML('afterbegin',`<div class="ali" id="adm-${svcId}"><span class="alinm">${name} — ${phone}</span><div class="alibtns"><span class="asi asi-ok" onclick="editService('${svcId}','${name}','${phone}')">تعديل</span><span class="asi asi-d" onclick="document.getElementById('${svcId}')&&document.getElementById('${svcId}').remove();document.getElementById('adm-${svcId}').remove()">حذف</span></div></div>`);
  ['aSV-name','aSV-phone'].forEach(id=>document.getElementById(id).value='');showToast('✅ تم إضافة الخدمة');
}
function addPerson(){
  const name=document.getElementById('aP-name').value.trim();const role=document.getElementById('aP-role').value.trim();
  const bio=document.getElementById('aP-bio').value.trim();const prev=document.getElementById('aP-prev');const imgSrc=prev&&prev.style.display!=='none'?prev.src:'';
  if(!name){showToast('⚠️ اكتب الاسم');return}
  const d={type:'person',label:role,title:name,body:bio,img:imgSrc};
  const ac=document.createElement('div');ac.className='art-card';ac.setAttribute('onclick',`openArtDetail(${JSON.stringify(d)})`);
  const imgHTML=imgSrc?`<img class="art-img" src="${imgSrc}"/>`:'';
  ac.innerHTML=`${imgHTML}<div class="art-body"><div class="art-label">👤 ${role}</div><div class="art-title">${name}</div><div class="art-excerpt">${bio.substring(0,80)}...</div></div>`;
  document.getElementById('personsList').insertBefore(ac,document.getElementById('personsList').firstChild);
  document.getElementById('admPersonsList').insertAdjacentHTML('afterbegin',`<div class="ali"><span class="alinm">${name}</span><div class="alibtns"><span class="asi asi-d" onclick="this.closest('.ali').remove()">حذف</span></div></div>`);
  ['aP-name','aP-role','aP-bio'].forEach(id=>document.getElementById(id).value='');if(prev)prev.style.display='none';
  showToast('✅ تم إضافة الشخصية');closeAdmin();goTo('persons');
}
function addHistory(){
  const date=document.getElementById('aH-date').value.trim();const title=document.getElementById('aH-title').value.trim();
  const body=document.getElementById('aH-body').value.trim();const prev=document.getElementById('aH-prev');const imgSrc=prev&&prev.style.display!=='none'?prev.src:'';
  if(!title){showToast('⚠️ اكتب الاسم');return}
  const d={type:'history',label:date,title,body,img:imgSrc};
  const ac=document.createElement('div');ac.className='art-card';ac.setAttribute('onclick',`openArtDetail(${JSON.stringify(d)})`);
  const imgHTML=imgSrc?`<img class="art-img" src="${imgSrc}"/>`:'';
  ac.innerHTML=`${imgHTML}<div class="art-body"><div class="art-label">🏛️ ${date}</div><div class="art-title">${title}</div><div class="art-excerpt">${body.substring(0,80)}...</div></div>`;
  document.getElementById('historyList').insertBefore(ac,document.getElementById('historyList').firstChild);
  document.getElementById('admHistList').insertAdjacentHTML('afterbegin',`<div class="ali"><span class="alinm">${title}</span><div class="alibtns"><span class="asi asi-d" onclick="this.closest('.ali').remove()">حذف</span></div></div>`);
  ['aH-date','aH-title','aH-body'].forEach(id=>document.getElementById(id).value='');if(prev)prev.style.display='none';
  showToast('✅ تم إضافة التاريخ');closeAdmin();goTo('history');
}
function userAddMarket(){window.open('https://wa.me/201000767058?text=أريد نشر إعلان في سوق قويسنا','_blank')}
function userAddJob(){window.open(`https://wa.me/201000767058?text=أريد نشر إعلان وظيفة في تطبيق Quesina City`,'_blank')}
function saveSocials(){
  const map={fb:'lnk-fb',ig:'lnk-ig',yt:'lnk-yt',wa:'lnk-wa'};
  ['fb','ig','yt','wa'].forEach(k=>{const v=document.getElementById('aS-'+k).value;if(v)document.getElementById(map[k]).href=v});
  showToast('✅ تم حفظ الروابط');
}
function changeNewsName(){const name=document.getElementById('aNN')?document.getElementById('aNN').value.trim():'';if(!name)return;document.getElementById('newsSecTitle').textContent=name;showToast('✅ تم تغيير اسم القسم')}
function saveAllSectionNames(){
  const map={
    'sn-news':{lbl:'الأخبار',bnId:'bn-news',secId:'newsSecTitle'},
    'sn-food':{lbl:'المطاعم',bnId:'bn-food'},
    'sn-med':{lbl:'طبي',bnId:'bn-medical'},
    'sn-deliv':{lbl:'توصيل',bnId:'bn-delivery'}
  };
  Object.keys(map).forEach(k=>{
    const inp=document.getElementById(k);if(!inp)return;
    const val=inp.value.trim();if(!val)return;
    if(map[k].bnId){const btn=document.getElementById(map[k].bnId);if(btn){const lbl=btn.querySelector('.blbl');if(lbl)lbl.textContent=val;}}
    if(map[k].secId){const el=document.getElementById(map[k].secId);if(el)el.textContent=val;}
  });
  showToast('✅ تم حفظ أسماء الأقسام');
}
function toggleSecVis(secId,show){
  // hide/show from bottom nav
  const bn=document.getElementById('bn-'+secId);
  if(bn)bn.style.display=show?'':'none';
  // also hide grid icon
  const qcArr=document.querySelectorAll('.qc');
  qcArr.forEach(qc=>{if(qc.getAttribute('onclick')&&qc.getAttribute('onclick').includes("'"+secId+"'"))qc.style.display=show?'':'none';});
  showToast(show?'✅ تم إظهار القسم':'✅ تم إخفاء القسم');
}
function toggleDelivery(forceShow){
  if(forceShow===true)deliveryOn=true;
  else if(forceShow===false)deliveryOn=false;
  else deliveryOn=!deliveryOn;
  const btn=document.getElementById('delivToggle');
  if(btn){btn.textContent=deliveryOn?'إخفاء قسم التوصيل':'إظهار قسم التوصيل';btn.className=deliveryOn?'abtn':'abtn abtn-red';}
  const nb=document.getElementById('bn-delivery');if(nb)nb.style.display=deliveryOn?'':'none';
  const qcArr=document.querySelectorAll('.qc');
  qcArr.forEach(qc=>{if(qc.getAttribute('onclick')&&qc.getAttribute('onclick').includes("'delivery'"))qc.style.display=deliveryOn?'':'none';});
  showToast(deliveryOn?'✅ تم إظهار التوصيل':'✅ تم إخفاء التوصيل');
}

/* NEWS STATIC DELETE */
function deleteNewsStatic(id){
  const map={'news-s-0':0,'news-s-1':1};
  const nc=document.getElementById(id);
  if(nc){nc.remove();}
  else{
    const cards=document.querySelectorAll('#newsList .nc');
    const idx=map[id];
    if(idx!==undefined&&cards[idx])cards[idx].remove();
  }
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  renderHomeNews();showToast('🗑️ تم حذف الخبر');
}

/* ══ JOBS ADMIN PANEL FUNCTIONS ══ */
let currentEditJobId=null;
function openJobAdminEdit(uid,title,company,salary,phone,addr,desc){
  currentEditJobId=uid;
  document.getElementById('jobsListView').style.display='none';
  document.getElementById('jobsEditView').style.display='block';
  document.getElementById('jobEditTitle').textContent='تعديل: '+title;
  document.getElementById('eJ-title').value=title||'';
  document.getElementById('eJ-company').value=company||'';
  document.getElementById('eJ-salary').value=salary||'';
  document.getElementById('eJ-phone').value=phone||'';
  document.getElementById('eJ-addr').value=addr||'';
  document.getElementById('eJ-desc').value=desc||'';
  document.getElementById('eJ-uid').value=uid||'';
  // Load current availability state
  try{
    const jav=JSON.parse(localStorage.getItem('quesina_job_avail')||'{}');
    const isUnavail=jav[uid]===false;
    const openBtn=document.getElementById('jAvBtn-open');
    const closedBtn=document.getElementById('jAvBtn-closed');
    if(openBtn)openBtn.style.outline=isUnavail?'none':'2px solid #2e7d32';
    if(closedBtn)closedBtn.style.outline=isUnavail?'2px solid #c62828':'none';
  }catch(e){}
}
function setJobAvailability(status){
  const uid=document.getElementById('eJ-uid').value;
  if(!uid)return;
  // Save to localStorage
  let jav={};
  try{jav=JSON.parse(localStorage.getItem('quesina_job_avail')||'{}');}catch(e){}
  jav[uid]=(status==='متاح');
  localStorage.setItem('quesina_job_avail',JSON.stringify(jav));
  // Update job card in UI
  const jCard=document.getElementById(uid);
  if(jCard){
    // Add/update unavailable badge
    let badge=jCard.querySelector('.job-avail-badge');
    if(!badge){
      badge=document.createElement('span');
      badge.className='job-avail-badge';
      badge.style.cssText='display:inline-block;font-size:10px;font-weight:800;padding:3px 8px;border-radius:8px;margin-right:6px';
      const jt=jCard.querySelector('.jt');
      if(jt)jt.insertAdjacentElement('afterend',badge);
    }
    if(status==='غير متاح'){
      badge.textContent='🔒 الوظيفة امتلأت';
      badge.style.background='rgba(198,40,40,.1)';
      badge.style.color='#c62828';
      jCard.style.opacity='0.6';
    } else {
      badge.textContent='✅ متاحة';
      badge.style.background='rgba(46,125,50,.1)';
      badge.style.color='#2e7d32';
      jCard.style.opacity='1';
    }
  }
  // Update button highlights
  const openBtn=document.getElementById('jAvBtn-open');
  const closedBtn=document.getElementById('jAvBtn-closed');
  if(openBtn)openBtn.style.outline=status==='متاح'?'2px solid #2e7d32':'none';
  if(closedBtn)closedBtn.style.outline=status==='غير متاح'?'2px solid #c62828':'none';
  showToast(status==='غير متاح'?'🔒 تم وضع الوظيفة كـ "غير متاحة"':'✅ الوظيفة متاحة الآن');
}
function saveJobAdminEdit(){
  const uid=document.getElementById('eJ-uid').value;
  const title=document.getElementById('eJ-title').value.trim();
  const company=document.getElementById('eJ-company').value.trim();
  const salary=document.getElementById('eJ-salary').value.trim();
  const phone=document.getElementById('eJ-phone').value.trim();
  const addr=document.getElementById('eJ-addr').value.trim();
  const desc=document.getElementById('eJ-desc').value.trim();
  if(!title){showToast('⚠️ اكتب المسمى الوظيفي');return;}
  const jcEl=document.getElementById(uid);
  if(jcEl){
    const jt=jcEl.querySelector('.jt');if(jt)jt.textContent=title;
    const jco=jcEl.querySelector('.jco');if(jco)jco.textContent=company;
    const d={title,company,salary,type:'دوام كامل',phone,desc,addr};
    jcEl.setAttribute('onclick',`openJobDetail(${JSON.stringify(d)})`);
  }
  const ac=document.getElementById('adm-'+uid);
  if(ac){const nm=ac.querySelector('div[style*="font-weight:800"]');if(nm)nm.textContent=title;}
  document.getElementById('jobsListView').style.display='block';
  document.getElementById('jobsEditView').style.display='none';
  showToast('✅ تم حفظ بيانات الوظيفة');
}
function deleteJobAdminFromEdit(){
  const uid=document.getElementById('eJ-uid').value;
  if(!confirm('حذف الوظيفة نهائياً؟'))return;
  const el=document.getElementById(uid);if(el)el.remove();
  const adm=document.getElementById('adm-'+uid);
  if(adm)adm.closest('.rest-admin-card')?.remove()||adm.remove();
  document.getElementById('jobsListView').style.display='block';
  document.getElementById('jobsEditView').style.display='none';
  showToast('🗑️ تم حذف الوظيفة');
}
function addJobDirectFromPanel(){
  addJobDirect();
  document.getElementById('jobsListView').style.display='block';
  document.getElementById('jobsAddView').style.display='none';
}
function toggleCustomSpec(sel){
  const inp=document.getElementById('aC-spec-custom');
  if(inp)inp.style.display=sel.value==='أخرى'?'block':'none';
}
/* NEWS DELETE / EDIT */
function deleteNewsItem(id){
  const el=document.getElementById(id);if(el)el.remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  const n=parseInt(document.getElementById('stNews').textContent)-1;
  document.getElementById('stNews').textContent=Math.max(0,n);
  renderHomeNews();showToast('🗑️ تم حذف الخبر');
}
function editNewsItem(id){
  const el=document.getElementById(id);if(!el)return;
  const title=el.querySelector('.ntit').textContent;
  const cat=el.querySelector('.ncat').textContent;
  const date=el.querySelector('.ndt').textContent;
  document.getElementById('aN-title').value=title;
  document.getElementById('aN-cat').value=cat;
  document.getElementById('aN-date').value=date;
  el.remove();const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  const n=parseInt(document.getElementById('stNews').textContent)-1;
  document.getElementById('stNews').textContent=Math.max(0,n);
  admTab('t-news',document.querySelector('.atab'));
  openAdmin();showToast('✏️ عدّل الخبر وأضفه من جديد');
}
/* HOME NEWS */
function renderHomeNews(){
  const src=document.getElementById('newsList');const dest=document.getElementById('homeNewsList');
  if(!src||!dest)return;dest.innerHTML='';
  [...src.querySelectorAll('.nc')].slice(0,3).forEach(nc=>dest.insertAdjacentHTML('beforeend',nc.outerHTML));
}

/* IMAGE PREVIEW */
function prevImg(input,previewId){
  const p=document.getElementById(previewId);
  if(input.files&&input.files[0]){const r=new FileReader();r.onload=e=>{p.src=e.target.result;p.style.display='block'};r.readAsDataURL(input.files[0])}
}

/* TOAST */
function showToast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800);
}

/* CLOSED REST MSG */
function sendClosedRestMsg(){
  const name=document.getElementById('rdClosedName').value.trim();
  const note=document.getElementById('rdClosedNote').value.trim();
  const restName=document.getElementById('rdFullName').textContent;
  if(!note){showToast('⚠️ اكتب رسالتك أولاً');return}
  const msg=encodeURIComponent(`رسالة لـ ${restName}
من: ${name||'زبون'}
${note}`);
  window.open('https://wa.me/201000767058?text='+msg,'_blank');
  showToast('✅ تم إرسال رسالتك');
}
/* MED ADMIN LIST BUILDER */
/* STATIC ITEM CONTROLS */

// Medical static items
function toggleMedVis(id,show){
  const map={'med-static-0':0,'med-static-1':1,'med-static-2':2};
  const cards=document.querySelectorAll('#medList .card');
  const idx=map[id];
  if(cards[idx]!==undefined)cards[idx].style.display=show?'':'none';
  showToast(show?'✅ تم الإظهار':'✅ تم الإخفاء');
}
function deleteMedStatic(id){
  const map={'med-static-0':0,'med-static-1':1,'med-static-2':2};
  const cards=document.querySelectorAll('#medList .card');
  const idx=map[id];
  if(cards[idx]!==undefined)cards[idx].remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  showToast('🗑️ تم الحذف');
}
function editMedStatic(id){
  showToast('✏️ عدّل التفاصيل وأضف من جديد');
  admTab('t-medical',document.querySelector('[onclick*="t-medical"]'));
}

// Transport static items
const transStaticEls=['tr-0','tr-1','tr-2','tr-3','tr-4'];
function deleteTransStatic(idx){
  const cards=document.querySelectorAll('#transList .trc');
  if(cards[idx])cards[idx].remove();
  const adm=document.getElementById('adm-tr-'+idx);if(adm)adm.remove();
  showToast('🗑️ تم حذف الرحلة');
}
function editTransStatic(idx){
  const cards=document.querySelectorAll('#transList .trc');
  if(cards[idx]){
    const num=cards[idx].querySelector('.trnum');
    if(num)document.getElementById('aT-num').value=num.textContent.split('—')[0].trim();
    cards[idx].remove();
    const adm=document.getElementById('adm-tr-'+idx);if(adm)adm.remove();
  }
  admTab('t-transport',document.querySelector('[onclick*="t-transport"]'));
  openAdmin();showToast('✏️ عدّل الرحلة وأضفها من جديد');
}

// Ads static
function deleteAdStatic(idx){
  const slides=document.querySelectorAll('#adsTrack .ads-slide');
  if(slides[idx])slides[idx].remove();
  const adm=document.getElementById('adm-ad-static-'+idx);if(adm)adm.remove();
  initAds();showToast('🗑️ تم حذف الإعلان');
}

// Education static
let currentEditEduId=null;
function openEduEdit(uid,name,sub,phone,addr,hours,type){
  currentEditEduId=uid;
  document.getElementById('eduListView').style.display='none';
  document.getElementById('eduEditView').style.display='block';
  document.getElementById('eduEditTitle').textContent='تعديل: '+name;
  document.getElementById('eEd-name').value=name||'';
  document.getElementById('eEd-sub').value=sub||'';
  document.getElementById('eEd-phone').value=phone||'';
  document.getElementById('eEd-addr').value=addr||'';
  document.getElementById('eEd-hours').value=hours||'';
  document.getElementById('eEd-uid').value=uid||'';
  const typeEl=document.getElementById('eEd-type');
  if(typeEl&&type){for(let i=0;i<typeEl.options.length;i++){if(typeEl.options[i].value===type||typeEl.options[i].text===type){typeEl.selectedIndex=i;break;}}}
}
function saveEduEdit(){
  const uid=document.getElementById('eEd-uid').value;
  const name=document.getElementById('eEd-name').value.trim();
  const sub=document.getElementById('eEd-sub').value.trim();
  const phone=document.getElementById('eEd-phone').value.trim();
  const addr=document.getElementById('eEd-addr').value.trim();
  const hours=document.getElementById('eEd-hours').value.trim();
  if(!name){showToast('⚠️ اكتب الاسم');return;}
  // Update card in main edu list
  const allCards=document.querySelectorAll('#edTab-centers .card, #edTab-teachers .card');
  const idx=uid==='edu-static-0'?0:uid==='edu-static-1'?1:-1;
  if(idx>=0&&allCards[idx]){
    const nm=allCards[idx].querySelector('.cnm');if(nm)nm.textContent=name;
    const sb=allCards[idx].querySelector('.csub');if(sb)sb.textContent=sub;
  }
  // Update admin card label
  const admCard=document.querySelector(`[onclick*="openEduEdit('${uid}'"]`);
  if(admCard){const nm=admCard.querySelector('div[style*="font-weight:800"]');if(nm)nm.textContent=name;}
  refreshEduAdminList();
  document.getElementById('eduListView').style.display='block';
  document.getElementById('eduEditView').style.display='none';
  showToast('✅ تم حفظ بيانات '+name);
}
function deleteEduFromEdit(){
  const uid=document.getElementById('eEd-uid').value;
  if(!confirm('هل أنت متأكد من حذف هذا العنصر نهائياً؟'))return;
  // Remove from main list
  const allCards=document.querySelectorAll('#edTab-centers .card, #edTab-teachers .card');
  const idx=uid==='edu-static-0'?0:uid==='edu-static-1'?1:-1;
  if(idx>=0&&allCards[idx])allCards[idx].remove();
  else{const c=document.querySelector(`[data-edu-id="${uid}"]`);if(c)c.remove();}
  // Remove from admin list
  const admCard=document.querySelector(`[onclick*="openEduEdit('${uid}'"]`);
  if(admCard)admCard.closest('.rest-admin-card')?.remove();
  document.getElementById('eduListView').style.display='block';
  document.getElementById('eduEditView').style.display='none';
  showToast('🗑️ تم الحذف');
}
function refreshEduAdminList(){
  const list=document.getElementById('admEduList');if(!list)return;
  // keep existing static cards, refresh dynamic ones
}
function toggleEduStatic(id,show){
  const all=document.querySelectorAll('#edTab-centers .card, #edTab-teachers .card');
  const idx=id==='edu-static-0'?0:1;
  if(all[idx])all[idx].style.display=show?'':'none';
  showToast(show?'✅ تم الإظهار':'✅ تم الإخفاء');
}
function deleteEduStatic(id){
  const all=document.querySelectorAll('#edTab-centers .card, #edTab-teachers .card');
  const idx=id==='edu-static-0'?0:1;
  if(all[idx])all[idx].remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  showToast('🗑️ تم الحذف');
}

// Jobs static
function toggleJobStatic(id,show){
  const el=document.getElementById(id);
  if(el)el.style.display=show?'':'none';
  showToast(show?'✅ تم الإظهار':'✅ تم الإخفاء');
}
function markJobUnavailableStatic(id){
  const el=document.getElementById(id);
  if(el){
    el.style.opacity='0.5';
    const tags=el.querySelectorAll('.tag.tg');
    tags.forEach(t=>{t.textContent='غير متاح';t.className='tag tr';});
  }
  showToast('✅ تم التعليم كغير متاح');
}
function deleteJobStatic(id){
  const el=document.getElementById(id);if(el)el.remove();
  const adm=document.getElementById('adm-'+id);
  if(adm)adm.closest('.rest-admin-card')?.remove()||adm.remove();
  showToast('🗑️ تم الحذف');
}

// Market static
function markSoldStatic(id){
  const el=document.getElementById(id);
  if(el){
    el.style.opacity='0.6';
    const badge=el.querySelector('.mkbdg');
    if(badge){badge.textContent='مباع';badge.style.background='rgba(198,40,40,.3)';}
  }
  showToast('✅ تم التعليم كمباع');
}
function markUnavailableStatic(id){
  const el=document.getElementById(id);
  if(el){
    el.style.opacity='0.5';
    const badge=el.querySelector('.mkbdg');
    if(badge){badge.textContent='غير متاح';badge.style.background='rgba(255,255,255,.1)';}
  }
  showToast('✅ تم التعليم كغير متاح');
}
function deleteMktStatic(id){
  const el=document.getElementById(id);if(el)el.remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  showToast('🗑️ تم الحذف');
}

// Notif static
function deleteNotifStatic(id){
  const map={
    'notif-static-0':0,
    'notif-static-1':1
  };
  const items=document.querySelectorAll('#notifList > div');
  const idx=map[id];
  if(items[idx]!==undefined)items[idx].remove();
  const adm=document.getElementById('adm-'+id);if(adm)adm.remove();
  showToast('🗑️ تم حذف الإشعار');
}

// Delivery — toggle "other" source input
function toggleOtherDelivery(sel){
  const inp=document.getElementById('dOtherSrc');
  if(inp)inp.style.display=sel.value==='other'?'block':'none';
}


/* PUSH NOTIFICATION PROMPT */
function askPushNotif(contentType,contentTitle){
  const autoOn=document.getElementById('autoNotifToggle');
  if(!autoOn||!autoOn.checked)return;
  const send=confirm('📢 هل تريد إرسال إشعار للمستخدمين بـ "'+contentTitle+'" في '+contentType+'؟');
  if(send){
    // auto-fill notif form and send
    document.getElementById('aNt-type').value='📢 إعلان عام';
    document.getElementById('aNt-text').value='جديد في '+contentType+': '+contentTitle;
    sendNotif();
  }
}
/* INIT */
window.addEventListener('load',()=>{
  initAds();renderHomeNews();
  setTimeout(()=>{document.getElementById('nb').classList.add('show');document.getElementById('ndot').style.display='block'},1500);
  // Init admin lists
  setTimeout(()=>{refreshRestAdminList();refreshMedAdminList();},200);
  // Add FB icons to existing cards that have data-fb
  setTimeout(()=>{
    document.querySelectorAll('#foodList .card[data-fb]').forEach(card=>{
      const fb=card.dataset.fb;
      if(!fb)return;
      const meta=card.querySelector('.cmeta');
      if(meta&&!meta.querySelector('.rest-fb-badge')){
        meta.insertAdjacentHTML('beforeend',`<a class="rest-fb-badge" href="${fb}" target="_blank" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>`);
      }
    });
  },300);
  setTimeout(()=>runSplash(),100);
});



/* ─── MENU BUILDER v11 ─── */
const DEFAULT_MENUS = {
  'مشويات':[{sec:'🍽️ المنيو',items:[]}],
  'مصري':[{sec:'🍽️ المنيو',items:[]}],
  'بيتزا':[{sec:'🍽️ المنيو',items:[]}],
  'مشروبات':[{sec:'🍽️ المنيو',items:[]}]
};

let popupItem=null,popupQty=1;

function buildRestMenu(card,restName){
  const wrap=document.getElementById('rdMenuWrap');
  const tabs=document.getElementById('rdMenuTabs');
  if(!wrap||!tabs)return;
  wrap.innerHTML='';tabs.innerHTML='';
  const id=card.dataset.restId;
  const type=card.dataset.cat||'مشويات';
  // Check for custom saved menus first, fallback to default
  const savedMenus=window.restaurantMenus&&id&&window.restaurantMenus[id];
  if(savedMenus&&savedMenus.length){
    // Build sections from flat item list
    const secMap={};
    savedMenus.forEach(item=>{
      const s=item.section||'🍽️ القائمة';
      if(!secMap[s])secMap[s]=[];
      secMap[s].push(item);
    });
    const sections=Object.keys(secMap).map(s=>({sec:s,items:secMap[s]}));
    renderMenuSections(sections,tabs,wrap);
  } else {
    renderMenuSections(DEFAULT_MENUS[type]||DEFAULT_MENUS['مشويات'],tabs,wrap);
  }
}

function renderMenuSections(sections,tabs,wrap){
  if(!sections||!sections.length)return;
  sections.forEach((sec,idx)=>{
    const btn=document.createElement('button');
    btn.className='mtab'+(idx===0?' active':'');
    btn.textContent=sec.sec;
    btn.onclick=()=>{
      document.querySelectorAll('.mtab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const el=document.getElementById('msec-'+idx);
      if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
    };
    tabs.appendChild(btn);
    const secDiv=document.createElement('div');
    secDiv.className='menu-section';secDiv.id='msec-'+idx;
    secDiv.innerHTML='<div style="font-size:12px;font-weight:800;color:var(--t3);letter-spacing:1px;padding:14px 0 8px">'+sec.sec+'</div>';
    (sec.items||[]).forEach(item=>{
      const div=document.createElement('div');
      div.className='menu-item-v2';
      div.onclick=()=>openItemPopup(item);
      const imgEl=item.img?'<img src="'+item.img+'" class="mi2-img" style="object-fit:cover" alt=""/>'
        :'<div class="mi2-img">'+(item.emoji||'🍽️')+'</div>';
      div.innerHTML=imgEl+'<div class="mi2-info"><div class="mi2-name">'+item.name+'</div><div class="mi2-desc">'+(item.desc||'')+'</div><div class="mi2-bottom"><span class="mi2-price">'+item.price+' جنيه</span><button class="mi2-add" onclick="event.stopPropagation();quickAddCart(\''+item.name+'\','+item.price+')">+</button></div></div>';
      secDiv.appendChild(div);
    });
    wrap.appendChild(secDiv);
  });
}

function openItemPopup(item){
  popupItem=item;popupQty=1;
  document.getElementById('itemPopupName').textContent=item.name;
  document.getElementById('itemPopupDesc').textContent=item.desc||'';
  document.getElementById('itemPopupQty').textContent='1';
  document.getElementById('itemPopupEmoji').textContent=item.emoji||'🍽️';
  const total=item.price;
  document.getElementById('itemPopupTotal').textContent=total+' جنيه';
  document.getElementById('itemPopupTotalBtn').textContent=total+' جنيه';
  if(item.img){document.getElementById('itemPopupImg').src=item.img;document.getElementById('itemPopupImg').style.display='block';document.getElementById('itemPopupImgPh').style.display='none';}
  else{document.getElementById('itemPopupImg').style.display='none';document.getElementById('itemPopupImgPh').style.display='flex';}
  document.getElementById('itemPopup').classList.add('open');
}
function closeItemPopup(){document.getElementById('itemPopup').classList.remove('open');}
function changePopupQty(delta){
  if(!popupItem)return;
  popupQty=Math.max(1,popupQty+delta);
  document.getElementById('itemPopupQty').textContent=popupQty;
  const t=popupItem.price*popupQty;
  document.getElementById('itemPopupTotal').textContent=t+' جنيه';
  document.getElementById('itemPopupTotalBtn').textContent=t+' جنيه';
}
function addItemToCartFromPopup(){
  if(!popupItem)return;
  for(let i=0;i<popupQty;i++)addCart(popupItem.name,popupItem.price,null);
  closeItemPopup();updateRdCartTotal();
  showToast('✅ أُضيف '+popupItem.name+' للسلة');
}
function quickAddCart(name,price){addCart(name,price,null);updateRdCartTotal();showToast('✅ أُضيف للسلة');}
function updateRdCartTotal(){
  const sub=cart.items.reduce((a,i)=>a+(i.price*i.qty),0);
  const el=document.getElementById('rdCartTotal');
  if(el)el.textContent=(sub+20)+' جنيه';
}

/* ─── GPS SORTING ─── */
function sortRestsByGPS(){
  if(!navigator.geolocation){showToast('GPS غير متاح');return}
  showToast('📍 جاري تحديد موقعك...');
  navigator.geolocation.getCurrentPosition(pos=>{
    const list=document.getElementById('foodList');
    const cards=[...list.children];
    cards.sort(()=>Math.random()-.5);
    cards.forEach(c=>list.appendChild(c));
    showToast('✅ تم ترتيب المطاعم حسب موقعك');
  },()=>showToast('⚠️ لم نتمكن من تحديد موقعك'));
}

/* ═══════════════════════════════════════════════════════
   FIREBASE AUTH & FLOW
═══════════════════════════════════════════════════════ */
let confirmationResult = null;
let currentRatingOrderId = null;
let currentRatingVendorId = null;
let currentRatingValue = 0;
let vendorOrdersListener = null;

// ── SPLASH ──
function runSplash(){
  const logo=document.getElementById('splashLogo');
  const txt=document.getElementById('splashText');
  const bar=document.getElementById('splashBar');
  setTimeout(()=>{logo.style.opacity='1';logo.style.transform='scale(1)';},100);
  setTimeout(()=>{txt.style.opacity='1';},400);
  setTimeout(()=>{bar.style.width='100%';},200);
  setTimeout(()=>{
    const sp=document.getElementById('splashScreen');
    sp.style.opacity='0';
    setTimeout(()=>{sp.style.display='none';checkAuth();},500);
  },2500);
}

// ── AUTH STATE ──
function checkAuth(){
  // Show auth screen for login
  document.getElementById('authScreen').style.display='block';
}

function routeByRole(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('vendorScreen').style.display='none';
  if(currentRole==='admin'){
    // Show main app with admin panel auto-opened
    showMainApp();
    // Add role manager button to admin panel
    addRoleManagerBtn();
  } else if(['restaurant','doctor','craftsman','delivery'].includes(currentRole)){
    showVendorDashboard();
  } else {
    showMainApp();
  }
}

function showMainApp(){
  document.getElementById('vendorScreen').style.display='none';
  const adminBtn=document.getElementById('adminBtn');
  if(adminBtn) adminBtn.style.display=(currentRole==='admin')?'flex':'none';
  // Also hide/show admin button in More drawer
  const moreAdminBtn=document.getElementById('moreAdminBtn');
  if(moreAdminBtn) moreAdminBtn.style.display=(currentRole==='admin')?'flex':'none';
  // Update UI for logged-in user
  const name=currentUser?currentUser.displayName||currentUser.email||'':'';
  // Add "My Orders" button to bottom nav if user
  addMyOrdersBtn();
  // Load real-time notifications
  if(currentUser)listenNotifications();
}

// ── NEW PHONE-BASED AUTH ──
let _regOtpCode = '';
let _regVerifiedPhone = '';
let _forgotOtpCode = '';
let _forgotStep = 1;

function authSwitchTab(tab) {
  const pL = document.getElementById('panelLogin');
  const pS = document.getElementById('panelSignup');
  const tL = document.getElementById('tabLogin');
  const tS = document.getElementById('tabSignup');
  const ae = document.getElementById('authErr');
  if(pL) pL.style.display = tab==='login' ? 'block' : 'none';
  if(pS) pS.style.display = tab==='signup' ? 'block' : 'none';
  if(tL){tL.style.background=tab==='login'?'#E85D04':'transparent';tL.style.color=tab==='login'?'#fff':'#999';}
  if(tS){tS.style.background=tab==='signup'?'#E85D04':'transparent';tS.style.color=tab==='signup'?'#fff':'#999';}
  if(ae) ae.style.display = 'none';
  if(tab==='signup') showSignupStep(1);
  if(tab==='login') showForgot(false);
}

function togglePassVis(id){
  const el=document.getElementById(id);
  if(el) el.type = el.type==='password' ? 'text' : 'password';
}

function showSignupStep(step){
  [1,2,3].forEach(n=>{
    const el=document.getElementById('signupStep'+n);
    if(el) el.style.display = n===step ? 'block' : 'none';
  });
}

function showForgot(show){
  const s1=document.getElementById('loginStep1');
  const fp=document.getElementById('loginForgotPanel');
  if(s1) s1.style.display = show ? 'none' : 'block';
  if(fp) fp.style.display = show ? 'block' : 'none';
  if(show){ _forgotStep=1; resetForgotUI(); }
}

function resetForgotUI(){
  const otpDiv=document.getElementById('forgotOtpDiv');
  const npDiv=document.getElementById('forgotNewPassDiv');
  const btn=document.getElementById('forgotBtn');
  const sub=document.getElementById('forgotSubText');
  if(otpDiv) otpDiv.style.display='none';
  if(npDiv) npDiv.style.display='none';
  if(btn) btn.textContent='إرسال كود واتساب';
  if(sub) sub.textContent='سيتم إرسال كود التحقق على واتساب';
}

function forgotStep(){
  const phone=(document.getElementById('forgotPhone').value||'').trim();
  const otp=(document.getElementById('forgotOtp')||{value:''}).value.trim();
  const np=(document.getElementById('forgotNewPass')||{value:''}).value.trim();
  const btn=document.getElementById('forgotBtn');
  if(_forgotStep===1){
    if(!phone){showAuthErr('يرجى إدخال رقم الموبایل');return;}
    _forgotOtpCode = String(Math.floor(100000+Math.random()*900000));
    const waNum='201000767058';
    const msg=encodeURIComponent('🔑 كود التحقق لـ Q APP: ' + _forgotOtpCode + '\nصالح لمدة ١٠ دقائق فقط.');
    window.open('https://wa.me/'+waNum+'?text='+msg,'_blank');
    document.getElementById('forgotSubText').textContent='تم إرسال الكود على واتساب (' + phone + ')';
    document.getElementById('forgotOtpDiv').style.display='block';
    if(btn) btn.textContent='تحقق من الكود';
    _forgotStep=2;
  } else if(_forgotStep===2){
    if(otp!==_forgotOtpCode){showAuthErr('❌ الكود غير صحيح، تحقق من واتساب');return;}
    document.getElementById('forgotNewPassDiv').style.display='block';
    if(btn) btn.textContent='تغيير كلمة المرور';
    _forgotStep=3;
  } else if(_forgotStep===3){
    if(!np||np.length<6){showAuthErr('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');return;}
    // Save new password
    try{
      let u=JSON.parse(localStorage.getItem('quesina_user')||'{}');
      if(u.phone===phone||u.phoneNumber===phone){u.password=np;localStorage.setItem('quesina_user',JSON.stringify(u));}
    }catch(e){}
    showForgot(false);
    showAuthErr_green('✅ تم تغيير كلمة المرور بنجاح!');
  }
}

function showAuthErr_green(msg){
  const e=document.getElementById('authErr');
  if(!e)return;
  e.style.background='rgba(46,125,50,.1)';
  e.style.borderColor='rgba(46,125,50,.3)';
  e.style.color='#2e7d32';
  e.textContent=msg;e.style.display='block';
  setTimeout(()=>{e.style.display='none';e.style.background='';e.style.borderColor='';e.style.color='';},4000);
}

function authForgotPassword(){ showForgot(true); }

function doPhoneLogin(){
  const phone=(document.getElementById('loginPhone').value||'').trim();
  const pass=(document.getElementById('loginPass').value||'').trim();
  if(!phone||!pass){showAuthErr('يرجى إدخال رقم الموبايل وكلمة المرور');return;}

  // ── Secure admin check: phone in ADMIN_PHONES + password from QDB ──
  const adminConfig = QDB.get('admin_config') || {};
  const adminPhone = adminConfig.phone || '01000767058';
  const adminPass  = adminConfig.password || '';
  const cleanPhone = phone.replace(/^0?2?/, '').replace(/\s/g,'');
  const isAdminPhone = ADMIN_PHONES.some(p=>p.replace(/^0?2?/,'')===cleanPhone) || phone===adminPhone;
  
  if(isAdminPhone && adminPass && pass===adminPass){
    document.getElementById('authScreen').style.display='none';
    currentRole='admin';
    currentUser={uid:'secure-admin',displayName:'المدير',email:'',phoneNumber:phone};
    showMainApp(); addRoleManagerBtn(); return;
  }
  // Legacy admin fallback (first login before setting password)
  if(isAdminPhone && !adminPass && pass==='admin123'){
    document.getElementById('authScreen').style.display='none';
    currentRole='admin';
    currentUser={uid:'secure-admin',displayName:'المدير',email:'',phoneNumber:phone};
    showMainApp(); addRoleManagerBtn();
    showToast('⚠️ من فضلك غيّر كلمة مرور المدير من الإعدادات');
    return;
  }

  // ── Vendor check from QDB ──
  const vendors = QDB.get('vendors') || {};
  for(const vid in vendors){
    const v=vendors[vid];
    if((v.phone===phone||v.phoneNumber===phone) && v.password===pass){
      document.getElementById('authScreen').style.display='none';
      currentRole=v.role||'restaurant';
      currentVendorId=vid;
      currentUser={uid:vid,displayName:v.name||v.vendorName||'بائع',email:'',phoneNumber:phone};
      showVendorDashboard(); return;
    }
  }

  // ── Regular user check from QDB ──
  const users = QDB.get('users') || {};
  for(const uid in users){
    const u=users[uid];
    if((u.phone===phone||u.phoneNumber===phone) && u.password===pass){
      localUser=u;
      currentUser={uid,displayName:u.name||'مستخدم',email:u.email||'',phoneNumber:phone};
      currentRole='user';
      document.getElementById('authScreen').style.display='none';
      showMainApp(); showToast('✅ مرحباً بك، '+u.name+'!'); return;
    }
  }
  showAuthErr('❌ رقم الموبايل أو كلمة المرور غير صحيحة');
}

function doBiometricLogin(){
  if(window.PublicKeyCredential){
    // WebAuthn available — try platform authenticator
    navigator.credentials.get({publicKey:{
      challenge: new Uint8Array(32),
      timeout: 60000,
      userVerification: 'required',
      rpId: location.hostname || 'localhost'
    }}).then(cred=>{
      // Biometric success — check for saved user
      try{
        const s=localStorage.getItem('quesina_user');
        if(s){
          const u=JSON.parse(s);
          localUser=u; currentUser={uid:'biometric-user',displayName:u.name||'مستخدم',email:u.email||'',phoneNumber:u.phone||''};
          currentRole='user';
          document.getElementById('authScreen').style.display='none';
          showMainApp(); showToast('✅ تم الدخول بالبصمة!');
        } else {
          showAuthErr('⚠️ لا يوجد حساب مسجل — أنشئ حسابك أولاً');
        }
      }catch(e){ authSkip(); }
    }).catch(err=>{
      // Fallback if no credential registered
      const saved=localStorage.getItem('quesina_user');
      if(saved){
        try{const u=JSON.parse(saved);localUser=u;currentUser={uid:'bio-fallback',displayName:u.name||'مستخدم',email:u.email||'',phoneNumber:u.phone||''};currentRole='user';document.getElementById('authScreen').style.display='none';showMainApp();showToast('✅ تم التحقق بالبصمة!');}
        catch(ex){showAuthErr('تعذر الدخول بالبصمة');}
      } else {
        showAuthErr('⚠️ سجّل حسابك أولاً ثم فعّل البصمة');
      }
    });
  } else {
    // No WebAuthn — use saved user
    try{
      const s=localStorage.getItem('quesina_user');
      if(s){const u=JSON.parse(s);localUser=u;currentUser={uid:'local-bio',displayName:u.name||'مستخدم',email:u.email||'',phoneNumber:u.phone||''};currentRole='user';document.getElementById('authScreen').style.display='none';showMainApp();showToast('✅ مرحباً بك!');}
      else{showAuthErr('⚠️ هذا الجهاز لا يدعم البصمة');}
    }catch(e){showAuthErr('⚠️ خطأ في التحقق');}
  }
}

function sendRegOtp(){
  const phone=(document.getElementById('regPhone').value||'').trim();
  if(!phone||phone.length<10){showAuthErr('يرجى إدخال رقم موبايل صحيح (١٠ أرقام على الأقل)');return;}
  _regOtpCode = String(Math.floor(100000+Math.random()*900000));
  _regVerifiedPhone = phone;
  // Open WhatsApp to send OTP
  const waNum='201000767058';
  const msg=encodeURIComponent('✅ كود تأكيد تسجيل Q APP: ' + _regOtpCode + '\nصالح لمدة ١٠ دقائق فقط.\nلا تشاركه مع أحد.');
  window.open('https://wa.me/'+waNum+'?text='+msg,'_blank');
  const msgEl=document.getElementById('otpSentMsg');
  if(msgEl) msgEl.textContent='تم إرسال الكود على واتساب (' + phone + ')';
  showSignupStep(2);
  showToast('📲 تم إرسال الكود على واتساب');
}

function verifyRegOtp(){
  const entered=(document.getElementById('regOtp').value||'').trim();
  if(!entered){showAuthErr('يرجى إدخال كود التأكيد');return;}
  if(entered===_regOtpCode){
    showSignupStep(3);
    showToast('✅ تم التحقق من رقمك بنجاح!');
  } else {
    showAuthErr('❌ الكود غير صحيح — تحقق من واتساب وأعد المحاولة');
  }
}

// ══ SIGNUP OTP FLOW ══
let _pendingRegData = null;

function startOtpVerification(){
  // Validate all fields first
  const name=(document.getElementById('regName').value||'').trim();
  const email=(document.getElementById('regEmail')?document.getElementById('regEmail').value||'':'').trim();
  const phone=(document.getElementById('regPhone')?document.getElementById('regPhone').value||'':'').trim();
  const pass=(document.getElementById('regPass').value||'').trim();
  const passConf=(document.getElementById('regPassConf').value||'').trim();
  const agreed=document.getElementById('agreeTermsNew')?document.getElementById('agreeTermsNew').checked:false;
  const dob=(document.getElementById('regDob').value||'').trim();
  const gender=(document.getElementById('regGender').value||'').trim();
  if(!name){showAuthErr('⚠️ الاسم الكامل مطلوب');document.getElementById('regName')?.focus();return;}
  if(!email){showAuthErr('⚠️ البريد الإلكتروني مطلوب');document.getElementById('regEmail')?.focus();return;}
  if(!/^[^@]+@[^@]+\.[^@]+$/.test(email)){showAuthErr('⚠️ صيغة البريد غير صحيحة');document.getElementById('regEmail')?.focus();return;}
  if(!phone||phone.length<10){showAuthErr('⚠️ رقم الموبايل مطلوب (١٠ أرقام)');document.getElementById('regPhone')?.focus();return;}
  if(!pass||pass.length<6){showAuthErr('⚠️ كلمة المرور ٦ أحرف على الأقل');document.getElementById('regPass')?.focus();return;}
  if(pass!==passConf){showAuthErr('⚠️ كلمتا المرور غير متطابقتين');document.getElementById('regPassConf')?.focus();return;}
  if(!agreed){showAuthErr('⚠️ يجب الموافقة على الشروط والأحكام');return;}
  // Check duplicate email
  try{const users=QDB.get('users')||{};if(Object.values(users).find(u=>u.email===email)){showAuthErr('⚠️ هذا البريد مستخدم بالفعل');return;}}catch(e){}
  // Save pending data
  _pendingRegData={name,email,phone,pass,dob,gender};
  // Generate & send OTP
  _regOtpCode=String(Math.floor(100000+Math.random()*900000));
  _regVerifiedPhone=phone;
  const waNum='2'+phone.replace(/^0/,'');
  const msg=encodeURIComponent('🔐 كود تأكيد Q APP\n\nالكود: *'+_regOtpCode+'*\n\nصالح لمدة ١٠ دقائق فقط.\nلا تشاركه مع أحد.');
  window.open('https://wa.me/'+waNum+'?text='+msg,'_blank');
  // Show Phase B
  document.getElementById('signupPhaseA').style.display='none';
  document.getElementById('signupPhaseB').style.display='block';
  const msgEl=document.getElementById('otpSentMsg');
  if(msgEl)msgEl.textContent='📩 تم إرسال الكود على واتساب رقم '+phone;
  document.getElementById('regOtp').value='';
  document.getElementById('regOtp').focus();
  showAuthErr('');
}

function resendOtpCode(){
  if(!_pendingRegData){backToSignupForm();return;}
  _regOtpCode=String(Math.floor(100000+Math.random()*900000));
  const phone=_pendingRegData.phone;
  const waNum='2'+phone.replace(/^0/,'');
  const msg=encodeURIComponent('🔐 كود تأكيد Q APP\n\nالكود: *'+_regOtpCode+'*\n\nصالح لمدة ١٠ دقائق.\nلا تشاركه مع أحد.');
  window.open('https://wa.me/'+waNum+'?text='+msg,'_blank');
  showToast('📲 تم إعادة إرسال الكود');
  document.getElementById('regOtp').value='';
  document.getElementById('regOtp').focus();
}

function backToSignupForm(){
  document.getElementById('signupPhaseA').style.display='block';
  document.getElementById('signupPhaseB').style.display='none';
  showAuthErr('');
}

function verifyOtpAndRegister(){
  const entered=(document.getElementById('regOtp').value||'').trim();
  if(!entered){showAuthErr('⚠️ أدخل كود التأكيد');return;}
  if(entered!==_regOtpCode){
    showAuthErr('❌ الكود غير صحيح — تحقق من واتساب وأعد المحاولة');
    document.getElementById('regOtp').style.borderColor='#e53935';
    return;
  }
  if(!_pendingRegData){showAuthErr('⚠️ بيانات التسجيل ضاعت، ابدأ من جديد');backToSignupForm();return;}
  document.getElementById('regOtp').style.borderColor='#43a047';
  // Create account
  const {name,email,phone,pass,dob,gender}=_pendingRegData;
  const newUid='user_'+Date.now();
  localUser={uid:newUid,name,email,phone,phoneNumber:phone,dob,gender,password:pass,role:'user',avatar:'',addresses:[],verified:true};
  const users=QDB.get('users')||{};
  users[newUid]=localUser;
  QDB.set('users',users);
  try{localStorage.setItem('quesina_user',JSON.stringify(localUser));}catch(e){}
  currentRole='user';
  currentUser={uid:newUid,displayName:name,email,phoneNumber:phone};
  _pendingRegData=null;
  document.getElementById('authScreen').style.display='none';
  showMainApp();
  showToast('🎉 مرحباً '+name+'! تم تأكيد حسابك بنجاح ✅');
}

function completeRegistration(){
  // legacy alias — now routes through OTP
  startOtpVerification();
}

function authSkip(){
  document.getElementById('authScreen').style.display='none';
  currentRole='guest';
  currentUser={uid:'guest',displayName:'زائر',email:'',phoneNumber:''};
  showMainApp();
}

function authGoogle(){
  document.getElementById('authScreen').style.display='none';
  currentRole='user';
  currentUser={uid:'local-google-'+Date.now(),displayName:'مستخدم Google',email:'google@user.com',phoneNumber:''};
  showMainApp();
}

function authPhone(){
  document.getElementById('phonePanel').style.display=
    document.getElementById('phonePanel').style.display==='none'?'block':'none';
}

function sendOTP(){
  document.getElementById('authScreen').style.display='none';
  currentRole='admin';
  currentUser={uid:'local-admin',displayName:'المدير',email:SUPER_ADMIN_EMAIL,phoneNumber:''};
  showMainApp();
}
function verifyOTP(){sendOTP();}

async function authBiometric(){
  if(!window.PublicKeyCredential){showAuthErr('البصمة غير مدعومة على هذا الجهاز');return}
  showAuthErr('سجّل دخول بالبريد أولاً لتفعيل البصمة');
}

function authForgotPassword(){showToast('غير متاح في الوضع المحلي');}

function getAuthErr(code){
  const msgs={
    'auth/email-already-in-use':'البريد مستخدم بالفعل',
    'auth/wrong-password':'كلمة المرور خاطئة',
    'auth/user-not-found':'المستخدم غير موجود',
    'auth/invalid-email':'بريد إلكتروني غير صحيح',
    'auth/too-many-requests':'محاولات كثيرة، حاول لاحقاً',
    'auth/network-request-failed':'تحقق من الاتصال بالإنترنت',
    'auth/popup-closed-by-user':'تم إغلاق نافذة الدخول',
  };
  return msgs[code]||'حدث خطأ، حاول مجدداً';
}

/* ═══════════════════════════════════════════════════════
   ROLE MANAGER (Super Admin Only)
═══════════════════════════════════════════════════════ */
function addRoleManagerBtn(){
  const admBdy=document.querySelector('.adm-bdy');
  if(!admBdy||document.getElementById('roleManagerBtn'))return;
  const btn=document.createElement('button');
  btn.id='roleManagerBtn';
  btn.className='abtn';btn.style.background='linear-gradient(135deg,#6a1b9a,#8e24aa)';
  btn.style.marginBottom='10px';
  btn.textContent='👑 إدارة أدوار المستخدمين';
  btn.onclick=openRoleManager;
  admBdy.insertBefore(btn,admBdy.firstChild);
}

async function openRoleManager(){
  document.getElementById('roleManagerScreen').style.display='block';
  loadAllUsers();
}

function assignRole(){showToast('✅ تم تعيين الدور (offline mode)');}
function loadAllUsers(){
  const list=document.getElementById('allUsersList');
  if(list)list.innerHTML='<div style="font-size:11px;color:var(--t3);text-align:center;padding:10px">وضع بدون إنترنت</div>';
}

/* ═══════════════════════════════════════════════════════
   VENDOR DASHBOARD LOGIC — Full role-based system
═══════════════════════════════════════════════════════ */

// Vendors registry — admin sets these via role manager
// Format: email → { role, vendorId, vendorName, entityType, waNumber }
const vendorsRegistry = {};
try {
  const _vr = localStorage.getItem('quesina_vendors');
  if (_vr) Object.assign(vendorsRegistry, JSON.parse(_vr));
} catch(e) {}
// Sync vendorsRegistry with QDB
function syncVendorsToQDB(){
  const vendors = QDB.get('vendors')||{};
  // Merge: QDB vendors take precedence for phone-based login
  Object.entries(vendors).forEach(([vid,v])=>{
    if(v.email && !vendorsRegistry[v.email]){
      vendorsRegistry[v.email]=v;
    }
  });
}
syncVendorsToQDB();

function saveVendorsRegistry() {
  try { localStorage.setItem('quesina_vendors', JSON.stringify(vendorsRegistry)); } catch(e) {}
}

// Per-vendor orders (stored locally, key = vendorId)
const vendorOrdersStore = {};
try {
  const _vo = localStorage.getItem('quesina_vendor_orders');
  if (_vo) Object.assign(vendorOrdersStore, JSON.parse(_vo));
} catch(e) {}

function saveVendorOrders() {
  try { localStorage.setItem('quesina_vendor_orders', JSON.stringify(vendorOrdersStore)); } catch(e) {}
}

// Role emoji map
const roleEmoji = {
  restaurant: '🍽️', shop: '🏪', doctor: '🏥', craftsman: '🔧',
  delivery: '🛵', pharmacy: '💊', education: '📚'
};
const roleLabels = {
  restaurant: 'صاحب مطعم', shop: 'صاحب محل', doctor: 'دكتور / عيادة',
  craftsman: 'حرفي / أسطى', delivery: 'مندوب توصيل',
  pharmacy: 'صيدلية', education: 'سنتر / مدرس'
};

function showVendorDashboard() {
  const screen = document.getElementById('vendorScreen');
  screen.style.display = 'flex';

  // Set role info
  const role = currentRole || 'restaurant';
  const vendorInfo = vendorsRegistry[currentUser?.email] || {};
  const vendorId = currentVendorId || vendorInfo.vendorId || 'default';
  const displayName = vendorInfo.vendorName || currentUser?.displayName || 'لوحة التحكم';

  document.getElementById('vendorRoleLabel').textContent = roleLabels[role] || 'بائع';
  document.getElementById('vendorName').textContent = displayName;
  document.getElementById('vendorAvatarIcon').textContent = roleEmoji[role] || '🏪';

  // Show/hide tabs based on role
  const notifyTab = document.getElementById('vt-notify');
  if (role === 'delivery') {
    if (notifyTab) notifyTab.style.display = 'flex';
  }

  // Load orders for this vendor
  refreshVendorOrders();
  loadVendorStats();
  loadVendorMenuItems();
  vTab('orders', document.getElementById('vt-orders'));
}

let vendorOrderFilter = '';

function vTab(tab, btn) {
  ['orders','notify','menu','stats'].forEach(t => {
    const panel = document.getElementById('vp' + t.charAt(0).toUpperCase() + t.slice(1));
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
    const bt = document.getElementById('vt-' + t);
    if (bt) {
      bt.style.color = t === tab ? '#E85D04' : '#9a9a9a';
      bt.style.borderBottomColor = t === tab ? '#E85D04' : 'transparent';
    }
  });
  if (tab === 'stats') loadVendorStats();
}

function filterVendorOrders(status) {
  vendorOrderFilter = status;
  // Update filter buttons
  ['all','new','prog','done'].forEach(k => {
    const b = document.getElementById('vof-' + k);
    if (b) { b.style.background = '#fff'; b.style.color = '#9a9a9a'; b.style.border = '1px solid #e0e0e0'; }
  });
  const activeMap = { '': 'all', 'جديد': 'new', 'جاري': 'prog', 'تم التوصيل': 'done' };
  const activeBtn = document.getElementById('vof-' + (activeMap[status] || 'all'));
  if (activeBtn) { activeBtn.style.background = '#E85D04'; activeBtn.style.color = '#fff'; activeBtn.style.border = 'none'; }
  refreshVendorOrders();
}

function refreshVendorOrders() {
  const vendorId = currentVendorId || vendorsRegistry[currentUser?.email]?.vendorId || 'default';
  const allOrders = vendorOrdersStore[vendorId] || [];
  const filtered = vendorOrderFilter ? allOrders.filter(o => o.status === vendorOrderFilter) : allOrders;
  const list = document.getElementById('vendorOrdersList');
  if (!list) return;

  if (!filtered.length) {
    list.innerHTML = `<div style="text-align:center;padding:40px 20px;color:#b0b0b0">
      <div style="font-size:36px;margin-bottom:8px">📦</div>
      <div style="font-size:13px;font-weight:700">لا توجد طلبات${vendorOrderFilter ? ' بهذه الحالة' : ' بعد'}</div>
      <div style="font-size:11px;margin-top:4px">ستظهر الطلبات هنا فور وصولها</div>
    </div>`;
    return;
  }

  list.innerHTML = '';
  filtered.forEach((ord, idx) => {
    const realIdx = allOrders.indexOf(ord);
    const statusColor = ord.status === 'جديد' ? '#e65100' : ord.status === 'جاري' ? '#1565c0' : ord.status === 'تم التوصيل' ? '#2e7d32' : '#c62828';
    const statusBg = ord.status === 'جديد' ? '#fff3e0' : ord.status === 'جاري' ? '#e3f2fd' : ord.status === 'تم التوصيل' ? '#e8f5e9' : '#ffebee';
    list.insertAdjacentHTML('beforeend', `
      <div style="background:#fff;border-radius:14px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="font-size:13px;font-weight:900;color:#1a1a1a">${ord.customerName || 'عميل'}</div>
          <span style="background:${statusBg};color:${statusColor};font-size:10px;font-weight:800;padding:3px 10px;border-radius:20px">${ord.status}</span>
        </div>
        <div style="font-size:11px;color:#9a9a9a;margin-bottom:4px">📱 ${ord.customerPhone || '—'}</div>
        <div style="font-size:11px;color:#9a9a9a;margin-bottom:4px">📍 ${ord.customerAddr || '—'}</div>
        <div style="font-size:11px;color:#5a3020;margin-bottom:8px;line-height:1.5">${ord.items || '—'}</div>
        <div style="font-size:13px;font-weight:900;color:#E85D04;margin-bottom:10px">💰 ${ord.total || 0} جنيه</div>
        <div style="font-size:10px;color:#b0b0b0;margin-bottom:10px">⏰ ${ord.timestamp || ''}</div>
        <!-- Action buttons -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px">
          <button onclick="setVendorOrderStatus('${vendorId}',${realIdx},'جاري')" style="background:#e3f2fd;border:none;color:#1565c0;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">🔄 جاري</button>
          <button onclick="setVendorOrderStatus('${vendorId}',${realIdx},'تم التوصيل')" style="background:#e8f5e9;border:none;color:#2e7d32;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">✅ تم</button>
          <button onclick="setVendorOrderStatus('${vendorId}',${realIdx},'ملغي')" style="background:#ffebee;border:none;color:#c62828;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">❌ إلغاء</button>
        </div>
        <!-- Notify customer buttons -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <button onclick="notifyCustomerWA('${ord.customerPhone || ''}','🔄 طلبك يتم تحضيره الآن!')" style="background:#e8f8ee;border:1px solid rgba(37,211,102,.3);color:#25D366;border-radius:8px;padding:7px;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit">📩 يتم التحضير</button>
          <button onclick="notifyCustomerWA('${ord.customerPhone || ''}','🛵 طلبك خرج للتوصيل!')" style="background:#e8f8ee;border:1px solid rgba(37,211,102,.3);color:#25D366;border-radius:8px;padding:7px;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit">📩 في الطريق</button>
        </div>
      </div>`);
  });

  // Update badge
  const newCount = allOrders.filter(o => o.status === 'جديد').length;
  const badge = document.getElementById('vendorNewOrderBadge');
  if (badge) { badge.textContent = newCount; badge.style.display = newCount > 0 ? 'flex' : 'none'; }
}

function setVendorOrderStatus(vendorId, idx, status) {
  if (!vendorOrdersStore[vendorId] || !vendorOrdersStore[vendorId][idx]) return;
  const ord = vendorOrdersStore[vendorId][idx];
  ord.status = status;
  saveVendorOrders();
  // Sync status to user's order history in localStorage
  try{
    const statusMap={'جاري':'قيد_التحضير','تم التوصيل':'تم التوصيل',ملغي:'ملغي',جديد:'جديد'};
    let myOrders=JSON.parse(localStorage.getItem('quesina_my_orders')||'[]');
    const userOrd=myOrders.find(o=>o.restId===vendorId||(ord.customerPhone&&o.phone===ord.customerPhone));
    if(userOrd){userOrd.status=statusMap[status]||status;}
    localStorage.setItem('quesina_my_orders',JSON.stringify(myOrders));
    // Broadcast status update
    const bc=new BroadcastChannel('quesina_db');
    bc.postMessage({key:'order_status',orderId:ord.id||'',status,vendorId,ts:Date.now()});
    bc.close();
  }catch(e){}
  refreshVendorOrders();
  loadVendorStats();
  // Notify vendor of status change
  const statusLabels={'جاري':'🔄 قيد التحضير','تم التوصيل':'✅ تم التوصيل','ملغي':'❌ ملغي'};
  showToast((statusLabels[status]||status)+' — تم تحديث الطلب');
}

function notifyCustomerWA(phone, message) {
  if (!phone) { showToast('⚠️ رقم الهاتف غير متاح'); return; }
  const num = '2' + phone.replace(/^0/, '');
  window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(message), '_blank');
}

function sendVendorNotif(message) {
  const phone = document.getElementById('vNotifPhone')?.value.trim() || '';
  if (!phone) {
    // Show in notify panel
    document.getElementById('vNotifMsg').value = message;
    showToast('✅ الرسالة جاهزة — أدخل رقم الهاتف وأرسل');
    return;
  }
  notifyCustomerWA(phone, message);
}

function sendVendorCustomNotif() {
  const phone = document.getElementById('vNotifPhone')?.value.trim() || '';
  const msg = document.getElementById('vNotifMsg')?.value.trim() || '';
  if (!phone) { showToast('⚠️ أدخل رقم هاتف العميل'); return; }
  if (!msg) { showToast('⚠️ اكتب الرسالة'); return; }
  notifyCustomerWA(phone, msg);
  document.getElementById('vNotifMsg').value = '';
  document.getElementById('vNotifPhone').value = '';
  showToast('✅ تم إرسال الإشعار');
}

function setVendorStatus(status) {
  const vendorId = currentVendorId || vendorsRegistry[currentUser?.email]?.vendorId || '';
  if (vendorId) {
    // Update the card in the main list
    const card = document.querySelector(`#foodList .card[data-rest-id="${vendorId}"], #shopList .card#${vendorId}, #medList .card#${vendorId}`);
    if (card) {
      const badge = card.querySelector('.avon, .avoff, .rst-status');
      if (badge) { badge.textContent = status; badge.className = status === 'مفتوح' ? 'avon rst-status rst-open' : status === 'مشغول' ? 'rst-status rst-busy' : 'avoff rst-status rst-closed'; }
    }
  }
  const statusEl = document.getElementById('vendorCurrentStatus');
  if (statusEl) { statusEl.textContent = status; statusEl.style.color = status === 'مفتوح' ? '#2e7d32' : status === 'مشغول' ? '#e65100' : '#c62828'; }
  showToast(`✅ تم تغيير الحالة إلى: ${status}`);
}

function addVendorItem() {
  const name = document.getElementById('vmItemName').value.trim();
  const price = document.getElementById('vmItemPrice').value.trim();
  const desc = document.getElementById('vmItemDesc').value.trim();
  if (!name) { showToast('⚠️ اكتب اسم الصنف'); return; }
  const list = document.getElementById('vendorMenuList');
  const id = 'vm-' + Date.now();
  const vendorId = currentVendorId || vendorsRegistry[currentUser?.email]?.vendorId || 'default';
  // Save to vendor menu store
  if(!window.vendorMenus) window.vendorMenus={};
  if(!window.vendorMenus[vendorId]) window.vendorMenus[vendorId]=[];
  window.vendorMenus[vendorId].push({id,name,price,desc,available:true});
  try{localStorage.setItem('quesina_vendor_menus',JSON.stringify(window.vendorMenus));}catch(e){}
  renderVendorMenuItem(id, name, price, desc, true, list);
  document.getElementById('vmItemName').value = '';
  document.getElementById('vmItemPrice').value = '';
  document.getElementById('vmItemDesc').value = '';
  showToast('✅ تم إضافة الصنف للمنيو');
}

function renderVendorMenuItem(id, name, price, desc, available, container) {
  const statusColor = available ? '#2e7d32' : '#c62828';
  const statusBg = available ? 'rgba(46,125,50,.1)' : 'rgba(198,40,40,.1)';
  const statusText = available ? '✅ متاح' : '🔒 غير متاح';
  const el = document.createElement('div');
  el.id = id;
  el.style.cssText = 'background:#fff;border-radius:14px;padding:12px;display:flex;align-items:center;gap:10px;box-shadow:0 2px 8px rgba(0,0,0,.06);margin-bottom:8px;opacity:'+(available?'1':'0.6');
  el.innerHTML = `
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:800;color:#1a1a1a">${name}</div>
      ${price ? `<div style="font-size:12px;font-weight:700;color:#E85D04;margin-top:2px">${price} جنيه</div>` : ''}
      ${desc ? `<div style="font-size:11px;color:#9a9a9a;margin-top:2px">${desc}</div>` : ''}
    </div>
    <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
      <span style="background:${statusBg};color:${statusColor};font-size:10px;font-weight:800;padding:3px 8px;border-radius:8px;text-align:center;cursor:pointer" onclick="toggleVendorItemAvail('${id}')">${statusText}</span>
      <button onclick="deleteVendorItem('${id}')" style="background:#ffebee;border:none;color:#c62828;border-radius:8px;padding:4px 8px;cursor:pointer;font-size:11px;font-family:inherit">🗑️ حذف</button>
    </div>`;
  if(container) container.appendChild(el);
}

function toggleVendorItemAvail(id) {
  const vendorId = currentVendorId || vendorsRegistry[currentUser?.email]?.vendorId || 'default';
  if(!window.vendorMenus || !window.vendorMenus[vendorId]) return;
  const item = window.vendorMenus[vendorId].find(i=>i.id===id);
  if(!item) return;
  item.available = !item.available;
  try{localStorage.setItem('quesina_vendor_menus',JSON.stringify(window.vendorMenus));}catch(e){}
  // Refresh the menu list
  loadVendorMenuItems();
  showToast(item.available ? '✅ الصنف متاح الآن' : '🔒 تم إخفاء الصنف');
}

function deleteVendorItem(id) {
  const vendorId = currentVendorId || vendorsRegistry[currentUser?.email]?.vendorId || 'default';
  if(window.vendorMenus && window.vendorMenus[vendorId]){
    window.vendorMenus[vendorId] = window.vendorMenus[vendorId].filter(i=>i.id!==id);
    try{localStorage.setItem('quesina_vendor_menus',JSON.stringify(window.vendorMenus));}catch(e){}
  }
  const el = document.getElementById(id); if(el)el.remove();
  showToast('🗑️ تم حذف الصنف');
}

function loadVendorMenuItems() {
  const vendorId = currentVendorId || vendorsRegistry[currentUser?.email]?.vendorId || 'default';
  if(!window.vendorMenus) try{window.vendorMenus=JSON.parse(localStorage.getItem('quesina_vendor_menus')||'{}');}catch(e){window.vendorMenus={};}
  const list = document.getElementById('vendorMenuList');
  if(!list) return;
  list.innerHTML = '';
  // Get vendor's own items
  const myItems = (window.vendorMenus[vendorId]||[]);
  // Also get items admin added to their restaurant card
  const adminItems = (window.restaurantMenus&&window.restaurantMenus[vendorId])||[];
  // Merge — show admin items first (read-only), then vendor's own
  if(!myItems.length && !adminItems.length){
    list.innerHTML='<div style="text-align:center;padding:20px;color:#b0b0b0;font-size:12px">لا توجد أصناف بعد — أضف أول صنف</div>';
    return;
  }
  if(adminItems.length){
    const sep=document.createElement('div');
    sep.style.cssText='font-size:11px;font-weight:800;color:#E85D04;margin-bottom:8px;padding:6px 10px;background:rgba(232,93,4,.06);border-radius:8px;border:1px solid rgba(232,93,4,.1)';
    sep.textContent='📋 أصناف أضافها الإدارة — يمكنك تعديلها';
    list.appendChild(sep);
    adminItems.forEach(item=>{
      const id='admin-item-'+item.name.replace(/\s/g,'_');
      const available=item.available!==false;
      renderVendorMenuItem(id, item.name, item.price, item.desc||item.description||'', available, list);
    });
  }
  if(myItems.length){
    if(adminItems.length){
      const sep2=document.createElement('div');
      sep2.style.cssText='font-size:11px;font-weight:800;color:#2e7d32;margin:10px 0 8px;padding:6px 10px;background:rgba(46,125,50,.06);border-radius:8px;border:1px solid rgba(46,125,50,.1)';
      sep2.textContent='✅ أصنافك الخاصة';
      list.appendChild(sep2);
    }
    myItems.forEach(item => renderVendorMenuItem(item.id, item.name, item.price, item.desc, item.available, list));
  }
}

function loadVendorStats() {
  const vendorId = currentVendorId || vendorsRegistry[currentUser?.email]?.vendorId || 'default';
  const orders = vendorOrdersStore[vendorId] || [];
  const total = orders.length;
  const pending = orders.filter(o => o.status === 'جاري' || o.status === 'جديد').length;
  const revenue = orders.filter(o => o.status === 'تم التوصيل').reduce((a, o) => a + (parseInt(o.total) || 0), 0);

  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('vStatOrders', total);
  el('vStatRevenue', revenue);
  el('vStatPending', pending);

  // Rating
  const ratings = window.ratingsDB?.[vendorId];
  el('vStatRating', ratings?.count ? '⭐ ' + (ratings.total / ratings.count).toFixed(1) : '—');

  // Recent completed
  const recent = orders.filter(o => o.status === 'تم التوصيل').slice(0, 5);
  const recentList = document.getElementById('vStatRecentList');
  if (recentList) {
    if (!recent.length) { recentList.innerHTML = '<div style="text-align:center;padding:12px;font-size:12px;color:#b0b0b0">لا توجد بيانات بعد</div>'; }
    else {
      recentList.innerHTML = '';
      recent.forEach(o => {
        recentList.insertAdjacentHTML('beforeend', `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f5f5f5"><span style="font-size:12px;color:#1a1a1a">${o.customerName || 'عميل'}</span><span style="font-size:12px;font-weight:700;color:#E85D04">${o.total || 0} ج</span></div>`);
      });
    }
  }
}

// Add orders to vendor when sendCartOrder is called
function routeOrderToVendor(orderData) {
  const restId = orderData.restId || window.currentOpenRestId || '';
  if (!restId) return;
  // Find vendor for this rest
  const vendorEmail = Object.keys(vendorsRegistry).find(
    e => vendorsRegistry[e].vendorId === String(restId)
  );
  if (!vendorEmail) return;
  const vendorId = vendorsRegistry[vendorEmail].vendorId;
  if (!vendorOrdersStore[vendorId]) vendorOrdersStore[vendorId] = [];
  vendorOrdersStore[vendorId].unshift({
    ...orderData,
    status: 'جديد',
    timestamp: new Date().toLocaleTimeString('ar-EG'),
    date: new Date().toLocaleDateString('ar-EG')
  });
  saveVendorOrders();
  // Add to vendor's notification center
  if(typeof addToNotifCenter==='function'){
    addToNotifCenter({
      text:'📦 طلب جديد من '+( orderData.customerName||'عميل')+' — '+( orderData.total||0)+' جنيه',
      icon:'📦', type:'طلب'
    });
  }
  // Send push notification to vendor if currently in vendor dashboard
  triggerVendorOrderAlert(orderData);
}

/* ═══════════════════════════════════════════════════════
   VENDOR LOGIN — from admin panel
═══════════════════════════════════════════════════════ */
function assignVendorRole(email, role, vendorId, vendorName, waNumber) {
  vendorsRegistry[email] = { role, vendorId, vendorName, waNumber: waNumber || '', email };
  // Save to QDB for real-time vendor login by phone
  const vendors = QDB.get('vendors')||{};
  vendors[vendorId] = { role, vendorId, vendorName, waNumber: waNumber||'', email, phone: waNumber||'' };
  QDB.set('vendors', vendors);
  saveVendorsRegistry();
  showToast(`✅ تم تعيين ${roleLabels[role] || role} للبريد: ${email}`);
  renderVendorsList();
}

function removeVendorRole(email) {
  delete vendorsRegistry[email];
  saveVendorsRegistry();
  renderVendorsList();
  showToast('🗑️ تم حذف الصلاحية');
}

function renderVendorsList() {
  const wrap = document.getElementById('vendorsAdminList');
  if (!wrap) return;
  const entries = Object.entries(vendorsRegistry);
  if (!entries.length) {
    wrap.innerHTML = '<div style="text-align:center;padding:12px;font-size:12px;color:var(--t3)">لا يوجد بائعون مسجلون بعد</div>';
    return;
  }
  wrap.innerHTML = '';
  entries.forEach(([email, v]) => {
    wrap.insertAdjacentHTML('beforeend', `
      <div style="background:var(--s2);border-radius:12px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px;border:1px solid var(--bd2)">
        <div style="font-size:22px">${roleEmoji[v.role] || '👤'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:800;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.vendorName || email}</div>
          <div style="font-size:10px;color:var(--t3)">${email} • ${roleLabels[v.role] || v.role} • ID: ${v.vendorId}</div>
        </div>
        <button onclick="removeVendorRole('${email}')" style="background:rgba(198,40,40,.1);border:none;color:#c62828;border-radius:7px;padding:5px 9px;font-size:11px;cursor:pointer;font-family:inherit">حذف</button>
      </div>`);
  });
}

// Try vendor login from admin login system
function tryVendorLogin(email) {
  const vendor = vendorsRegistry[email];
  if (!vendor) return false;
  currentRole = vendor.role;
  currentVendorId = vendor.vendorId;
  document.getElementById('authScreen') && (document.getElementById('authScreen').style.display = 'none');
  showVendorDashboard();
  return true;
}

function listenVendorOrders() { refreshVendorOrders(); }

function authSignOut() { location.reload(); }
function loadVendorMenu(){ loadVendorMenuItems(); }

function triggerVendorOrderAlert(orderData) {
  // Visual alert — flash the orders tab badge
  const badge = document.getElementById('vendorNewOrderBadge');
  if(badge){
    const vendorId = currentVendorId || 'default';
    const count = (vendorOrdersStore[vendorId]||[]).filter(o=>o.status==='جديد').length;
    badge.textContent = count; badge.style.display = 'flex';
    // Pulse animation
    badge.style.animation = 'none';
    setTimeout(()=>badge.style.animation='',10);
  }
  // Browser notification if allowed
  if(Notification && Notification.permission==='granted'){
    new Notification('🛒 طلب جديد!', {
      body: `من: ${orderData.customerName||'عميل'} — ${orderData.total||0} جنيه`,
      icon: '/icon-192.svg'
    });
  }
  // Sound alert (simple beep)
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value=880; gain.gain.value=0.3;
    osc.start(); setTimeout(()=>osc.stop(),200);
    setTimeout(()=>{osc.frequency.value=1100;const o2=ctx.createOscillator();const g2=ctx.createGain();o2.connect(g2);g2.connect(ctx.destination);o2.frequency.value=1100;g2.gain.value=0.3;o2.start();setTimeout(()=>o2.stop(),200);},250);
  }catch(e){}
  // Show toast in vendor dashboard
  const vScreen = document.getElementById('vendorScreen');
  if(vScreen && vScreen.style.display!=='none'){
    showToast('🔔 طلب جديد من '+( orderData.customerName||'عميل'));
    refreshVendorOrders();
  }
}

/* ═══════════════════════════════════════════════════════
   USER ORDER FLOW + TRACKING
═══════════════════════════════════════════════════════ */
function addMyOrdersBtn(){
  const bnav=document.querySelector('.bnav');
  if(!bnav||document.getElementById('bn-myorders'))return;
  const btn=document.createElement('button');
  btn.id='bn-myorders';btn.className='bb';
  btn.innerHTML=`<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg><span class="blbl">طلباتي</span>`;
  btn.onclick=openMyOrders;
  bnav.insertBefore(btn,bnav.lastElementChild);
}

function saveOrderToFirebase(orderData){return null;}

function openMyOrders(){
  const page=document.getElementById('myOrdersPage');
  page.style.display='flex';
  loadMyOrders();
}

function loadMyOrders(){
  const list=document.getElementById('myOrdersList');
  let myOrders=[];
  try{myOrders=JSON.parse(localStorage.getItem('quesina_my_orders')||'[]');}catch(e){}
  if(!myOrders.length){
    list.innerHTML='<div style="text-align:center;padding:40px 20px"><div style="font-size:48px;margin-bottom:12px">🛒</div><div style="font-size:14px;font-weight:700;color:#666">لا توجد طلبات بعد</div><div style="font-size:12px;color:#aaa;margin-top:6px">طلباتك ستظهر هنا مع حالتها التفصيلية</div></div>';
    return;
  }
  list.innerHTML='';
  myOrders.slice(0,20).forEach(function(ord){
    var st=ord.status||'جديد';
    var stColors={'جديد':'#e65100','قيد_التحضير':'#1565c0','في_الطريق':'#2e7d32','تم التوصيل':'#2e7d32','ملغي':'#c62828'};
    var stBg={'جديد':'#fff3e0','قيد_التحضير':'#e3f2fd','في_الطريق':'#e8f5e9','تم التوصيل':'#e8f5e9','ملغي':'#ffebee'};
    var stIcon={'جديد':'🆕','قيد_التحضير':'🔄','في_الطريق':'🛵','تم التوصيل':'✅','ملغي':'❌'};
    var col=stColors[st]||'#E85D04';
    var bg=stBg[st]||'#fff3e0';
    var ico=stIcon[st]||'📦';
    var stKey=st.replace(/ /g,'_');
    var steps=['جديد','قيد_التحضير','في_الطريق','تم التوصيل'];
    var curIdx=steps.indexOf(stKey);
    var pct=((curIdx+1)*25)+'%';
    var stepLabels=['جديد','قيد التحضير','في الطريق','تم التوصيل'];
    var stepsHtml='';
    stepLabels.forEach(function(s,i){stepsHtml+='<div style="font-size:9px;font-weight:700;color:'+(i<=curIdx?col:'#ccc')+'">'+s+'</div>';});
    var rateBtn=st==='تم التوصيل'?('<button onclick="openRatingModal(\''+ord.restId+'\',\''+ord.restName+'\')" style="width:100%;background:rgba(232,93,4,.08);border:1px solid rgba(232,93,4,.2);color:#E85D04;border-radius:10px;padding:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:6px">⭐ قيّم الطلب</button>'):'';
    var itemsRow=ord.items&&ord.restName?'<div style="font-size:11px;color:#888;margin-bottom:6px">'+ord.items+'</div>':'';
    list.insertAdjacentHTML('beforeend','<div style="background:#fff;border-radius:16px;margin-bottom:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07)"><div style="background:'+bg+';padding:12px 14px;display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:11px;font-weight:800;color:'+col+'">'+ico+' '+st+'</div><div style="font-size:10px;color:#888;margin-top:2px">⏰ '+(ord.timestamp||ord.date||'')+'</div></div><div style="font-size:16px;font-weight:900;color:#E85D04">'+(ord.total||0)+' جنيه</div></div><div style="padding:12px 14px"><div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:4px">🍽️ '+(ord.restName||ord.items||'—')+'</div>'+itemsRow+'<div style="margin:10px 0 6px"><div style="display:flex;justify-content:space-between;margin-bottom:6px">'+stepsHtml+'</div><div style="height:4px;background:#f0f0f0;border-radius:4px;overflow:hidden"><div style="height:100%;background:'+col+';border-radius:4px;width:'+pct+';transition:width .5s"></div></div></div>'+rateBtn+'</div></div>');
  });
}

function confirmOrderReceived(orderId,vendorId,vendorName,btn){
  btn.disabled=true;btn.textContent='✓ تم';
  showRatingPopup(orderId,vendorId,vendorName);
}

/* ═══════════════════════════════════════════════════════
   RATING SYSTEM
═══════════════════════════════════════════════════════ */
function showRatingPopup(orderId,vendorId,vendorName){
  currentRatingOrderId=orderId;
  currentRatingVendorId=vendorId;
  currentRatingValue=0;
  document.getElementById('ratingTargetName').textContent='قيّم تجربتك مع '+vendorName;
  document.getElementById('ratingComment').value='';
  document.getElementById('ratingPopup').style.display='flex';
  // Reset stars
  document.querySelectorAll('#ratingStars span').forEach(s=>s.style.filter='grayscale(1)');
}

function setRating(val){
  currentRatingValue=val;
  document.querySelectorAll('#ratingStars span').forEach((s,i)=>{
    s.style.filter=i<val?'none':'grayscale(1)';
    s.style.color=i<val?'#fdd835':'rgba(255,255,255,.2)';
    s.style.transform=i===val-1?'scale(1.3)':'scale(1)';
  });
}

function submitRating(){
  if(!currentRatingValue){showToast('⚠️ اختر تقييمك أولاً');return}
  document.getElementById('ratingPopup').style.display='none';
  showToast('🌟 شكراً على تقييمك! '+currentRatingValue+' نجوم');
}

/* ═══════════════════════════════════════════════════════
   REAL-TIME NOTIFICATIONS
═══════════════════════════════════════════════════════ */
function listenNotifications(){}
function markNotifRead(id){const el=document.getElementById('fn-'+id);if(el)el.remove();}

/* ═══════════════════════════════════════════════════════
   sendCartOrder — Offline version, sends to restaurant's own WA
═══════════════════════════════════════════════════════ */
window.sendCartOrder=function(){
  const name=document.getElementById('cName').value.trim();
  const phone=document.getElementById('cPhone').value.trim();
  const addr=document.getElementById('cAddr').value.trim();
  const cnote=document.getElementById('cNote')?document.getElementById('cNote').value.trim():'';
  if(!name||!phone||!addr){showToast('⚠️ اكمل بياناتك');return}
  if(cart.items.length===0){showToast('⚠️ السلة فارغة');return}
  const sub=cart.items.reduce((a,i)=>a+(i.price*i.qty),0);
  const restName=cart.restName||document.getElementById('cartRestName').textContent.replace('الطلب من: ','');
  // Use the restaurant's own WA number; fallback to admin number
  const waNum=cart.restWA?'2'+cart.restWA.replace(/^0/,''):'201000767058';
  const msg=encodeURIComponent(`🛒 طلب جديد من تطبيق قويسنا
━━━━━━━━━━━━━━
🍽️ المطعم: ${restName}
👤 الاسم: ${name}
📱 الهاتف: ${phone}
📍 العنوان: ${addr}
━━━━━━━━━━━━━━
🧾 تفاصيل الطلب:
${cart.items.map(i=>`• ${i.name} ×${i.qty} = ${i.price*i.qty} جنيه`).join('\n')}
━━━━━━━━━━━━━━
💵 قيمة الطلب: ${sub} جنيه
🛵 رسوم التوصيل: 20 جنيه
💰 الإجمالي: ${sub+20} جنيه${cnote?'\n━━━━━━━━━━━━━━\n📝 طلب خاص: '+cnote:''}`);
  window.open('https://wa.me/'+waNum+'?text='+msg,'_blank');
  addOrderToAdmin(name,phone,addr,cart.items,sub);
  // Save to user's order history with tracking
  const myOrderId='ord_'+Date.now();
  const myOrd={
    id:myOrderId,
    restId:window.currentOpenRestId||'',
    restName:cart.restName||restName||'',
    items:cart.items.map(i=>i.name+'×'+i.qty).join('، '),
    total:sub+20,
    status:'جديد',
    timestamp:new Date().toLocaleTimeString('ar-EG'),
    date:new Date().toLocaleDateString('ar-EG')
  };
  try{
    let myOrders=JSON.parse(localStorage.getItem('quesina_my_orders')||'[]');
    myOrders.unshift(myOrd);
    if(myOrders.length>50)myOrders=myOrders.slice(0,50);
    localStorage.setItem('quesina_my_orders',JSON.stringify(myOrders));
  }catch(e){}
  clearCart();showToast('✅ تم إرسال طلبك! تابع حالته من "طلباتي"');
};


/* ══ PROMO BANNER ══ */
let promoIdx=0,promoTimer=null;
const promoBannerData=[
  {title:'خصم ٢٠٪ على المشويات',sub:'في مطاعم قويسنا المميزة — محدود لهذا اليوم',label:'🔥 عرض خاص',bg:'linear-gradient(135deg,#E85D04,#DC2F02)',link:''},
  {title:'بيتزا إيطالية أصيلة',sub:'جرّب التجربة الإيطالية في قلب قويسنا',label:'🍕 وجبة جديدة',bg:'linear-gradient(135deg,#F48C06,#E85D04)',link:''},
  {title:'كافيهات قويسنا بانتظارك',sub:'أجمل الكافيهات في مكان واحد',label:'☕ مشروبات',bg:'linear-gradient(135deg,#2e7d32,#1b5e20)',link:''},
];
function goPromo(idx){
  promoIdx=idx;
  const track=document.getElementById('promoBannerTrack');
  if(track)track.style.transform=`translateX(${idx*100}%)`;
  document.querySelectorAll('.pdot').forEach((d,i)=>d.classList.toggle('active',i===idx));
}
function nextPromo(){goPromo((promoIdx+1)%document.querySelectorAll('.pdot').length);}
function startPromoAuto(){promoTimer=setInterval(nextPromo,3500);}
function stopPromoAuto(){if(promoTimer)clearInterval(promoTimer);}

function renderPromoBanner(){
  const track=document.getElementById('promoBannerTrack');
  if(!track)return;
  const dots=document.getElementById('promoDots');
  track.innerHTML='';
  if(dots)dots.innerHTML='';
  promoBannerData.forEach((item,i)=>{
    const slide=document.createElement('div');
    slide.className='promo-slide';
    slide.style.cssText=`min-width:100%;background:${item.bg||'linear-gradient(135deg,#E85D04,#DC2F02)'};padding:16px 18px;display:flex;flex-direction:column;gap:6px;cursor:pointer`;
    slide.onclick=()=>{
      if(item.restId){
        // Navigate to restaurant detail
        const restCard=document.querySelector(`#foodList .card[data-rest-id="${item.restId}"]`);
        if(restCard){closeAdmin();goTo('food');setTimeout(()=>openRestDetail(restCard),200);}
        else{goTo('food');}
      } else if(item.link){
        window.open(item.link,'_blank');
      }
    };
    slide.innerHTML=`<div style="font-size:11px;font-weight:800;color:rgba(255,255,255,.75)">${item.label||''}</div><div style="font-size:17px;font-weight:900;color:#fff;line-height:1.3">${item.title||''}</div><div style="font-size:12px;color:rgba(255,255,255,.85)">${item.sub||''}</div>${item.restId?'<div style="margin-top:4px"><span style="background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;border:1px solid rgba(255,255,255,.3)">اضغط لعرض المطعم ←</span></div>':''}`;
    if(item.img){const im=document.createElement('img');im.src=item.img;im.style.cssText='width:100%;height:90px;object-fit:cover;border-radius:8px;margin-top:6px';slide.appendChild(im);}
    track.appendChild(slide);
    if(dots){const dot=document.createElement('div');dot.className='pdot'+(i===0?' active':'');dot.onclick=()=>goPromo(i);dots.appendChild(dot);}
  });
  goPromo(0);
  stopPromoAuto();startPromoAuto();
  // Swipe support
  initPromoSwipe();
}

function initPromoSwipe(){
  const wrap=document.getElementById('promoBannerWrap');
  if(!wrap||wrap._swipeInit)return;
  wrap._swipeInit=true;
  let sx=0,sy=0,dragging=false;
  wrap.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;dragging=true;},{passive:true});
  wrap.addEventListener('touchend',e=>{
    if(!dragging)return;dragging=false;
    const dx=e.changedTouches[0].clientX-sx;
    const dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>40){
      const total=document.querySelectorAll('.pdot').length;
      if(dx<0)goPromo((promoIdx+1)%total);
      else goPromo((promoIdx-1+total)%total);
    }
  },{passive:true});
}

/* ══ PROMO ADMIN ══ */
let currentPromoEditIdx=null;
function openPromoBannerAdmin(){
  renderPromoAdminList();
  document.getElementById('promoBannerAdmin').style.display='flex';
}
function closePromoBannerAdmin(){document.getElementById('promoBannerAdmin').style.display='none';}
function renderPromoAdminList(){
  const list=document.getElementById('promoAdminList');if(!list)return;
  list.innerHTML='';
  const bgs=['#E85D04','#F48C06','#2e7d32'];
  promoBannerData.forEach((item,i)=>{
    list.insertAdjacentHTML('beforeend',`
      <div style="background:#fff;border:1.5px solid rgba(232,93,4,.15);border-radius:12px;padding:12px;margin-bottom:10px;display:flex;align-items:center;gap:10px">
        <div style="width:44px;height:44px;border-radius:10px;background:${item.bg};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px">${item.label.split(' ')[0]}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:800;color:#1a0a00;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.title}</div>
          <div style="font-size:10px;color:#9a6040;margin-top:2px">${item.sub.substring(0,35)}...</div>
        </div>
        <div style="display:flex;gap:5px;flex-shrink:0">
          <button onclick="openPromoEdit(${i})" style="background:rgba(232,93,4,.1);border:1px solid rgba(232,93,4,.25);color:#E85D04;border-radius:8px;padding:5px 8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">✏️</button>
          <button onclick="deletePromoItem(${i})" style="background:rgba(198,40,40,.1);border:1px solid rgba(198,40,40,.2);color:#c62828;border-radius:8px;padding:5px 8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">🗑️</button>
        </div>
      </div>`);
  });
}
function openPromoEdit(idx){
  currentPromoEditIdx=idx;
  const item=promoBannerData[idx];
  document.getElementById('pEdit-label').value=item.label||'';
  document.getElementById('pEdit-title').value=item.title||'';
  document.getElementById('pEdit-sub').value=item.sub||'';
  document.getElementById('pEdit-link').value=item.link||'';
  // Populate restaurant dropdown
  const sel=document.getElementById('pEdit-restId');
  if(sel){
    sel.innerHTML='<option value="">— بدون ربط بمطعم —</option>';
    document.querySelectorAll('#foodList .card').forEach(card=>{
      const nm=card.querySelector('.cnm');
      if(!nm)return;
      const rid=card.dataset.restId||'';
      const opt=document.createElement('option');
      opt.value=rid;opt.textContent=nm.textContent;
      if(rid===String(item.restId||''))opt.selected=true;
      sel.appendChild(opt);
    });
  }
  document.getElementById('promoListView').style.display='none';
  document.getElementById('promoEditView').style.display='block';
}
function savePromoEdit(){
  if(currentPromoEditIdx===null)return;
  promoBannerData[currentPromoEditIdx].label=document.getElementById('pEdit-label').value.trim();
  promoBannerData[currentPromoEditIdx].title=document.getElementById('pEdit-title').value.trim();
  promoBannerData[currentPromoEditIdx].sub=document.getElementById('pEdit-sub').value.trim();
  promoBannerData[currentPromoEditIdx].link=document.getElementById('pEdit-link').value.trim();
  const selRestId=document.getElementById('pEdit-restId')?.value||'';
  promoBannerData[currentPromoEditIdx].restId=selRestId||null;
  // Handle image
  const imgEl=document.getElementById('pEdit-img-prev');
  if(imgEl&&imgEl.src&&!imgEl.src.endsWith('#')&&!imgEl.src.endsWith(window.location.href))promoBannerData[currentPromoEditIdx].img=imgEl.src;
  renderPromoBanner();
  document.getElementById('promoListView').style.display='block';
  document.getElementById('promoEditView').style.display='none';
  renderPromoAdminList();
  showToast('✅ تم حفظ البانر');
}
function deletePromoItem(idx){
  if(!confirm('حذف هذا البانر؟'))return;
  promoBannerData.splice(idx,1);
  renderPromoBanner();
  renderPromoAdminList();
  showToast('🗑️ تم الحذف');
}
function addNewPromo(){
  promoBannerData.push({title:'عرض جديد',sub:'تفاصيل العرض هنا',label:'🎉 جديد',bg:'linear-gradient(135deg,#E85D04,#DC2F02)',link:''});
  renderPromoBanner();
  renderPromoAdminList();
  openPromoEdit(promoBannerData.length-1);
  showToast('✅ تمت الإضافة — يمكنك التعديل الآن');
}

// Init promo on load
document.addEventListener('DOMContentLoaded',()=>{renderPromoBanner();});

// ── SHOPS SECTION ──
/* ══════════════════════════════════════════
   SHOPS SECTION — Full CRUD like Medical
══════════════════════════════════════════ */
let currentEditShopId=null;
window.shopLogoOverrides={};
window.shopHeroOverrides={};
window.shopItems={};

function openShopDetail(card){
  try{
    const nm=card.querySelector('.cnm')?.textContent||'';
    const sub=card.querySelector('.csub')?.textContent||'';
    const ph=card.dataset.phone||card.querySelector('.cnm')?.dataset.phone||'';
    const wa=card.dataset.wa||ph;
    const addr=card.dataset.addr||'';
    const hours=card.dataset.hours||'';
    const cat=card.dataset.cat||'محل';
    const id=card.id||'';
    document.getElementById('shdTitle').textContent=nm;
    document.getElementById('shdFullName').textContent=nm;
    document.getElementById('shdSub').textContent=sub;
    document.getElementById('shdHours').textContent=hours||'—';
    document.getElementById('shdAddr').textContent=addr||'—';
    document.getElementById('shdCat').textContent=cat;
    const callEl=document.getElementById('shdCall');callEl.href=ph?'tel:'+ph:'#';
    document.getElementById('shdWA').href=wa?'https://wa.me/2'+wa.replace(/^0/,'')+'?text=استفسار عن '+nm:'#';
    document.getElementById('shdMap').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(nm+' قويسنا');
    // Hero/logo
    const heroOv=window.shopHeroOverrides[id];const logoOv=window.shopLogoOverrides[id];
    const heroImg=document.getElementById('shdHeroImg');const heroPh=document.getElementById('shdHeroPh');
    if(heroOv){heroImg.src=heroOv;heroImg.style.display='block';heroPh.style.display='none';}
    else{heroImg.style.display='none';heroPh.style.display='flex';}
    const lw=document.getElementById('shdLogoWrap');
    if(logoOv){lw.innerHTML=`<img src="${logoOv}" style="width:100%;height:100%;object-fit:cover;border-radius:12px"/>`;}
    else{lw.innerHTML='<span style="font-size:22px">🏪</span>';}
    // Items
    const items=window.shopItems[id]||[];
    const wrap=document.getElementById('shdItemsList');
    if(items.length){
      wrap.innerHTML='';
      items.forEach(it=>{
        wrap.insertAdjacentHTML('beforeend',`<div style="background:#fff;border:1px solid var(--bd);border-radius:12px;padding:12px;margin-bottom:8px;display:flex;gap:10px;align-items:center">
          ${it.img?`<img src="${it.img}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;flex-shrink:0"/>`:'<div style="width:56px;height:56px;border-radius:8px;background:var(--s3);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">🛍️</div>'}
          <div style="flex:1"><div style="font-size:13px;font-weight:800;color:#1a1a1a">${it.name}</div>${it.desc?`<div style="font-size:11px;color:var(--t3)">${it.desc}</div>`:''}<div style="font-size:13px;font-weight:900;color:var(--orange);margin-top:4px">${it.price}</div></div>
        </div>`);
      });
    } else {
      wrap.innerHTML='<div style="font-size:12px;color:var(--t3);text-align:center;padding:20px">لا توجد منتجات مضافة بعد</div>';
    }
    document.getElementById('shopDetailPage').classList.add('open');
  }catch(e){showToast('⚠️ خطأ');}
}

function addShop(){
  const name=document.getElementById('aSh-name').value.trim();
  const cat=document.getElementById('aSh-cat').value;
  const phone=document.getElementById('aSh-phone').value.trim();
  const wa=document.getElementById('aSh-wa').value.trim()||phone;
  const addr=document.getElementById('aSh-addr').value.trim();
  const desc=document.getElementById('aSh-desc').value.trim();
  const openT=document.getElementById('aSh-open').value;
  const closeT=document.getElementById('aSh-close').value;
  const rating=document.getElementById('aSh-rating').value.trim();
  const prevEl=document.getElementById('aSh-prev');
  const imgSrc=prevEl&&prevEl.style.display!=='none'&&prevEl.src&&prevEl.src!==window.location.href?prevEl.src:'';
  if(!name){showToast('⚠️ اكتب اسم المحل');return;}
  const shopId='shop-'+Date.now();
  const catColors={موضة:'#d81b60','سوبر ماركت':'#2e7d32',هايبر:'#1565c0',مكياج:'#d81b60',إلكترونيات:'#0277bd',أثاث:'#5d4037'};
  const clr=catColors[cat]||'#5a3020';
  const card=document.createElement('div');
  card.className='card';card.id=shopId;card.dataset.cat=cat;
  card.dataset.phone=phone;card.dataset.wa=wa;card.dataset.addr=addr;
  card.dataset.hours=openT&&closeT?openT+' — '+closeT:'';
  const thumbHTML=imgSrc?`<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover"/>`:`<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M4 8l1-3h18l1 3" fill="none" stroke="${clr}" stroke-width="1.5"/><rect x="3" y="8" width="20" height="14" rx="3" fill="${clr}" opacity=".7"/></svg>`;
  card.setAttribute('onclick','openShopDetail(this)');
  card.innerHTML=`<div class="crow"><div class="cthumb" style="background:${imgSrc?'transparent':'#f5f5f5'}">${thumbHTML}</div><div class="cinfo"><div class="cnm">${name}</div><div class="csub">${cat}${desc?' • '+desc:''}</div><div class="cmeta"><span class="tag" style="background:${clr}20;color:${clr}">${cat}</span>${rating?'<span class="stars-d">★ '+rating+'</span>':''}<span class="avon" data-ar="متاح الآن" data-en="Available Now">مفتوح</span></div></div></div>`;
  if(imgSrc){window.shopLogoOverrides[shopId]=imgSrc;}
  document.getElementById('shopList').insertBefore(card,document.getElementById('shopList').firstChild);
  refreshShopAdminList();
  ['aSh-name','aSh-phone','aSh-wa','aSh-addr','aSh-desc','aSh-rating'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  if(prevEl){prevEl.src='';prevEl.style.display='none';}
  document.getElementById('shopListView').style.display='block';
  document.getElementById('shopAddView').style.display='none';
  showToast('✅ تم إضافة المحل');closeAdmin();goTo('shops');
}

function refreshShopAdminList(){
  const list=document.getElementById('admShopList');if(!list)return;
  list.innerHTML='';
  document.querySelectorAll('#shopList .card').forEach((card,idx)=>{
    const nm=card.querySelector('.cnm')?.textContent||'';
    const sub=card.querySelector('.csub')?.textContent||'';
    const id=card.id||('shop-idx-'+idx);
    if(!card.id)card.id=id;
    const logoOv=window.shopLogoOverrides[id];
    list.insertAdjacentHTML('beforeend',
      `<div class="rest-admin-card" onclick="openShopEditor('${id}')" style="background:var(--s2);border:1px solid var(--bd2);border-radius:12px;padding:11px 13px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='var(--s3)'" onmouseout="this.style.background='var(--s2)'">
        <div style="width:40px;height:40px;border-radius:10px;background:#fce4ec;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden">${logoOv?`<img src="${logoOv}" style="width:100%;height:100%;object-fit:cover"/>`:'🏪'}</div>
        <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800;color:var(--t1)">${nm}</div><div style="font-size:11px;color:var(--t3);margin-top:2px">${sub||'محل'} • اضغط للتعديل</div></div>
        <span style="font-size:10px;color:#d81b60">← تعديل</span>
      </div>`);
  });
}

function openShopEditor(id){
  currentEditShopId=id;
  const card=document.getElementById(id);
  document.getElementById('shopListView').style.display='none';
  document.getElementById('shopEditorView').style.display='block';
  if(card){
    document.getElementById('shopEditorTitle').textContent='تعديل: '+(card.querySelector('.cnm')?.textContent||'');
    document.getElementById('edit-Sh-name').value=card.querySelector('.cnm')?.textContent||'';
    document.getElementById('edit-Sh-phone').value=card.dataset.phone||'';
    document.getElementById('edit-Sh-wa').value=card.dataset.wa||'';
    document.getElementById('edit-Sh-addr').value=card.dataset.addr||'';
  }
  switchShopTab('info');
  loadShopItems(id);
}

function closeShopEditor(){
  currentEditShopId=null;
  document.getElementById('shopEditorView').style.display='none';
  document.getElementById('shopListView').style.display='block';
}

function switchShopTab(tab){
  ['info','photos','items','danger'].forEach(t=>{
    const el=document.getElementById('shetab-content-'+t);if(el)el.style.display=t===tab?'block':'none';
    const btn=document.getElementById('shetab-'+t);
    if(btn){btn.style.background=t===tab?'#d81b60':'transparent';btn.style.color=t===tab?'#fff':'var(--t3)';}
  });
}

function adminSetShopStatus(status){
  if(!currentEditShopId)return;
  const card=document.getElementById(currentEditShopId);
  if(card){const av=card.querySelector('.avon,.avoff');if(av){av.className=status==='مفتوح'?'avon':'avoff';av.textContent=status==='مفتوح'?'مفتوح':status;}}
  showToast('✅ تم تغيير الحالة إلى '+status);
}

function saveShopInfo(){
  const id=currentEditShopId;if(!id)return;
  const card=document.getElementById(id);if(!card)return;
  const nm=document.getElementById('edit-Sh-name').value.trim();
  const phone=document.getElementById('edit-Sh-phone').value.trim();
  const wa=document.getElementById('edit-Sh-wa').value.trim()||phone;
  const addr=document.getElementById('edit-Sh-addr').value.trim();
  const desc=document.getElementById('edit-Sh-desc').value.trim();
  const cat=document.getElementById('edit-Sh-cat').value;
  if(!nm){showToast('⚠️ اكتب الاسم');return;}
  const nmEl=card.querySelector('.cnm');const subEl=card.querySelector('.csub');
  if(nmEl)nmEl.textContent=nm;
  if(subEl)subEl.textContent=cat+(desc?' • '+desc:'');
  card.dataset.phone=phone;card.dataset.wa=wa;card.dataset.addr=addr;
  document.getElementById('shopEditorTitle').textContent='تعديل: '+nm;
  refreshShopAdminList();
  showToast('✅ تم حفظ بيانات '+nm);
}

function setShopHeroFromEditor(input){
  if(!input.files||!input.files[0])return;
  const id=currentEditShopId;
  const reader=new FileReader();
  reader.onload=e=>{window.shopHeroOverrides[id]=e.target.result;showToast('✅ تم تحديث صورة الغلاف');};
  reader.readAsDataURL(input.files[0]);
}

function setShopLogoFromEditor(input){
  if(!input.files||!input.files[0])return;
  const id=currentEditShopId;
  const reader=new FileReader();
  reader.onload=e=>{
    const prev=document.getElementById('edit-shop-logo-prev');
    if(prev){prev.src=e.target.result;prev.style.display='block';}
    window.shopLogoOverrides[id]=e.target.result;
    // Update thumbnail in shop list card
    const card=document.getElementById(id);
    if(card){const ct=card.querySelector('.cthumb');if(ct){ct.innerHTML=`<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover"/>`;ct.style.background='transparent';}}
    refreshShopAdminList();
    showToast('✅ تم تحديث اللوجو');
  };
  reader.readAsDataURL(input.files[0]);
}

function toggleShopVisFromEditor(){
  const id=currentEditShopId;if(!id)return;
  const card=document.getElementById(id);if(!card)return;
  card.style.display=card.style.display==='none'?'':'none';
  showToast(card.style.display===''?'👁 تم إظهار المحل':'🙈 تم إخفاء المحل');
}

function deleteShopFromEditor(){
  if(!currentEditShopId)return;
  if(!confirm('⚠️ حذف هذا المحل نهائياً؟'))return;
  const card=document.getElementById(currentEditShopId);if(card)card.remove();
  closeShopEditor();refreshShopAdminList();showToast('🗑️ تم حذف المحل');
}

function addShopItem(){
  const id=currentEditShopId;if(!id){showToast('⚠️ لم يتم تحديد محل');return;}
  const name=document.getElementById('shItem-name').value.trim();
  const price=document.getElementById('shItem-price').value.trim();
  const desc=document.getElementById('shItem-desc').value.trim();
  const prevEl=document.getElementById('shItem-prev');
  const imgSrc=prevEl&&prevEl.style.display!=='none'&&prevEl.src&&prevEl.src!==window.location.href?prevEl.src:'';
  if(!name){showToast('⚠️ اكتب اسم المنتج');return;}
  if(!window.shopItems[id])window.shopItems[id]=[];
  window.shopItems[id].push({name,price,desc,img:imgSrc});
  loadShopItems(id);
  ['shItem-name','shItem-price','shItem-desc'].forEach(el=>{const e=document.getElementById(el);if(e)e.value='';});
  if(prevEl){prevEl.src='';prevEl.style.display='none';}
  showToast('✅ تم إضافة المنتج');
}

function loadShopItems(id){
  const wrap=document.getElementById('shopItemsList');if(!wrap)return;
  const items=window.shopItems[id]||[];
  if(!items.length){wrap.innerHTML='<div style="font-size:11px;color:var(--t3);text-align:center;padding:10px">لا توجد منتجات بعد</div>';return;}
  wrap.innerHTML='';
  items.forEach((it,idx)=>{
    wrap.insertAdjacentHTML('beforeend',`<div style="background:var(--s3);border-radius:9px;padding:8px 10px;display:flex;align-items:center;gap:8px">
      ${it.img?`<img src="${it.img}" style="width:40px;height:40px;border-radius:7px;object-fit:cover;flex-shrink:0"/>`:'<div style="width:40px;height:40px;background:var(--s4);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🛍️</div>'}
      <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:800;color:var(--t1)">${it.name}</div><div style="font-size:11px;color:var(--orange);font-weight:700">${it.price}</div></div>
      <button onclick="deleteShopItem('${id}',${idx})" style="background:rgba(198,40,40,.1);border:none;color:#c62828;border-radius:7px;padding:5px 9px;font-size:11px;cursor:pointer;font-family:inherit">🗑️</button>
    </div>`);
  });
}

function deleteShopItem(id,idx){
  if(!window.shopItems[id])return;
  window.shopItems[id].splice(idx,1);
  loadShopItems(id);showToast('🗑️ تم حذف المنتج');
}

// Init shop admin list on load
window.addEventListener('load',()=>{
  refreshShopAdminList();
  if(darkModeOn)applyDarkMode();
});

/* ══════════════════════════════════════════
   USER PROFILE & AUTH
══════════════════════════════════════════ */
let localUser=null;
let darkModeOn=false;
try{const s=localStorage.getItem('quesina_user');if(s)localUser=JSON.parse(s);}catch(e){}
try{darkModeOn=localStorage.getItem('quesina_dark')==='1';}catch(e){}

function openUserProfile(){
  if(!localUser){openAuthPage();return;}
  loadProfileData();
  document.getElementById('userProfilePage').style.display='flex';
  // Highlight profile nav button
  document.querySelectorAll('.bb').forEach(b=>b.classList.remove('active'));
  const pb=document.getElementById('bn-profile');if(pb)pb.classList.add('active');
}

function closeUserProfile(){
  document.getElementById('userProfilePage').style.display='none';
  // Remove highlight from profile nav button
  const pb=document.getElementById('bn-profile');if(pb)pb.classList.remove('active');
}

function toggleDarkMode(){
  darkModeOn=!darkModeOn;
  try{localStorage.setItem('quesina_dark',darkModeOn?'1':'0');}catch(e){}
  applyDarkMode();
}

function applyDarkMode(){
  const toggle=document.getElementById('darkModeToggle');
  const thumb=document.getElementById('darkModeThumb');
  if(darkModeOn){
    document.body.style.filter='invert(1) hue-rotate(180deg)';
    document.querySelectorAll('img,video').forEach(el=>el.style.filter='invert(1) hue-rotate(180deg)');
    if(toggle)toggle.style.background='#E85D04';
    if(thumb){thumb.style.right='auto';thumb.style.left='3px';}
  } else {
    document.body.style.filter='';
    document.querySelectorAll('img,video').forEach(el=>el.style.filter='');
    if(toggle)toggle.style.background='#e0e0e0';
    if(thumb){thumb.style.left='auto';thumb.style.right='3px';}
  }
}

function loadProfileData(){
  if(!localUser)return;
  document.getElementById('profileDisplayName').textContent=localUser.name||'المستخدم';
  document.getElementById('profileDisplayEmail').textContent=localUser.email||localUser.phoneNumber||'';
  document.getElementById('profile-name').value=localUser.name||'';
  document.getElementById('profile-email').value=localUser.email||'';
  document.getElementById('profile-phone').value=localUser.phone||localUser.phoneNumber||'';
  const dobEl=document.getElementById('profile-dob');if(dobEl)dobEl.value=localUser.dob||'';
  const genEl=document.getElementById('profile-gender');if(genEl)genEl.value=localUser.gender||'';
  const avatarImg=document.getElementById('profileAvatarImg');
  const avatarSvg=document.getElementById('profileAvatarSvg');
  if(localUser.avatar){avatarImg.src=localUser.avatar;avatarImg.style.display='block';avatarSvg.style.display='none';}
  else{avatarImg.style.display='none';avatarSvg.style.display='block';}
  // Load addresses
  renderProfileAddrs();
}

function saveProfileData(){
  if(!localUser)return;
  localUser.name=document.getElementById('profile-name').value.trim()||localUser.name;
  localUser.email=document.getElementById('profile-email').value.trim()||localUser.email;
  localUser.phone=document.getElementById('profile-phone').value.trim()||localUser.phone;
  const dobEl=document.getElementById('profile-dob');if(dobEl&&dobEl.value)localUser.dob=dobEl.value;
  const genEl=document.getElementById('profile-gender');if(genEl&&genEl.value)localUser.gender=genEl.value;
  try{localStorage.setItem('quesina_user',JSON.stringify(localUser));}catch(e){}
  document.getElementById('profileDisplayName').textContent=localUser.name;
  document.getElementById('profileDisplayEmail').textContent=localUser.email;
  showToast('✅ تم حفظ البيانات');
}

function updateProfileAvatar(input){
  if(!input.files||!input.files[0])return;
  const reader=new FileReader();
  reader.onload=e=>{
    const avatarImg=document.getElementById('profileAvatarImg');
    const avatarSvg=document.getElementById('profileAvatarSvg');
    avatarImg.src=e.target.result;avatarImg.style.display='block';avatarSvg.style.display='none';
    if(localUser){localUser.avatar=e.target.result;try{localStorage.setItem('quesina_user',JSON.stringify(localUser));}catch(ex){}}
    showToast('✅ تم تحديث الصورة');
  };
  reader.readAsDataURL(input.files[0]);
}

function toggleProfileSection(id){
  const el=document.getElementById(id);if(!el)return;
  el.style.display=el.style.display==='none'?'block':'none';
}

function addProfileAddr(){
  const inp=document.getElementById('newAddrInput');
  const val=inp.value.trim();if(!val){showToast('⚠️ اكتب العنوان');return;}
  if(!localUser.addresses)localUser.addresses=[];
  localUser.addresses.push(val);
  try{localStorage.setItem('quesina_user',JSON.stringify(localUser));}catch(e){}
  inp.value='';renderProfileAddrs();showToast('✅ تم إضافة العنوان');
}

function renderProfileAddrs(){
  const wrap=document.getElementById('profileAddrList');if(!wrap)return;
  const addrs=localUser?.addresses||[];
  if(!addrs.length){wrap.innerHTML='<div style="font-size:12px;color:#9a9a9a;margin-bottom:10px">لا توجد عناوين محفوظة</div>';return;}
  wrap.innerHTML='';
  addrs.forEach((a,i)=>{
    wrap.insertAdjacentHTML('beforeend',`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0">
      <span style="font-size:16px">📍</span>
      <span style="flex:1;font-size:12px;color:#1a1a1a">${a}</span>
      <button onclick="removeProfileAddr(${i})" style="background:rgba(198,40,40,.1);border:none;color:#c62828;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer">✕</button>
    </div>`);
  });
}

function removeProfileAddr(i){
  if(!localUser?.addresses)return;
  localUser.addresses.splice(i,1);
  try{localStorage.setItem('quesina_user',JSON.stringify(localUser));}catch(e){}
  renderProfileAddrs();
}

function logoutUser(){
  localUser=null;
  try{localStorage.removeItem('quesina_user');}catch(e){}
  closeUserProfile();
  showToast('👋 تم تسجيل الخروج');
}

/* AUTH PAGE */
function openAuthPage(){
  document.getElementById('authPage').style.display='flex';
}

function closeAuthPage(){
  document.getElementById('authPage').style.display='none';
}

function switchAuthTab_compat(tab){
  document.getElementById('authForm-login').style.display=tab==='login'?'block':'none';
  document.getElementById('authForm-register').style.display=tab==='register'?'block':'none';
  const loginBtn=document.getElementById('authTab-login');
  const regBtn=document.getElementById('authTab-register');
  if(tab==='login'){loginBtn.style.background='linear-gradient(135deg,#E85D04,#DC2F02)';loginBtn.style.color='#fff';regBtn.style.background='transparent';regBtn.style.color='#9a9a9a';}
  else{regBtn.style.background='linear-gradient(135deg,#E85D04,#DC2F02)';regBtn.style.color='#fff';loginBtn.style.background='transparent';loginBtn.style.color='#9a9a9a';}
}

function switchAuthTab(tab){ switchAuthTab_compat(tab); }

function doLogin(){
  const email=document.getElementById('login-email').value.trim();
  const pass=document.getElementById('login-pass').value;
  if(!email||!pass){showToast('⚠️ اكمل بياناتك');return;}
  // Offline mode — check local storage for registered user
  let savedUser=null;
  try{const s=localStorage.getItem('quesina_user');if(s)savedUser=JSON.parse(s);}catch(e){}
  // Check super admin
  if(email===SUPER_ADMIN_EMAIL&&pass===SUPER_ADMIN_PASS){
    localUser={name:'المدير',email,phone:'',role:'admin',avatar:''};
    try{localStorage.setItem('quesina_user',JSON.stringify(localUser));}catch(ex){}
    currentRole='admin';
    currentUser={uid:'super-admin',displayName:'المدير',email,phoneNumber:''};
    document.getElementById('authScreen').style.display='none';
    showMainApp();
    addRoleManagerBtn();
    showToast('✅ مرحباً، المدير!');
    return;
  }
  if(savedUser&&savedUser.email===email&&savedUser.password===pass){
    localUser=savedUser;
    closeAuthPage();
    loadProfileData();
    document.getElementById('userProfilePage').style.display='flex';
    showToast('✅ مرحباً بك، '+localUser.name+'!');
    return;
  }
  showToast('⚠️ البريد أو كلمة المرور غير صحيحة');
}

function doRegister(){
  const name=document.getElementById('reg-name').value.trim();
  const phone=document.getElementById('reg-phone').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-pass').value;
  if(!name||!email||!pass){showToast('⚠️ اكمل بياناتك');return;}
  localUser={name,phone,email,password:pass,role:'user',avatar:'',addresses:[]};
  try{localStorage.setItem('quesina_user',JSON.stringify(localUser));}catch(e){}
  closeAuthPage();
  loadProfileData();
  document.getElementById('userProfilePage').style.display='flex';
  showToast('✅ تم إنشاء حسابك! مرحباً، '+name);
}

/* ══════════════════════════════════════════════════════════
   UNIVERSAL SECTION BANNER SYSTEM
   كل قسم عنده promoBannerData مستقل وlوحة تحكم مشتركة
══════════════════════════════════════════════════════════ */
// secBannerData, secBannerIdx, secBannerTimers declared at top of main script

function renderSecBanner(sec){
  const wrap=document.getElementById('secBannerWrap-'+sec);
  const track=document.getElementById('secBannerTrack-'+sec);
  const dots=document.getElementById('secBannerDots-'+sec);
  if(!wrap||!track||!dots)return;
  const data=secBannerData[sec]||[];
  if(!data.length){wrap.style.display='none';return;}
  wrap.style.display='block';
  track.innerHTML='';dots.innerHTML='';
  data.forEach((item,i)=>{
    const slide=document.createElement('div');
    slide.style.cssText=`min-width:100%;background:${item.bg||'linear-gradient(135deg,#E85D04,#DC2F02)'};padding:16px 18px;display:flex;flex-direction:column;gap:6px;cursor:pointer`;
    slide.onclick=()=>{if(item.link)window.open(item.link,'_blank');};
    let imgHTML=item.img?`<img src="${item.img}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;margin-top:6px"/>`:'';
    slide.innerHTML=`<div style="font-size:11px;font-weight:800;color:rgba(255,255,255,.8)">${item.label||''}</div><div style="font-size:17px;font-weight:900;color:#fff;line-height:1.3">${item.title||''}</div><div style="font-size:12px;color:rgba(255,255,255,.85)">${item.sub||''}</div>${imgHTML}`;
    track.appendChild(slide);
    const dot=document.createElement('div');
    dot.className='pdot'+(i===0?' active':'');
    dot.onclick=()=>goSecBanner(sec,i);
    dots.appendChild(dot);
  });
  goSecBanner(sec,0);
  if(secBannerTimers[sec])clearInterval(secBannerTimers[sec]);
  secBannerTimers[sec]=setInterval(()=>{
    const total=secBannerData[sec].length;
    if(total>1)goSecBanner(sec,(secBannerIdx[sec]+1)%total);
  },3500);
  // swipe
  if(!wrap._secSwipeInit){
    wrap._secSwipeInit=true;
    let sx=0;
    wrap.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true});
    wrap.addEventListener('touchend',e=>{
      const dx=e.changedTouches[0].clientX-sx;
      const total=secBannerData[sec].length;
      if(Math.abs(dx)>40){
        if(dx<0)goSecBanner(sec,(secBannerIdx[sec]+1)%total);
        else goSecBanner(sec,(secBannerIdx[sec]-1+total)%total);
      }
    },{passive:true});
  }
}

function goSecBanner(sec,idx){
  secBannerIdx[sec]=idx;
  const track=document.getElementById('secBannerTrack-'+sec);
  if(track)track.style.transform=`translateX(${idx*100}%)`;
  const dots=document.getElementById('secBannerDots-'+sec);
  if(dots)dots.querySelectorAll('.pdot').forEach((d,i)=>d.classList.toggle('active',i===idx));
}

/* ══ Section Banner Admin Modal ══ */
let currentSecBannerSec=null;
let currentSecBannerEditIdx=null;

function openSecBannerAdmin(sec,title){
  currentSecBannerSec=sec;
  document.getElementById('secBannerAdminTitle').textContent=title||'بانر القسم';
  renderSecBannerAdminList();
  document.getElementById('secBannerAdminModal').style.display='flex';
}
function closeSecBannerAdmin(){
  document.getElementById('secBannerAdminModal').style.display='none';
  currentSecBannerSec=null;
}
function renderSecBannerAdminList(){
  const list=document.getElementById('secBannerAdminList');if(!list)return;
  list.innerHTML='';
  const data=secBannerData[currentSecBannerSec]||[];
  if(!data.length){
    list.innerHTML='<div style="text-align:center;padding:16px;font-size:12px;color:var(--t3)">لا توجد بانرات بعد — اضغط ➕ لإضافة واحد</div>';
    return;
  }
  data.forEach((item,i)=>{
    list.insertAdjacentHTML('beforeend',`
      <div style="background:#fff;border:1.5px solid rgba(232,93,4,.15);border-radius:12px;padding:12px;margin-bottom:10px;display:flex;align-items:center;gap:10px">
        <div style="width:44px;height:44px;border-radius:10px;background:${item.bg||'#E85D04'};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;overflow:hidden">${item.img?`<img src="${item.img}" style="width:100%;height:100%;object-fit:cover"/>`:(item.label?.split(' ')[0]||'🎯')}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:800;color:#1a0a00;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.title||'بانر'}</div>
          <div style="font-size:10px;color:#9a6040;margin-top:2px">${(item.sub||'').substring(0,40)}</div>
        </div>
        <div style="display:flex;gap:5px;flex-shrink:0">
          <button onclick="openSecBannerEdit(${i})" style="background:rgba(232,93,4,.1);border:1px solid rgba(232,93,4,.25);color:#E85D04;border-radius:8px;padding:5px 8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">✏️</button>
          <button onclick="deleteSecBannerItem(${i})" style="background:rgba(198,40,40,.1);border:1px solid rgba(198,40,40,.2);color:#c62828;border-radius:8px;padding:5px 8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">🗑️</button>
        </div>
      </div>`);
  });
}
function openSecBannerEdit(idx){
  currentSecBannerEditIdx=idx;
  const item=secBannerData[currentSecBannerSec][idx];
  document.getElementById('sbEdit-label').value=item.label||'';
  document.getElementById('sbEdit-title').value=item.title||'';
  document.getElementById('sbEdit-sub').value=item.sub||'';
  document.getElementById('sbEdit-link').value=item.link||'';
  document.getElementById('sbEdit-bg').value=item.bg||'linear-gradient(135deg,#E85D04,#DC2F02)';
  const prev=document.getElementById('sbEdit-img-prev');
  if(item.img){prev.src=item.img;prev.style.display='block';}else{prev.src='';prev.style.display='none';}
  document.getElementById('secBannerListView').style.display='none';
  document.getElementById('secBannerEditView').style.display='block';
}
function saveSecBannerEdit(){
  if(currentSecBannerEditIdx===null)return;
  const item=secBannerData[currentSecBannerSec][currentSecBannerEditIdx];
  item.label=document.getElementById('sbEdit-label').value.trim();
  item.title=document.getElementById('sbEdit-title').value.trim();
  item.sub=document.getElementById('sbEdit-sub').value.trim();
  item.link=document.getElementById('sbEdit-link').value.trim();
  item.bg=document.getElementById('sbEdit-bg').value.trim()||item.bg;
  const imgEl=document.getElementById('sbEdit-img-prev');
  if(imgEl&&imgEl.src&&imgEl.src!==window.location.href&&!imgEl.src.endsWith('#'))item.img=imgEl.src;
  renderSecBanner(currentSecBannerSec);
  document.getElementById('secBannerListView').style.display='block';
  document.getElementById('secBannerEditView').style.display='none';
  renderSecBannerAdminList();
  showToast('✅ تم حفظ البانر');
}
function deleteSecBannerItem(idx){
  if(!confirm('حذف هذا البانر؟'))return;
  secBannerData[currentSecBannerSec].splice(idx,1);
  renderSecBanner(currentSecBannerSec);
  renderSecBannerAdminList();
  showToast('🗑️ تم الحذف');
}
function addNewSecBanner(){
  secBannerData[currentSecBannerSec].push({
    title:'عرض جديد',sub:'تفاصيل العرض هنا',label:'🎉 جديد',
    bg:'linear-gradient(135deg,#E85D04,#DC2F02)',link:''
  });
  renderSecBanner(currentSecBannerSec);
  renderSecBannerAdminList();
  openSecBannerEdit(secBannerData[currentSecBannerSec].length-1);
  showToast('✅ تمت الإضافة — عدّل البانر الآن');
}

/* ══════════════════════════════════════════════════════════
   PUSH NOTIFICATIONS (Web Push API)
══════════════════════════════════════════════════════════ */
// pushEnabled declared at top of main script
async function requestPushPermission(){
  if(!('Notification' in window)){showToast('⚠️ المتصفح لا يدعم الإشعارات');return;}
  if(Notification.permission==='granted'){pushEnabled=true;showToast('✅ الإشعارات مفعّلة بالفعل');return;}
  if(Notification.permission==='denied'){showToast('⚠️ الإشعارات محظورة — فعّلها من إعدادات المتصفح');return;}
  const permission=await Notification.requestPermission();
  pushEnabled=permission==='granted';
  if(pushEnabled){
    showToast('✅ تم تفعيل الإشعارات!');
    sendPushNotification('مدينة قويسنا','مرحباً! ستصلك إشعارات الأخبار والعروض 🎉','');
  } else {
    showToast('تم رفض الإشعارات');
  }
}
function sendPushNotification(title,body,icon){
  if(!pushEnabled||Notification.permission!=='granted')return;
  try{
    new Notification(title,{
      body,
      icon:icon||'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23E85D04"/><text y=".9em" font-size="80">🌆</text></svg>',
      badge:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23E85D04"/></svg>',
      dir:'rtl',lang:'ar'
    });
  }catch(e){console.log('Push error:',e);}
}
// Auto-request on first visit
window.addEventListener('load',()=>{
  const asked=localStorage.getItem('push_asked');
  if(!asked&&'Notification' in window&&Notification.permission==='default'){
    localStorage.setItem('push_asked','1');
    setTimeout(()=>{
      if(confirm('هل تريد تلقي إشعارات الأخبار والعروض من مدينة قويسنا؟')){
        requestPushPermission();
      }
    },4000);
  } else if(Notification.permission==='granted'){
    pushEnabled=true;
  }
});

/* ══════════════════════════════════════════════════════════
   REAL RATINGS SYSTEM
══════════════════════════════════════════════════════════ */
// window.ratingsDB declared and loaded at top of main script
function loadRatings(){
  try{const s=localStorage.getItem('quesina_ratings');if(s)window.ratingsDB=JSON.parse(s);}catch(e){}
}
function saveRatings(){
  try{
    localStorage.setItem('quesina_ratings',JSON.stringify(window.ratingsDB));
    try{const bc=new BroadcastChannel('quesina_db');bc.postMessage({key:'ratings',val:window.ratingsDB,ts:Date.now()});bc.close();}catch(e){}
    QDB.set('ratings',window.ratingsDB);
  }catch(e){}
}
function submitEntityRating(entityId,entityName,stars,comment){
  if(!stars||stars<1||stars>5){showToast('⚠️ اختر عدد النجوم');return;}
  if(!window.ratingsDB[entityId])window.ratingsDB[entityId]={total:0,count:0,reviews:[]};
  const db=window.ratingsDB[entityId];
  db.reviews.unshift({
    user:localUser?.name||'مجهول',
    stars,comment:comment||'',
    date:new Date().toLocaleDateString('ar-EG')
  });
  db.total+=stars;db.count++;
  saveRatings();
  // Update displayed rating
  const avg=(db.total/db.count).toFixed(1);
  const badge=document.getElementById('rdRating');
  if(badge)badge.textContent='★ '+avg+' ('+db.count+')';
  // Update card in list
  const card=document.querySelector(`[data-rest-id="${entityId}"]`);
  if(card){const s=card.querySelector('.stars-d');if(s)s.textContent='★★★★★ '+avg;}
  showToast('✅ شكراً على تقييمك! '+stars+' نجوم');
  closeRatingModal();
}
function openRatingModal(entityId,entityName){
  document.getElementById('ratingModalEntityId').value=entityId;
  document.getElementById('ratingModalEntityName').textContent=entityName;
  // Show existing reviews
  renderReviewsList(entityId);
  // Show avg
  const db=window.ratingsDB[entityId];
  const avg=db&&db.count?((db.total/db.count).toFixed(1)+' ('+db.count+' تقييم)'):'لا يوجد تقييم بعد';
  document.getElementById('ratingModalAvg').textContent=avg;
  setRatingModalStars(0);
  document.getElementById('ratingModalComment').value='';
  document.getElementById('ratingModal').style.display='flex';
}
function closeRatingModal(){document.getElementById('ratingModal').style.display='none';}
function setRatingModalStars(n){
  window.selectedRatingStars=n;
  document.querySelectorAll('#ratingModalStars span').forEach((s,i)=>{
    s.style.color=i<n?'#E85D04':'rgba(232,93,4,.2)';
  });
}
function renderReviewsList(entityId){
  const wrap=document.getElementById('ratingModalReviews');if(!wrap)return;
  const reviews=(window.ratingsDB[entityId]?.reviews||[]).slice(0,5);
  if(!reviews.length){wrap.innerHTML='<div style="font-size:11px;color:var(--t3);text-align:center;padding:8px">لا توجد تقييمات بعد</div>';return;}
  wrap.innerHTML='';
  reviews.forEach(r=>{
    wrap.insertAdjacentHTML('beforeend',`
      <div style="background:var(--s2);border-radius:10px;padding:8px 10px;margin-bottom:6px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:11px;font-weight:800;color:var(--t1)">${r.user}</span>
          <span style="font-size:13px;color:#E85D04">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span>
        </div>
        ${r.comment?`<div style="font-size:11px;color:var(--t2)">${r.comment}</div>`:''}
        <div style="font-size:10px;color:var(--t3);margin-top:3px">${r.date}</div>
      </div>`);
  });
}
loadRatings();

/* ══════════════════════════════════════════════════════════
   GOOGLE MAPS INTEGRATION
══════════════════════════════════════════════════════════ */
function openGoogleMaps(name,lat,lng){
  const query=lat&&lng?`${lat},${lng}`:encodeURIComponent(name+' قويسنا مصر');
  const url=lat&&lng
    ?`https://www.google.com/maps/search/?api=1&query=${query}`
    :`https://www.google.com/maps/search/?api=1&query=${query}`;
  window.open(url,'_blank');
}
function openMapEmbed(name,addr){
  const query=encodeURIComponent((addr||name)+' قويسنا مصر');
  document.getElementById('mapEmbedTitle').textContent=name;
  document.getElementById('mapEmbedFrame').src=`https://maps.google.com/maps?q=${query}&output=embed&z=15`;
  document.getElementById('mapEmbedModal').style.display='flex';
}
function closeMapEmbed(){
  document.getElementById('mapEmbedModal').style.display='none';
  document.getElementById('mapEmbedFrame').src='';
}

/* ══════════════════════════════════════════════════════════
   COUPON / DISCOUNT SYSTEM
══════════════════════════════════════════════════════════ */
// couponsDB and appliedCoupon declared at top of main script

function applyCoupon(){
  const code=document.getElementById('couponInput')?.value.trim().toUpperCase();
  if(!code){showToast('⚠️ أدخل كود الكوبون');return;}
  const coupon=couponsDB[code];
  if(!coupon){showToast('❌ كود الكوبون غير صحيح');return;}
  if(coupon.used>=coupon.uses){showToast('❌ انتهت صلاحية هذا الكوبون');return;}
  // Check restaurant restriction
  if(coupon.restName){
    const currentRest=cart.restName||document.getElementById('cartRestName')?.textContent?.replace('الطلب من: ','')||'';
    if(currentRest&&!currentRest.includes(coupon.restName)&&!coupon.restName.includes(currentRest)){
      const fb=document.getElementById('couponFeedback');
      if(fb){fb.textContent='❌ هذا الكوبون خاص بـ "'+coupon.restName+'" فقط';fb.style.color='#c62828';}
      showToast('❌ الكوبون خاص بمطعم '+coupon.restName);
      return;
    }
  }
  appliedCoupon={code,...coupon};
  const sub=cart.items.reduce((a,i)=>a+(i.price*i.qty),0);
  const discountAmt=coupon.type==='percent'?Math.round(sub*coupon.discount/100):coupon.discount;
  const restNote=coupon.restName?' ('+coupon.restName+')':'';
  document.getElementById('couponFeedback').textContent=`✅ ${coupon.desc}${restNote} — وفّرت ${discountAmt} جنيه`;
  document.getElementById('couponFeedback').style.color='#2e7d32';
  updateCartWithCoupon();
  showToast('✅ تم تطبيق الكوبون!');
}
function updateCartWithCoupon(){
  const sub=cart.items.reduce((a,i)=>a+(i.price*i.qty),0);
  let discount=0;
  if(appliedCoupon){
    discount=appliedCoupon.type==='percent'?Math.round(sub*appliedCoupon.discount/100):appliedCoupon.discount;
  }
  const total=Math.max(0,sub-discount)+(typeof deliveryFee!=='undefined'?deliveryFee:20);
  const totalEl=document.getElementById('cartTotal');
  const discEl=document.getElementById('cartDiscountRow');
  if(discEl)discEl.style.display=discount>0?'flex':'none';
  const discAmtEl=document.getElementById('cartDiscountAmt');
  if(discAmtEl)discAmtEl.textContent='-'+discount+' جنيه';
  if(totalEl)totalEl.textContent=total+' جنيه';
}
function removeCoupon(){
  appliedCoupon=null;
  const inp=document.getElementById('couponInput');if(inp)inp.value='';
  const fb=document.getElementById('couponFeedback');if(fb)fb.textContent='';
  updateCartWithCoupon();
  showToast('تم إزالة الكوبون');
}

/* ══════════════════════════════════════════════════════════
   REAL-TIME ORDERS (polling simulation)
══════════════════════════════════════════════════════════ */
// pendingOrdersQueue declared at top of main script
let ordersPollTimer=null;

function addOrderToQueue(orderData){
  orderData.id='ord-'+Date.now();
  orderData.status='جديد';
  orderData.timestamp=new Date().toLocaleTimeString('ar-EG');
  pendingOrdersQueue.unshift(orderData);
  updateOrdersBadge();
  // Notify admin
  sendPushNotification('🛒 طلب جديد!',`${orderData.name} — ${orderData.items}`,null);
}
function updateOrdersBadge(){
  const badge=document.getElementById('ordersLiveBadge');
  const newCount=pendingOrdersQueue.filter(o=>o.status==='جديد').length;
  if(badge){badge.textContent=newCount;badge.style.display=newCount>0?'flex':'none';}
  // Also update admin counter
  const stOrd=document.getElementById('stOrders');
  if(stOrd)stOrd.textContent=pendingOrdersQueue.length;
}
function renderLiveOrders(){
  const wrap=document.getElementById('liveOrdersList');if(!wrap)return;
  wrap.innerHTML='';
  if(!pendingOrdersQueue.length){
    wrap.innerHTML='<div style="text-align:center;padding:20px;font-size:12px;color:var(--t3)">لا توجد طلبات جديدة</div>';
    return;
  }
  pendingOrdersQueue.forEach((ord,idx)=>{
    const statusColor=ord.status==='جديد'?'#e65100':ord.status==='جاري'?'#1565c0':'#2e7d32';
    wrap.insertAdjacentHTML('beforeend',`
      <div style="background:#fff;border:1.5px solid var(--bd);border-radius:12px;padding:12px;margin-bottom:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div style="font-size:13px;font-weight:800;color:#1a1a1a">${ord.name}</div>
          <span style="font-size:10px;font-weight:800;padding:3px 8px;border-radius:8px;background:${statusColor}20;color:${statusColor}">${ord.status}</span>
        </div>
        <div style="font-size:11px;color:var(--t3);margin-bottom:4px">📱 ${ord.phone} • 📍 ${ord.addr}</div>
        <div style="font-size:11px;color:var(--t2);margin-bottom:8px">${ord.items}</div>
        <div style="font-size:12px;font-weight:800;color:#E85D04;margin-bottom:8px">💰 ${ord.total} جنيه • ⏰ ${ord.timestamp}</div>
        <div style="display:flex;gap:6px">
          <button onclick="updateOrderStatus(${idx},'جاري')" style="flex:1;background:rgba(21,101,192,.1);border:1px solid rgba(21,101,192,.25);color:#1565c0;border-radius:8px;padding:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">🚚 جاري</button>
          <button onclick="updateOrderStatus(${idx},'تم التوصيل')" style="flex:1;background:rgba(46,125,50,.1);border:1px solid rgba(46,125,50,.25);color:#2e7d32;border-radius:8px;padding:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">✅ تم</button>
          <button onclick="updateOrderStatus(${idx},'ملغي')" style="flex:1;background:rgba(198,40,40,.1);border:1px solid rgba(198,40,40,.2);color:#c62828;border-radius:8px;padding:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">❌ إلغاء</button>
        </div>
      </div>`);
  });
}
function updateOrderStatus(idx,status){
  if(!pendingOrdersQueue[idx])return;
  pendingOrdersQueue[idx].status=status;
  updateOrdersBadge();
  renderLiveOrders();
  sendPushNotification('تحديث طلب',`طلب ${pendingOrdersQueue[idx].name}: ${status}`,null);
  showToast('✅ تم تحديث الطلب إلى: '+status);
}
function openLiveOrders(){
  renderLiveOrders();
  document.getElementById('liveOrdersModal').style.display='flex';
}
function closeLiveOrders(){document.getElementById('liveOrdersModal').style.display='none';}

// ── CART / COUPON / RATINGS / PERSIST ──
// Inject coupon row into cart panel after DOM loads
document.addEventListener('DOMContentLoaded',()=>{
  // Track currently open restaurant id for rating
  window.currentOpenRestId=null;
  window.currentOpenRestName=null;

  // Add rating button to restaurant detail page actions
  const rdActionsEl=document.getElementById('restDetailPage')?.querySelector('.rest-actions');
  if(rdActionsEl){
    const rateBtn=document.createElement('button');
    rateBtn.className='rest-action-btn';
    rateBtn.id='rdRateBtn';
    rateBtn.style.cssText='background:rgba(232,93,4,.12);color:#E85D04;border:1px solid rgba(232,93,4,.25);cursor:pointer;font-family:inherit;padding:8px 12px;border-radius:10px;font-size:12px;font-weight:700';
    rateBtn.innerHTML='⭐ قيّم';
    rateBtn.onclick=()=>{
      const nm=window.currentOpenRestName||document.getElementById('rdFullName')?.textContent||'';
      const id=window.currentOpenRestId||'unknown';
      openRatingModal(id,nm);
    };
    rdActionsEl.appendChild(rateBtn);
  }

  // Override rdMap to open embedded map
  const rdMap=document.getElementById('rdMap');
  if(rdMap){
    rdMap.addEventListener('click',function(e){
      e.preventDefault();
      const nm=document.getElementById('rdFullName')?.textContent||'';
      const addr=document.getElementById('rdAddr')?.textContent||'';
      openMapEmbed(nm,addr);
    });
  }

  // Add coupon field into cart panel (before the name input)
  const cartForm=document.querySelector('.cart-panel .dform');
  if(cartForm&&!document.getElementById('couponInput')){
    const couponDiv=document.createElement('div');
    couponDiv.innerHTML=`<div style="display:flex;gap:6px;margin-bottom:4px"><input type="text" id="couponInput" placeholder="كود كوبون الخصم..." style="flex:1;background:#fff3ee;border:1.5px solid rgba(232,93,4,.2);border-radius:10px;padding:9px 12px;font-size:12px;font-family:inherit;direction:rtl;outline:none;color:#1a1a1a"/><button onclick="applyCoupon()" style="background:linear-gradient(135deg,#E85D04,#DC2F02);color:#fff;border:none;border-radius:10px;padding:9px 14px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">تطبيق</button></div><div id="couponFeedback" style="font-size:11px;color:var(--t3);margin-bottom:6px"></div>`;
    cartForm.insertBefore(couponDiv,cartForm.firstChild);
  }
  // Add discount row to cart totals
  const cartTotalRow=document.getElementById('cartTotal')?.closest('div');
  if(cartTotalRow&&!document.getElementById('cartDiscountRow')){
    cartTotalRow.insertAdjacentHTML('beforebegin',`<div id="cartDiscountRow" style="display:none;justify-content:space-between;margin-bottom:5px"><span style="font-size:13px;color:#2e7d32">🏷️ خصم الكوبون</span><span style="font-size:13px;font-weight:800;color:#2e7d32" id="cartDiscountAmt">-0 جنيه</span></div>`);
  }

  // Add live orders button to admin panel header
  const admHdrDiv=document.querySelector('.adm-hdr > div');
  if(admHdrDiv&&!document.getElementById('ordersLiveBadge')){
    const liveBtn=document.createElement('button');
    liveBtn.style.cssText='background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:5px;margin-top:6px';
    liveBtn.innerHTML='📦 طلبات حية <span id="ordersLiveBadge" style="display:none;background:#f44336;color:#fff;border-radius:50%;min-width:16px;height:16px;font-size:9px;font-weight:800;align-items:center;justify-content:center;padding:0 3px">0</span>';
    liveBtn.onclick=openLiveOrders;
    admHdrDiv.appendChild(liveBtn);
  }

  // Inject vendors management tab
  const admBdyForVendors = document.querySelector('.adm-bdy');
  if (admBdyForVendors && !document.getElementById('t-vendors')) {
    const vTab = document.createElement('div');
    vTab.id = 't-vendors';
    vTab.className = 'atc';
    vTab.innerHTML = `
      <div style="font-size:13px;font-weight:800;color:#1a1a1a;margin-bottom:12px">👥 إدارة البائعين وأصحاب المحلات</div>
      <!-- Add vendor form -->
      <div style="background:var(--s2);border-radius:12px;padding:12px;margin-bottom:12px;border:1px solid var(--bd2)">
        <div style="font-size:11px;font-weight:800;color:var(--orange);margin-bottom:10px">➕ إضافة بائع جديد</div>
        <div class="aform">
          <div class="arow">
            <div><label class="albl">البريد الإلكتروني</label><input type="email" id="vnd-email" placeholder="vendor@email.com" style="direction:ltr"/></div>
            <div><label class="albl">الدور</label>
              <select id="vnd-role">
                <option value="restaurant">🍽️ صاحب مطعم</option>
                <option value="shop">🏪 صاحب محل</option>
                <option value="doctor">🏥 دكتور / عيادة</option>
                <option value="craftsman">🔧 حرفي / أسطى</option>
                <option value="delivery">🛵 مندوب توصيل</option>
                <option value="pharmacy">💊 صيدلية</option>
                <option value="education">📚 سنتر / مدرس</option>
              </select>
            </div>
          </div>
          <div class="arow">
            <div><label class="albl">اسم المحل / العيادة</label><input type="text" id="vnd-name" placeholder="مطعم الشاطر..."/></div>
            <div><label class="albl">ID الكيان</label><input type="text" id="vnd-id" placeholder="r1 / shop-123..."/></div>
          </div>
          <input type="tel" id="vnd-wa" placeholder="رقم واتساب الخاص بالبائع (اختياري)"/>
          <button class="abtn" onclick="addVendorFromAdmin()" style="background:linear-gradient(135deg,#E85D04,#DC2F02)">+ تسجيل البائع</button>
        </div>
      </div>
      <!-- Vendors list -->
      <div style="font-size:11px;font-weight:800;color:var(--t3);margin-bottom:8px">البائعون المسجلون:</div>
      <div id="vendorsAdminList"></div>
      <!-- Login as vendor test -->
      <div style="background:rgba(232,93,4,.06);border-radius:12px;padding:10px;margin-top:12px;border:1px solid rgba(232,93,4,.15)">
        <div style="font-size:11px;font-weight:700;color:var(--t3);margin-bottom:8px">🔑 تجربة لوحة تحكم بائع:</div>
        <div style="display:flex;gap:8px">
          <input type="email" id="vnd-test-email" placeholder="بريد البائع..." style="flex:1;background:#fff;border:1.5px solid var(--bd2);border-radius:8px;padding:7px 10px;font-size:12px;font-family:inherit;direction:ltr;outline:none"/>
          <button onclick="testVendorLogin()" style="background:linear-gradient(135deg,#E85D04,#DC2F02);color:#fff;border:none;border-radius:8px;padding:7px 12px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">دخول</button>
        </div>
      </div>`;
    admBdyForVendors.appendChild(vTab);
    renderVendorsList();
  }
  const tSettings=document.getElementById('t-settings');
  if(tSettings&&!document.getElementById('pushSettingsBlock')){
    tSettings.insertAdjacentHTML('afterbegin',`
      <div id="pushSettingsBlock" style="background:var(--s2);border-radius:12px;padding:12px;margin-bottom:14px;border:1px solid var(--bd2)">
        <div style="font-size:12px;font-weight:800;color:#1a1a1a;margin-bottom:8px">🔔 إشعارات الجهاز (Push Notifications)</div>
        <button onclick="requestPushPermission()" style="width:100%;background:linear-gradient(135deg,#E85D04,#DC2F02);color:#fff;border:none;border-radius:10px;padding:11px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;margin-bottom:6px">🔔 تفعيل إشعارات الجهاز</button>
        <div style="font-size:10px;color:var(--t3)">ستصلك إشعارات عند وصول طلبات جديدة أو نشر أخبار</div>
      </div>`);
    tSettings.insertAdjacentHTML('beforeend',`
      <div id="couponSettingsBlock" style="margin-top:14px">
        <div style="font-size:12px;font-weight:800;color:#1a1a1a;margin-bottom:8px">🏷️ إدارة كوبونات الخصم</div>
        <div id="couponAdminList"></div>
        <div class="aform" style="margin-top:10px">
          <div class="arow"><div><label class="albl">كود الكوبون</label><input type="text" id="newCoupon-code" placeholder="SUMMER30"/></div><div><label class="albl">قيمة الخصم</label><input type="number" id="newCoupon-discount" placeholder="20"/></div></div>
          <div class="arow"><div><label class="albl">النوع</label><select id="newCoupon-type"><option value="percent">نسبة % مئوية</option><option value="fixed">قيمة ثابتة جنيه</option></select></div><div><label class="albl">عدد مرات الاستخدام</label><input type="number" id="newCoupon-uses" placeholder="100"/></div></div>
          <label class="albl">🍽️ تطبيق على مطعم محدد (اتركه فارغاً للكل)</label>
          <select id="newCoupon-rest" style="width:100%;background:#fff;border:1.5px solid rgba(232,93,4,.2);border-radius:9px;padding:8px 11px;font-size:12px;font-family:inherit;color:#1a1a1a;margin-bottom:7px;direction:rtl;outline:none">
            <option value="">— ينطبق على جميع المطاعم —</option>
          </select>
          <input type="text" id="newCoupon-desc" placeholder="وصف الكوبون..."/>
          <button class="abtn" onclick="addAdminCoupon()" style="background:linear-gradient(135deg,#E85D04,#DC2F02)">+ إضافة كوبون</button>
        </div>
      </div>`);
    renderCouponAdminList();
    // Populate restaurant list in coupon selector — done dynamically via refreshCouponRestList()
    setTimeout(refreshCouponRestList, 500);
  }
});

function refreshCouponRestList(){
  const sel=document.getElementById('newCoupon-rest');
  if(!sel) return;
  // Keep first option only
  while(sel.options.length>1) sel.remove(1);
  // Add all current restaurants
  document.querySelectorAll('#foodList .card .cnm').forEach(el=>{
    const nm=el.textContent.trim();
    if(!nm) return;
    const opt=document.createElement('option');
    opt.value=nm; opt.textContent=nm;
    sel.appendChild(opt);
  });
  // Also add dynamically added restaurants from admin
  const dynRests=QDB.get('restaurants')||{};
  Object.values(dynRests).forEach(r=>{
    if(!r.name) return;
    const already=[...sel.options].some(o=>o.value===r.name);
    if(!already){
      const opt=document.createElement('option');
      opt.value=r.name; opt.textContent=r.name;
      sel.appendChild(opt);
    }
  });
}

function renderCouponAdminList(){
  const wrap=document.getElementById('couponAdminList');if(!wrap)return;
  wrap.innerHTML='';
  Object.entries(couponsDB).forEach(([code,c])=>{
    const restLabel=c.restName?`<span style="background:rgba(232,93,4,.1);color:#E85D04;border-radius:5px;padding:2px 6px;font-size:9px;font-weight:800">🍽️ ${c.restName}</span>`:`<span style="background:rgba(46,125,50,.1);color:#2e7d32;border-radius:5px;padding:2px 6px;font-size:9px;font-weight:800">🌍 جميع المطاعم</span>`;
    wrap.insertAdjacentHTML('beforeend',`
      <div style="background:var(--s2);border-radius:10px;padding:8px 10px;margin-bottom:6px;display:flex;align-items:center;gap:8px">
        <div style="background:linear-gradient(135deg,#E85D04,#DC2F02);color:#fff;border-radius:7px;padding:4px 8px;font-size:11px;font-weight:900;flex-shrink:0">${code}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;font-weight:700;color:var(--t1)">${c.desc||''} ${restLabel}</div>
          <div style="font-size:10px;color:var(--t3)">${c.discount}${c.type==='percent'?'%':' جنيه'} • استُخدم ${c.used}/${c.uses} مرة</div>
        </div>
        <button onclick="deleteCoupon('${code}')" style="background:rgba(198,40,40,.1);border:none;color:#c62828;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;font-family:inherit">🗑️</button>
      </div>`);
  });
}
function addAdminCoupon(){
  const code=document.getElementById('newCoupon-code')?.value.trim().toUpperCase();
  const discount=parseInt(document.getElementById('newCoupon-discount')?.value)||0;
  const type=document.getElementById('newCoupon-type')?.value||'percent';
  const uses=parseInt(document.getElementById('newCoupon-uses')?.value)||100;
  const desc=document.getElementById('newCoupon-desc')?.value.trim()||'';
  const restName=document.getElementById('newCoupon-rest')?.value.trim()||'';
  if(!code||!discount){showToast('⚠️ اكتب الكود والخصم');return;}
  couponsDB[code]={discount,type,desc,uses,used:0,restName:restName||null};
  ['newCoupon-code','newCoupon-discount','newCoupon-uses','newCoupon-desc'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const restSel=document.getElementById('newCoupon-rest');if(restSel)restSel.value='';
  renderCouponAdminList();
  showToast('✅ تم إضافة الكوبون '+code+(restName?' لـ '+restName:''));
}
function deleteCoupon(code){
  if(!confirm('حذف الكوبون '+code+'؟'))return;
  delete couponsDB[code];
  renderCouponAdminList();
  showToast('🗑️ تم حذف الكوبون');
}

/* ══════════════════════════════════════════════════════════
   WHATSAPP NOTIFICATION SYSTEM
   إشعار واتساب تلقائي لصاحب المطعم / المحل عند كل طلب
══════════════════════════════════════════════════════════ */

// Restaurant WhatsApp numbers registry — admin can update these
window.vendorWA = {
  // format: 'rest-id': '01xxxxxxxxx'
  // These are populated from restaurant cards automatically
};

function getVendorWA(restId) {
  // First check registry
  if (window.vendorWA[restId]) return window.vendorWA[restId];
  // Fallback: read from card
  const card = document.querySelector(`#foodList .card[data-rest-id="${restId}"]`);
  if (card) {
    const wa = card.dataset.wa || card.dataset.phone ||
               card.querySelector('.cnm')?.dataset.phone || '';
    if (wa) { window.vendorWA[restId] = wa; return wa; }
  }
  return null;
}

function sendWhatsAppToVendor(restId, restName, orderDetails) {
  const wa = getVendorWA(restId);
  if (!wa) return; // No vendor WA number, skip
  const num = '2' + wa.replace(/^0/, '');
  const msg = encodeURIComponent(
    `🛒 طلب جديد على تطبيق قويسنا!\n━━━━━━━━━━━━━━\n` +
    `🍽️ المطعم: ${restName}\n${orderDetails}\n━━━━━━━━━━━━━━\n` +
    `يرجى التأكيد في أقرب وقت ممكن 🙏`
  );
  // Open WhatsApp to vendor in background tab
  const link = document.createElement('a');
  link.href = `https://wa.me/${num}?text=${msg}`;
  link.target = '_blank';
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => document.body.removeChild(link), 500);
}

// sendWhatsAppToVendor is called from within sendCartOrder above

/* ══════════════════════════════════════════════════════════
   LANGUAGE SYSTEM (Arabic / English)
══════════════════════════════════════════════════════════ */
let currentLang = 'ar';

const translations = {
  ar: {
    appName:'مدينة قويسنا', appSlogan:'قويسنا كلها بضغطة زرار 🤍',
    home:'الرئيسية', news:'الأخبار', food:'طعام',
    medical:'طبي', delivery:'توصيل', more:'المزيد', profile:'حسابي',
    langBtn:'English',
    // Quick grid
    qNews:'الأخبار', qNewsSub:'محلية وعامة',
    qFood:'المطاعم', qFoodSub:'دليل الطعام',
    qTransport:'المواصلات', qTransportSub:'على فين؟',
    qMedical:'الطب والصحة', qMedicalSub:'عيادات وطوارئ',
    qMarket:'سوق قويسنا', qMarketSub:'بيع ومقايضة',
    qCraft:'الأسطى', qCraftSub:'مهنيون متاحون',
    qEdu:'التعليم', qEduSub:'سناتر ومدرسين',
    qJobs:'الوظائف', qJobsSub:'فرص عمل',
    qDelivery:'التوصيل', qDeliverySub:'اطلب الآن',
    qShops:'المحلات', qShopsSub:'موضة وسوبر ماركت',
    // Section headers
    secHome:'الأقسام', secLatestNews:'آخر الأخبار',
    secNews:'الأخبار', secFood:'المطاعم والكافيهات', secMedical:'الطب والصحة',
    secMarket:'سوق قويسنا', secCraft:'الأسطى — دليل المهنيين',
    secEdu:'التعليم — سناتر ومدرسين', secJobs:'فرص العمل في قويسنا',
    secTransport:'المواصلات — على فين؟', secServices:'خدمات المدينة',
    secPersons:'ولاد البلد — شخصيات قويسنا', secHistory:'أصل الحكاية — تاريخ القرى',
    secDelivery:'خدمة التوصيل', secShops:'المحلات التجارية',
    secZaman:'قويسنا زمان — ذاكرة المدينة', secSport:'كورة قويسنا',
    // News chips
    newsSearch:'ابحث...', newsAll:'الكل', newsNews:'أخبار',
    newsSport:'رياضة', newsEdu:'تعليم', newsHealth:'صحة',
    // Food
    foodTitle:'المطاعم والكافيهات', foodSearch:'ابحث عن مطعم...',
    foodAll:'الكل', foodGrill:'مشويات', foodEgyptian:'مصري',
    foodPizza:'بيتزا', foodDrinks:'مشروبات',
    foodRegister:'صاحب مطعم؟ سجّل مطعمك', foodContact:'📩 تواصل',
    foodSortGPS:'📍 ترتيب حسب الأقرب',
    // Medical
    medTitle:'الطب والصحة', medSearch:'ابحث عن دكتور أو صيدلية...',
    medAll:'الكل', medClinic:'عيادات', medPharmacy:'صيدليات', medHospital:'مستشفيات',
    medRegister:'دكتور أو صيدلية؟ سجّل معنا',
    // Craftsmen
    craftSearch:'ابحث عن تخصص...',
    craftAll:'الكل', craftElec:'كهرباء', craftPlumb:'سباكة',
    craftCarp:'نجارة', craftPaint:'دهان',
    craftRegister:'أسطى؟ سجّل اسمك معنا',
    // Education
    eduCenters:'السناتر', eduTeachers:'مدرسين', eduNursery:'حضانات',
    eduLibrary:'مكتبات', eduBooks:'تبادل كتب',
    eduRegister:'سنتر أو مدرس؟ سجّل معنا',
    // Transport
    trChipTrain:'قطارات', trChipBus:'باصات', trChipMicro:'ميكروباص',
    // Market
    mktAll:'الكل', mktUsed:'مستعمل', mktHome:'أسر منتجة', mktBooks:'كتب',
    mktAdLabel:'📢 انشر إعلانك معنا',
    // Sport
    sportResults:'النتائج', sportTable:'جدول الترتيب',
    spTeam:'الفريق', spPlayed:'لعب', spWon:'فاز', spDraw:'تعادل',
    spLost:'خسر', spFor:'له', spAgainst:'عليه', spPts:'نقاط',
    // Shops
    shTitle:'المحلات التجارية', shSearch:'ابحث عن محل...',
    shAll:'الكل', shFashion:'موضة', shSupermarket:'سوبر ماركت',
    shHyper:'هايبر', shMakeup:'مكياج', shElectronics:'إلكترونيات',
    shFurniture:'أثاث',
    // Delivery
    dlTitle:'خدمة التوصيل', dlSubtitle:'توصيل داخل قويسنا وضواحيها',
    dlAgents:'اختر مندوب التوصيل', dlForm:'بيانات الطلب',
    dlName:'اسمك الكامل', dlPhone:'رقم هاتفك',
    dlAddr:'عنوانك بالتفصيل',
    dlNote:'اكتب طلبك بالتفصيل...', dlSend:'🛵 أرسل الطلب الآن',
    // Jobs
    jobsPost:'💼 أعلن عن وظيفة شاغرة', jobsAdd:'+ أضف وظيفة',
    // More drawer
    moreZaman:'زمان', moreSport:'كورة', moreServices:'خدمات',
    morePersons:'ولاد البلد', moreHistory:'أصل الحكاية',
    moreMarket:'السوق', moreShops:'المحلات', moreAbout:'عن التطبيق',
    moreLang:'English', moreCraft:'الأسطى', moreNotifs:'إشعارات',
    moreAdmin:'التحكم',
    // Profile
    profileTitle:'الملف الشخصي',
    profPersonal:'البيانات الشخصية', profFavs:'المفضلة',
    profAddresses:'العناوين', profDarkMode:'الوضع الليلي',
    profSupport:'الدعم الفني', profOrders:'طلباتي',
    profLogout:'تسجيل الخروج',
    // Auth
    authEmailLabel:'البريد الإلكتروني', authPassLabel:'كلمة المرور',
    authLoginBtn:'دخول 🚀', authRegBtn:'إنشاء الحساب ✨',
    authWelcome:'مرحباً بك في Q APP', authTagline:'قويسنا كلها بضغطة زرار 🤍',
    authLogin:'تسجيل الدخول', authSignup:'حساب جديد',
    authSkip:'تصفح بدون تسجيل دخول',
    // Cart
    cartTitle:'سلة الطلبات 🛒', cartSend:'📩 إرسال الطلب عبر واتساب',
    cartClear:'🗑️ مسح السلة', cartDelivery:'رسوم التوصيل',
    cartTotal:'الإجمالي', cartOrder:'قيمة الطلب',
    // About
    aboutAppName:'مدينة قويسنا', aboutAppSlogan:'قويسنا كلها بضغطة زرار 🤍',
    aboutVersion:'الإصدار 2.0.0', aboutStatRest:'مطعم',
    aboutStatSec:'قسم', aboutStatSupport:'دعم',
    aboutContactTitle:'📞 تواصل معنا', aboutPhone:'01000767058',
    aboutPhoneLabel:'اتصل بنا', aboutWA:'واتساب', aboutWALabel:'تواصل عبر واتساب',
    aboutFB:'صفحة الفيسبوك', aboutFBLabel:'تابعنا على فيسبوك',
    aboutPrivacyTitle:'سياسة الخصوصية', aboutTermsTitle:'شروط الاستخدام',
    aboutCopyright:'© 2026 Quesina City + Q APP — All Rights Reserved',
    aboutMadeWith:'Made with ❤️ for Quesina\'s people',
    aboutPrivacyText1:'نحن في تطبيق مدينة قويسنا نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.',
    aboutPrivacyText2:'• البيانات المجمّعة: الاسم، رقم الهاتف، العنوان — لأغراض التوصيل فقط.',
    aboutPrivacyText3:'• لا نشارك بياناتك مع أطراف ثالثة.',
    aboutPrivacyText4:'• يمكنك طلب حذف حسابك في أي وقت عبر واتساب.',
    aboutPrivacyText5:'• آخر تحديث: أبريل ٢٠٢٦',
    aboutTermsText1:'• التطبيق مخصص لخدمة أبناء مدينة قويسنا ومحيطها.',
    aboutTermsText2:'• يُحظر استخدام التطبيق لأغراض غير قانونية أو مخالفة للآداب العامة.',
    aboutTermsText3:'• المعلومات المنشورة مسؤولية أصحابها، والتطبيق غير مسؤول عن أي أضرار.',
    aboutTermsText4:'• نحتفظ بحق تعليق أي حساب يخالف الشروط.',
    footer:'© 2026 Quesina City + Q APP — All Rights Reserved\nMade with ❤️ for Quesina\'s people',
  },
  en: {
    appName:'Quesina City', appSlogan:'Everything Quesina — One Tap Away 🤍',
    home:'Home', news:'News', food:'Food',
    medical:'Medical', delivery:'Delivery', more:'More', profile:'Account',
    langBtn:'عربي',
    // Quick grid
    qNews:'News', qNewsSub:'Local & General',
    qFood:'Restaurants', qFoodSub:'Food Guide',
    qTransport:'Transport', qTransportSub:'Where to?',
    qMedical:'Healthcare', qMedicalSub:'Clinics & Emergency',
    qMarket:'Market', qMarketSub:'Buy & Trade',
    qCraft:'Craftsmen', qCraftSub:'Available Pros',
    qEdu:'Education', qEduSub:'Centers & Tutors',
    qJobs:'Jobs', qJobsSub:'Opportunities',
    qDelivery:'Delivery', qDeliverySub:'Order Now',
    qShops:'Shops', qShopsSub:'Fashion & Markets',
    // Section headers
    secHome:'Sections', secLatestNews:'Latest News',
    secNews:'News', secFood:'Restaurants & Cafés', secMedical:'Health & Medical',
    secMarket:'Quesina Market', secCraft:'Craftsmen Directory',
    secEdu:'Education — Centers & Tutors', secJobs:'Jobs in Quesina',
    secTransport:'Transportation — Where to?', secServices:'City Services',
    secPersons:'Local Personalities', secHistory:'History & Stories',
    secDelivery:'Delivery Service', secShops:'Shops & Stores',
    secZaman:'Quesina Through Time', secSport:'Quesina Football',
    // News chips
    newsSearch:'Search...', newsAll:'All', newsNews:'News',
    newsSport:'Sports', newsEdu:'Education', newsHealth:'Health',
    // Food
    foodTitle:'Restaurants & Cafés', foodSearch:'Search for a restaurant...',
    foodAll:'All', foodGrill:'Grills', foodEgyptian:'Egyptian',
    foodPizza:'Pizza', foodDrinks:'Drinks',
    foodRegister:'Own a restaurant? Register it', foodContact:'📩 Contact',
    foodSortGPS:'📍 Sort by Nearest',
    // Medical
    medTitle:'Health & Medical', medSearch:'Search doctors or pharmacies...',
    medAll:'All', medClinic:'Clinics', medPharmacy:'Pharmacies', medHospital:'Hospitals',
    medRegister:'Doctor or pharmacy? Register with us',
    // Craftsmen
    craftSearch:'Search by specialty...',
    craftAll:'All', craftElec:'Electric', craftPlumb:'Plumbing',
    craftCarp:'Carpentry', craftPaint:'Painting',
    craftRegister:'Craftsman? Register with us',
    // Education
    eduCenters:'Centers', eduTeachers:'Tutors', eduNursery:'Nurseries',
    eduLibrary:'Libraries', eduBooks:'Book Exchange',
    eduRegister:'Center or tutor? Register with us',
    // Transport
    trChipTrain:'Trains', trChipBus:'Buses', trChipMicro:'Minibus',
    // Market
    mktAll:'All', mktUsed:'Used', mktHome:'Homemade', mktBooks:'Books',
    mktAdLabel:'📢 Post your ad here',
    // Sport
    sportResults:'Results', sportTable:'League Table',
    spTeam:'Team', spPlayed:'P', spWon:'W', spDraw:'D',
    spLost:'L', spFor:'GF', spAgainst:'GA', spPts:'Pts',
    // Shops
    shTitle:'Shops & Stores', shSearch:'Search for a shop...',
    shAll:'All', shFashion:'Fashion', shSupermarket:'Supermarket',
    shHyper:'Hypermarket', shMakeup:'Makeup', shElectronics:'Electronics',
    shFurniture:'Furniture',
    // Delivery
    dlTitle:'Delivery Service', dlSubtitle:'Delivery within Quesina & surroundings',
    dlAgents:'Choose Delivery Agent', dlForm:'Order Details',
    dlName:'Full Name', dlPhone:'Phone Number',
    dlAddr:'Your address in detail',
    dlNote:'Describe your order in detail...', dlSend:'🛵 Send Order Now',
    // Jobs
    jobsPost:'💼 Post a Job Opening', jobsAdd:'+ Add Job',
    // More drawer
    moreZaman:'History', moreSport:'Football', moreServices:'Services',
    morePersons:'Personalities', moreHistory:'Stories',
    moreMarket:'Market', moreShops:'Shops', moreAbout:'About App',
    moreLang:'عربي', moreCraft:'Craftsmen', moreNotifs:'Notifications',
    moreAdmin:'Admin',
    // Profile
    profileTitle:'My Profile',
    profPersonal:'Personal Info', profFavs:'Favourites',
    profAddresses:'Addresses', profDarkMode:'Dark Mode',
    profSupport:'Support', profOrders:'My Orders',
    profLogout:'Sign Out',
    // Auth
    authEmailLabel:'Email Address', authPassLabel:'Password',
    authLoginBtn:'Sign In 🚀', authRegBtn:'Create Account ✨',
    authWelcome:'Welcome to Q APP', authTagline:'Everything Quesina — One Tap Away 🤍',
    authLogin:'Sign In', authSignup:'Create Account',
    authSkip:'Browse without signing in',
    // Cart
    cartTitle:'Order Cart 🛒', cartSend:'📩 Send Order via WhatsApp',
    cartClear:'🗑️ Clear Cart', cartDelivery:'Delivery Fee',
    cartTotal:'Total', cartOrder:'Order Value',
    // About
    aboutAppName:'Quesina City', aboutAppSlogan:'Everything Quesina — One Tap Away',
    aboutVersion:'Version 2.0.0', aboutStatRest:'Restaurants',
    aboutStatSec:'Sections', aboutStatSupport:'24/7',
    aboutContactTitle:'📞 Contact Us', aboutPhone:'01000767058',
    aboutPhoneLabel:'Call Us', aboutWA:'WhatsApp', aboutWALabel:'Chat on WhatsApp',
    aboutFB:'Facebook Page', aboutFBLabel:'Follow us on Facebook',
    aboutPrivacyTitle:'Privacy Policy', aboutTermsTitle:'Terms of Use',
    aboutCopyright:'© 2026 Quesina City + Q APP — All Rights Reserved',
    aboutMadeWith:'Made with ❤️ for Quesina\'s people',
    aboutPrivacyText1:'At Quesina City App, we respect your privacy and protect your personal data.',
    aboutPrivacyText2:'• Data collected: Name, phone, address — for delivery purposes only.',
    aboutPrivacyText3:'• We do not share your data with third parties.',
    aboutPrivacyText4:'• You can request account deletion anytime via WhatsApp.',
    aboutPrivacyText5:'• Last updated: April 2026',
    aboutTermsText1:'• This app is dedicated to serving residents of Quesina City and surroundings.',
    aboutTermsText2:'• Prohibited: using the app for illegal or unethical purposes.',
    aboutTermsText3:'• Published content is the responsibility of its authors; the app is not liable for damages.',
    aboutTermsText4:'• We reserve the right to suspend accounts that violate these terms.',
    footer:'© 2026 Quesina City + Q APP — All Rights Reserved\nMade with ❤️ for Quesina\'s people',
  }
};

function toggleAppLang() {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  applyLang();
  showToast(currentLang === 'en' ? '🌐 Switched to English' : '🌐 تم التبديل للعربية');
}

function applyLang() {
  const t = translations[currentLang];
  const isEn = currentLang === 'en';

  document.documentElement.lang = currentLang;
  document.documentElement.dir = isEn ? 'ltr' : 'rtl';
  document.title = isEn ? 'Quesina City' : 'Quesina City — مدينة قويسنا';

  // ── Helpers ──
  function txt(sel, val) {
    if (!val) return;
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (el) el.textContent = val;
  }
  function ph(id, val) {
    if (!val) return;
    const el = document.getElementById(id);
    if (el) el.placeholder = val;
  }
  function slblTxt(sec, val) {
    if (!sec || !val) return;
    const s = document.getElementById(sec);
    if (!s) return;
    const sl = s.querySelector('.slbl');
    if (!sl) return;
    const last = sl.childNodes[sl.childNodes.length - 1];
    if (last && last.nodeType === 3) last.textContent = val;
    else if (sl.children.length === 0) sl.textContent = val;
  }
  function chips(secId, vals) {
    const sec = document.getElementById(secId);
    if (!sec) return;
    const chs = sec.querySelectorAll('.chip');
    vals.forEach((v, i) => { if (chs[i] && v) chs[i].textContent = v; });
  }

  // ── Brand ──
  txt('.brand-ar', t.appName);
  txt('.brand-tag', t.appSlogan);

  // ── Bottom nav ──
  const navMap = { 'bn-home':'home','bn-news':'news','bn-food':'food','bn-medical':'medical','bn-delivery':'delivery','bn-more':'more','bn-profile':'profile' };
  Object.entries(navMap).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) { const lbl = el.querySelector('.blbl'); if (lbl) lbl.textContent = t[key]; }
  });

  // ── More drawer items ──
  const moreGrid = document.querySelector('.more-grid');
  if (moreGrid) {
    const mdiItems = moreGrid.querySelectorAll('.mdi');
    const moreVals = [t.moreZaman,t.moreSport,t.moreServices,t.morePersons,t.moreHistory,t.moreMarket,t.moreShops,t.moreAbout,t.moreLang,t.moreCraft,t.moreNotifs,t.moreAdmin];
    mdiItems.forEach((item, i) => {
      if (!moreVals[i]) return;
      const span = item.querySelector('span');
      if (span && span.id !== 'langBtnLabel') span.textContent = moreVals[i];
    });
  }
  const lb = document.getElementById('langBtnLabel');
  if (lb) lb.textContent = t.langBtn;

  // ── Home quick grid ──
  const qgrid = document.querySelector('#s-home .qgrid');
  if (qgrid) {
    const qData = [
      [t.qNews,t.qNewsSub],[t.qFood,t.qFoodSub],[t.qTransport,t.qTransportSub],
      [t.qMedical,t.qMedicalSub],[t.qMarket,t.qMarketSub],[t.qCraft,t.qCraftSub],
      [t.qEdu,t.qEduSub],[t.qJobs,t.qJobsSub],[t.qDelivery,t.qDeliverySub],[t.qShops,t.qShopsSub]
    ];
    qgrid.querySelectorAll('.qc').forEach((qc, i) => {
      if (!qData[i]) return;
      const lbl = qc.querySelector('.qlbl'); if (lbl && qData[i][0]) lbl.textContent = qData[i][0];
      const sub = qc.querySelector('.qsub'); if (sub && qData[i][1]) sub.textContent = qData[i][1];
    });
  }

  // ── Home section slbls ──
  const homeSlbls = document.querySelectorAll('#s-home .slbl');
  if (homeSlbls[0]) { const last = homeSlbls[0].childNodes[homeSlbls[0].childNodes.length-1]; if (last && last.nodeType===3) last.textContent = t.secHome; }
  if (homeSlbls[1]) { const last = homeSlbls[1].childNodes[homeSlbls[1].childNodes.length-1]; if (last && last.nodeType===3) last.textContent = t.secLatestNews; }

  // ── All section headers ──
  ['s-news','s-food','s-medical','s-market','s-craftsmen','s-education','s-jobs','s-transport','s-services','s-persons','s-history','s-delivery','s-shops','s-zaman','s-sport'].forEach(sid => {
    const keyMap = {'s-news':'secNews','s-food':'secFood','s-medical':'secMedical','s-market':'secMarket','s-craftsmen':'secCraft','s-education':'secEdu','s-jobs':'secJobs','s-transport':'secTransport','s-services':'secServices','s-persons':'secPersons','s-history':'secHistory','s-delivery':'secDelivery','s-shops':'secShops','s-zaman':'secZaman','s-sport':'secSport'};
    slblTxt(sid, t[keyMap[sid]]);
  });

  // ── NEWS chips + search ──
  const newsEl = document.getElementById('s-news');
  if (newsEl) {
    const inp = newsEl.querySelector('input[placeholder]');
    if (inp) inp.placeholder = t.newsSearch || '';
    chips('s-news', [t.newsAll, t.newsNews, t.newsSport, t.newsEdu, t.newsHealth]);
  }

  // ── FOOD chips + search ──
  if (document.getElementById('s-food')) {
    const inp = document.querySelector('#s-food input[placeholder]');
    if (inp) inp.placeholder = t.foodSearch || '';
    chips('s-food', [t.foodAll, t.foodGrill, t.foodEgyptian, t.foodPizza, t.foodDrinks]);
    const sortBtn = document.querySelector('#s-food [onclick*="sortRestsByGPS"]');
    if (sortBtn) sortBtn.textContent = t.foodSortGPS;
    const regDiv = document.querySelector('#s-food [style*="rgba(37,211"]');
    if (regDiv) { const sp = regDiv.querySelector('span'); if (sp) sp.textContent = t.foodRegister; }
  }

  // ── MEDICAL chips + search ──
  if (document.getElementById('s-medical')) {
    const inp = document.querySelector('#s-medical input[placeholder]');
    if (inp) inp.placeholder = t.medSearch || '';
    chips('s-medical', [t.medAll, t.medClinic, t.medPharmacy, t.medHospital]);
    const regDiv = document.querySelector('#s-medical [style*="rgba(37,211"]');
    if (regDiv) { const sp = regDiv.querySelector('span'); if (sp) sp.textContent = t.medRegister; }
  }

  // ── CRAFTSMEN chips + search ──
  if (document.getElementById('s-craftsmen')) {
    const inp = document.querySelector('#s-craftsmen input[placeholder]');
    if (inp) inp.placeholder = t.craftSearch || '';
    chips('s-craftsmen', [t.craftAll, t.craftElec, t.craftPlumb, t.craftCarp, t.craftPaint]);
    const regDiv = document.querySelector('#s-craftsmen [style*="rgba(37,211"]');
    if (regDiv) { const sp = regDiv.querySelector('span'); if (sp) sp.textContent = t.craftRegister; }
  }

  // ── EDUCATION chips ──
  if (document.getElementById('s-education')) {
    chips('s-education', [t.eduCenters, t.eduTeachers, t.eduNursery, t.eduLibrary, t.eduBooks]);
    const regDiv = document.querySelector('#s-education [style*="rgba(37,211"]');
    if (regDiv) { const sp = regDiv.querySelector('span'); if (sp) sp.textContent = t.eduRegister; }
  }

  // ── TRANSPORT chips ──
  if (document.getElementById('s-transport')) {
    chips('s-transport', [t.trChipTrain, t.trChipBus, t.trChipMicro]);
  }

  // ── MARKET chips ──
  if (document.getElementById('s-market')) {
    chips('s-market', [t.mktAll, t.mktUsed, t.mktHome, t.mktBooks]);
    const adSpan = document.querySelector('#s-market [style*="rgba(249,168"] span');
    if (adSpan) adSpan.textContent = t.mktAdLabel;
  }

  // ── SHOPS chips + search ──
  if (document.getElementById('s-shops')) {
    const inp = document.querySelector('#s-shops input[placeholder]');
    if (inp) inp.placeholder = t.shSearch || '';
    chips('s-shops', [t.shAll, t.shFashion, t.shSupermarket, t.shHyper, t.shMakeup, t.shElectronics, t.shFurniture]);
  }

  // ── SPORT chips + table headers ──
  if (document.getElementById('s-sport')) {
    chips('s-sport', [t.sportResults, t.sportTable]);
    const ths = document.querySelectorAll('#s-sport thead th');
    const thVals = ['#', t.spTeam, t.spPlayed, t.spWon, t.spDraw, t.spLost, t.spFor, t.spAgainst, t.spPts];
    ths.forEach((th, i) => { if (i > 0 && thVals[i]) th.textContent = thVals[i]; });
  }

  // ── DELIVERY section ──
  const dlEl = document.getElementById('s-delivery');
  if (dlEl) {
    const h3 = dlEl.querySelector('.dbanner h3'); if (h3) h3.textContent = t.dlTitle;
    const p  = dlEl.querySelector('.dbanner p');  if (p)  p.textContent = t.dlSubtitle;
    const dlSlbls = dlEl.querySelectorAll('.slbl');
    if (dlSlbls[0]) { const last = dlSlbls[0].childNodes[dlSlbls[0].childNodes.length-1]; if (last && last.nodeType===3) last.textContent = t.dlAgents; }
    if (dlSlbls[1]) { const last = dlSlbls[1].childNodes[dlSlbls[1].childNodes.length-1]; if (last && last.nodeType===3) last.textContent = t.dlForm; }
    ph('dName', t.dlName); ph('dPhone', t.dlPhone); ph('dAddr', t.dlAddr); ph('dNote', t.dlNote);
    const sendBtn = dlEl.querySelector('.bmain'); if (sendBtn) sendBtn.textContent = t.dlSend;
  }

  // ── JOBS section ──
  const jobsEl = document.getElementById('s-jobs');
  if (jobsEl) {
    const adDiv = jobsEl.querySelector('[style*="rgba(249,168"]');
    if (adDiv) {
      const lbl = adDiv.querySelector('div'); if (lbl) lbl.textContent = t.jobsPost;
      const btn = adDiv.querySelector('button'); if (btn) btn.textContent = t.jobsAdd;
    }
  }

  // ── PROFILE page labels ──
  const profilePage = document.getElementById('userProfilePage');
  if (profilePage) {
    const ptitle = profilePage.querySelector('[style*="font-size:17px;font-weight:900"]');
    if (ptitle) ptitle.textContent = t.profileTitle;
    // Find all section title rows (font-size:15px font-weight:800)
    const profTitles = profilePage.querySelectorAll('[style*="font-size:15px;font-weight:800;color:#1a1a1a"]');
    const profKeys = [t.profPersonal, t.profFavs, t.profAddresses, t.profDarkMode, t.profSupport, t.profOrders];
    profTitles.forEach((el, i) => { if (profKeys[i]) el.textContent = profKeys[i]; });
    // Logout
    const logoutEl = profilePage.querySelector('[style*="color:#c62828"][style*="font-size:15px"]');
    if (logoutEl) logoutEl.textContent = t.profLogout;
  }

  // ── AUTH page ──
  const authPage = document.getElementById('authPage');
  if (authPage) {
    const atitle = authPage.querySelector('[style*="font-size:22px"]');
    if (atitle) atitle.textContent = t.appName;
    const aslogan = authPage.querySelector('[style*="rgba(255,255,255,.75)"]');
    if (aslogan) aslogan.textContent = t.appSlogan;
    const loginTab = document.getElementById('authTab-login');
    const regTab   = document.getElementById('authTab-register');
    if (loginTab) loginTab.textContent = t.authLogin;
    if (regTab)   regTab.textContent = t.authSignup;
    const loginBtn = authPage.querySelector('[onclick="doLogin()"]');
    if (loginBtn) loginBtn.textContent = t.authLoginBtn;
    const regBtn = authPage.querySelector('[onclick="doRegister()"]');
    if (regBtn) regBtn.textContent = t.authRegBtn;
    const skipBtns = authPage.querySelectorAll('[onclick="closeAuthPage()"]');
    skipBtns.forEach(btn => btn.textContent = t.authSkip);
    // Labels in login form
    const loginLabels = document.querySelectorAll('#authForm-login label');
    if (loginLabels[0]) loginLabels[0].textContent = t.authEmailLabel;
    if (loginLabels[1]) loginLabels[1].textContent = t.authPassLabel;
    // Labels in register form
    const regLabels = document.querySelectorAll('#authForm-register label');
    if (regLabels[2]) regLabels[2].textContent = t.authEmailLabel;
    if (regLabels[3]) regLabels[3].textContent = t.authPassLabel;
  }

  // ── About page ──
  ['aboutAppName','aboutAppSlogan','aboutVersion','aboutStatRest','aboutStatSec','aboutStatSupport','aboutContactTitle','aboutPhone','aboutPhoneLabel','aboutWA','aboutWALabel','aboutFB','aboutFBLabel','aboutPrivacyTitle','aboutTermsTitle','aboutCopyright','aboutMadeWith','aboutPrivacyText1','aboutPrivacyText2','aboutPrivacyText3','aboutPrivacyText4','aboutPrivacyText5','aboutTermsText1','aboutTermsText2','aboutTermsText3','aboutTermsText4'].forEach(id => {
    const el = document.getElementById(id);
    if (el && t[id]) el.textContent = t[id];
  });

  // ── Footers ──
  if (t.footer) {
    document.querySelectorAll('.page-copyright').forEach(el => {
      el.innerHTML = t.footer.replace(/\n/g, '<br>');
    });
  }

  // ── data-en / data-ar universal content switcher ──
  // Any element with data-en gets swapped based on language
  document.querySelectorAll('[data-en]').forEach(el => {
    const val = isEn ? el.dataset.en : (el.dataset.ar || null);
    if (val) el.textContent = val;
  });

  try { localStorage.setItem('quesina_lang', currentLang); } catch(e) {}
}

// Restore saved language on load
window.addEventListener('load', () => {
  try {
    const saved = localStorage.getItem('quesina_lang');
    if (saved && saved !== 'ar') { currentLang = saved; applyLang(); }
  } catch(e) {}
});

/* ══════════════════════════════════════════════════════════
   ABOUT PAGE HELPER
══════════════════════════════════════════════════════════ */
function toggleAboutSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function saveAboutAdmin(){
  const wa=document.getElementById('ab-wa').value.trim();
  const phone=document.getElementById('ab-phone').value.trim();
  const fb=document.getElementById('ab-fb').value.trim();
  const name=document.getElementById('ab-name').value.trim();
  const slogan=document.getElementById('ab-slogan').value.trim();
  const ver=document.getElementById('ab-ver').value.trim();
  // Apply to about section
  if(wa){document.querySelectorAll('[href*="wa.me/"]').forEach(el=>{const old=el.href;const upd=old.replace(/wa\.me\/\d+/,'wa.me/'+wa);el.href=upd;});}
  if(phone){const tel=document.querySelector('[href^="tel:01"]');if(tel)tel.href='tel:'+phone;const abPh=document.getElementById('aboutPhone');if(abPh)abPh.textContent=phone;}
  if(fb){const fbLink=document.getElementById('aboutFbLink');if(fbLink)fbLink.href=fb;const lnkFb=document.getElementById('lnk-fb');if(lnkFb)lnkFb.href=fb;}
  if(name){const n=document.getElementById('aboutAppName');if(n)n.textContent=name;const bn=document.querySelector('.brand-ar');if(bn)bn.textContent=name;}
  if(slogan){const s=document.getElementById('aboutAppSlogan');if(s)s.textContent=slogan;const bt=document.querySelector('.brand-tag');if(bt)bt.textContent=slogan;}
  if(ver){const v=document.getElementById('aboutVersion');if(v)v.textContent='الإصدار '+ver;}
  showToast('✅ تم حفظ بيانات التطبيق');
}

function saveAboutPrivacy(){
  const text=document.getElementById('ab-privacy').value.trim();
  if(!text){showToast('⚠️ اكتب نص السياسة');return;}
  const lines=text.split('\n').filter(l=>l.trim());
  const ids=['aboutPrivacyText1','aboutPrivacyText2','aboutPrivacyText3','aboutPrivacyText4','aboutPrivacyText5'];
  lines.forEach((line,i)=>{if(i<ids.length){const el=document.getElementById(ids[i]);if(el)el.textContent=line;}});
  showToast('✅ تم حفظ سياسة الخصوصية');
}

function saveAboutTerms(){
  const text=document.getElementById('ab-terms').value.trim();
  if(!text){showToast('⚠️ اكتب نص الشروط');return;}
  const lines=text.split('\n').filter(l=>l.trim());
  const ids=['aboutTermsText1','aboutTermsText2','aboutTermsText3','aboutTermsText4'];
  lines.forEach((line,i)=>{if(i<ids.length){const el=document.getElementById(ids[i]);if(el)el.textContent=line;}});
  showToast('✅ تم حفظ شروط الاستخدام');
}

function addVendorFromAdmin() {
  const email = document.getElementById('vnd-email')?.value.trim();
  const role  = document.getElementById('vnd-role')?.value;
  const name  = document.getElementById('vnd-name')?.value.trim();
  const id    = document.getElementById('vnd-id')?.value.trim();
  const wa    = document.getElementById('vnd-wa')?.value.trim();
  if (!email || !role || !name || !id) { showToast('⚠️ اكمل البيانات المطلوبة'); return; }
  assignVendorRole(email, role, id, name, wa);
  ['vnd-email','vnd-name','vnd-id','vnd-wa'].forEach(eid => { const el=document.getElementById(eid); if(el)el.value=''; });
}

function testVendorLogin() {
  const email = document.getElementById('vnd-test-email')?.value.trim();
  if (!email) { showToast('⚠️ أدخل البريد الإلكتروني'); return; }
  const vendor = vendorsRegistry[email];
  if (!vendor) { showToast('❌ هذا البريد غير مسجل كبائع'); return; }
  currentRole = vendor.role;
  currentVendorId = vendor.vendorId;
  currentUser = { uid: 'vendor-test', displayName: vendor.vendorName, email };
  closeAdmin();
  showVendorDashboard();
}
