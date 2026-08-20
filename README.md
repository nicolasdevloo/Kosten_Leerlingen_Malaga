# Stagekosten Málaga

Een budget- en bonnetjesapp voor leerlingen van het zesde jaar die op buitenlandse stage gaan (Erasmus+, Málaga). De leerling houdt op zijn telefoon zijn stagekosten bij (foto van het bonnetje of handmatig), ziet hoeveel er van zijn dagtoelage en totaalbudget overblijft, en dient aan het einde van de stage één keer een dossier in. De begeleidende leerkracht volgt in een webdashboard wie ingediend heeft en wie onvolledige bonnetjes heeft, en exporteert per leerling of per klas een PDF-dossier voor de Erasmus+-verantwoording.

Gebouwd volgens de designhandoff in `design_handoff_stagekosten/`: React + Vite als PWA (offline-first, "zet op beginscherm"), met een leerlingapp (mobiel) en een leerkrachtdashboard (desktop) in dezelfde codebase.

## Starten

```bash
npm install
npm run dev       # ontwikkelserver, http://localhost:5173
npm run build     # productiebuild naar dist/
npm run preview   # de build lokaal bekijken
```

Bij de eerste keer opstarten wordt de app gevuld met voorbeelddata: de stage "Málaga 2026", 25 leerlingen verdeeld over 6AD/6BO/6CO/6OOS/6TC en willekeurige bonnetjes. Die data wordt daarna in IndexedDB bewaard, dus wijzigingen (nieuwe bonnetjes, ingediende dossiers, aangepaste periode…) overleven een herlaad. Ga naar **/** voor een overzicht met alle demo-leerlinglinks en een knop om de demodata te resetten.

## Routes

| Route | Wat |
|---|---|
| `/` | Dev-landing: links naar alle demo-leerlingen en het leerkrachtdashboard (bestaat enkel voor deze demo — in productie start een leerling altijd via zijn persoonlijke link). |
| `/y/:token` | Persoonlijke link van een leerling: identiteit bevestigen, "zet op beginscherm", daarna naar de app. |
| `/app` | Leerlingapp (mobiel): dashboard, bonnetjes, bonnetje toevoegen/afmaken, indienen, profiel. |
| `/leerkracht` | Klasoverzicht met filters en detailpaneel per leerling. |
| `/leerkracht/leerlingen` | Stageperiode instellen, klas kiezen, namen plakken of een CSV/TXT-klaslijst slepen, links en QR-codes genereren. |
| `/dossier/:studentId` | Printbaar PDF-dossier van één leerling (`window.print()` → "Opslaan als PDF"). |
| `/dossier/klas/:klas` | Alle dossiers van een klas na elkaar (gebruik `alle` voor de hele stage), elk op een nieuwe pagina. |

## Architectuur

- **React + TypeScript + Vite**, geen backend: alle state zit in één Zustand-store (`src/data/store.ts`), gepersisteerd in IndexedDB via `idb-keyval` (`src/data/idbStorage.ts`) zodat bonnetjes en foto's (als data-URL) ook echt offline bewaard blijven.
- **Kernregels** (dagtoelage €30, mag overschreden worden; totaalbudget €420, mag niet; categorieën Eten/Vervoer/Ontspanning; onvolledig bonnetje blokkeert indienen) zitten in `src/data/selectors.ts`, los van de UI, zodat ze op één plek getest en aangepast kunnen worden.
- **Design tokens** (kleuren, radii, typografie, schaduw) uit de handoff staan in `tailwind.config.js`.
- **PWA**: `vite-plugin-pwa` genereert het manifest en een service worker, zodat "zet op beginscherm" echt een installeerbare app oplevert.
- **PDF-dossier**: geen PDF-library — de dossierpagina is gewone HTML/CSS die er ook op scherm goed uitziet, en de knop "Afdrukken / opslaan als PDF" gebruikt de browser-printfunctie (`window.print()`), wat in alle browsers een correcte, selecteerbare PDF oplevert.

## Wat hier gesimuleerd is (geen backend)

Dit is een volledig werkende front-end volgens de designspecificatie, maar zonder server — alles staat lokaal op het toestel. Voor een echte uitrol met meerdere leerlingen/toestellen die dezelfde stage delen, is een backend nodig voor:

- **De persoonlijke link als sessie.** Nu genereert de browser zelf het token (`src/lib/token.ts`) en wordt alles in dezelfde lokale store bewaard; leerling en leerkracht "delen" dus in deze demo toestel-lokale data. In productie genereert de server het token (met echte 128-bit entropie), en synchroniseert elk toestel enkel zijn eigen bonnetjes naar de server.
- **Echte synchronisatie.** "Nu versturen" / de offlinestrook markeert bonnetjes nu enkel lokaal als "niet meer wachtend" — er is geen server om echt naartoe te versturen.
- **OCR van het bonnetjesbedrag.** Nu een simulatie (een plausibel bedrag na het kiezen van een foto), altijd corrigeerbaar door de leerling zoals in de spec gevraagd.
- **Mailen van links.** De knop "Links mailen" staat er (zoals in de handoff, waar het mailtemplate ook nog niet ontworpen was) maar verstuurt niets.
- **Klaslijst-import (CSV/Excel).** Ondersteunt platte CSV/TXT (naam per lijn, of naam als eerste kolom); een echte .xlsx-parser is niet meegenomen.

Functioneel — de validatieregels, offline-opslag-in-de-browser, PDF-export, filters, klas- en periodebeheer — werkt allemaal echt, alleen leeft de data per toestel/browser in plaats van op een gedeelde server.

## Open punten (zoals in de handoff)

- De stageperiode ligt bij oplevering niet vast; de leerkracht stelt die in via "Leerlingen uitnodigen" → de app werkt ook met een lege periode.
- Eén PDF met de dossiers van een hele klas: gebouwd (`/dossier/klas/:klas`), elk dossier op een eigen pagina.
- Mailtemplate voor het versturen van de links: nog niet ontworpen/gebouwd.
