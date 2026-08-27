import OpenAI from "openai";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Mangler miljøvariabel: ${name}`);
  }
  return value;
}

/**
 * Foundry portal sometimes copies full API paths (e.g. /openai/v1/responses).
 * The OpenAI SDK expects only the resource base URL.
 */
export function normalizeFoundryEndpoint(raw: string): string {
  let endpoint = raw.trim().replace(/\/$/, "");

  endpoint = endpoint.replace(/\/openai\/v1(?:\/.*)?$/i, "");
  endpoint = endpoint.replace(/\/openai\/deployments\/.*$/i, "");
  endpoint = endpoint.replace(/\/openai$/i, "");

  return endpoint;
}

export function getFoundryConfig() {
  const endpoint = normalizeFoundryEndpoint(requireEnv("AZURE_FOUNDRY_ENDPOINT"));
  const apiKey = requireEnv("AZURE_FOUNDRY_API_KEY");
  const deployment = requireEnv("AZURE_FOUNDRY_DEPLOYMENT");
  const apiVersion =
    process.env.AZURE_FOUNDRY_API_VERSION ?? "2024-10-21";

  return { endpoint, apiKey, deployment, apiVersion };
}

export function createFoundryClient(): {
  client: OpenAI;
  deployment: string;
} {
  const { endpoint, apiKey, deployment, apiVersion } = getFoundryConfig();
  const apiMode = process.env.AZURE_FOUNDRY_API_MODE ?? "v1";

  if (apiMode === "legacy") {
    const client = new OpenAI({
      apiKey,
      baseURL: `${endpoint}/openai/deployments/${deployment}`,
      defaultQuery: { "api-version": apiVersion },
      defaultHeaders: { "api-key": apiKey },
    });

    return { client, deployment };
  }

  // Foundry OpenAI v1 API — recommended for services.ai.azure.com resources.
  const client = new OpenAI({
    apiKey,
    baseURL: `${endpoint}/openai/v1`,
    defaultHeaders: { "api-key": apiKey },
  });

  return { client, deployment };
}
