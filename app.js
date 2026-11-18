(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const escapeHTML = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safePath = (path) => typeof path === 'string' && /^(?:assets\/(?:photos|videos)\/)?[a-z0-9][a-z0-9_. -]*\.(?:png|jpe?g|webp|mp4)$/i.test(path) && !path.includes('..') ? path : '';
  const safeDriveVideoId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{20,100}$/.test(id) ? id : '';
  const isFriends = !!window.BDAY_FRIENDS_ONLY;
  const people = BDAY.innerCircle;
  const others = BDAY.birthdayMessages;
  let passcode = '';
  let innerIndex = 0;
  let wishesIndex = 0;
  let lockErrorTimer = 0;
  let toastTimer = 0;
  let activeVideo = null;

  // Screen navigation
  function goTo(id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({behavior:'smooth',block:'start'});
    const panel = $('#chapterPanel');
    if (panel) panel.hidden = true;
    $('#chapterToggle')?.setAttribute('aria-expanded','false');
  }
  $$('[data-go]').forEach(el=> el.addEventListener('click',()=>goTo(el.dataset.go)));
  $('#chapterToggle')?.addEventListener('click',()=>{
    const panel = $('#chapterPanel'); panel.hidden = !panel.hidden;
    $('#chapterToggle').setAttribute('aria-expanded',String(!panel.hidden));
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-actions') && !e.target.closest('.chapter-panel')) {
      if ($('#chapterPanel')) $('#chapterPanel').hidden = true;
      $('#chapterToggle')?.setAttribute('aria-expanded','false');
    }
  });

  function toast(msg) {
    const t=$('#toast'); if(!t) return;
    t.textContent=msg;t.classList.add('show');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3000);
  }

  // Birthday gate. Visual interaction only, not intended as site security.
  function updatePassDots() {
    $$('#passDots span').forEach((dot,i)=>dot.classList.toggle('filled', i<passcode.length));
    $('#passDots').setAttribute('aria-label',`${passcode.length} of 4 digits entered`);
  }
  function unlock() {
    const screen=$('#lockScreen');
    screen.classList.add('leaving');
    document.body.classList.remove('is-locked');
    setTimeout(()=>{screen.hidden=true;$('#welcome')?.scrollIntoView({behavior:'instant'});},850);
  }
  function digit(d) {
    if ($('#lockScreen')?.hidden || $('#lockScreen')?.classList.contains('leaving')) return;
    passcode+=d;updatePassDots();
    if(passcode.length===4) {
      if(passcode===BDAY.passcode){ $('#passError').textContent='Unlocked! Your surprise is ready ♡';setTimeout(unlock,310); }
      else {
        $('#passError').textContent='Not quite! Try again ♡';
        $('#passDots').classList.remove('shake'); void $('#passDots').offsetWidth; $('#passDots').classList.add('shake');
        clearTimeout(lockErrorTimer);
        lockErrorTimer=setTimeout(()=>{passcode='';updatePassDots();$('#passError').textContent='';$('#passDots').classList.remove('shake');},650);
      }
    }
  }
  $$('#numberPad [data-digit]').forEach(btn=>btn.addEventListener('click',()=>{if(passcode.length<4)digit(btn.dataset.digit)}));
  $('#passBackspace')?.addEventListener('click',()=>{passcode=passcode.slice(0,-1);updatePassDots();$('#passError').textContent='';});
  document.addEventListener('keydown', e=>{
    if(!$('#lockScreen')?.hidden && !$('#lockScreen')?.classList.contains('leaving')) {
      if(/^\d$/.test(e.key) && passcode.length<4) digit(e.key);
      if(e.key==='Backspace'){passcode=passcode.slice(0,-1);updatePassDots();}
      return;
    }
    if(e.key==='Escape') closeModal();
  });

  function portrait(p,i,kind){
    const path=safePath(p.photo);
    const role = kind==='inner' ? 'INNER CIRCLE' : 'BIRTHDAY WISH';
    const caption = kind==='inner' ? 'from your people ♡' : 'sending love your way';
    return `<div class="person-portrait tone-${i%4}"><span class="portrait-tape tape-a"></span><span class="portrait-tape tape-b"></span><div class="portrait-paper"><div class="portrait-shell">${path?`<img src="${escapeHTML(path)}" alt="${escapeHTML(p.name)}" onerror="this.remove()">`:''}<div class="person-monogram">${escapeHTML(p.name.charAt(0))}</div>${!path?`<span class="portrait-label">Add ${escapeHTML(p.name)}'s display photo</span>`:''}</div><div class="portrait-bottom"><span>${role}</span><strong>${caption}</strong></div></div></div>`;
  }
  function renderCarousel(kind){
    const inner=kind==='inner', data=inner?people:others;
    const index=inner?innerIndex:wishesIndex;
    const person=data[index];
    const el=$(inner?'#innerCard':'#wishesCard'); if(!el) return;
    const ready=!!(safePath(person.video) || safeDriveVideoId(person.driveVideoId));
    const typeLabel=inner?'INNER CIRCLE / VIDEO GREETING':'BIRTHDAY WISHES / VIDEO GREETING';
    const status=ready
      ? `<div class="video-status video-status-ready"><span class="status-symbol">✓</span><div><strong>Video ready</strong><span>${escapeHTML(person.videoInfo || 'A greeting just for you.')}</span></div></div>`
      : `<div class="video-status"><span class="status-symbol">♡</span><div><strong>Waiting for a little hello</strong><span>${escapeHTML(person.name)}'s video will appear here once submitted.</span></div></div>`;
    el.innerHTML = `${portrait(person,index,kind)}<div class="person-details person-details-video"><div class="person-meta-row"><span class="meta">${typeLabel}</span><span class="index-pill">${String(index+1).padStart(2,'0')}</span></div><h3>${escapeHTML(person.name)}</h3><p class="video-intro">${ready?'There’s a little birthday greeting waiting for you.':'This video greeting is still on its way.'}</p>${status}<div class="card-actions"><button class="mini-button ${ready ? 'video-ready' : 'video-soon'}" type="button" data-action="video" data-kind="${kind}" data-index="${index}">${ready ? '▶ Watch the birthday video' : '▶ Video not submitted yet'}</button></div></div>`;
    el.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>goTo(btn.dataset.go)));
    const dots=$(inner?'#innerDots':'#wishesDots');
    dots.innerHTML=data.map((x,i)=>`<button type="button" class="${i===index?'active':''}" data-i="${i}" aria-label="Show ${escapeHTML(x.name)}"></button>`).join('');
    dots.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{if(inner)innerIndex=+btn.dataset.i;else wishesIndex=+btn.dataset.i;renderCarousel(kind)}));
    $(inner?'#innerCount':'#wishesCount').textContent=`${String(index+1).padStart(2,'0')} / ${String(data.length).padStart(2,'0')}`;
  }
  function cycle(kind,step){const inner=kind==='inner';const arr=inner?people:others;
    if(inner)innerIndex=(innerIndex+step+arr.length)%arr.length;else wishesIndex=(wishesIndex+step+arr.length)%arr.length;
    renderCarousel(kind);
  }
  $('#innerPrev')?.addEventListener('click',()=>cycle('inner',-1));
  $('#innerNext')?.addEventListener('click',()=>cycle('inner',1));
  $('#wishesPrev')?.addEventListener('click',()=>cycle('wishes',-1));
  $('#wishesNext')?.addEventListener('click',()=>cycle('wishes',1));
  renderCarousel('inner');renderCarousel('wishes');

  // Interactive Marjie Files: real known favorites + configurable story / photo slots.
  // Expandable cards are keyboard-accessible native buttons. An optional fourth file
  // only becomes visible after all three main files have been explored.
  const marjieFileInfo = BDAY.marjieFiles || {};
  const openedFiles = new Set();
  const marjieCards = $$('.mf-card[data-marjie-file]');
  const progressLabel = $('#mfProgressLabel');
  marjieCards.forEach(card => {
    const toggle = card.querySelector('.mf-toggle');
    const detail = document.getElementById(toggle?.getAttribute('aria-controls'));
    if (!toggle || !detail) return;
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      detail.hidden = expanded;
      card.classList.toggle('mf-card-open', !expanded);
      const action = card.querySelector('.mf-open-label');
      if (action) action.innerHTML = expanded ? 'OPEN THIS FILE <span aria-hidden="true">↗</span>' : 'CLOSE THIS FILE <span aria-hidden="true">↖</span>';
      if (!expanded) openedFiles.add(card.dataset.marjieFile);
      if (progressLabel) progressLabel.textContent = `${openedFiles.size} of 3 little files opened`;
      if (openedFiles.size === marjieCards.length) {
        const bonus = $('#mfBonus');
        if (bonus && bonus.hidden) {bonus.hidden=false;bonus.classList.add('mf-bonus-visible');}
      }
    });
  });
  [['#mfLoreStory','loreStory'],['#mfLoreBy','loreBy'],['#mfBonusText','bonusText'],['#mfBonusBy','bonusBy']].forEach(([selector,key])=>{
    const txt=marjieFileInfo[key];
    if (typeof txt==='string' && txt.trim()) {
      const node=$(selector);
      if(node) node.textContent=txt.trim();
    }
  });
  $$('[data-mf-photo]').forEach(slot=>{
    const path=safePath(marjieFileInfo[slot.dataset.mfPhoto]);
    if (!path) return;
    const img=slot.querySelector('img');
    if(!img)return;
    img.addEventListener('error',()=>{slot.hidden=true;},{once:true});
    img.src=path;slot.hidden=false;
  });

  // Memories — real photos automatically replace placeholders once paths are supplied.
  const memoryGrid=$('#memoryGrid');
  if(memoryGrid) memoryGrid.innerHTML=BDAY.memories.map((m,i)=>`<button class="memory-card" type="button" data-action="memory" data-index="${i}" aria-label="View ${escapeHTML(m.label)}">
     ${safePath(m.photo)?`<img src="${escapeHTML(safePath(m.photo))}" alt="${escapeHTML(m.label)}" onerror="this.remove()">`:''}
     <span class="memory-graphic">${['✿','♡','✦','✳','❋','♡'][i%6]}</span><span class="memory-label">MEMORY ${String(i+1).padStart(2,'0')}</span><span class="memory-caption">${escapeHTML(m.caption)}</span>
     </button>`).join('');

  function openModal({title,eyebrow,body,caption}){
    const modal=$('#mediaModal');if(!modal)return;
    $('#modalTitle').textContent=title;$('#modalEyebrow').textContent=eyebrow;
    $('#modalBody').innerHTML=body;$('#modalCaption').textContent=caption||'';
    modal.hidden=false;document.body.style.overflow='hidden';
    activeVideo=modal.querySelector('video');
    if(activeVideo)activeVideo.addEventListener('error',()=>toast('This video could not load. Check its filename in content.js.'),{once:true});
    modal.querySelector('.modal-close').focus();
  }
  function closeModal(){const modal=$('#mediaModal');if(!modal||modal.hidden)return;
    if(activeVideo){activeVideo.pause();activeVideo=null;}
    $('#modalBody').innerHTML=''; // Unmount Drive iframe so playback stops on close.
    modal.hidden=true;document.body.style.overflow=$('#lockScreen')?.hidden?'':'hidden';
  }
  $$('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
  function showVideo(person){
    const path=safePath(person.video);
    const driveId=safeDriveVideoId(person.driveVideoId);
    if(path){
      // A versioned URL makes sure the replaced Shawn + Victor MP4 is not cached as the old recording.
      const videoSrc = path === 'shawn_victor_greeting.mp4' ? `${path}?v=20261118-new-upload` : path;
      openModal({title:`From ${person.name}`,eyebrow:'A VIDEO JUST FOR MARJIE',body:`<video src="${escapeHTML(videoSrc)}" controls playsinline preload="metadata"></video>`,caption:person.videoInfo || 'A birthday greeting ♡'});
    } else if(driveId){
      const viewUrl=`https://drive.google.com/file/d/${driveId}/view`;
      const previewUrl=`https://drive.google.com/file/d/${driveId}/preview`;
      const body=`<iframe src="${previewUrl}" title="Birthday greeting from ${escapeHTML(person.name)}" loading="eager" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen style="display:block;width:100%;aspect-ratio:16/9;min-height:260px;border:0;border-radius:10px;background:#151515"></iframe><p style="margin-top:12px;text-align:center;font-size:.85rem">Video not playing? <a href="${viewUrl}" target="_blank" rel="noopener noreferrer">Open greeting in Google Drive ↗</a></p>`;
      openModal({title:`From ${person.name}`,eyebrow:'A VIDEO JUST FOR MARJIE',body,caption:person.videoInfo || 'A birthday greeting ♡'});
    } else {
      openModal({title:`From ${person.name}`,eyebrow:'BIRTHDAY GREETING / DEMO',body:`<div class="video-preview"><div><div class="demo-circle">♡</div><strong>Waiting for ${escapeHTML(person.name)}</strong><span>The video will be added after it is submitted.</span></div></div>`,caption:'This greeting has not been uploaded to Drive yet.'});
    }
  }

  function showMemory(i){const p=BDAY.memories[i],path=safePath(p.photo);
    const body=path?`<img class="modal-memory-image" src="${escapeHTML(path)}" alt="${escapeHTML(p.label)}">`:`<div class="video-preview"><div><div class="demo-circle">✿</div><strong>${escapeHTML(p.label)}</strong><span>Add your real photo to bring this memory to life.</span></div></div>`;
    openModal({title:p.caption,eyebrow:'A LITTLE MARJIE MOMENT',body,caption:path?'A moment to remember ♡':'Demo photo placeholder. Add the matching file in content.js.'});
  }
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-action]');if(!btn)return;
    const type=btn.dataset.action,i=Number(btn.dataset.index);
    if(type==='video')showVideo(btn.dataset.kind==='inner'?people[i]:others[i]);
    if(type==='memory')showMemory(i);
  });

  // Candles: let Marjie tap each flame to make a birthday wish.
  let candlesOut=0;
  $$('.candle').forEach(candle=>candle.addEventListener('click',()=>{
    if(candle.classList.contains('out'))return;
    candle.classList.add('out');candlesOut++;
    if(candlesOut===3){$('#cakeFeedback').textContent='Wish made! Happy birthday, Marjie ♡';$('#finishStory').disabled=false;confetti(50)}
    else $('#cakeFeedback').textContent=`${3-candlesOut} candle${3-candlesOut===1?'':'s'} left... ♡`;
  }));
  $('#finishStory')?.addEventListener('click',()=>{
    $('#fakeEnd').hidden=false;goTo('fakeEnd');confetti(90);
  });

  if(isFriends){
    $('#endButton')?.addEventListener('click',()=>toast('And that is the end of the friends’ preview. Thank you for being part of it!'));
  }else{
    $('#endButton')?.addEventListener('click',()=>{
      $('#personalReveal').hidden=false;
      $('#revealCurtain').hidden=false;
      const headline=$('#revealHeadline'), subtitle=$('#revealSubtitle'),btn=$('#openLastMessage');
      headline.textContent='Wait...';subtitle.textContent='I think we forgot someone.';
      document.body.style.overflow='hidden';
      setTimeout(()=>{headline.textContent='One more message.';subtitle.textContent='This one was saved for last.';btn.hidden=false;},1600);
    });
    $('#openLastMessage')?.addEventListener('click',()=>{
      $('#revealCurtain').hidden=true;$('#personalContent').hidden=false;
      document.body.style.overflow='';
      goTo('personalReveal');
    });
    $('#bouquetBloom')?.addEventListener('click',()=>{
      $('#bouquetArt').classList.remove('bloomed');void $('#bouquetArt').offsetWidth;$('#bouquetArt').classList.add('bloomed');
      $('#bloomNote').textContent='Your favorite flowers, just for you. ♡';
    });
    $('#openDigitalGift')?.addEventListener('click',()=>{
      const reveal=$('#digitalGiftReveal');
      if(!reveal)return;
      const giftArt=reveal.querySelector('.digital-gift-image');
      if(giftArt && !giftArt.getAttribute('src')){
        const giftPath=giftArt.getAttribute('data-gift-image');
        if(giftPath)giftArt.setAttribute('src',giftPath);
      }
      reveal.hidden=false;
      $('#openDigitalGift').disabled=true;
      $('#openDigitalGift').innerHTML='Opened just for you <span>♡</span>';
      toast('Your digital gift is ready. ♡');
    });
    $('#aaronLetter').textContent=BDAY.personal.letter;
    $('#openLetter')?.addEventListener('click',()=>{
      const envelope=$('#letterSurprise'), button=$('#openLetter'), letterPage=$('#letterReveal');
      if(!envelope || !button || !letterPage || !letterPage.hidden)return;
      envelope.classList.add('opened');
      button.setAttribute('aria-expanded','true');
      button.disabled=true;
      const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      setTimeout(()=>{
        letterPage.hidden=false;
        letterPage.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
      },reduceMotion?0:680);
    });
    const verseGrid=$('#verseGrid');
    verseGrid.innerHTML=BDAY.personal.verses.map(x=>`<article class="verse-card reveal"><span class="tiny-label">${escapeHTML(x.theme)}</span><h3>${escapeHTML(x.reference)}</h3><p>${escapeHTML(x.note)}</p><div class="verse-ref">A VERSE TO REMEMBER ♡</div></article>`).join('');
    $('#playAaronVideo')?.addEventListener('click',()=>{
      const path=safePath(BDAY.personal.video);
      openModal({title:'From your bebiilovess',eyebrow:'THE LAST BIRTHDAY GREETING',body:path?`<video src="${escapeHTML(path)}" controls playsinline preload="metadata"></video>`:`<div class="video-preview"><div><div class="demo-circle">▶</div><strong>For my bebii ♡</strong><span>Your personal birthday video will go here.</span></div></div>`,caption:path?'Your special message ♡':'Preview only — replace this slot with your video later.'});
    });
    $('#replayAll')?.addEventListener('click',()=>window.location.reload());
  }

  function confetti(count){
    const host=$('#confetti');if(!host)return;
    const colors=['#ba6775','#f5bf3e','#7c9870','#f6e9d7','#e3a5aa'];
    for(let i=0;i<count;i++){
      const el=document.createElement('i');el.style.left=Math.random()*100+'%';el.style.background=colors[i%colors.length];
      el.style.animationDelay=(Math.random()*.65)+'s';el.style.animationDuration=(2.2+Math.random()*1.5)+'s';host.appendChild(el);
      el.addEventListener('animationend',()=>el.remove(),{once:true});
    }
  }
  // Reveal animations only for visible sections; graceful fallback without IntersectionObserver.
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){e.target.classList.add(e.target.classList.contains('note')?'shown':'visible');observer.unobserve(e.target)}
      });
    },{threshold:.08,rootMargin:'0px 0px -25px 0px'});
    $$('.reveal,.note').forEach(el=>observer.observe(el));
  } else $$('.reveal,.note').forEach(el=>el.classList.add(el.classList.contains('note')?'shown':'visible'));
  document.addEventListener('scroll',()=>{
    if($('#personalContent')&&!$('#personalContent').hidden)$$('.verse-card.reveal').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight-80)el.classList.add('visible')});
  },{passive:true});
})();
