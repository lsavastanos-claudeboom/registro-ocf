# -*- coding: utf-8 -*-
"""Trasforma quiz_template.html nella versione online (Registro OCF) e costruisce index.html + data.js"""
import json, re

tpl = open('/home/claude/quiz_template.html', encoding='utf-8').read()
css = open('/home/claude/ocf-online/style_nuovo.css', encoding='utf-8').read()

# ---------- 1) head ----------
head_nuovo = '''<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>QuizzOcf — Simulatore prova valutativa</title>
<meta name="description" content="Simulatore della prova valutativa OCF sulla banca dati ufficiale 2026.">
<meta name="theme-color" content="#1C2B3A">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="QuizzOcf">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
__CSS__
</style>
</head>'''
tpl = re.sub(r'<!DOCTYPE html>.*?</head>', head_nuovo.replace('__CSS__', css), tpl, count=1, flags=re.S)

# ---------- 2) header ----------
header_nuovo = '''<header class="top">
  <img src="icons/logo-64.png" alt="" class="logo-img">
  <div class="marchio">
    <h1>Quizz<span class="rosso">Ocf</span></h1>
    <div class="sub">Banca dati gennaio 2026 · 4.995 domande</div>
  </div>
  <div class="utente-box">
    <span id="sync-stato" class="nascosto"><span class="sync-dot"></span><span id="sync-testo">sincronizzato</span></span>
    <span id="utente-email"></span>
    <button id="btn-esci" class="nascosto">Esci</button>
  </div>
</header>'''
tpl = re.sub(r'<header class="top">.*?</header>', header_nuovo, tpl, count=1, flags=re.S)

# ---------- 3) tab con icone ----------
tabs_nuovi = '''<div class="tabs" id="barra-tab">
    <button class="tab attiva" id="tab-allenamento"><span class="t-ico">✏️</span><span>Allenati</span></button>
    <button class="tab" id="tab-dashboard"><span class="t-ico">📊</span><span>Quadro</span></button>
    <button class="tab" id="tab-ripasso"><span class="t-ico">📖</span><span>Ripasso</span></button>
    <button class="tab" id="tab-cerca"><span class="t-ico">🔍</span><span>Cerca</span></button>
    <button class="tab" id="tab-dispensa"><span class="t-ico">📚</span><span>Dispensa</span></button>
  </div>'''
tpl = re.sub(r'<div class="tabs" id="barra-tab">.*?</div>', tabs_nuovi, tpl, count=1, flags=re.S)

# ---------- 4) dati esterni ----------
tpl = tpl.replace('const QUESTIONS = /*__DATA__*/;', 'const QUESTIONS = window.OCF_DATA.QUESTIONS;')
tpl = tpl.replace('const SPIEG = /*__SPIEG__*/{};', 'const SPIEG = window.OCF_DATA.SPIEG || {};')
tpl = tpl.replace('const TRUCCHI = /*__TRUCCHI__*/{};', 'const TRUCCHI = window.OCF_DATA.TRUCCHI || {};')
tpl = tpl.replace('const SOTTO = /*__SOTTO__*/{SA: [], map: {}};', 'const SOTTO = window.OCF_DATA.SOTTO || {SA: [], map: {}};')

# ---------- 5) nota tastiera (nascosta su touch) ----------
tpl = tpl.replace('<div class="nota">Scorciatoie: <kbd>', '<div class="nota nota-tastiera">Scorciatoie: <kbd>')

# ---------- 6) etichetta autosave file ----------
tpl = tpl.replace('Scarica automaticamente il file dei progressi a fine test',
                  'Scarica anche il file .json a fine test (copia di sicurezza)')

