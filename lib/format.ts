const NOT_FOUND = "Ikke funnet";

export function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return NOT_FOUND;
  }
  return String(value);
}

export function formatQuantity(
  quantity: number | null,
  quantityUnit: string | null,
): string {
  if (quantity === null && !quantityUnit) {
    return NOT_FOUND;
  }
  if (quantity !== null && quantityUnit) {
    return `${formatNumber(quantity)} ${quantityUnit}`;
  }
  if (quantity !== null) {
    return formatNumber(quantity);
  }
  return quantityUnit ?? NOT_FOUND;
}

export function formatWeightKg(value: number | null): string {
  if (value === null) {
    return NOT_FOUND;
  }
  return `${formatNumber(value)} kg`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("nb-NO").format(value);
}

export { NOT_FOUND };
