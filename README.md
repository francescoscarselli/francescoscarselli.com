# francescoscarselli.com

Il sito è fatto di file HTML normali. Non c'è niente da installare, niente da
compilare: si apre un file, si cambia il testo, si salva, si carica su GitHub e
il sito è aggiornato in un minuto.

## Dove sta cosa

| Voglio cambiare | Apro |
| --- | --- |
| La home in italiano | `index.html` |
| La home in inglese | `en/index.html` |
| La biografia e l'elenco dei premi | `biografia.html` e `en/biography.html` |
| I dischi e le tracce | `discografia.html` e `en/discography.html` |
| I video | `video.html` e `en/videos.html` |
| Colori, caratteri, spaziature | `assets/css/site.css` |

Ogni modifica va fatta **in entrambe le lingue**: sono due file separati apposta,
perché Google indicizzi anche la versione inglese.

## Le cose che farai più spesso

### Aggiungere una novità alla sezione "In corso"

In `index.html` cerca `<div class="diario">`. Copia uno dei blocchi `<article>`
e mettilo **per primo**, perché l'ordine è dal più recente al più vecchio:

```html
<article>
  <p class="minuto">marzo 2027</p>
  <div>
    <h3>Titolo della novità</h3>
    <p>Due o tre righe che raccontano di cosa si tratta.</p>
  </div>
</article>
```

Se vuoi una fotografia, copia il blocco `<picture>` dal primo articolo e cambia
il nome del file. La fotografia la mette solo la novità più recente: se la metti
a tutte, non risalta più niente.

Poi fai la stessa cosa in `en/index.html`.

### Cambiare il disco in evidenza

In `index.html` cerca `<section class="disco"`. Dentro ci sono la copertina, il
titolo, l'anno e l'elenco delle tracce. Cambia quelli, e cambia l'indirizzo del
pulsante "Ascolta l'album intero" con il collegamento push.fm del disco nuovo.

Il disco vecchio non va buttato: spostalo in `discografia.html`, dove stanno
tutti.

### Aggiungere gli estratti da ascoltare

Servono file **mp3**, uno per traccia, da 30 a 60 secondi. Mettili in
`assets/audio/` con nomi semplici, senza accenti né spazi — per esempio
`valentango.mp3`.

Poi, nella riga della traccia, scrivi il nome del file dentro `data-src`:

```html
<li><button type="button" data-src="assets/audio/valentango.mp3" data-duration="228">
```

`data-duration` è la durata in secondi (3 minuti e 48 fa 228).

Finché `data-src` resta vuoto, la traccia non è cliccabile e compare l'avviso
che gli estratti arrivano presto: il sito funziona lo stesso.

### Cambiare o aggiungere fotografie

Metti gli originali in `assets/img/src/` e lancia:

```
./tools/build-images.sh
```

Lo script fa tutto: le vira in bianco e nero caldo, le ridimensiona nelle misure
che servono e prepara anche la versione leggera in WebP. Le copertine dei dischi
(i file che iniziano per `cover-`) le lascia a colori.

Gli originali non finiscono su GitHub: restano solo sul tuo computer.

Se vuoi ritagliare un dettaglio da una fotografia, in cima allo script c'è
l'elenco `ritagli`: ogni riga dice come si chiamerà il ritaglio, da quale foto
viene e quale porzione prendere.

## Prima di pubblicare

Lancia sempre:

```
python3 tools/check.py
```

Controlla i collegamenti rotti, le descrizioni mancanti, le fotografie senza
testo alternativo e le pagine che si sono disallineate fra loro. Se stampa
`0 problemi`, si può pubblicare.

Per vedere il sito sul tuo computer prima di metterlo online:

```
python3 -m http.server 8000
```

poi apri `http://localhost:8000` nel browser.

## Come è pubblicato

Il sito sta su GitHub Pages, gratis. Ogni volta che carichi le modifiche su
GitHub, il sito si aggiorna da solo dopo un minuto.

Finché i DNS del dominio puntano al vecchio sito, l'indirizzo è
`francescoscarselli.github.io/francescoscarselli.com`. Quando si passa al
dominio vero, il file `docs/CNAME-da-attivare` va spostato nella cartella
principale e rinominato `CNAME`: da quel momento GitHub serve il sito su
`francescoscarselli.com`.

Non c'è nessun tracciamento e nessun cookie: per questo non c'è la fascia dei
cookie da accettare. Nessun dato di chi visita il sito viene raccolto.

## Se qualcosa si rompe

Il sito è scritto in modo che ogni pezzo funzioni anche se un altro si rompe.
Senza JavaScript, i collegamenti funzionano lo stesso e la musica semplicemente
riparte a ogni pagina. Senza le fotografie, restano i testi.

Per tornare indietro a com'era prima, su GitHub ogni modifica resta registrata e
si può annullare.
