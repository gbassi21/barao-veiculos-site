const menu=document.querySelector('.menu-toggle');const nav=document.querySelector('header nav');function closeMenu(){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false')}menu?.addEventListener('click',()=>{nav.classList.toggle('open');menu.setAttribute('aria-expanded',nav.classList.contains('open'));});nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){closeMenu();menu?.focus()}});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function animateScroll(){const hero=document.querySelector('.hero-visual');if(hero)hero.style.setProperty('--parallax',`${Math.min(scrollY*.07,45)}px`);const stage=document.querySelector('.frame-stage');if(stage){const r=stage.getBoundingClientRect();const p=Math.min(1,Math.max(0,(innerHeight-r.top)/(innerHeight*.9)));stage.style.setProperty('--frame',p)}const iris=document.querySelector('.iris-photo');if(iris){const r=iris.getBoundingClientRect();const p=Math.min(1,Math.max(0,(innerHeight-r.top)/(innerHeight*.7)));iris.style.setProperty('--iris',`${12+p*64}%`)}}
let pending=false;if(!reduced.matches){addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(()=>{animateScroll();pending=false})}},{passive:true});addEventListener('resize',animateScroll);animateScroll()}
const thumbs=[...document.querySelectorAll('.thumb')];let photo=0,swap=0;function showPhoto(i){photo=(i+thumbs.length)%thumbs.length;const main=document.querySelector('#main-photo');const src=thumbs[photo].dataset.photo,n=++swap,pre=new Image();main.classList.add('fading');pre.onload=pre.onerror=()=>{if(n===swap){main.src=src;main.classList.remove('fading')}};pre.src=src;main.alt=main.alt.replace(/foto \d+/,`foto ${photo+1}`);thumbs.forEach((b,j)=>b.setAttribute('aria-pressed',j===photo));document.querySelector('.gallery-count').textContent=`${photo+1} / ${thumbs.length}`;thumbs[photo].scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'nearest',inline:'nearest'})}thumbs.forEach((b,i)=>b.addEventListener('click',()=>showPhoto(i)));document.querySelector('.gallery-prev')?.addEventListener('click',()=>showPhoto(photo-1));document.querySelector('.gallery-next')?.addEventListener('click',()=>showPhoto(photo+1));let startX=0;const gallery=document.querySelector('.gallery');gallery?.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});gallery?.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45)showPhoto(photo+(dx<0?1:-1))},{passive:true});
gallery?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showPhoto(photo+(e.key==='ArrowRight'?1:-1))}});
document.querySelectorAll('.inquiry-form[data-topic]').forEach(f=>f.addEventListener('submit',ev=>{ev.preventDefault();const d=new FormData(f);const message=`Olá! Vim pelo site da Barão Veículos. Meu nome é ${d.get('name')} e gostaria de conversar sobre ${f.dataset.topic}. Veículo: ${d.get('model')}. ${d.get('details')||''}`;location.href='https://wa.me/5527998357731?text='+encodeURIComponent(message)}));
const mobileFilters=document.querySelector('.mobile-filters'),phone=matchMedia('(max-width:760px)');if(mobileFilters){const sync=()=>{mobileFilters.open=!phone.matches};sync();phone.addEventListener('change',sync)}

// Horário de funcionamento: destaca o dia de hoje e diz se a loja está aberta agora (hora de Brasília)
(()=>{const H={0:null,1:[8.5,18.5],2:[8.5,18.5],3:[8.5,18.5],4:[8.5,18.5],5:[8.5,18.5],6:[8.5,14]},NAMES=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const fmt=h=>{const m=Math.round((h%1)*60);return `${Math.floor(h)}h${m?String(m).padStart(2,'0'):''}`};
function now(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()).map(x=>[x.type,x.value]));
  return {day:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday),time:(+p.hour%24)+(+p.minute)/60}}
function nextOpen(day){for(let i=1;i<=7;i++){const d=(day+i)%7;if(H[d])return {d,label:i===1?'amanhã':NAMES[d]}}}
function paint(){const {day,time}=now(),h=H[day];let open=false,msg;
  if(h&&time>=h[0]&&time<h[1]){open=true;msg=`Aberto agora · fecha hoje às ${fmt(h[1])}`}
  else if(h&&time<h[0])msg=`Fechado agora · abre hoje às ${fmt(h[0])}`;
  else{const n=nextOpen(day);msg=`Fechado agora · abre ${n.label} às ${fmt(H[n.d][0])}`}
  document.querySelectorAll('[data-hours-status]').forEach(el=>{el.textContent=msg;el.classList.toggle('open',open);el.classList.toggle('closed',!open)});
  document.querySelectorAll('.hours-list li').forEach(li=>{const t=+li.dataset.day===day;li.classList.toggle('today',t);if(t)li.setAttribute('aria-current','date');else li.removeAttribute('aria-current');const b=li.querySelector('em');if(t&&!b)li.insertAdjacentHTML('afterbegin','<em>Hoje</em>');if(!t&&b)b.remove()});document.querySelectorAll('.hours-list').forEach(ul=>[...ul.children].sort((x,y)=>((+x.dataset.day-day+7)%7)-((+y.dataset.day-day+7)%7)).forEach(li=>ul.appendChild(li)))}
