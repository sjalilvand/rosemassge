/* =====================================================================
   calls.js — تماس صوتی و تصویری (WebRTC) پیام‌رسان رز | Rose Messenger
   سیگنالینگ از طریق polling روی /api/sync + /api/calls (بدون وابستگی خارجی)
   نیازمند HTTPS برای دسترسی به میکروفون/دوربین مرورگر
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- آیکون‌های اضافه ---------- */
  Object.assign(I, {
    phone: '<path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    videocam: '<rect x="3" y="6" width="13" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 12 5-3.5v7L16 12z" fill="currentColor"/>',
    micoff: '<path d="M9 5a3 3 0 0 1 6 0v6M12 17.5V21M5.5 11a6.5 6.5 0 0 0 10.4 5.2M4 4l16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>',
    camoff: '<path d="M3 3l18 18M10 6h6a3 3 0 0 1 0 12h-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="3" y="6" width="9" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>'
  });

  /* ---------- وضعیت ---------- */
  const C = {
    call: null,        // {cid, role, kind, state, peer}
    lastSig: 0,
    pc: null,
    local: null,       // MediaStream
    remote: null,
    pendingIce: [],    // کاندیدهای دریافتی پیش از setRemoteDescription
    buffered: [],      // سیگنال‌های دریافتی پیش از پذیرش تماس (سمت گیرنده)
    ringInt: null,
    timerInt: null,
    answeredAt: 0,
    ringing: false,
    uiOn: false,
    guard: 0
  };

  const RTC_CFG = {
    iceServers: [
      { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      { urls: ['stun:stun2.l.google.com:19302', 'stun:stun3.l.google.com:19302'] },
      { urls: ['stun:stun.cloudflare.com:3478'] }
    ],
    iceCandidatePoolSize: 2
  };

  /* ---------- عناصر رابط ---------- */
  const ui = {};
  function buildUI() {
    // پوشه‌ی تمام‌صفحه تماس
    const ov = el('div', 'call-overlay'); ov.id = 'callOverlay'; ov.hidden = true;
    ov.innerHTML =
      '<video id="cRemote" autoplay playsinline></video>' +
      '<video id="cLocal" class="call-pip" autoplay playsinline muted></video>' +
      '<div class="call-top"><span class="call-av" id="cAv"></span>' +
      '<div class="call-tt"><strong id="cName"></strong><span id="cStatus"></span></div>' +
      '<span id="cTimer" class="call-timer" hidden>۰۰:۰۰</span></div>' +
      '<div class="call-controls">' +
      '<button id="cMute" class="call-btn" title="قطع/وصل میکروفون"></button>' +
      '<button id="cCamT" class="call-btn" title="قطع/وصل دوربین"></button>' +
      '<button id="cHang" class="call-btn danger" title="پایان تماس"></button></div>';
    document.body.append(ov);

    // کارت تماس ورودی
    const rm = el('div', 'overlay'); rm.id = 'mRing'; rm.hidden = true;
    rm.innerHTML =
      '<div class="m-card ring-card"><span id="rAv"></span>' +
      '<strong id="rName"></strong><span id="rKind" class="ring-kind"></span>' +
      '<div class="ring-btns">' +
      '<button id="rReject" class="call-btn danger big" title="رد تماس"></button>' +
      '<button id="rAccept" class="call-btn accept big" title="پاسخ"></button></div></div>';
    document.body.append(rm);

    ui.ov = ov; ui.remote = ov.querySelector('#cRemote'); ui.local = ov.querySelector('#cLocal');
    ui.av = ov.querySelector('#cAv'); ui.name = ov.querySelector('#cName');
    ui.status = ov.querySelector('#cStatus'); ui.timer = ov.querySelector('#cTimer');
    ui.mute = ov.querySelector('#cMute'); ui.cam = ov.querySelector('#cCamT'); ui.hang = ov.querySelector('#cHang');
    ui.ring = rm; ui.rAv = rm.querySelector('#rAv'); ui.rName = rm.querySelector('#rName');
    ui.rKind = rm.querySelector('#rKind');
    ui.mute.innerHTML = icon('mic'); ui.cam.innerHTML = icon('videocam');
    ui.hang.innerHTML = icon('phone'); ui.hang.classList.add('hang');
    ui.answer = rm.querySelector('#rAccept');
    ui.answer.innerHTML = icon('phone');
    rm.querySelector('#rReject').innerHTML = icon('x');
  }

  /* ---------- ابزار ---------- */
  const canMedia = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const ringBeep = beep;

  function ringTone(on) {
    if (C.ringInt) { clearInterval(C.ringInt); C.ringInt = null; }
    if (on) C.ringInt = setInterval(ringBeep, 900);
  }

  function fmtDur(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return pad2(m) + ':' + pad2(s);
  }

  function setStatus(t) { if (ui.status) ui.status.textContent = t; }

  async function signal(p) {
    try { await api('calls/' + C.call.cid + '/signal', 'POST', { payload: p }); } catch (_) {}
  }

  async function getMedia(kind) {
    return navigator.mediaDevices.getUserMedia(kind === 'video'
      ? { audio: true, video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } }
      : { audio: true, video: false });
  }

  /* ---------- RTCPeerConnection ---------- */
  async function prepareMedia(call) {
    const relay = await api('calls/ice');
    const stream = await getMedia(call.kind);
    if (C.call !== call) {
      stream.getTracks().forEach(track => track.stop());
      return false;
    }
    C.local = stream;
    ui.local.srcObject = stream;
    C.pc = createPC(relay);
    stream.getTracks().forEach(track => C.pc.addTrack(track, stream));
    return true;
  }

  function createPC(relay) {
    const pc = new RTCPeerConnection({ ...RTC_CFG, iceServers: [...RTC_CFG.iceServers, ...relay] });
    pc.onicecandidate = e => {
      if (C.pc === pc && e.candidate) signal({ t: 'ice', c: e.candidate.toJSON() });
    };
    pc.ontrack = e => {
      C.remote = e.streams[0];
      if (ui.remote) { ui.remote.srcObject = C.remote; ui.remote.classList.remove('connecting'); }
    };
    pc.onconnectionstatechange = () => {
      if (!C.pc) return;
      if (C.pc.connectionState === 'connected' && C.call) { setStatus('متصل'); startTimer(); }
      if (C.pc.connectionState === 'failed') hangup();
    };
    return pc;
  }

  async function flushIce() {
    for (const c of C.pendingIce) { try { await C.pc.addIceCandidate(c); } catch (_) {} }
    C.pendingIce = [];
  }

  async function processSignals(sigs) {
    for (const s of sigs || []) {
      let p; try { p = JSON.parse(s.payload); } catch (_) { continue; }
      if (C.call && C.call.role === 'callee' && !C.pc) {
        C.buffered.push(p); continue;               // هنوز پاسخ نداده‌ایم؛ نگه می‌داریم
      }
      if (!C.pc) continue;
      if (p.t === 'ice') {
        if (!C.pc.remoteDescription) C.pendingIce.push(p.c);
        else { try { await C.pc.addIceCandidate(p.c); } catch (_) {} }
      } else if (p.t === 'sdp' && p.v === 'offer' && !C.pc.remoteDescription) {
        await C.pc.setRemoteDescription({ type: 'offer', sdp: p.s });
        await flushIce();
        const ans = await C.pc.createAnswer();
        await C.pc.setLocalDescription(ans);
        await signal({ t: 'sdp', v: 'answer', s: C.pc.localDescription.sdp });
      } else if (p.t === 'sdp' && p.v === 'answer' && !C.pc.remoteDescription) {
        await C.pc.setRemoteDescription({ type: 'answer', sdp: p.s });
        await flushIce();
      }
    }
  }

  /* ---------- شروع تماس (تماس‌گیرنده) ---------- */
  async function start(peer, kind) {
    if (!S.me) return;
    if (!peer) { toast('ابتدا یک گفت‌وگوی خصوصی را باز کنید', true); return; }
    if (C.call) { toast('در حال حاضر در تماس دیگری هستید', true); return; }
    if (!canMedia()) {
      toast('برای تماس صوتی/تصویری باید صفحه با HTTPS باز شود؛ روی سرور دستور install -HTTPS را اجرا کنید و آدرس را با https:// باز کنید', true);
      return;
    }
    let r;
    try { r = await api('calls', 'POST', { peer: peer.id, kind: kind }); }
    catch (e) { toast(e.message, true); return; }
    C.call = { cid: r.cid, role: 'caller', kind: r.kind, state: 'ringing', peer: peer };
    openOverlay();
    setStatus('در حال زنگ زدن…');
    ringTone(true);
    try {
      if (!await prepareMedia(C.call)) return;
      const offer = await C.pc.createOffer();
      await C.pc.setLocalDescription(offer);
      await signal({ t: 'sdp', v: 'offer', s: C.pc.localDescription.sdp });
    } catch (e) {
      toast(e && e.name === 'NotAllowedError' ? 'دسترسی به میکروفون/دوربین رد شد' : 'شروع تماس ناموفق بود', true);
      hangup();
    }
  }

  /* ---------- تماس ورودی ---------- */
  function showIncoming(call) {
    C.ringing = true;
    C.call = { cid: call.cid, role: 'callee', kind: call.kind, state: call.state, peer: call.peer };
    ui.rAv.replaceChildren(avEl(call.peer ? call.peer.name : '', call.peer && call.peer.avatar, 'lg'));
    ui.rName.textContent = call.peer ? call.peer.name : 'تماس';
    ui.rKind.textContent = call.kind === 'video' ? 'تماس تصویری ورودی' : 'تماس صوتی ورودی';
    ui.ring.hidden = false;
    document.title = 'تماس ورودی — پیام‌رسان رز';
    ringTone(true);
    C.autoRej = setTimeout(() => { if (C.ringing) reject(); }, 60000);
  }

  async function accept() {
    if (!C.call || C.call.state !== 'ringing') return;
    const call = C.call;
    clearTimeout(C.autoRej);
    ui.answer.disabled = true;
    try { await api('calls/' + call.cid + '/state', 'POST', { state: 'accept' }); }
    catch (e) { toast(e.message, true); cleanup(); return; }
    finally { ui.answer.disabled = false; }
    if (C.call !== call) return;
    call.state = 'active';
    C.ringing = false;
    ringTone(false);
    ui.ring.hidden = true;
    openOverlay();
    try {
      if (!await prepareMedia(C.call)) return;
      setStatus('در حال اتصال…');
      const buf = C.buffered; C.buffered = [];
      await processSignals(buf.map(p => ({ payload: JSON.stringify(p) })));
    } catch (e) {
      toast(e && e.name === 'NotAllowedError' ? 'دسترسی به میکروفون/دوربین رد شد' : 'اتصال ناموفق بود', true);
      hangup();
    }
  }

  async function reject() {
    clearTimeout(C.autoRej);
    ringTone(false);
    ui.ring.hidden = true;
    document.title = 'پیام‌رسان رز';
    const cid = C.call && C.call.cid;
    C.ringing = false;
    cleanup();
    if (cid) { try { await api('calls/' + cid + '/state', 'POST', { state: 'reject' }); } catch (_) {} }
    toast('تماس رد شد');
  }

  /* ---------- وضعیت‌های هم‌گام‌سازی ---------- */
  async function onSync(call) {
    if (!call) {
      if (C.call && Date.now() > C.guard) ended(callEndedText('ended'));
      else if (C.ringing) cleanup();
      return;
    }
    if (!C.call || C.call.cid !== call.cid) {
      if (C.call && Date.now() > C.guard) { cleanup(); }
      C.call = { cid: call.cid, role: call.role, kind: call.kind, state: call.state, peer: call.peer };
    } else {
      C.call.state = call.state;
      if (call.peer) C.call.peer = call.peer;
    }
    if (C.call.role === 'callee' && C.call.state === 'ringing' && !C.ringing) showIncoming(C.call);
    if (C.call.state === 'active') onActive();
    try {
      await processSignals(call.signals);
      if (C.call?.cid === call.cid) C.lastSig = call.last_sig || C.lastSig;
    } catch (_) {
      if (C.call?.cid === call.cid) hangup();
    }
  }

  function callEndedText(st) {
    return st === 'rejected' ? 'تماس رد شد' : st === 'missed' ? 'پاسخی داده نشد' : 'تماس پایان یافت';
  }

  function onActive() {
    if (!C.uiOn) return;
    ringTone(false);
    if (C.pc?.connectionState !== 'connected') setStatus('در حال اتصال…');
  }

  /* ---------- پایان تماس ---------- */
  async function hangup(state) {
    if (!C.call) return;
    C.guard = Date.now() + 5000;
    const cid = C.call.cid;
    cleanup();
    try { await api('calls/' + cid + '/state', 'POST', { state: state || 'end' }); } catch (_) {}
  }

  function ended(msg) {
    if (Date.now() < C.guard) { cleanup(); return; }
    cleanup();
    toast(msg);
  }

  function cleanup() {
    ringTone(false);
    clearTimeout(C.autoRej);
    if (C.timerInt) { clearInterval(C.timerInt); C.timerInt = null; }
    if (C.local) { C.local.getTracks().forEach(t => t.stop()); C.local = null; }
    C.remote = null;
    if (C.pc) { try { C.pc.close(); } catch (_) {} C.pc = null; }
    C.pendingIce = []; C.buffered = []; C.lastSig = 0;
    C.ringing = false; C.answeredAt = 0;
    if (ui.ov) { ui.ov.hidden = true; ui.remote.srcObject = null; ui.local.srcObject = null; }
    if (ui.ring) ui.ring.hidden = true;
    if (ui.timer) ui.timer.hidden = true;
    uiOn(false);
    document.title = 'پیام‌رسان رز';
    C.call = null;
  }

  /* ---------- رابط تماس ---------- */
  function openOverlay() {
    if (!ui.ov) return;
    ui.ov.hidden = false;
    ui.timer.hidden = true;
    uiOn(true);
    ui.av.replaceChildren(avEl(C.call.peer ? C.call.peer.name : '', C.call.peer && C.call.peer.avatar, 'md'));
    ui.name.textContent = C.call.peer ? C.call.peer.name : '';
    ui.remote.classList.add('connecting');
    const isVideo = C.call.kind === 'video';
    ui.cam.style.display = isVideo ? '' : 'none';
    ui.local.style.display = isVideo ? '' : 'none';
    ui.remote.style.display = isVideo ? '' : 'none';
    // برای تماس صوتی، پس‌زمینه ساده
    ui.ov.classList.toggle('audio-only', !isVideo);
    ui.mute.classList.remove('off'); ui.cam.classList.remove('off');
    ui.mute.innerHTML = icon('mic'); ui.cam.innerHTML = icon('videocam');
  }

  function uiOn(v) { C.uiOn = v; }

  function startTimer() {
    if (C.timerInt || !C.uiOn) return;
    if (!C.answeredAt) C.answeredAt = Date.now();
    ui.timer.hidden = false;
    C.timerInt = setInterval(() => {
      if (ui.timer) ui.timer.textContent = fmtDur(Math.floor((Date.now() - C.answeredAt) / 1000));
    }, 1000);
  }

  /* ---------- دکمه‌های میوت / دوربین / قطع ---------- */
  function wireControls() {
    ui.mute.onclick = () => {
      if (!C.local) return;
      const t = C.local.getAudioTracks()[0];
      if (t) { t.enabled = !t.enabled; ui.mute.classList.toggle('off', !t.enabled); ui.mute.innerHTML = icon(t.enabled ? 'mic' : 'micoff'); }
    };
    ui.cam.onclick = () => {
      if (!C.local) return;
      const t = C.local.getVideoTracks()[0];
      if (t) { t.enabled = !t.enabled; ui.cam.classList.toggle('off', !t.enabled); ui.cam.innerHTML = icon(t.enabled ? 'videocam' : 'camoff'); }
    };
    ui.hang.onclick = () => hangup();
    ui.answer.onclick = accept;
    ui.ring.querySelector('#rReject').onclick = reject;
  }

  /* ---------- راه‌اندازی ---------- */
  function init() {
    buildUI();
    wireControls();
    const a = $('#chCallA'), v = $('#chCallV');
    if (a) { a.innerHTML = icon('phone'); a.onclick = () => start(S.cur && S.cur.peer, 'audio'); }
    if (v) { v.innerHTML = icon('videocam'); v.onclick = () => start(S.cur && S.cur.peer, 'video'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.RoseCall = { start: start, cleanup: cleanup, onSync: onSync, lastSig: function () { return C.lastSig; } };
})();
