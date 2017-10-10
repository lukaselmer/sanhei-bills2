import { Article } from './article';
import { BillArticle } from './bill-article';
import { CombinedBillArticle } from './combined-bill-article';

export class CombinedBillArticlesChangesExtractor {
  articlesToChangeAmount: CombinedBillArticle[];
  articlesToChangeArticleId: CombinedBillArticle[];
  articlesToDelete: BillArticle[];
  articlesToCreate: CombinedBillArticle[];
  articlesToChange: CombinedBillArticle[];
  private potentialArticleDeletions: Article[];
  definitiveArticleDeletions: Article[];

  constructor(
    private updatedArticles: CombinedBillArticle[],
    private existingArticles: CombinedBillArticle[],
    private articlesStore: Article[],
    private billArticlesStore: BillArticle[]
  ) { }

  processUpdatedArticles() {
    this.ignoreSameArticles();
    this.extractAmountChanges();
    this.extractPotentialArticleDeletions();
    this.extractArticleIdChanges();
    this.extractArticleDeletions();
    this.extractArticleCreations();
    this.extractArticleChanges();
    this.extractDefinitiveArticleDeletions();
  }

  private ignoreSameArticles() {
    this.updatedArticles = this.updatedArticles
      .map(article => {
        const index = this.existingArticles.findIndex(existingArticle => this.areArticlesEqual(article, existingArticle));
        if (index === -1) return { handled: false, article };
        this.existingArticles.splice(index, 1);
        return { handled: true, article };
      })
      .filter(wrapper => !wrapper.handled).map(wrapper => wrapper.article);
  }

  private areArticlesEqual(a: CombinedBillArticle, b: CombinedBillArticle): boolean {
    return a.amount === b.amount && this.areArticleDetailsEqual(a, b);
  }

  private extractAmountChanges() {
    const wrapped = this.updatedArticles.map(article => {
      const index = this.existingArticles.findIndex(existingArticle => this.areArticleDetailsEqual(article, existingArticle));
      if (index === -1) return { handled: false, article };
      this.existingArticles.splice(index, 1);
      article.billArticle = this.existingArticles[index].billArticle;
      return { handled: true, article };
    });
    this.articlesToChangeAmount = wrapped.filter(wrapper => wrapper.handled).map(wrapper => wrapper.article);
    this.updatedArticles = wrapped.filter(wrapper => !wrapper.handled).map(wrapper => wrapper.article);
  }

  private extractPotentialArticleDeletions() {
    this.potentialArticleDeletions = this.existingArticles.map(article => article.article as Article);
  }

  private extractArticleIdChanges() {
    const wrapped = this.updatedArticles.map(article => {
      const index = this.findIndexInArticlesStore(article);
      if (index === -1) return { handled: false, article };
      article.article = this.articlesStore[index];
      return { handled: true, article };
    });
    this.articlesToChangeArticleId = wrapped.filter(wrapper => wrapper.handled).map(wrapper => wrapper.article);
    this.updatedArticles = wrapped.filter(wrapper => !wrapper.handled).map(wrapper => wrapper.article);
  }

  private findIndexInArticlesStore(article: CombinedBillArticle) {
    return this.articlesStore.findIndex(existingArticle => this.areArticleDetailsEqual(article, existingArticle));
  }

  private areArticleDetailsEqual(a: CombinedBillArticle, b: CombinedBillArticle | Article): boolean {
    return a.catalogId === b.catalogId &&
      a.description === b.description &&
      a.dimension === b.dimension &&
      a.price === b.price;
  }

  private extractArticleDeletions() {
    while (this.updatedArticles.length < this.existingArticles.length) {
      const article = this.existingArticles.pop() as CombinedBillArticle;
      this.articlesToDelete.push(article.billArticle as BillArticle);
    }
  }

  private extractArticleCreations() {
    while (this.updatedArticles.length > this.existingArticles.length) {
      const combinedArticle = this.updatedArticles.pop() as CombinedBillArticle;
      const index = this.findIndexInArticlesStore(combinedArticle);
      if (index !== -1) combinedArticle.article = this.articlesStore[index];
      this.articlesToCreate.push(combinedArticle);
    }
  }

  private extractArticleChanges() {
    while (this.updatedArticles.length > 0) {
      const updatedArticle = this.updatedArticles.pop() as CombinedBillArticle;
      const existingArticle = this.existingArticles.pop() as CombinedBillArticle;
      updatedArticle.billArticle = existingArticle.billArticle as BillArticle;
      const index = this.findIndexInArticlesStore(updatedArticle);
      if (index !== -1) updatedArticle.article = this.articlesStore[index];
      this.articlesToChange.push(updatedArticle);
    }
  }

  private extractDefinitiveArticleDeletions() {
    const articleIdsStillInUse = ([] as (number | string)[]).concat(
      this.articlesToChangeArticleId.map(a => (a.article as Article).id),
      this.articlesToCreate.map(a => a.article ? a.article.id : undefined).filter(a => a).map((a: number | string) => a),
      this.articlesToChange.map(a => a.article ? a.article.id : undefined).filter(a => a).map((a: number | string) => a)
    );

    this.definitiveArticleDeletions = this.potentialArticleDeletions.filter(article =>
      this.billArticlesStore.filter(ba => ba.articleId === article.id).length === 1
    ).filter(article => {
      articleIdsStillInUse.includes(article.id);
    });
  }
}
