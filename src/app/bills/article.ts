export class Article {
  id: string;
  price: number;

  inCatalog: boolean;

  catalogId: string;
  description: string;
  dimension: string;

  // timestamp * 1000 format: 1272033357000 (for 2010-04-23 14:35:57 UTC)
  // see https://firebase.google.com/docs/database/web/offline-capabilities
  // firebase.database.ServerValue.TIMESTAMP
  createdAt: number;
  updatedAt: number;
  deletedAt: number | undefined;
}
