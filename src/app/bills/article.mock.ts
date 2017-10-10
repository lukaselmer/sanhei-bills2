import { Article } from './article';

const article = {
  amount: 5,
  price: 150,
  catalogId: 'gn3if423g34g',
  description: 'O-Ring',
  dimension: '7x7'
};

export function articleVariant(attributes: Partial<Article> = {}): Article {
  return { ...article, ...attributes };
}
