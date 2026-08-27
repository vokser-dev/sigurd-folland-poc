export interface FreightDocumentItem {
  productName: string | null;
  productNumber: string | null;
  batchNumber: string | null;

  quantity: number | null;
  quantityUnit: string | null;

  packageCount: number | null;
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
