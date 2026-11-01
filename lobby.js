/* REMIX LOBBY-5 · FRIEND-1 · STATS-1 — "play with a friend" (invite link / code), optional who's online, privacy-safe visit counter.
   Shared by the games page and every game (loaded from the site root). No personal data: nicknames only, no ids/IPs/emails stored. */
(function(){ /* STATS-1: +1 visit per page per browser tab (reloads in the same tab don't count again). Only day + page + number are stored. */
  try{
    var page=window.GAME? String(window.GAME.id||'') : 'home';
    if(!/^[a-z0-9-]{1,40}$/.test(page) || !/^https?:$/.test(location.protocol)) return;
    var k='rmxV_'+page; if(sessionStorage.getItem(k)) return; sessionStorage.setItem(k,'1');
    fetch('https://uuyaoffzgjxxwxlzhwur.supabase.co/rest/v1/rpc/bump_visit',{method:'POST',keepalive:true,
      headers:{'apikey':'sb_publishable_1uPwY4lT8NDgiy2iCJAp9g_h_v2p2j9','Content-Type':'application/json'},body:JSON.stringify({p_page:page})}).catch(function(){});
  }catch(e){}
})();

(function(){
  if(window.RMXL) return;
  if(window.GAME&&!window.GAME.net&&!window.GAME.race) return; // solo-only games stay offline/invisible
  var SB='https://uuyaoffzgjxxwxlzhwur.supabase.co', KEY='sb_publishable_1uPwY4lT8NDgiy2iCJAp9g_h_v2p2j9';
  var ROOT=(location.pathname.match(/^(.*\/remix-games\/)/)||[0,'/'])[1];
  var HOME=!window.GAME;
  var SOLO={'flag-rally':1,'maze-bots':1,'moon-buggy':1,'road-agent':1,'temple-kick':1}; // games with no friend mode (hidden from the home picker)
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
  function clean(s){ var d=0; return String(s||'').replace(/[^A-Za-z0-9 _-]/g,'').replace(/[0-9]/g,function(c){ return ++d<=2?c:''; }).slice(0,10).toUpperCase(); }
  var me=ls('rmxId'); if(!me){ me=Math.random().toString(36).slice(2,10); ls('rmxId',me); }
  var L={ me:me, ch:null, sb:null, list:{}, ready:false, game:(window.GAME&&window.GAME.id)||'', gameTitle:(window.GAME&&window.GAME.title)||'',
    get name(){ return clean(ls('rmxName'))||''; }, set name(v){ ls('rmxName',clean(v)); },
    get online(){ return ls('rmxOnline')!=='0'; } };
  window.RMXL=L;
  // a fun nickname, picked once (never a real name)
  function funName(){ var f=clean(ls('rmxFun')); if(f) return f;
    var A=['ZIPPY','TURBO','NEON','LUCKY','MIGHTY','SNAPPY','JOLLY','FUNKY','ROCKET','SUPER','HAPPY','BLAZE','DIZZY','SPEEDY'], B=['FOX','PANDA','TIGER','OWL','YAK','CROC','BEE','LION','ORCA','KOALA','RHINO','GECKO','ZEBRA','HIPPO'];
    for(var i=0;i<40;i++){ f=A[Math.floor(Math.random()*A.length)]+B[Math.floor(Math.random()*B.length)]; if(f.length<=10) break; }
    f=clean(f); ls('rmxFun',f); return f; }
  L.nick=function(){ return L.name||funName(); };
  function ensureName(){ if(!L.name){ L.name=funName(); L.retrack&&L.retrack(); } }
  // ---------- styles + UI ----------
  var css=document.createElement('style'); css.textContent='#rmxL{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:#000a;font:15px system-ui,sans-serif;color:#fff}#rmxL .b{width:min(94vw,460px);max-height:94vh;overflow:auto;background:#1a0d2b;border:2px solid #ff3bd488;border-radius:20px;padding:16px;box-shadow:0 0 30px #ff3bd455;text-align:center;box-sizing:border-box}#rmxL h3{margin:0 0 6px;font-size:22px}#rmxL p{margin:4px 0 10px;opacity:.9}#rmxL button{font:800 15px system-ui,sans-serif;border:0;border-radius:12px;padding:10px 12px;cursor:pointer}#rmxL .row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;margin:6px 0;border-radius:10px;background:#ffffff12;text-align:left}#rmxL .inv{background:linear-gradient(90deg,#ff3bd4,#ffd23f);color:#14061f}#rmxL .rx{background:#ffffff22;color:#fff;width:100%;margin-top:10px}#rmxL .t{background:#ffffff1a;color:#fff;font-size:14px}#rmxL .two{display:flex;gap:10px}#rmxL .tile{flex:1;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:18px;color:#14061f;box-shadow:0 0 16px #0006}#rmxL .tile i{font-style:normal;font-size:38px;line-height:1}#rmxL .tile small{font:600 12px system-ui,sans-serif;opacity:.8}#rmxL .ti{background:linear-gradient(160deg,#ff3bd4,#ffd23f)}#rmxL .tc{background:linear-gradient(160deg,#00e5ff,#3bff7a)}#rmxL .rb{display:block;width:100%;font-size:19px;padding:15px;margin-top:8px}#rmxL .code{font:900 46px/1.1 system-ui,sans-serif;letter-spacing:10px;color:#ffd23f;margin:4px 0 6px;padding:8px;border:2px dashed #ffd23f88;border-radius:14px;user-select:all}#rmxL input{box-sizing:border-box;width:100%;padding:12px;border-radius:12px;border:2px solid #ffffff55;background:#0006;color:#fff;font:800 22px system-ui,sans-serif;text-transform:uppercase;text-align:center}#rmxL #fC{font-size:40px;letter-spacing:12px;padding:8px}#rmxL .me{margin:12px 0 4px;font-size:14px;opacity:.9}#rmxL .lnk{background:none;color:#00e5ff;text-decoration:underline;padding:4px 6px;font-size:14px}#rmxL .gl{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:6px}#rmxL .gl button{color:#14061f;font-size:13px;padding:12px 6px;background:var(--c,#ffd23f)}#rmxL .wait{color:#3bff7a;font-weight:800;animation:rmxB 1.4s ease-in-out infinite}@keyframes rmxB{50%{opacity:.45}}@media (max-height:460px){#rmxL .tile{min-height:92px}#rmxL .tile i{font-size:30px}#rmxL h3{font-size:19px}#rmxL .code{font-size:36px}#rmxL .rb{padding:11px;font-size:17px}}#rmxPop{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:10000;display:none;width:min(92vw,400px);background:#1a0d2b;border:2px solid #ffd23f;border-radius:16px;padding:14px;color:#fff;font:15px system-ui,sans-serif;box-shadow:0 0 30px #ffd23f66;text-align:center}#rmxPop button{font:800 15px system-ui,sans-serif;border:0;border-radius:10px;padding:10px 16px;margin:8px 4px 0;cursor:pointer}'+(window.GAME?'#btnOnline{display:none!important}':'');
  document.head.appendChild(css);
  var box=document.createElement('div'); box.id='rmxL'; box.innerHTML='<div class="b"></div>'; var pop=document.createElement('div'); pop.id='rmxPop';
  function mount(){ if(!document.body) return setTimeout(mount,50); document.body.appendChild(box); document.body.appendChild(pop); }
  mount();
  box.addEventListener('click',function(e){ if(e.target===box) L.close(); });
  ['pointerdown','keydown'].forEach(function(t){ box.addEventListener(t,function(e){ e.stopPropagation(); }); pop.addEventListener(t,function(e){ e.stopPropagation(); }); });
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function sheet(html,mode){ var b=box.firstChild; box.style.display='flex'; L.mode=mode||''; b.innerHTML=html; b.scrollTop=0; return b; }
  function on(b,id,f){ var el=b.querySelector('#'+id); if(el) el.onclick=f; return el; }
  L.close=function(){ box.style.display='none'; L.mode=''; };
  function banner(t){ pop.innerHTML='<div style="font-size:18px;font-weight:800">'+t+'</div>'; pop.style.display='block'; clearTimeout(L._bt); L._bt=setTimeout(function(){ pop.style.display='none'; },3500); }

  // ---------- 👥 PLAY WITH A FRIEND (the main, simple entry) ----------
  L.friend=function(){
    var b=sheet('<h3>👥 PLAY WITH A FRIEND</h3><p>'+(HOME?'Play a game together on 2 phones.':'Play <b>'+esc(L.gameTitle)+'</b> together on 2 phones.')+'</p>'+
      '<div class="two"><button class="tile ti" id="fInv"><i>📨</i>INVITE A FRIEND<small>get a link to send</small></button><button class="tile tc" id="fCode"><i>🔑</i>I HAVE A CODE<small>my friend sent one</small></button></div>'+
      '<div class="me">You are <b>'+esc(L.nick())+'</b> <button class="lnk" id="fName">✏️ change</button></div>'+
      '<div class="two" style="margin-top:6px"><button class="t" id="fOn" style="flex:1">🟢 see who\'s online</button>'+(HOME?'':'<button class="t" id="fMore" style="flex:1">⚙️ more options</button>')+'</div>'+
      '<button class="rx" id="fX">CLOSE</button>','friend');
    on(b,'fInv',function(){ HOME? pickGame('invite') : L.invite(); });
    on(b,'fCode',L.code);
    on(b,'fName',function(){ nameSheet(L.friend); });
    on(b,'fOn',L.open);
    on(b,'fMore',function(){ L.close(); passClick(); });
    on(b,'fX',L.close);
  };
  function nameSheet(back){
    var b=sheet('<h3>✏️ YOUR NICKNAME</h3><p>Your friend sees this. No real names please.</p><input id="rmxN" maxlength="10" value="'+esc(L.nick())+'"><button class="rb inv" id="rmxS">SAVE</button><button class="rx" id="rmxB">◀ BACK</button>','name');
    var i=b.querySelector('#rmxN'); i.addEventListener('keydown',function(e){ e.stopPropagation(); if(e.key==='Enter') b.querySelector('#rmxS').click(); });
    on(b,'rmxS',function(){ var v=clean(i.value); if(!v){ i.value=funName(); return; } L.name=v; L.retrack(); back(); });
    on(b,'rmxB',back); setTimeout(function(){ try{ i.select(); }catch(e){} },50);
  }
  // 📨 invite: make a room (in the game), then show the share sheet
  L.invite=function(){
    if(!navigator.onLine){ sheet('<h3>📵 NO INTERNET</h3><p>Playing with a friend needs internet. Check your connection and try again.</p><button class="rx" id="fX">OK</button>').querySelector('#fX').onclick=L.close; return; }
    if(!window.rmxInvite){ pickGame('invite'); return; }
    ensureName(); L.close();
    window.rmxInvite(function(room){ L.share(room); });
  };
  L.link=function(room,game){ var base=game? location.origin+ROOT+game+'/' : location.origin+location.pathname.replace(/[^\/]*$/,''); return base+'?room='+encodeURIComponent(room); };
  L.share=function(room){
    var url=L.link(room), title=L.gameTitle||'Remix Arcade', txt='🎮 Play '+title+' with me on Remix Arcade! Tap the link to join my room ('+room+'):';
    var b=sheet('<h3>📨 SEND THIS TO YOUR FRIEND</h3><div class="code">'+esc(room)+'</div>'+
      (navigator.share?'<button class="rb inv" id="fSh">📤 SHARE INVITE</button>':'')+
      '<button class="rb '+(navigator.share?'t':'inv')+'" id="fCp">📋 COPY LINK</button>'+
      '<p style="font-size:13px">Your friend taps the link and lands in your room. Or they open <b>'+esc(title)+'</b>, tap 👥 PLAY WITH A FRIEND → 🔑 I HAVE A CODE and type <b>'+esc(room)+'</b>.</p>'+
      '<p class="wait">⏳ Waiting for your friend…</p><button class="rx" id="fX">OK</button>','share');
    L.shareRoom=room;
    on(b,'fSh',function(){ try{ navigator.share({title:'Remix Arcade',text:txt,url:url}).catch(function(e){ if(!e||e.name!=='AbortError') copy(); }); }catch(e){ copy(); } });
    function copy(){ var btn=b.querySelector('#fCp'); copyText(txt+' '+url).then(function(ok){ if(!btn) return; btn.textContent=ok?'✔ COPIED — now paste it to your friend':'Hold the code above to copy it'; setTimeout(function(){ if(btn.isConnected) btn.textContent='📋 COPY LINK'; },3000); }); }
    on(b,'fCp',copy); on(b,'fX',L.close);
  };
  L.whatsapp=L.share; // the room screen's invite button (shell.js calls RMXL.whatsapp) now opens the share sheet
  function copyText(t){
    function legacy(){ try{ var ta=document.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0,t.length); var ok=document.execCommand('copy'); ta.remove(); return ok; }catch(e){ return false; } }
    if(navigator.clipboard&&window.isSecureContext) return navigator.clipboard.writeText(t).then(function(){ return true; },legacy);
    return Promise.resolve(legacy());
  }
  // 🔑 join with a code
  L.code=function(){
    var b=sheet('<h3>🔑 TYPE THE CODE</h3><p>Your friend\'s code has 4 letters or numbers.<br><small style="opacity:.75">Got a link instead? Just tap the link — no code needed.</small></p><input id="fC" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="____"><button class="rb inv" id="fGo">▶ JOIN</button><button class="rx" id="fB">◀ BACK</button>','code');
    var i=b.querySelector('#fC');
    function go(){ var c=i.value.toUpperCase().replace(/[^A-Z0-9]/g,''); if(c.length!==4){ i.style.borderColor='#ff3b5c'; i.focus(); return; } ensureName(); HOME? pickGame('code',c) : joinCode(c); }
    i.addEventListener('keydown',function(e){ e.stopPropagation(); if(e.key==='Enter') go(); });
    i.addEventListener('input',function(){ i.value=i.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4); i.style.borderColor=''; });
    on(b,'fGo',go); on(b,'fB',L.friend); setTimeout(function(){ try{ i.focus(); }catch(e){} },60);
  };
  function joinCode(c){
    L.close(); passClick(); // opens the game's own room menu, then presses its JOIN button with the code
    var j=document.querySelector('#modal [data-a="j"]');
    if(j&&document.querySelector('#mpCode')){ window.__mpCode=c; var ci=document.querySelector('#mpCode'); ci.value=c; j.click(); }
    else location.href=L.link(c);
  }
  // home page: pick which game
  function pickGame(kind,c){
    var G=(typeof GAMES!=='undefined'&&GAMES.length)? GAMES : [], last=-1; try{ last=+localStorage.getItem('rmxHomeIdx'); }catch(e){}
    var list=G.map(function(g,i){ return {id:g[0],name:g[1],c:g[2],i:i}; }).filter(function(g){ return !SOLO[g.id]; });
    list.sort(function(a,b){ return (b.i===last)-(a.i===last); });
    var b=sheet('<h3>'+(kind==='code'?'🎮 WHICH GAME IS YOUR FRIEND PLAYING?':'🎮 PICK A GAME TO PLAY TOGETHER')+'</h3>'+(kind==='code'?'<p>Code <b style="color:#ffd23f;letter-spacing:3px">'+esc(c)+'</b></p>':'<p>You\'ll get a link to send your friend.</p>')+
      '<div class="gl">'+list.map(function(g){ return '<button data-g="'+esc(g.id)+'" style="--c:'+esc(g.c||'#ffd23f')+'">'+(g.i===last?'⭐ ':'')+esc(g.name)+'</button>'; }).join('')+'</div><button class="rx" id="fB">◀ BACK</button>','pick');
    b.querySelectorAll('[data-g]').forEach(function(btn){ btn.onclick=function(){ var id=btn.getAttribute('data-g'); location.href= kind==='code'? L.link(c,id) : location.origin+ROOT+id+'/?friend=invite'; }; });
    on(b,'fB',kind==='code'?L.code:L.friend);
  }
  // let the game's original MULTIPLAYER button through (used by "more options" and code-join)
  function passClick(){ var mb=document.getElementById('btnMP'); if(!mb) return; L._pass=true; try{ mb.click(); }finally{ L._pass=false; } }
  if(window.GAME){
    document.addEventListener('click',function(e){ if(L._pass) return; var t=e.target&&e.target.closest&&e.target.closest('button'); if(!t) return;
      var first=t.closest('#modal')&&t.getAttribute('data-a')==='m'&&/PLAY WITH A FRIEND|MULTIPLAYER \(2/.test(t.textContent);
      if(t.id==='btnMP'||first){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        if(first){ var m=document.getElementById('modal'); m.classList.add('hidden'); m.innerHTML=''; }
        L.friend(); } },true);
    // when the friend arrives in the room, close the share sheet so the host sees the room
    var watch=function(){ var m=document.getElementById('modal'); if(!m) return setTimeout(watch,300);
      new MutationObserver(function(){ if(L.mode!=='share') return; var x=(m.textContent.match(/(\d)\/[23] players/)||[])[1]; if(+x>=2){ L.close(); banner('🎉 Your friend is here!'); } }).observe(m,{childList:true,subtree:true,characterData:true}); };
    watch();
    // opened from the games page with ?friend=invite → start the invite as soon as the game menu shows
    if(/[?&]friend=invite/.test(location.search)){
      try{ history.replaceState(null,'',location.pathname); }catch(e){}
      var tries=0, auto=function(){ var s=document.getElementById('screen-menu'); if(++tries>400) return;
        if(!s||s.classList.contains('hidden')) return setTimeout(auto,250);
        setTimeout(function(){ var m=document.getElementById('modal'); if(m&&m.querySelector('[data-a="s"]')&&m.querySelector('[data-a="m"]')){ m.classList.add('hidden'); m.innerHTML=''; } L.invite(); },450); };
      auto();
    }
  }

  // ---------- 🟢 who's online (optional) ----------
  L.open=function(){
    var b=box.firstChild; box.style.display='flex'; L.mode='online';
    if(!L.online){ b.innerHTML='<h3>⚫ You are HIDDEN</h3><p>Nobody can see you or invite you. Turn on ONLINE to see who\'s playing.</p><button class="rb inv" id="rmxOn">🟢 GO ONLINE</button><button class="rx" id="rmxX">◀ BACK</button>'; b.querySelector('#rmxOn').onclick=function(){ L.setOnline(true); setTimeout(L.open,1200); }; b.querySelector('#rmxX').onclick=L.friend; return; }
    if(!L.name){ nameSheet(L.open); b.querySelector('h3').textContent='🟢 WHO\'S ONLINE'; b.querySelector('p').textContent='Pick a nickname first (no real names). Others online will see it.'; return; }
    var ids=Object.keys(L.list).filter(function(k){ return k!==me; });
    var canInvite=!!window.rmxInvite;
    var rows=ids.length? ids.map(function(k){ var p=L.list[k]; return '<div class="row"><div><b>'+esc(p.name||'?')+'</b><br><small style="opacity:.75">'+(p.title?('in '+esc(p.title)):'on the games page')+(p.busy?' · playing':'')+'</small></div>'+(canInvite&&!p.busy?'<button class="inv" data-k="'+k+'">INVITE</button>':'')+'</div>'; }).join('') : '<p style="opacity:.8">Nobody else is online right now. Tap ◀ BACK and use 📨 INVITE A FRIEND to send a link instead.</p>';
    b.innerHTML='<h3>🟢 ONLINE NOW ('+ids.length+')</h3><p style="margin:0 0 6px;opacity:.85">You are <b>'+esc(L.name)+'</b>'+(canInvite?'':' — open a game to invite someone')+'</p>'+rows+'<div class="two" style="margin-top:8px"><button class="t" id="rmxH" style="flex:1">⚫ GO HIDDEN</button><button class="t" id="rmxR" style="flex:1">✏️ NICKNAME</button></div><button class="rx" id="rmxX">◀ BACK</button>';
    b.querySelectorAll('[data-k]').forEach(function(btn){ btn.onclick=function(){ var k=btn.getAttribute('data-k'); window.rmxInvite(function(room){ L.send({e:'invite',to:k,from:L.name,fromId:me,game:L.game,title:L.gameTitle,room:room}); btn.textContent='SENT ✔'; btn.disabled=true; }); }; });
    b.querySelector('#rmxH').onclick=function(){ L.setOnline(false); L.open(); };
    b.querySelector('#rmxR').onclick=function(){ nameSheet(L.open); };
    b.querySelector('#rmxX').onclick=L.friend;
  };
  L.setBusy=function(b){ L.busy=!!b; L.retrack(); };
  // ---------- invites from the online list ----------
  function showInvite(m){
    clearTimeout(L._bt);
    pop.innerHTML='<div style="font-size:18px;font-weight:800">🎮 <span style="color:#ffd23f">'+esc(m.from)+'</span> invites you!</div><div style="margin-top:4px">Play <b>'+esc(m.title||m.game)+'</b> together</div><button id="rmxA" style="background:linear-gradient(90deg,#3bff7a,#00e5ff);color:#14061f">ACCEPT</button><button id="rmxD" style="background:#ffffff22;color:#fff">NO THANKS</button>';
    pop.style.display='block'; var t=setTimeout(function(){ pop.style.display='none'; },30000);
    pop.querySelector('#rmxA').onclick=function(){ clearTimeout(t); pop.style.display='none'; location.href=L.link(m.room,m.game); };
    pop.querySelector('#rmxD').onclick=function(){ clearTimeout(t); pop.style.display='none'; L.send({e:'decline',to:m.fromId,from:L.name}); };
  }
  L.send=function(p){ try{ L.ch&&L.ch.send({type:'broadcast',event:'i',payload:p}); }catch(e){} };
  // ---------- connection ----------
  function loadSb(cb){ if(window.supabase) return cb(); var s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'; s.onload=cb; document.head.appendChild(s); }
  L.retrack=function(){ if(L.ch&&L.ready&&L.online&&L.name) L.ch.track({name:L.name,game:L.game,title:L.gameTitle,busy:!!L.busy,t:Date.now()}); };
  L.connect=function(){
    if(!L.online||L.ch||!navigator.onLine) return;
    loadSb(function(){ try{
      L.sb=L.sb||window.supabase.createClient(SB,KEY);
      var ch=L.sb.channel('rmx-lobby',{config:{broadcast:{self:false},presence:{key:me}}}); L.ch=ch;
      ch.on('presence',{event:'sync'},function(){ var st=ch.presenceState(); L.list={}; Object.keys(st).forEach(function(k){ if(st[k][0]) L.list[k]=st[k][0]; }); if(L.mode==='online'&&box.style.display==='flex') L.open(); if(L.onList) L.onList(); })
        .on('broadcast',{event:'i'},function(r){ var m=r.payload||{}; if(m.to!==me) return; if(m.e==='invite') showInvite(m); else if(m.e==='decline'&&L.onDecline) L.onDecline(m.from); })
        .subscribe(function(s){ if(s==='SUBSCRIBED'){ L.ready=true; L.retrack(); } });
    }catch(e){} });
  };
  L.setOnline=function(on){ ls('rmxOnline',on?'1':'0'); if(!on){ try{ if(L.ch){ L.ch.untrack(); L.sb.removeChannel(L.ch); } }catch(e){} L.ch=null; L.ready=false; L.list={}; } else L.connect(); if(L.onList) L.onList(); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',L.connect); else L.connect();
  window.addEventListener('online',L.connect);
})();

/* LOBBY-3 2P-ONLY + FRIEND-1 plain words: multiplayer only in games with PLAY TOGETHER (GAME.net) or a race mode. Others = solo only. */
(function(){
  var g=window.GAME; if(!g) return; var two=!!g.net, race=!two&&!!g.race; /* race games = same puzzle, first to finish wins */
  var css=document.createElement('style');
  css.textContent= (two||race) ? '' : '#btnMP,#btnOnline{display:none!important}';
  document.head.appendChild(css);
  var FR='👥 PLAY WITH A FRIEND';
  function fix(){
    var m=document.querySelectorAll('button');
    for(var i=0;i<m.length;i++){ var b=m[i], t=b.textContent;
      if(!two && !race && t.indexOf('MULTIPLAYER (2')>=0 && b.getAttribute('data-a')==='m'){ var s=b.parentNode.querySelector('[data-a="s"]'); if(s){ s.click(); return; } }
      if((two||race) && (t==='👥 MULTIPLAYER (2–3)'||t==='👥 2 PLAYER — PLAY TOGETHER'||t==='👥 RACE A FRIEND — FIRST TO FINISH WINS')){ b.textContent=FR; }
      if(t==='📲 INVITE ON WHATSAPP'){ b.textContent='📨 SEND INVITE LINK'; b.style.background='linear-gradient(90deg,#ff3bd4,#ffd23f)'; b.style.color='#14061f'; }
      if(t==='🟢 INVITE ONLINE PLAYERS'){ b.textContent='🟢 see who\'s online'; b.style.opacity='.85'; }
      if(two){
        if(t.indexOf('START RACE')>=0&&b.style.display!=='none'){ b.style.display='none'; }
        if(t.indexOf('QUICK MATCH')>=0&&b.style.display!=='none'){ b.style.display='none'; }
      }
    }
    var ps=document.querySelectorAll('#modal p'); for(var j=0;j<ps.length;j++){ var x=ps[j];
      if(x.textContent==='Send this code to your friends on WhatsApp.') x.textContent='Tap 📨 SEND INVITE LINK to send this room to a friend.';
      if(two){
        if(x.textContent.indexOf('Race 1 or 2 friends')===0) x.textContent='Play the whole game TOGETHER with 1 friend on 2 phones. Create a room and send the code, or join with a code.';
        if(x.textContent.indexOf('Waiting for the host to start')>=0) x.innerHTML='<b>Waiting for the host to tap PLAY TOGETHER…</b>';
        if(x.textContent.indexOf('/3 players')>=0) x.textContent=x.textContent.replace('/3 players','/2 players');
      } }
  }
  var busy=false; new MutationObserver(function(){ if(busy) return; busy=true; try{ fix(); }finally{ setTimeout(function(){ busy=false; },0); } }).observe(document.documentElement,{childList:true,subtree:true,characterData:true}); fix(); setInterval(fix,600);
})();
