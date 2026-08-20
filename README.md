# Stagekosten Málaga

Een budget- en bonnetjesapp voor leerlingen van het zesde jaar die op buitenlandse stage gaan (Erasmus+, Málaga). De leerling houdt op zijn telefoon zijn stagekosten bij (foto van het bonnetje of handmatig), ziet hoeveel er van zijn dagtoelage en totaalbudget overblijft, en dient aan het einde van de stage één keer een dossier in. De begeleidende leerkracht volgt in een webdashboard wie ingediend heeft en wie onvolledige bonnetjes heeft, en exporteert per leerling of per klas een PDF-dossier voor de Erasmus+-verantwoording.

Gebouwd volgens de designhandoff in `design_handoff_stagekosten/`: React + Vite als PWA (offline-first, "zet op beginscherm"), met een leerlingapp (mobiel) en een leerkrachtdashboard (desktop) in dezelfde codebase.

## Live bekijken

Deze repo bevat een GitHub Actions-workflow (`.github/workflows/deploy-pages.yml`) die de app automatisch bouwt en publiceert op **GitHub Pages** bij elke push naar `main` of `claude/apps-maken-vqpam8`. Eenmalig instellen:

1. Ga op GitHub naar **Settings → Pages** van deze repo.
2. Zet bij **Source** de waarde op **GitHub Actions**.
3. Wacht tot de workflow onder het tabblad **Actions** groen is (duurt ~1 minuut) — de link staat dan bovenaan die workflow-run, en ziet er zo uit: `https://nicolasdevloo.github.io/Kosten_Leerlingen_Malaga/`.

Die link werkt meteen op telefoon en laptop, kan je delen, en kan op een gsm-beginscherm gezet worden zoals in de app zelf beschreven staat.

## Starten (lokaal)

```bash
npm install
npm run dev       # ontwikkelserver, http://localhost:5173
npm run build     # productiebuild naar dist/
npm run preview   # de build lokaal bekijken
```

Bij de eerste keer opstarten wordt de app gevuld met enkel de stage-configuratie "Málaga 2027" (budget, dagtoelage), zonder leerlingen — die voegt de leerkracht toe via "Leerlingen uitnodigen". Data wordt in IndexedDB bewaard, dus wijzigingen overleven een herlaad. Ga naar **/** voor een knop naar het leerkrachtdashboard en om de data te resetten.

## Routes

| Route | Wat |
|---|---|
| `/` | Landingspagina met een knop naar het leerkrachtdashboard en om de data te resetten. |
| `/y/:payload` | Persoonlijke link van een leerling (naam, klas en stage-instellingen zitten gecodeerd in `:payload`): identiteit bevestigen, "zet op beginscherm", daarna naar de app. Werkt op elk toestel, ook een dat de app nog nooit opende. |
| `/app` | Leerlingapp (mobiel): dashboard, bonnetjes, bonnetje toevoegen/afmaken, indienen, profiel. |
| `/leerkracht` | Klasoverzicht met filters en detailpaneel per leerling. |
| `/leerkracht/leerlingen` | Stageperiode instellen, klas kiezen, namen plakken of een CSV/TXT-klaslijst slepen, links en QR-codes genereren. |
| `/dossier/:studentId` | Printbaar PDF-dossier van één leerling (`window.print()` → "Opslaan als PDF"). |
| `/dossier/klas/:klas` | Alle dossiers van een klas na elkaar (gebruik `alle` voor de hele stage), elk op een nieuwe pagina. |

## Architectuur

- **React + TypeScript + Vite**, geen backend: alle state zit in één Zustand-store (`src/data/store.ts`), gepersisteerd in IndexedDB via `idb-keyval` (`src/data/idbStorage.ts`) zodat bonnetjes en foto's (als data-URL) ook echt offline bewaard blijven, per toestel.
- **Kernregels** (dagtoelage €30, mag overschreden worden; totaalbudget €420, mag niet; categorieën Eten/Vervoer/Ontspanning; onvolledig bonnetje blokkeert indienen) zitten in `src/data/selectors.ts`, los van de UI.
- **Design tokens** (kleuren, radii, typografie, schaduw) uit de handoff staan in `tailwind.config.js`.
- **PWA**: `vite-plugin-pwa` genereert het manifest en een service worker, zodat "zet op beginscherm" echt een installeerbare app oplevert.
- **PDF-dossier**: geen PDF-library — de dossierpagina is gewone HTML/CSS, en de knop "Afdrukken / opslaan als PDF" gebruikt de browser-printfunctie (`window.print()`).

## Hoe leerling en leerkracht data delen zonder server

Er is bewust géén live backend (geen account/database om te beheren). In plaats daarvan:

1. **De persoonlijke link is zelf de "database".** Wanneer de leerkracht een leerling toevoegt, wordt de link niet enkel een kaal token — naam, klas én de volledige stage-instellingen (budget, dagtoelage, periode, school, begeleider) zitten er base64-gecodeerd in (`src/lib/linkPayload.ts`). Een leerling die de link op zijn eigen telefoon opent, heeft dus meteen alles wat nodig is, ook al heeft dat toestel nooit met de leerkracht gecommuniceerd. Een link opnieuw aanmaken (nieuw token) maakt de oude automatisch ongeldig.
2. **Elke leerling houdt zijn eigen bonnetjes lokaal bij**, offline-first, tijdens de hele stage — dit is precies zoals eerder, gewoon zonder live synchronisatie naar het dashboard (bewust: dat hoeft niet, is met de leerkracht afgesproken).
3. **"Indienen" is achteraf, door de leerling zelf.** Bij het indienen genereert de app een klein dossierbestand (`src/lib/dossierExport.ts`, een `.json`) met naam, klas en alle bonnetjes. De leerling deelt dat bestand naar de leerkracht (via de systeem-deelknop op de telefoon, of gewoon downloaden en doorsturen per WhatsApp/mail), samen met de PDF voor de Erasmus+-papieren.
4. **De leerkracht importeert dat bestand** via "Dossierbestand importeren" in het dashboard — de leerling verschijnt dan met zijn echte bonnetjes in de tabel, telt mee in de Excel-export en het klasse-PDF.

Dit is een bewuste, eenvoudigere keuze dan een echte cloud-database: geen account, geen kosten, geen server om te onderhouden — wel betekent het dat de leerkracht pas na het indienen (niet live tijdens de reis) de echte bonnetjes van een leerling ziet.

## Wat nog beperkt is

- **OCR van het bonnetjesbedrag** is een simulatie (een plausibel bedrag na het nemen van een foto), altijd corrigeerbaar door de leerling.
- **Mailen van links.** De knop "Links mailen" staat er (zoals in de handoff, waar het mailtemplate ook nog niet ontworpen was) maar verstuurt niets — kopieer de link of toon de QR-code in plaats daarvan.
- **Klaslijst-import (CSV/Excel).** Ondersteunt platte CSV/TXT (naam per lijn, of naam als eerste kolom); een echte .xlsx-parser is niet meegenomen.

## Open punten (zoals in de handoff)

- De stageperiode ligt bij oplevering niet vast; de leerkracht stelt die in via "Leerlingen uitnodigen" → de app werkt ook met een lege periode.
- Eén PDF met de dossiers van een hele klas: gebouwd (`/dossier/klas/:klas`), elk dossier op een eigen pagina.
- Mailtemplate voor het versturen van de links: nog niet ontworpen/gebouwd.
