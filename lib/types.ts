export interface FreightDocumentItem {
  productName: string | null;
  /** Produktnummer / artikkelnummer */
  productNumber: string | null;
  batchNumber: string | null;

  /** Antall / levert */
  quantity: number | null;
  quantityUnit: string | null;

  packageCount: number | null;
  /** Vekt i kilogram */
  netWeightKg: number | null;
}

export interface FreightDocument {
  supplier: string | null;
  documentNumber: string | null;
  documentDate: string | null;

  /**
   * Produktordre, purchase order, PO number,
   * bestillingsnummer eller tilsvarende referanse.
   */
  orderNumber: string | null;

  items: FreightDocumentItem[];

  totalPackageCount: number | null;
  totalWeightKg: number | null;
}
