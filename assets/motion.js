/* Comportamento do movimento da Barão. Carregado por último, depois do React.
   O site funciona igual sem este arquivo: ele só liga a classe html.js-motion
   (que esconde o que vai animar) quando consegue rodar até o fim. */
(()=>{
const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

// Entrada ao rolar, escalonada entre irmãos (no máximo 8 × 0,05s de atraso)
const REVEAL='.section-head,.category-row,.page-heading,.steps article,.faq details,.specs,.description,.visit-card,.contact-grid article,.editorial>div,.inquiry-form,.legal>*,.empty,.results-bar,.chips,.admin-row,.footer-grid>div,.iris-copy>*,.frame-caption>*';
const io=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{rootMargin:'0px 0px -40px 0px',threshold:.08});
function scanReveal(scopes){
  const els=scopes.flatMap(s=>[...(s.matches?.(REVEAL)?[s]:[]),...(s.querySelectorAll?.(REVEAL)||[])])
    .filter(el=>!el.classList.contains('rv')&&!el.closest('dialog,.hero,.buy-bar,header'));
  const perParent=new Map();
  els.forEach(el=>{
    const i=perParent.get(el.parentNode)||0;perParent.set(el.parentNode,i+1);
    el.style.setProperty('--d',`${Math.min(i,8)*.05}s`);
    el.classList.add('rv');io.observe(el);
  });
}

// Imagens: aparecem quando carregam; o brilho roda enquanto esperam
const shell=img=>img.closest('.car-photo,.thumb,.iris-photo');
const done=img=>{img.classList.add('ok');shell(img)?.classList.remove('loading')};
function scanImages(scopes){
  scopes.flatMap(s=>[...(s.tagName==='IMG'?[s]:[]),...(s.querySelectorAll?.('img')||[])]).forEach(img=>{
    if(img.classList.contains('ok')||img.closest('.hero-visual'))return;
    if(img.complete&&img.naturalWidth)return done(img);
    shell(img)?.classList.add('loading');
  });
}
document.addEventListener('load',e=>{if(e.target.tagName==='IMG')done(e.target)},true);   // load não borbulha: captura
document.addEventListener('error',e=>{if(e.target.tagName==='IMG')done(e.target)},true);

// O MutationObserver junta a leva inteira para o escalonamento não zerar a cada nó
new MutationObserver(muts=>{
  const added=muts.flatMap(m=>[...m.addedNodes]).filter(n=>n.nodeType===1);
  if(added.length){scanImages(added);scanReveal(added)}
}).observe(document.body,{childList:true,subtree:true});

// Cabeçalho de vidro ao rolar
const header=$('header');
if(header){const on=()=>header.classList.toggle('scrolled',scrollY>8);addEventListener('scroll',on,{passive:true});on()}

// Menu do celular: o rótulo acompanha o estado
const toggle=$('.menu-toggle'),nav=$('header nav');
if(toggle&&nav)new MutationObserver(()=>toggle.setAttribute('aria-label',nav.classList.contains('open')?'Fechar menu':'Abrir menu')).observe(nav,{attributes:true,attributeFilter:['class']});

// Galeria: zoom ao clicar (só com mouse) que segue o cursor
const gallery=$('.gallery');
if(gallery&&!reduced&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  const img=$('img',gallery);
  img.addEventListener('click',()=>gallery.classList.toggle('zoom'));
  gallery.addEventListener('mousemove',e=>{if(!gallery.classList.contains('zoom'))return;const r=img.getBoundingClientRect();
    gallery.style.setProperty('--zx',`${(e.clientX-r.left)/r.width*100}%`);gallery.style.setProperty('--zy',`${(e.clientY-r.top)/r.height*100}%`)});
  gallery.addEventListener('mouseleave',()=>gallery.classList.remove('zoom'));
}

// Barra fixa de compra: aparece quando o botão principal sai da tela
const bar=$('.buy-bar'),main=$('.vehicle-summary>.whatsapp');
if(bar&&main)new IntersectionObserver(([en])=>bar.classList.toggle('show',!en.isIntersecting&&en.boundingClientRect.top<0)).observe(main);

// Listas de seleção abrem sempre para baixo: se faltar espaço, a página rola um pouco antes de abrir
function roomBelow(sel){
  const r=sel.getBoundingClientRect(),need=Math.min(300,innerHeight*.4)+20,lack=r.bottom+need-innerHeight;
  if(lack>0)sel.scrollIntoView({block:'center',behavior:'instant'});   // rola também o painel de filtros, não só a página
}
document.addEventListener('pointerdown',e=>{const sel=e.target.closest?.('select');if(sel)roomBelow(sel)},true);
document.addEventListener('keydown',e=>{if(e.target.matches?.('select')&&[' ','Enter','ArrowDown','ArrowUp'].includes(e.key))roomBelow(e.target)},true);

// Faixa de avisos: 4 mensagens, uma nova a cada 4,5 s; pausa com mouse ou foco
const tk=$('.ticker');
if(tk){const msgs=$$('.tk-msg',tk),bar=$('.tk-bar',tk);let i=0;
  const tick=()=>{if(document.hidden||tk.matches(':hover,:focus-within'))return;const old=msgs[i];old.classList.remove('on');old.classList.add('out');setTimeout(()=>old.classList.remove('out'),600);i=(i+1)%msgs.length;msgs[i].classList.add('on');if(bar){bar.style.animation='none';void bar.offsetWidth;bar.style.animation=''}};
  setInterval(tick,4500)}

// Banner principal: troca a cada 5 s mesmo com o mouse em cima; só espera com a aba escondida
const bn=$('.banner');
if(bn){const track=$('.bn-track',bn),slides=$$('.bn-slide',bn),dots=$$('.bn-dots button',bn),MS=5000;let n=0,timer;
  bn.style.setProperty('--bn-ms',MS+'ms');
  const go=k=>{n=(k+slides.length)%slides.length;track.style.transform=`translateX(-${n*100}%)`;
    slides.forEach((sl,j)=>{sl.classList.toggle('cur',j===n);sl.inert=j!==n});
    dots.forEach(d=>d.classList.remove('on'));void bn.offsetWidth;dots[n].classList.add('on');dots.forEach((d,j)=>d.setAttribute('aria-current',j===n?'true':'false'));
    clearTimeout(timer);if(!reduced&&!document.hidden)timer=setTimeout(()=>go(n+1),MS)};
  $('.bn-arrow.prev',bn).addEventListener('click',()=>go(n-1));$('.bn-arrow.next',bn).addEventListener('click',()=>go(n+1));
  dots.forEach((d,j)=>d.addEventListener('click',()=>go(j)));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(timer);else go(n)});
  let x0=0;bn.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});bn.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(n+(dx<0?1:-1))},{passive:true});
  go(0)}

scanImages([document.body]);scanReveal([document.body]);
root.classList.add('js-motion');
window.__motion=true;
})();
