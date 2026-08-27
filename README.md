# Fraktseddel AI-ekstraksjon PoC

Next.js-app som leser bilde av en fraktseddel via multimodal modell i Azure AI Foundry og viser strukturerte data. Ingen data lagres.

## Forutsetninger

- Node.js 20+
- Azure AI Foundry-prosjekt med en multimodal deployment (f.eks. `gpt-4o` eller `gpt-4.1`)

## Oppsett

```bash
npm install
cp .env.example .env.local
```

Fyll inn i `.env.local`:

| Variabel | Beskrivelse |
| --- | --- |
| `AZURE_FOUNDRY_ENDPOINT` | Base-URL fra «Keys and Endpoint» — **ikke** full API-sti |
| `AZURE_FOUNDRY_API_KEY` | API-nøkkel |
| `AZURE_FOUNDRY_DEPLOYMENT` | Deployment-navn for multimodal modell |
| `AZURE_FOUNDRY_API_MODE` | `v1` (standard) eller `legacy` for eldre deployment-URL |
| `AZURE_FOUNDRY_API_VERSION` | Kun for `legacy`-modus (f.eks. `2024-10-21`) |

## Kjøring

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000), velg eller ta bilde av en fraktseddel, og trykk **Analyser**.

## Flyt

1. Velg / ta bilde
2. Analyser via `POST /api/analyze`
3. Vis dokumentinfo, varelinjer, summer og rå JSON

## Scope

Inkludert: bilde → AI-ekstraksjon → strukturert `FreightDocument` → visning.

Ikke inkludert: produktordre, sammenligning, mottakskontroll, lagring, Maritech.

## Feilsøking

### 404 Resource not found

Dette kommer som regel fra Azure/Foundry, ikke fra Next.js-ruten `/api/analyze`.

Sjekk:

1. **Endpoint** — skal være base-URL, f.eks. `https://<resource>.services.ai.azure.com`  
   Ikke bruk stier som `/openai/v1/responses` fra Foundry-portalen.
2. **Deployment** — `AZURE_FOUNDRY_DEPLOYMENT` må matche deployment-navnet nøyaktig (f.eks. `gpt-4o`, ikke modell-ID).
3. **API-versjon** — for Foundry med `services.ai.azure.com` brukes v1-API automatisk. Ikke sett `2025-12-11` med legacy-modus; det gir 404.

Start dev-server på nytt etter endringer i `.env.local`.
