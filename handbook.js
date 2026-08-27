
(() => {
 const app=document.getElementById('handbookApp'); if(!app) return;
 const search=document.getElementById('hbSearch'), clear=document.getElementById('hbClear'), count=document.getElementById('hbSearchCount');
 const toc=document.getElementById('hbToc'), mobileToc=document.getElementById('hbMobileToc'), noResults=document.getElementById('hbNoResults');
 let lang='ja';
 const labels={ja:{toc:'目次',chapter:'第',suffix:'章',results:'件の項目'},en:{results:'results'}};
 function activeView(){return app.querySelector(`.hb-language-view[data-lang-view="${lang}"]`)}
 function cleanTitle(t){return t.replace(/\s+/g,' ').trim()}
 function buildToc(){
   const view=activeView(); const frag=document.createDocumentFragment();
   view.querySelectorAll('.hb-chapter').forEach(ch=>{
     const wrap=document.createElement('div'); wrap.className='hb-toc-chapter';
     const a=document.createElement('a'); a.href='#'+ch.id; a.textContent=cleanTitle(ch.querySelector('.hb-chapter-head h1').textContent); wrap.appendChild(a);
     ch.querySelectorAll('.hb-section').forEach(sec=>{
       const h=sec.querySelector('.hb-section-title'); if(!h) return;
       const x=document.createElement('a'); x.href='#'+sec.id; x.textContent=cleanTitle(h.textContent); x.className=sec.classList.contains('hb-level-2')?'hb-toc-group':'hb-toc-item'; wrap.appendChild(x);
     }); frag.appendChild(wrap);
   });
   const appx=view.querySelector('.hb-appendices'); if(appx){const wrap=document.createElement('div');wrap.className='hb-toc-chapter';const a=document.createElement('a');a.href='#'+appx.id;a.textContent=cleanTitle(appx.querySelector('h2').textContent);wrap.appendChild(a);frag.appendChild(wrap)}
   toc.innerHTML=''; toc.appendChild(frag.cloneNode(true)); mobileToc.innerHTML=''; mobileToc.appendChild(frag);
 }
 function setLang(next){
   lang=next; app.querySelectorAll('.hb-language-view').forEach(v=>v.style.display=v.dataset.langView===lang?'block':'none');
   app.querySelectorAll('.hb-lang-btn').forEach(b=>{const on=b.dataset.lang===lang;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',on)});
   search.placeholder=lang==='ja'?'例：奨学金、休学、駐車場、在留資格':'e.g. scholarship, parking, visa, health'; document.documentElement.lang=lang;
   search.value=''; resetSearch(); buildToc(); updateQuickLinks();
 }
 function updateQuickLinks(){
   const map=lang==='ja'?[['#ja-1-i-5','履修・学務','Courses / Gakumu'],['#ja-2-4','奨学金','Scholarships'],['#ja-2-1','学生証','Student ID'],['#ja-2-14','課外活動','Clubs'],['#ja-3-i-1','医療・健康','Health'],['#ja-4-1','在留資格','Immigration'],['#ja-5-1','東京サテライト','Tokyo Satellite']]:[['#en-1-i-5','Gakumu / Courses','Academic Affairs'],['#en-2-4','Scholarships','Financial support'],['#en-2-1','Student ID','Student life'],['#en-2-14','Club Activities','Activities'],['#en-3-i-1','Health Care','Medical'],['#en-4-1','VISA / Residence','Immigration'],['#en-appendices','Appendices','PDF / forms']];
   document.getElementById('hbQuickLinks').innerHTML=map.map(x=>`<a href="${x[0]}"><span>${x[1]}</span><small>${x[2]}</small></a>`).join('');
 }
 function resetSearch(){
   const view=activeView(); view.querySelectorAll('.hb-section').forEach(s=>s.hidden=false); view.querySelectorAll('.hb-chapter').forEach(c=>c.style.display=''); noResults.style.display='none';count.textContent='';
   app.querySelectorAll('mark.hb-search-hit').forEach(m=>m.replaceWith(document.createTextNode(m.textContent)));
 }
 function doSearch(){
   resetSearch(); const q=search.value.trim().toLocaleLowerCase(); if(!q) return;
   const view=activeView(); let hits=0;
   view.querySelectorAll('.hb-section').forEach(sec=>{const ok=sec.textContent.toLocaleLowerCase().includes(q);sec.hidden=!ok;if(ok)hits++});
   view.querySelectorAll('.hb-chapter').forEach(ch=>{const visible=[...ch.querySelectorAll('.hb-section')].some(s=>!s.hidden);ch.style.display=visible?'':'none'});
   noResults.style.display=hits?'none':'block'; count.textContent=lang==='ja'?`${hits}件の項目`:`${hits} results`;
   // lightweight highlight only in visible headings; avoids destructive replacement in links/body HTML.
   view.querySelectorAll('.hb-section:not([hidden]) .hb-section-title').forEach(h=>{const text=h.textContent; const i=text.toLocaleLowerCase().indexOf(q); if(i>=0){h.innerHTML='';h.append(text.slice(0,i));const m=document.createElement('mark');m.className='hb-search-hit';m.textContent=text.slice(i,i+q.length);h.append(m,text.slice(i+q.length))}});
 }
 app.querySelectorAll('.hb-lang-btn').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang))); app.querySelectorAll('[data-switch-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.switchLang)));
 search.addEventListener('input',doSearch); clear.addEventListener('click',()=>{search.value='';resetSearch();search.focus()});
 document.getElementById('hbCollapseAll').addEventListener('click',()=>{document.querySelector('.hb-sidebar-inner').scrollTo({top:0,behavior:'smooth'})});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);const target=document.getElementById(id);if(target){target.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'','#'+id);}});
 // Active TOC marker
 const io=new IntersectionObserver(entries=>{entries.forEach(ent=>{if(ent.isIntersecting){toc.querySelectorAll('.is-current').forEach(x=>x.classList.remove('is-current'));const a=toc.querySelector(`a[href="#${CSS.escape(ent.target.id)}"]`);if(a)a.classList.add('is-current')}})},{rootMargin:'-18% 0px -72% 0px'});
 app.querySelectorAll('.hb-section').forEach(s=>io.observe(s));
 buildToc(); updateQuickLinks();
})();
