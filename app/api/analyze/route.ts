import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { createFoundryClient } from "@/lib/foundry";
import {
  EXTRACTION_SYSTEM_PROMPT,
  EXTRACTION_USER_PROMPT,
} from "@/lib/prompt";
import { freightDocumentSchema } from "@/lib/schema";

export const runtime = "nodejs";

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Mangler PDF-fil (felt: pdf)." },
        { status: 400 },
      );
    }

    const isPdf =
      ALLOWED_TYPES.has(file.type) ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Ugyldig filtype. Tillatt: PDF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "PDF-en er for stor (maks 20 MB)." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:application/pdf;base64,${buffer.toString("base64")}`;
    const filename =
      file.name.toLowerCase().endsWith(".pdf") && file.name.trim()
        ? file.name
        : "document.pdf";

    const apiMode = process.env.AZURE_FOUNDRY_API_MODE ?? "v1";
    if (apiMode === "legacy") {
      return NextResponse.json(
        {
          error:
            "PDF-analyse krever AZURE_FOUNDRY_API_MODE=v1 (Responses API). Legacy deployment-URL støttes ikke for filinput.",
        },
        { status: 500 },
      );
    }

    const { client, deployment } = createFoundryClient();

    const response = await client.responses.parse({
      model: deployment,
      instructions: EXTRACTION_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: EXTRACTION_USER_PROMPT },
            {
              type: "input_file",
              filename,
              file_data: dataUrl,
              detail: "high",
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(freightDocumentSchema, "freight_document"),
      },
    });

    const parsed = response.output_parsed;
    if (!parsed) {
      return NextResponse.json(
        { error: "Ingen strukturert respons fra modellen." },
        { status: 502 },
      );
    }

    const validated = freightDocumentSchema.parse(parsed);
    return NextResponse.json(validated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ukjent feil";

    if (message.startsWith("Mangler miljøvariabel")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (error instanceof OpenAI.APIError) {
      if (error.status === 404) {
        return NextResponse.json(
          {
            error:
              "Fant ikke Foundry-ressurs eller deployment (404). Sjekk AZURE_FOUNDRY_ENDPOINT (base-URL) og AZURE_FOUNDRY_DEPLOYMENT. For Foundry brukes v1-API som standard; sett AZURE_FOUNDRY_API_MODE=legacy kun ved eldre oppsett. PDF krever modell som støtter filinput (f.eks. gpt-4o).",
          },
          { status: 502 },
        );
      }

      const detail =
        typeof error.error === "object" &&
        error.error !== null &&
        "message" in error.error &&
        typeof error.error.message === "string"
          ? error.error.message
          : error.message;

      return NextResponse.json(
        { error: `Foundry-feil (${error.status}): ${detail}` },
        { status: 502 },
      );
    }

    console.error("Analyze failed:", message);
    return NextResponse.json(
      { error: "Analyse feilet. Sjekk Foundry-konfigurasjon og prøv igjen." },
      { status: 500 },
    );
  }
}
