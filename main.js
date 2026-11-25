import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import './style.css';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
let ready = Object.values(cfg).every(Boolean);
let functions, auth;
if (ready) {
  const app = initializeApp(cfg);
  auth = getAuth(app); functions = getFunctions(app);
}
const call = (name, data) => httpsCallable(functions, name)(data);
const root = document.querySelector('#app');
let room = null, reveal = null;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shell(content){ root.innerHTML = `<main class="wrap"><header><div class="logo">🎅</div><p class="eyebrow">ПРАЗДНИЧНАЯ ИГРА</p><h1>Secret Santa</h1><p class="sub">Маленькое чудо, большой секрет</p></header>${content}<footer>🎄 Сделано для праздничных сюрпризов</footer></main>`; }
function home(){
 shell(`<section class="card"><h2>Создать игру</h2><label>Название<input id="title" value="Тайный Санта" maxlength="60"></label><label>Бюджет<input id="budget" placeholder="Например, 20 €" maxlength="40"></label><button id="create">Создать комнату</button></section><section class="card"><h2>Войти в игру</h2><label>Код комнаты<input id="code" placeholder="6 символов" maxlength="6" autocapitalize="characters"></label><label>Твоё имя<input id="name" placeholder="Имя участника" maxlength="40"></label><button class="alt" id="join">Войти по коду</button></section><p class="note">Каждый участник использует свой телефон. Назначения доступны только соответствующему участнику.</p>`);
 if(!ready){document.querySelectorAll('button').forEach(b=>b.disabled=true);root.insertAdjacentHTML('beforeend','<p class="setup">Сначала подключи Firebase — см. README в архиве проекта.</p>');return;}
 document.querySelector('#create').onclick=async()=>{try{await signInAnonymously(auth); const r=await call('createRoom',{title:document.querySelector('#title').value,budget:document.querySelector('#budget').value});room=r.data; showRoom();}catch(e){alert(e.message)}};
 document.querySelector('#join').onclick=async()=>{try{await signInAnonymously(auth);const r=await call('joinRoom',{code:document.querySelector('#code').value.trim().toUpperCase(),name:document.querySelector('#name').value.trim()});room=r.data;showRoom();}catch(e){alert(e.message)}};
}
function showRoom(){
 shell(`<section class="card"><span class="badge">КОМНАТА</span><h2>${esc(room.title||'Secret Santa')}</h2><div class="code">${esc(room.code)}</div><p>Отправь друзьям код комнаты.</p><p>Бюджет: <b>${esc(room.budget||'не задан')}</b></p><label>Твоё имя<input id="participant" placeholder="Имя для участия" maxlength="40"></label><button id="joinRoom">Присоединиться</button><div id="roomStatus"></div><button class="alt" id="back">Назад</button></section>`);
 document.querySelector('#back').onclick=home;
 document.querySelector('#joinRoom').onclick=async()=>{try{const r=await call('joinRoom',{code:room.code,name:document.querySelector('#participant').value.trim()});room={...room,...r.data};refreshRoom();}catch(e){alert(e.message)}};
 refreshRoom();
}
async function refreshRoom(){
 const status=document.querySelector('#roomStatus');if(!status)return;
 try{const r=await call('roomStatus',{code:room.code});const data=r.data;
 status.innerHTML=`<div class="members"><h3>Участники (${data.members.length})</h3>${data.members.map(m=>`<div>🎁 ${esc(m.name)}</div>`).join('')}</div>${data.drawn?'<p class="note">Жеребьёвка уже проведена.</p>':'<button id="draw">Провести жеребьёвку (организатор)</button>'}<button class="alt" id="reveal">Узнать, кому дарить</button><div id="secret"></div>`;
 if(!data.drawn) document.querySelector('#draw').onclick=async()=>{try{await call('draw',{code:room.code});refreshRoom();}catch(e){alert(e.message)}};
 document.querySelector('#reveal').onclick=async()=>{try{const v=await call('reveal',{code:room.code});document.querySelector('#secret').innerHTML=`<div class="secret">🎄 Ты даришь подарок: <strong>${esc(v.data.recipient)}</strong></div>`;}catch(e){alert(e.message)}};
 }catch(e){status.textContent=e.message;}
}
home();
