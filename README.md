# Registro OCF — Simulatore quiz online

App di studio per la prova valutativa OCF, costruita sulla banca dati ufficiale di gennaio 2026 (4.995 domande).

- **Frontend**: app statica (questo repository), pubblicata con GitHub Pages
- **Account e progressi**: [Supabase](https://supabase.com) (login email+password, sincronizzazione tra dispositivi)
- **PWA**: installabile su iPhone con "Aggiungi alla schermata Home", funziona anche offline

## Funzioni
Test da 60 domande con mix regolabile nuove/sbagliate · ripasso distanziato (gli errori tornano ogni 4-5 test, escono dopo 2 risposte esatte) · filtri per argomento e per i 15 sottoargomenti OCF di matematica · simulazione d'esame (85 minuti) · allenamento PRO · dashboard, ripasso, ricerca, dispensa di matematica con spiegazioni e trucchi AI · obiettivo giornaliero.

## Messa online
Segui la **GUIDA.md** (passo-passo, tutto via browser). In sintesi:
1. Progetto Supabase → esegui `supabase/schema.sql` → crea i 2 utenti → copia URL e anon key
2. Incolla i due valori in `config.js`
3. Pubblica il repository con GitHub Pages

Finché `config.js` contiene i segnaposto, l'app funziona in modalità locale (senza login).

*Solo per uso personale di studio. La banca dati è pubblicata da OCF (organismocf.it).*
