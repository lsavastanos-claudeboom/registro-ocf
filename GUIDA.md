# Guida alla pubblicazione (passo-passo, senza terminale)

Tempo totale: circa 30 minuti. Servono: un account GitHub, un account Supabase (entrambi gratuiti).

## 1. Supabase — database e account (15 min)

1. Vai su **supabase.com** → *Start your project* → registrati (basta l'email o il login GitHub).
2. *New project*: scegli un nome (es. `registro-ocf`), una password per il database (conservala ma non ti servirà più), regione **West EU**. Attendi 1-2 minuti che il progetto sia pronto.
3. **Crea le tabelle**: nel menu a sinistra apri **SQL Editor** → *New query* → incolla tutto il contenuto del file `supabase/schema.sql` di questo repository → premi **Run**. Deve dire "Success".
4. **Disattiva le registrazioni pubbliche**: menu **Authentication → Sign In / Up** (o *Providers → Email*): spegni l'interruttore **Allow new users to sign up**. Così potete entrare solo voi due.
5. **Crea i due utenti**: menu **Authentication → Users** → *Add user* → *Create new user*:
   - inserisci email e una password a scelta (ditela solo a voi!)
   - spunta **Auto Confirm User** ✔
   - ripeti per il secondo utente.
6. **Copia le chiavi**: menu **Project Settings** (ingranaggio) → **API**:
   - copia **Project URL** (es. `https://abcd1234.supabase.co`)
   - copia la chiave **anon public** (una stringa lunga).

## 2. Configura l'app (2 min)

Apri il file `config.js` e sostituisci i due segnaposto:

```js
window.OCF_CFG = {
  SUPABASE_URL: 'https://abcd1234.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOi...'
};
```

(La chiave *anon* è pensata per stare nel codice pubblico: la sicurezza la fanno le regole RLS del database, già impostate dallo schema.)

## 3. GitHub — pubblica il sito (10 min)

1. Vai su **github.com** → registrati → *New repository*:
   - nome: `registro-ocf`
   - visibilità: **Public** (per usare GitHub Pages gratuitamente; nel codice non c'è nulla di segreto — la chiave `anon` è fatta per essere pubblica).
2. Nella pagina del repository: **uploading an existing file** (o *Add file → Upload files*) → trascina **tutti i file di questa cartella** (compresa la cartella `icons/` e `supabase/`) → *Commit changes*.
   - Se il trascinamento delle cartelle non funziona, caricale una alla volta.
3. **Attiva GitHub Pages**: *Settings → Pages* → in "Branch" scegli `main` e cartella `/ (root)` → *Save*.
4. Dopo 1-2 minuti il sito è online su: `https://TUONOME.github.io/registro-ocf/`

## 4. Su iPhone: installala come app (1 min)

1. Apri l'indirizzo in **Safari**.
2. Tocca il tasto **Condividi** (quadrato con freccia) → **Aggiungi alla schermata Home**.
3. Ora hai l'icona "Registro OCF": si apre a tutto schermo come una vera app e funziona anche senza connessione (i progressi si sincronizzano appena torna la rete).

## 5. Primo accesso

- Apri il sito → schermata di login → email e password dell'utente creato al punto 1.5.
- Se avevi progressi nella versione offline: entra, poi usa **Carica progressi** e scegli il tuo file `.json` — verranno sincronizzati sul cloud.

## Problemi comuni

- **"Accesso non riuscito"** → controlla che l'utente esista in Authentication → Users e che la password sia giusta; verifica che in `config.js` URL e chiave siano quelli del TUO progetto.
- **La pagina resta bianca** → assicurati che `data.js` sia stato caricato su GitHub (è il file più grande, ~3,6 MB).
- **Pages non si attiva** → il repository dev'essere Public e il file `index.html` deve stare nella radice (non dentro una sottocartella).
- **Aggiornare l'app in futuro** → sostituisci i file nel repository (Upload files → sovrascrivi): il sito si aggiorna da solo in 1-2 minuti.
