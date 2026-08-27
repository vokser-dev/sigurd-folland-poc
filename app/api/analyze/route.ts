import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { createFoundryClient } from "@/lib/foundry";
import {
  EXTRACTION_SYSTEM_PROMPT,
  EXTRACTION_USER_PROMPT,
} from "@/lib/prompt";
import { freightDocumentSchema } from "@/lib/schema";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Mangler bildefil (felt: image)." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Ugyldig filtype. Tillatt: JPEG, PNG eller WebP.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Bildet er for stort (maks 10 MB)." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type === "image/jpg" ? "image/jpeg" : file.type;
    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const { client, deployment } = createFoundryClient();

    const completion = await client.chat.completions.parse({
      model: deployment,
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_USER_PROMPT },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(
        freightDocumentSchema,
        "freight_document",
      ),
    });

    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed) {
      const refusal = completion.choices[0]?.message?.refusal;
      return NextResponse.json(
        {
          error: refusal
            ? `Modellen avviste forespørselen: ${refusal}`
            : "Ingen strukturert respons fra modellen.",
        },
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
              "Fant ikke Foundry-ressurs eller deployment (404). Sjekk AZURE_FOUNDRY_ENDPOINT (base-URL) og AZURE_FOUNDRY_DEPLOYMENT. For Foundry brukes v1-API som standard; sett AZURE_FOUNDRY_API_MODE=legacy kun ved eldre oppsett.",
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
