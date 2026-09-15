"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { FreightDocument } from "@/lib/types";
import {
  displayValue,
  formatQuantity,
  formatWeightKg,
} from "@/lib/format";
import styles from "./page.module.css";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<FreightDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!next) {
      setError("Kunne ikke lese filen. Prøv en PDF.");
      return;
    }

    const isPdf =
      next.type === "application/pdf" ||
      next.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Kun PDF er støttet.");
      return;
    }

    setFile(next);
    setResult(null);
    setError(null);
  }

  async function onAnalyze() {
    if (!file) {
      setError("Velg en PDF først.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body = new FormData();
      body.append("pdf", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body,
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Analyse feilet.";
        throw new Error(message);
      }

      setResult(data as FreightDocument);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.brand}>Norgesdekk</p>
          <span className={styles.brandAccent} aria-hidden="true" />
        </div>
        <h1 className={styles.headline}>Leveransedokument AI</h1>
        <p className={styles.subtitle}>
          Last opp PDF av fraktseddel eller leveransedokument. Hent ut
          produktnummer, antall/levert og vekt — klart for mottak. Ingenting
          lagres.
        </p>
      </header>

      <section className={styles.upload} aria-labelledby="upload-heading">
        <h2 id="upload-heading" className={styles.sectionTitle}>
          PDF
        </h2>

        <input
          ref={fileInputRef}
          className={styles.fileInputHidden}
          type="file"
          accept="application/pdf,.pdf"
          onChange={onFileChange}
          tabIndex={-1}
          aria-hidden="true"
        />

        <button
          type="button"
          className={styles.fileButton}
          onClick={openFilePicker}
        >
          Velg PDF
        </button>

        {file ? (
          <p className={styles.fileName}>{file.name}</p>
        ) : (
          <p className={styles.hint}>PDF — maks 20 MB</p>
        )}

        {previewUrl ? (
          <iframe
            className={styles.preview}
            src={previewUrl}
            title="Forhåndsvisning av leveransedokument"
          />
        ) : null}

        <button
          type="button"
          className={styles.analyzeButton}
          onClick={onAnalyze}
          disabled={!file || loading}
        >
          {loading ? "Analyserer…" : "Analyser"}
        </button>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </section>

      {result ? <ResultView document={result} /> : null}

      <footer className={styles.footer}>
        PoC for Norgesdekk AS — dekk &amp; felg grossist
      </footer>
    </div>
  );
}

function ResultView({ document }: { document: FreightDocument }) {
  return (
    <section className={styles.results} aria-labelledby="results-heading">
      <h2 id="results-heading" className={styles.sectionTitle}>
        Resultat
      </h2>

      <dl className={styles.docMeta}>
        <div>
          <dt>Leverandør</dt>
          <dd>{displayValue(document.supplier)}</dd>
        </div>
        <div>
          <dt>Dokumentnummer</dt>
          <dd>{displayValue(document.documentNumber)}</dd>
        </div>
        <div>
          <dt>Dato</dt>
          <dd>{displayValue(document.documentDate)}</dd>
        </div>
        <div>
          <dt>Ordrenummer</dt>
          <dd>{displayValue(document.orderNumber)}</dd>
        </div>
      </dl>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Produkt</th>
              <th scope="col">Produktnr. / artikkelnr.</th>
              <th scope="col" className={styles.numeric}>
                Antall / levert
              </th>
              <th scope="col" className={styles.numeric}>
                Vekt
              </th>
              <th scope="col">Batch</th>
              <th scope="col" className={styles.numeric}>
                Kolli
              </th>
            </tr>
          </thead>
          <tbody>
            {document.items.length === 0 ? (
              <tr>
                <td colSpan={6}>Ingen varelinjer funnet</td>
              </tr>
            ) : (
              document.items.map((item, index) => (
                <tr key={`${item.productNumber ?? "row"}-${index}`}>
                  <td>{displayValue(item.productName)}</td>
                  <td>{displayValue(item.productNumber)}</td>
                  <td className={styles.numeric}>
                    {formatQuantity(item.quantity, item.quantityUnit)}
                  </td>
                  <td className={styles.numeric}>
                    {formatWeightKg(item.netWeightKg)}
                  </td>
                  <td>{displayValue(item.batchNumber)}</td>
                  <td className={styles.numeric}>
                    {displayValue(item.packageCount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <dl className={styles.totals}>
        <div>
          <dt>Totalt antall kolli</dt>
          <dd>{displayValue(document.totalPackageCount)}</dd>
        </div>
        <div>
          <dt>Total nettovekt</dt>
          <dd>{formatWeightKg(document.totalWeightKg)}</dd>
        </div>
      </dl>

      <details className={styles.rawJson}>
        <summary>Rå JSON</summary>
        <pre>{JSON.stringify(document, null, 2)}</pre>
      </details>
    </section>
  );
}
