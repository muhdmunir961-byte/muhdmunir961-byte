(()=>{
'use strict';
const canvas=document.getElementById('board'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id),overlay=$('overlay'),startBtn=$('start'),pauseBtn=$('pause'),restartBtn=$('restart');
const scoreEl=$('score'),timeEl=$('time'),bestEl=$('best'),heartsEl=$('hearts');
const W=960,H=540,TAU=Math.PI*2;
let state='ready',score=0,best=0,lives=3,remaining=60,entities=[],sparkles=[],elapsed=0,spawnT=0,last=0,clock=0,animation=0;
let player={x:210,y:H/2,tx:210,ty:H/2,r:16};
let pointer=false;const keys=new Set();const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
try{best=Math.max(0,Number(localStorage.getItem('mm-signal-best')||0)||0)}catch(e){}bestEl.textContent=fmt(best);
function fmt(n){return String(Math.max(0,Math.floor(n))).padStart(4,'0')}
function resize(){const r=canvas.getBoundingClientRect();const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(r.width*ratio);canvas.height=Math.round(r.height*ratio);draw()}
function info(){scoreEl.textContent=fmt(score);timeEl.textContent=String(Math.max(0,Math.ceil(remaining))).padStart(2,'0');bestEl.textContent=fmt(best);heartsEl.textContent='◆ '.repeat(lives).trim()||'—';heartsEl.setAttribute('aria-label',`${lives} lives remaining`)}
function show(title,desc,eyebrow,button){$('overlay-heading').textContent=title;$('overlay-text').textContent=desc;$('overlay-eyebrow').textContent=eyebrow;startBtn.textContent=button;overlay.hidden=false}
function hide(){overlay.hidden=true}
function start(){state='playing';score=0;lives=3;remaining=60;elapsed=0;spawnT=.6;entities=[];sparkles=[];player={x:210,y:H/2,tx:210,ty:H/2,r:16};keys.clear();pointer=false;pauseBtn.disabled=false;pauseBtn.textContent='Pause';hide();info();last=performance.now();if(!animation)animation=requestAnimationFrame(loop)}
function finish(){state='over';pauseBtn.disabled=true;if(score>best){best=score;try{localStorage.setItem('mm-signal-best',String(best))}catch(e){}}info();show('Run complete.',`You scored ${score} points. Best: ${best}. One more run?`,'SESSION CLOSED','PLAY AGAIN →')}
function pause(){if(state==='playing'){state='paused';pauseBtn.textContent='Resume';show('Paused.','Your run is saved until you resume.','SESSION ON HOLD','RESUME →')}else if(state==='paused'){state='playing';pauseBtn.textContent='Pause';hide();last=performance.now()}}
function movePointer(e){const r=canvas.getBoundingClientRect();player.tx=Math.max(25,Math.min(W-28,(e.clientX-r.left)/r.width*W));player.ty=Math.max(25,Math.min(H-25,(e.clientY-r.top)/r.height*H))}
canvas.addEventListener('pointerdown',e=>{if(state!=='playing')return;pointer=true;canvas.setPointerCapture(e.pointerId);movePointer(e)});canvas.addEventListener('pointermove',e=>{if(state==='playing'&&pointer){movePointer(e)}});canvas.addEventListener('pointerup',()=>{pointer=false});canvas.addEventListener('pointercancel',()=>{pointer=false});
window.addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(document.querySelector('dialog[open]')||e.target.matches('input,textarea,select,[contenteditable]'))return;if(!['playing','paused'].includes(state))return;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))e.preventDefault();if(key===' '||key==='escape'){if(document.activeElement?.matches('button,a'))return;pause();return}if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)){keys.add(key);pointer=false}});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&state==='playing')pause()},{threshold:0.02}).observe(document.getElementById('game-frame'));
startBtn.addEventListener('click',()=>state==='paused'?pause():start());pauseBtn.addEventListener('click',pause);restartBtn.addEventListener('click',start);
function spawn(){const danger=Math.random()<(0.34+Math.min(elapsed/200,.20));const obj={x:W+35,y:38+Math.random()*(H-76),r:danger?20+Math.random()*14:11+Math.random()*4,v:215+elapsed*2.8+Math.random()*110,danger,phase:Math.random()*TAU,dead:false};entities.push(obj)}
function particles(x,y,color,n){if(reduced)return;for(let i=0;i<n;i++){const a=Math.random()*TAU,v=45+Math.random()*120;sparkles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:.34+Math.random()*.24,color})}}
function update(dt){elapsed+=dt;remaining-=dt;if(remaining<=0){remaining=0;finish();return}spawnT-=dt;if(spawnT<=0){spawn();spawnT=.38+Math.random()*.42-Math.min(.12,elapsed/600)}
let dx=0,dy=0;if(keys.has('arrowleft')||keys.has('a'))dx--;if(keys.has('arrowright')||keys.has('d'))dx++;if(keys.has('arrowup')||keys.has('w'))dy--;if(keys.has('arrowdown')||keys.has('s'))dy++;
if(dx||dy){const len=Math.hypot(dx,dy);player.tx=Math.max(25,Math.min(W-28,player.tx+dx/len*420*dt));player.ty=Math.max(25,Math.min(H-25,player.ty+dy/len*420*dt))}
const k=1-Math.exp(-12*dt);player.x+=(player.tx-player.x)*k;player.y+=(player.ty-player.y)*k;
for(const o of entities){o.x-=o.v*dt;o.phase+=dt*3;if(o.x< -50)o.dead=true;if(!o.dead&&Math.hypot(o.x-player.x,o.y-player.y)<o.r+player.r-2){o.dead=true;if(o.danger){lives--;particles(o.x,o.y,'#ffb16e',12);if(lives<=0){lives=0;finish();return}}else{score+=10;particles(o.x,o.y,'#50eee2',9);if(score>best){best=score;try{localStorage.setItem('mm-signal-best',String(best))}catch(e){}}}}}
entities=entities.filter(o=>!o.dead);for(const p of sparkles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt}sparkles=sparkles.filter(p=>p.t>0);info()}
function line(x1,y1,x2,y2,color,width=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function draw(){if(!ctx||!canvas.width)return;const r=canvas.getBoundingClientRect();ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.fillStyle='#101e2d';ctx.fillRect(0,0,W,H);
// Quiet engineering-grid aesthetic: no glow spam, no scrolling stripes.
ctx.strokeStyle='#1f3448';ctx.lineWidth=1;for(let x=0;x<=W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<=H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
line(28,29,126,29,'#37556a');line(28,29,28,97,'#37556a');line(W-28,H-29,W-126,H-29,'#37556a');line(W-28,H-29,W-28,H-97,'#37556a');
ctx.font='600 12px system-ui';ctx.fillStyle='#62829b';ctx.fillText('MOVE / COLLECT / SURVIVE',31,H-30);
for(const o of entities){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.phase*.38);if(o.danger){ctx.strokeStyle='#f5ad69';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,o.r,0,TAU);ctx.stroke();line(-o.r*.6,-o.r*.6,o.r*.6,o.r*.6,'#e99e61',3);line(-o.r*.6,o.r*.6,o.r*.6,-o.r*.6,'#e99e61',3)}else{ctx.strokeStyle='#4de4d8';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,o.r,0,TAU);ctx.stroke();ctx.fillStyle='#4de4d8';ctx.beginPath();ctx.arc(0,0,3,0,TAU);ctx.fill()}ctx.restore()}
for(const p of sparkles){ctx.globalAlpha=Math.min(1,p.t*2);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3)}ctx.globalAlpha=1;
ctx.save();ctx.translate(player.x,player.y);ctx.fillStyle='#baf5ee';ctx.beginPath();ctx.moveTo(25,0);ctx.lineTo(-13,-15);ctx.lineTo(-7,0);ctx.lineTo(-13,15);ctx.closePath();ctx.fill();ctx.strokeStyle='#259ad6';ctx.lineWidth=2;ctx.stroke();ctx.restore();if(state==='ready'){ctx.globalAlpha=.5;ctx.strokeStyle='#4de4d8';ctx.lineWidth=1;ctx.beginPath();ctx.arc(player.x,player.y,37,0,TAU);ctx.stroke();ctx.globalAlpha=1}}
let lastDraw=0;function loop(now){animation=requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.045)||0;last=now;if(state==='playing')update(dt);if(state==='playing'||now-lastDraw>90){draw();lastDraw=now}}
window.addEventListener('resize',resize);info();resize();last=performance.now();animation=requestAnimationFrame(loop);
})();