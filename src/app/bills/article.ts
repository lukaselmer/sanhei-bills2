export class Article {
  id: number;
  price: number;

  inCatalog: boolean;

  catalogId: string;
  description: string;
  dimension: string;

  // datetime format: 2010-04-23 14:35:57 UTC
  createdAt: string;
  updatedAt: string;
}