if(document.querySelector('[data-hours-status]')){paint();setInterval(paint,60000)}})();

// Filtro de tipo: a lista de marcas mostra só as marcas do tipo escolhido (carros ou motos)
document.querySelectorAll('.filters[data-brands]').forEach(f=>{const map=JSON.parse(f.dataset.brands),kind=f.elements.kind,brand=f.elements.brand;if(!kind||!brand)return;
  const nice=b=>b.toLowerCase().replace(/(^|[\s-])\S/g,m=>m.toUpperCase());
  kind.addEventListener('change',()=>{const list=map[kind.value]||map[''],cur=brand.value;brand.replaceChildren(new Option('Todos',''),...list.map(b=>new Option(nice(b),b)));brand.value=list.includes(cur)?cur:''})});

// Versão estática (GitHub Pages): sem servidor, o estoque é filtrado aqui, a partir da URL (?kind=Moto&brand=HONDA...)
if(document.body.hasAttribute('data-static')&&document.querySelector('.inventory')){(()=>{
  const form=document.querySelector('.filters'),grid=document.querySelector('.stock-grid'),bar=document.querySelector('.results-bar'),qs=new URLSearchParams(location.search);
  const cards=[...grid.querySelectorAll('.car-card')],order=new Map(cards.map((c,i)=>[c,i]));
  const names={q:'Busca',kind:'Tipo',brand:'Marca',transmission:'Câmbio',max:'Até',year:'A partir de'};
  const val=k=>(qs.get(k)||'').trim(),num=(s,d)=>{const n=parseFloat(s);return isNaN(n)?d:n};
  const brl=n=>'R$ '+Math.round(n).toLocaleString('pt-BR');
  const nice=b=>b.toLowerCase().replace(/(^|[\s-])\S/g,m=>m.toUpperCase());
  const map=JSON.parse(form.dataset.brands||'{}');
  // campos do formulário refletem a URL (o tipo vem primeiro: ele refaz a lista de marcas)
  if(form.elements.kind){form.elements.kind.value=val('kind');form.elements.kind.dispatchEvent(new Event('change',{bubbles:true}))}
  for(const k of ['q','brand','transmission','max','year','sort'])if(form.elements[k])form.elements[k].value=val(k);
  const match=c=>{const d=c.dataset;return(!val('q')||(d.title+' '+d.brand).toLowerCase().includes(val('q').toLowerCase()))&&(!val('brand')||d.brand===val('brand'))&&(!val('kind')||d.kind===val('kind'))&&(!val('transmission')||d.trans===val('transmission'))&&+d.price<=num(val('max'),1e12)&&+d.year>=num(val('year'),0)};
  const sort=val('sort'),key=c=>sort==='price'?+c.dataset.price:sort==='price-desc'?-c.dataset.price:-c.dataset.year;
  const shown=cards.filter(match).sort((a,b)=>key(a)-key(b)||order.get(a)-order.get(b));
  cards.forEach(c=>c.hidden=true);shown.forEach(c=>{c.hidden=false;grid.appendChild(c)});
  const n=shown.length,status=bar.querySelector('[role=status]');
  if(status)status.innerHTML=`<strong>${n}</strong> ${n===1?'veículo encontrado':'veículos encontrados'}`;
  const without=k=>{const p=new URLSearchParams(qs);p.delete(k);const s=p.toString();return location.pathname+(s?'?'+s:'')};
  bar.parentElement.querySelector('.chips')?.remove();
  const active=Object.keys(names).filter(k=>val(k));
  if(active.length){const box=document.createElement('div');box.className='chips';box.setAttribute('aria-label','Filtros ativos');
    box.innerHTML=active.map(k=>{const t=k==='max'?brl(num(val(k),0)):k==='brand'?nice(val(k)):val(k);const a=document.createElement('a');a.className='chip';a.href=without(k);a.setAttribute('aria-label',`Remover filtro ${names[k]}: ${t}`);a.append(`${names[k]}: ${t}`);const x=document.createElement('span');x.setAttribute('aria-hidden','true');x.textContent='×';a.append(x);return a.outerHTML}).join('');
    bar.after(box)}
  grid.querySelector('.empty')?.remove();
  if(!n){const e=document.createElement('div');e.className='empty';e.innerHTML='<h2>Nenhum veículo com esses filtros</h2><p>Nenhum anúncio disponível combina com tudo o que você marcou. Retire algum filtro acima ou veja o estoque completo.</p><a href="'+location.pathname+'">Ver todo o estoque →</a>';grid.append(e)}
  // barra Todos / Carros / Motos mantém os outros filtros
  document.querySelectorAll('.kind-switch a').forEach((a,i)=>{const k=['','Carro','Moto'][i],p=new URLSearchParams(qs);p.delete('kind');p.delete('p');
    if(k&&p.get('brand')&&!(map[k]||[]).includes(p.get('brand')))p.delete('brand');if(k)p.set('kind',k);
    a.href=location.pathname+(p.toString()?'?'+p.toString():'');if(val('kind')===k)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
  // contador de filtros no botão do celular
  const sum=document.querySelector('.mobile-filters>summary');sum?.querySelector('.fcount')?.remove();if(sum&&active.length)sum.insertAdjacentHTML('beforeend',`<b class="fcount">${active.length}</b>`);
})()}
