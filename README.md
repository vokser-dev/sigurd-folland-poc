# Norgesdekk — Leveransedokument AI (PoC)

Next.js-app for **Norgesdekk** som leser PDF av fraktseddel/leveransedokument via Azure AI Foundry og viser strukturerte data (produktnummer, antall/levert, vekt m.m.). Ingen data lagres.

## Forutsetninger

- Node.js 20+
- Azure AI Foundry-prosjekt med en deployment som støtter PDF-filinput (f.eks. `gpt-4.1` eller `gpt-5.x`)
- Foundry **v1**-API (`AZURE_FOUNDRY_API_MODE=v1` / standard) — Responses API brukes for PDF

## Oppsett

```bash
npm install
cp .env.example .env.local
```

Fyll inn i `.env.local`:

| Variabel | Beskrivelse |
| --- | --- |
| `AZURE_FOUNDRY_ENDPOINT` | Base-URL / project-endpoint fra Foundry |
| `AZURE_FOUNDRY_API_KEY` | API-nøkkel |
| `AZURE_FOUNDRY_DEPLOYMENT` | Deployment-navn for modell med filstøtte |
| `AZURE_FOUNDRY_API_MODE` | `v1` (standard). PDF via Responses API krever v1 |
| `AZURE_FOUNDRY_API_VERSION` | Kun for `legacy`-modus (anbefales ikke for PDF) |

## Kjøring

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000), last opp en PDF, og trykk **Analyser**.

## Flyt

1. Velg PDF
2. Analyser via `POST /api/analyze` (Responses API `input_file` + strukturert schema)
3. Vis dokumentinfo, varelinjer (produktnummer / antall/levert / vekt), summer og rå JSON

## PDF-tolkning i Foundry

PoC-en bruker **Responses API** med `input_file` (base64). Foundry sender både uttrukket tekst og siderendring til modellen.

| Formål | Anbefaling |
| --- | --- |
| PoC / fleksible leveransedokumenter | Responses API + `input_file` (nåværende) |
| Modell | `gpt-4.1` eller nyere vision-modell (`gpt-5.x`) |
| Mer robust tabell/OCR i prod | Azure **Document Intelligence** (`prebuilt-layout`) eller **Content Understanding** |

## Scope

Inkludert: PDF → AI-ekstraksjon → strukturert `FreightDocument` → visning.

Ikke inkludert: ordre-sammenligning, mottakskontroll, lagring, ERP-integrasjon.

## Feilsøking

### 404 Resource not found

Sjekk endpoint (base-/project-URL), deployment-navn og at v1-API brukes. Start dev-server på nytt etter endringer i `.env.local`.
