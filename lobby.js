/* REMIX LOBBY-1 — who's online + invites. Shared by the games page and every game (loaded from the site root). */
(function(){
  if(window.RMXL) return;
  var SB='https://uuyaoffzgjxxwxlzhwur.supabase.co', KEY='sb_publishable_1uPwY4lT8NDgiy2iCJAp9g_h_v2p2j9';
  var ROOT=(location.pathname.match(/^(.*\/remix-games\/)/)||[0,'/'])[1];
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
  function clean(s){ return String(s||'').replace(/[^A-Za-z0-9 _-]/g,'').slice(0,10).toUpperCase(); }
  var me=ls('rmxId'); if(!me){ me=Math.random().toString(36).slice(2,10); ls('rmxId',me); }
  var L={ me:me, ch:null, sb:null, list:{}, ready:false, game:(window.GAME&&window.GAME.id)||'', gameTitle:(window.GAME&&window.GAME.title)||'',
    get name(){ return clean(ls('rmxName'))||''; }, set name(v){ ls('rmxName',clean(v)); },
    get online(){ return ls('rmxOnline')!=='0'; } };
  window.RMXL=L;
  // ---------- styles + UI ----------
  var css=document.createElement('style'); css.textContent='#rmxL{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:#0009;font:15px system-ui,sans-serif;color:#fff}#rmxL .b{width:min(92vw,420px);max-height:80vh;overflow:auto;background:#1a0d2b;border:1px solid #ff3bd488;border-radius:18px;padding:16px;box-shadow:0 0 30px #ff3bd455}#rmxL h3{margin:0 0 8px;font-size:20px}#rmxL button{font:800 14px system-ui,sans-serif;border:0;border-radius:10px;padding:9px 12px;cursor:pointer}#rmxL .row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;margin:6px 0;border-radius:10px;background:#ffffff12}#rmxL .inv{background:linear-gradient(90deg,#ff3bd4,#ffd23f);color:#14061f}#rmxL .x{background:#ffffff22;color:#fff;width:100%;margin-top:8px}#rmxL .t{background:#ffffff22;color:#fff}#rmxPop{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:10000;display:none;width:min(92vw,400px);background:#1a0d2b;border:2px solid #ffd23f;border-radius:16px;padding:14px;color:#fff;font:15px system-ui,sans-serif;box-shadow:0 0 30px #ffd23f66;text-align:center}#rmxPop button{font:800 15px system-ui,sans-serif;border:0;border-radius:10px;padding:10px 16px;margin:8px 4px 0;cursor:pointer}';
  document.head.appendChild(css);
  var box=document.createElement('div'); box.id='rmxL'; box.innerHTML='<div class="b"></div>'; var pop=document.createElement('div'); pop.id='rmxPop';
  function mount(){ if(!document.body) return setTimeout(mount,50); document.body.appendChild(box); document.body.appendChild(pop); }
  mount();
  box.addEventListener('click',function(e){ if(e.target===box) L.close(); });
  ['pointerdown','keydown'].forEach(function(t){ box.addEventListener(t,function(e){ e.stopPropagation(); }); pop.addEventListener(t,function(e){ e.stopPropagation(); }); });
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  L.close=function(){ box.style.display='none'; };
  L.open=function(){
    var b=box.firstChild; box.style.display='flex';
    if(!L.online){ b.innerHTML='<h3>⚫ You are HIDDEN</h3><p>Nobody can see you or invite you. Turn on ONLINE to see who\'s playing and send invites.</p><button class="inv" id="rmxOn" style="width:100%">🟢 GO ONLINE</button><button class="x" id="rmxX">CLOSE</button>'; b.querySelector('#rmxOn').onclick=function(){ L.setOnline(true); setTimeout(L.open,1200); }; b.querySelector('#rmxX').onclick=L.close; return; }
    if(!L.name){ b.innerHTML='<h3>🟢 ONLINE PLAYERS</h3><p>Pick a nickname first (no real names):</p><input id="rmxN" maxlength="10" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ffffff44;background:#0006;color:#fff;font:700 16px system-ui;text-transform:uppercase"><button class="inv" id="rmxS" style="width:100%;margin-top:8px">SAVE</button>'; var i=b.querySelector('#rmxN'); i.addEventListener('keydown',function(e){e.stopPropagation();}); b.querySelector('#rmxS').onclick=function(){ L.name=i.value; if(L.name){ L.retrack(); L.open(); } }; return; }
    var ids=Object.keys(L.list).filter(function(k){ return k!==me; });
    var canInvite=!!window.rmxInvite;
    var rows=ids.length? ids.map(function(k){ var p=L.list[k]; return '<div class="row"><div><b>'+esc(p.name||'?')+'</b><br><small style="opacity:.75">'+(p.title?('in '+esc(p.title)):'on the games page')+(p.busy?' · racing':'')+'</small></div>'+(canInvite&&!p.busy?'<button class="inv" data-k="'+k+'">INVITE</button>':'')+'</div>'; }).join('') : '<p style="opacity:.8">Nobody else is online right now. Send a WhatsApp invite instead!</p>';
    b.innerHTML='<h3>🟢 ONLINE NOW ('+ids.length+')</h3><p style="margin:0 0 6px;opacity:.85">You are <b>'+esc(L.name)+'</b>'+(canInvite?'':' — open a game and go to 👥 MULTIPLAYER to invite players')+'</p>'+rows+'<div style="display:flex;gap:6px;margin-top:8px"><button class="t" id="rmxH" style="flex:1">⚫ GO HIDDEN</button><button class="t" id="rmxR" style="flex:1">✏️ NICKNAME</button></div><button class="x" id="rmxX">CLOSE</button>';
    b.querySelectorAll('[data-k]').forEach(function(btn){ btn.onclick=function(){ var k=btn.getAttribute('data-k'); window.rmxInvite(function(room){ L.send({e:'invite',to:k,from:L.name,fromId:me,game:L.game,title:L.gameTitle,room:room}); btn.textContent='SENT ✔'; btn.disabled=true; }); }; });
    b.querySelector('#rmxH').onclick=function(){ L.setOnline(false); L.open(); };
    b.querySelector('#rmxR').onclick=function(){ ls('rmxName',''); L.open(); };
    b.querySelector('#rmxX').onclick=L.close;
  };
  L.whatsapp=function(room){ var url=location.origin+ROOT+L.game+'/?room='+room; var txt='🎮 Race me in '+(L.gameTitle||'Remix Arcade')+'! Tap to join my room '+room+': '+url; window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank'); };
  L.setBusy=function(b){ L.busy=!!b; L.retrack(); };
  // ---------- invites ----------
  function showInvite(m){
    pop.innerHTML='<div style="font-size:18px;font-weight:800">🎮 <span style="color:#ffd23f">'+esc(m.from)+'</span> invites you!</div><div style="margin-top:4px">Race in <b>'+esc(m.title||m.game)+'</b></div><button id="rmxA" style="background:linear-gradient(90deg,#3bff7a,#00e5ff);color:#14061f">ACCEPT</button><button id="rmxD" style="background:#ffffff22;color:#fff">NO THANKS</button>';
    pop.style.display='block'; var t=setTimeout(function(){ pop.style.display='none'; },30000);
    pop.querySelector('#rmxA').onclick=function(){ clearTimeout(t); pop.style.display='none'; location.href=location.origin+ROOT+m.game+'/?room='+encodeURIComponent(m.room); };
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
      ch.on('presence',{event:'sync'},function(){ var st=ch.presenceState(); L.list={}; Object.keys(st).forEach(function(k){ if(st[k][0]) L.list[k]=st[k][0]; }); if(box.style.display==='flex') L.open(); if(L.onList) L.onList(); })
        .on('broadcast',{event:'i'},function(r){ var m=r.payload||{}; if(m.to!==me) return; if(m.e==='invite') showInvite(m); else if(m.e==='decline'&&L.onDecline) L.onDecline(m.from); })
        .subscribe(function(s){ if(s==='SUBSCRIBED'){ L.ready=true; L.retrack(); } });
    }catch(e){} });
  };
  L.setOnline=function(on){ ls('rmxOnline',on?'1':'0'); if(!on){ try{ if(L.ch){ L.ch.untrack(); L.sb.removeChannel(L.ch); } }catch(e){} L.ch=null; L.ready=false; L.list={}; } else L.connect(); if(L.onList) L.onList(); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',L.connect); else L.connect();
  window.addEventListener('online',L.connect);
})();
