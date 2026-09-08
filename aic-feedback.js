/* Side sheets over the shortlist page.
   data-fb  → Feedback Form.html (slim bar with candidate context)
   data-cp  → Candidate Profile.html (page owns its own header; bar hidden)
   Optional: data-fb-name / -role / -init / -col, data-cp-name / -role / -company / -init / -col / -i / -n / -score */
(function(){
  const ICON = document.querySelector('.material-icons-round') ? 'material-icons-round' : 'ms';
  let ov, sheet, frame, bar, nav, lastFocus = null, mode = null, pendingSeek = null, navI = null, navN = null;

  function build(){
    ov = document.createElement('div');
    ov.className = 'fb-ov';
    sheet = document.createElement('aside');
    sheet.className = 'fb-sheet';
    sheet.setAttribute('role','dialog');
    sheet.setAttribute('aria-modal','true');
    sheet.innerHTML = '<div class="fb-bar">'
      + '<span class="fb-title">AI Interview feedback</span>'
      + '<div class="fb-nav"><button class="fb-nb" data-fbnav="prev" aria-label="Previous candidate"><span class="' + ICON + '">chevron_left</span></button><span class="fb-nav-lbl"></span><button class="fb-nb" data-fbnav="next" aria-label="Next candidate"><span class="' + ICON + '">chevron_right</span></button></div>'
      + '<button class="fb-x" title="Close" aria-label="Close"><span class="' + ICON + '">close</span></button>'
      + '</div>'
      + '<iframe class="fb-frame" title="Candidate detail"></iframe>';
    document.body.append(ov, sheet);
    frame = sheet.querySelector('.fb-frame');
    bar = sheet.querySelector('.fb-bar');
    nav = sheet.querySelector('.fb-nav');
    frame.addEventListener('load', ()=>{ if (pendingSeek != null){ try { frame.contentWindow.postMessage({type:'aic-seek', t:pendingSeek}, '*'); } catch(e){} pendingSeek = null; } });
    ov.addEventListener('click', close);
    sheet.querySelector('.fb-x').addEventListener('click', close);
  }

  function setNav(i, n){
    navI = i; navN = n;
    const has = n != null && n > 0 && i != null;
    nav.style.display = has ? '' : 'none';
    if (!has) return;
    nav.querySelector('.fb-nav-lbl').textContent = 'Candidate ' + (i+1) + ' of ' + n;
    nav.querySelector('[data-fbnav="prev"]').disabled = i <= 0;
    nav.querySelector('[data-fbnav="next"]').disabled = i >= n-1;
  }

  function show(src, label){
    if (frame.getAttribute('src') !== src) frame.src = src;
    sheet.setAttribute('aria-label', label);
    lastFocus = document.activeElement;
    document.body.classList.add('fb-lock');
    requestAnimationFrame(()=>{ ov.classList.add('on'); sheet.classList.add('on'); });
  }

  function openFeedback(t, seek){
    if (!ov) build();
    mode = 'fb';
    sheet.classList.remove('cp');
    bar.hidden = false;
    const i = (t.dataset.fbI != null && t.dataset.fbI !== '') ? +t.dataset.fbI : null;
    const n = (t.dataset.fbN != null && t.dataset.fbN !== '') ? +t.dataset.fbN : null;
    setNav(i, n);
    const p = new URLSearchParams();
    if (t.dataset.fbName) p.set('name', t.dataset.fbName);
    if (t.dataset.fbRole) p.set('role', t.dataset.fbRole);
    if (t.dataset.fbInit) p.set('init', t.dataset.fbInit);
    if (t.dataset.fbCol) p.set('col', t.dataset.fbCol);
    if (seek != null) p.set('seek', seek);
    const target = 'Feedback Form.html?' + p.toString();
    if (frame.getAttribute('src') === target && seek != null){
      try { frame.contentWindow.postMessage({type:'aic-seek', t:seek}, '*'); } catch(e){}
    }
    show(target, 'Detailed AI interview feedback');
    setTimeout(()=>sheet.querySelector('.fb-x').focus(), 320);
  }
  /* programmatic entry: aicOpenFeedback({name, role, init, col, i, n, t}) — t is a transcript timestamp like "2:19" */
  window.aicOpenFeedback = function(o){
    o = o || {};
    const stub = document.createElement('span');
    stub.dataset.fbName = o.name || ''; stub.dataset.fbRole = o.role || '';
    if (o.init) stub.dataset.fbInit = o.init; if (o.col) stub.dataset.fbCol = o.col;
    if (o.i != null) stub.dataset.fbI = o.i; if (o.n != null) stub.dataset.fbN = o.n;
    openFeedback(stub, o.t);
  };

  function openProfile(t){
    if (!ov) build();
    mode = 'cp';
    sheet.classList.add('cp');
    bar.hidden = true;
    const p = new URLSearchParams();
    for (const k of ['name','role','company','init','col','i','n','score']){
      const v = t.dataset['cp' + k[0].toUpperCase() + k.slice(1)];
      if (v != null && v !== '') p.set(k, v);
    }
    show('Candidate Profile.html?' + p.toString(), 'Candidate profile');
    setTimeout(()=>{ try { frame.contentWindow.focus(); } catch(e){} }, 320);
  }

  function close(){
    if (!ov) return;
    ov.classList.remove('on'); sheet.classList.remove('on');
    document.body.classList.remove('fb-lock');
    mode = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', e=>{
    const fb = e.target.closest('[data-fb]');
    if (fb){ e.preventDefault(); e.stopPropagation(); openFeedback(fb); return; }
    const cp = e.target.closest('[data-cp]');
    if (cp){ e.preventDefault(); e.stopPropagation(); openProfile(cp); return; }
    const nv = e.target.closest('[data-fbnav]');
    if (nv){
      e.preventDefault(); e.stopPropagation();
      if (nv.disabled || typeof window.aicFeedbackNav !== 'function') return;
      const r = window.aicFeedbackNav(nv.dataset.fbnav === 'prev' ? -1 : 1);
      if (r) window.aicOpenFeedback(r);
    }
  });
  document.addEventListener('keydown', e=>{
    if (e.key === 'Escape' && sheet && sheet.classList.contains('on')){ e.stopPropagation(); close(); }
  }, true);
  window.addEventListener('message', e=>{
    if (e.data && e.data.type === 'aic-sheet-close' && sheet && sheet.classList.contains('on')) close();
  });
})();