# ---------- 7) bootstrap -> avvio con login/sync ----------
vecchio_avvio = '''const ripristinato = caricaLocale();
renderHome();
if(ripristinato){
  $('nota-pool').textContent = `Bentornata! Progressi ripristinati automaticamente dal browser (ultimo salvataggio: ${stato.salvatoAlle || '—'}).`;
}
</script>'''
nuovo_avvio = '''// ================== AVVIO / ACCOUNT / SINCRONIZZAZIONE ==================
const CFG = window.OCF_CFG || {};
const cloudAttivo = CFG.SUPABASE_URL && !CFG.SUPABASE_URL.includes('INCOLLA') && window.supabase;
let sb = null, utente = null, pushTimer = null, pushInCorso = false, pushDaRifare = false;

function setSync(statoSync, testo){
  const el = $('sync-stato');
  el.classList.remove('nascosto', 'fuori', 'errore');
  if(statoSync !== 'ok') el.classList.add(statoSync);
  $('sync-testo').textContent = testo;
}

function statoDaCaricare(remoto, locale){
  // vince chi ha più storia; a parità il remoto (più recente tra i dispositivi)
  if(!remoto) return locale;
  if(!locale) return remoto;
  return (locale.storico || []).length > (remoto.storico || []).length ? locale : remoto;
}

async function caricaCloud(){
  const { data, error } = await sb.from('progressi').select('stato').eq('user_id', utente.id).maybeSingle();
  if(error) throw error;
  return data ? data.stato : null;
}

async function pushCloud(){
  if(!cloudAttivo || !utente) return;
  if(pushInCorso){ pushDaRifare = true; return; }
  pushInCorso = true;
  setSync('fuori', 'salvataggio…');
  try{
    const { error } = await sb.from('progressi')
      .upsert({ user_id: utente.id, stato: stato, updated_at: new Date().toISOString() });
    if(error) throw error;
    setSync('ok', 'sincronizzato');
  }catch(e){
    setSync('errore', navigator.onLine ? 'errore di sync' : 'offline — riprovo');
  }
  pushInCorso = false;
  if(pushDaRifare){ pushDaRifare = false; pushCloud(); }
}
function pushCloudDebounce(){
  if(!cloudAttivo || !utente) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(pushCloud, 1500);
}

// ogni salvataggio locale spinge anche sul cloud
const _salvaLocaleBase = salvaLocale;
salvaLocale = function(){
  const esito = _salvaLocaleBase();
  pushCloudDebounce();
  return esito;
};

window.addEventListener('online', () => { if(utente) pushCloud(); });
window.addEventListener('offline', () => { if(utente) setSync('fuori', 'offline'); });

function avviaApp(messaggio){
  renderHome();
  if(messaggio) $('nota-pool').textContent = messaggio;
}

async function dopoLogin(sessione){
  utente = sessione.user;
  $('velo-login').classList.add('nascosto');
  $('utente-email').textContent = (utente.email || '').split('@')[0];
  $('btn-esci').classList.remove('nascosto');
  setSync('fuori', 'carico…');
  const locale = caricaLocale() ? stato : null;
  let remoto = null;
  try{ remoto = await caricaCloud(); }catch(e){}
  const scelto = statoDaCaricare(remoto, locale);
  if(scelto) stato = normalizzaStato(JSON.parse(JSON.stringify(scelto)));
  if(stato.autosave === undefined) stato.autosave = false;   // online: il file .json è solo una copia extra
  _salvaLocaleBase();
  setSync('ok', 'sincronizzato');
  pushCloud();
  avviaApp('Bentornata! Progressi sincronizzati sul tuo account.');
}

async function avvio(){
  if(!cloudAttivo){
    // modalità locale (senza configurazione Supabase): come la versione offline
    const ripristinato = caricaLocale();
    avviaApp(ripristinato ? `Bentornata! Progressi ripristinati dal browser (ultimo salvataggio: ${stato.salvatoAlle || '—'}).` : '');
    return;
  }
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  const { data: { session } } = await sb.auth.getSession();
  if(session){ await dopoLogin(session); }
  else {
    $('velo-login').classList.remove('nascosto');
    renderHome();
  }
  sb.auth.onAuthStateChange((evento, sessione) => {
    if(evento === 'SIGNED_OUT'){ location.reload(); }
  });
}

$('btn-login').onclick = async () => {
  const email = $('login-email').value.trim();
  const pass = $('login-password').value;
  $('login-errore').textContent = '';
  if(!email || !pass){ $('login-errore').textContent = 'Inserisci email e password.'; return; }
  $('btn-login').disabled = true; $('btn-login').textContent = 'Accesso…';
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  $('btn-login').disabled = false; $('btn-login').textContent = 'Apri il registro';
  if(error){
    $('login-errore').textContent = 'Accesso non riuscito: controlla email e password.';
    return;
  }
  await dopoLogin(data.session);
};
$('login-password').addEventListener('keydown', e => { if(e.key === 'Enter') $('btn-login').click(); });
$('btn-esci').onclick = () => conferma('Vuoi uscire dall\\'account? I progressi restano salvati sul cloud.', async () => {
  clearTimeout(pushTimer);
  await pushCloud();
  await sb.auth.signOut();
});

if('serviceWorker' in navigator && location.protocol === 'https:'){
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

avvio();
</script>'''
assert vecchio_avvio in tpl
tpl = tpl.replace(vecchio_avvio, nuovo_avvio)

# ---------- 8) overlay login + script esterni prima di </body> ----------
login_html = '''
<div id="velo-login" class="velo nascosto">
  <div class="modale modale-login">
    <img src="icons/logo-64.png" alt="QuizzOcf" class="login-logo">
    <div class="login-marchio">Quizz<span class="rosso">Ocf</span></div>
    <div class="login-sub">Prova valutativa · banca dati 2026</div>
    <div class="campo">
      <label for="login-email">Email</label>
      <input type="email" id="login-email" autocomplete="username" inputmode="email" autocapitalize="none">
    </div>
    <div class="campo">
      <label for="login-password">Password</label>
      <input type="password" id="login-password" autocomplete="current-password">
    </div>
    <div id="login-errore"></div>
    <button class="btn-p" id="btn-login">Apri il registro</button>
    <div class="login-nota">I progressi si sincronizzano sul tuo account: puoi studiare dal telefono e riprendere dal computer. Gli account si creano dal pannello Supabase (vedi guida).</div>
  </div>
</div>
'''
tpl = tpl.replace('<script>\nconst QUESTIONS',
  login_html + '\n<script src="config.js"></script>\n<script src="data.js"></script>\n'
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>\n'
  '<script>\nconst QUESTIONS')

open('/home/claude/ocf-online/index.html', 'w', encoding='utf-8').write(tpl)

# ---------- data.js ----------
bank = json.load(open('/home/claude/questions.json'))
data = [{'n': q['num'], 't': q['argomento'], 'q': q['domanda'],
         'a': [q['A'], q['B'], q['C'], q['D']], 'e': 'ABCD'.index(q['es'])} for q in bank]
spieg = json.load(open('/home/claude/spiegazioni.json'))
truc = json.load(open('/home/claude/trucchi.json'))
sotto = json.load(open('/home/claude/sottoargomenti_ocf.json'))
def js(o): return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
open('/home/claude/ocf-online/data.js', 'w', encoding='utf-8').write(
    'window.OCF_DATA={QUESTIONS:' + js(data) + ',SPIEG:' + js(spieg) +
    ',TRUCCHI:' + js(truc) + ',SOTTO:' + js({'SA': sotto['SA'], 'map': sotto['map']}) + '};')

print('index.html e data.js creati')
import os
print('index:', round(os.path.getsize('/home/claude/ocf-online/index.html')/1024), 'KB, data:',
      round(os.path.getsize('/home/claude/ocf-online/data.js')/1e6, 2), 'MB')
