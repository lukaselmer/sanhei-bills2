import { Article } from './article';

const article = {
  id: 2000,
  price: 150,
  inCatalog: true,
  catalogId: 'gn3if423g34g',
  description: 'O-Ring',
  dimension: '7x7',
  deletedAt: undefined,
  createdAt: new Date(2017, 5, 22).getTime(),
  updatedAt: new Date(2017, 5, 24).getTime()
};

export function articleVariant(attributes: Partial<Article> = {}): Article {
  return { ...article, ...attributes };
}
