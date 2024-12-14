import 'rxjs/add/operator/count'
import { articleVariant } from '../../article.mock'
import { billVariant } from '../../bill.mock'
import { IBillingDatabase } from '../../store/billing-database'
import { ArticlesService } from './articles.service'
import { of } from 'rxjs'

describe('BillsService', () => {
  let service: ArticlesService
  const billMock1 = billVariant({
    id: '1',
    uid: 1001,
    address: 'A street\nSomething',
    articles: [
      articleVariant(),
      articleVariant({
        description: 'Other',
      }),
    ],
  })
  const billMock2 = billVariant({
    id: '2',
    uid: 1002,
    address: 'Mr\nHello\nSomething else\nWorld',
  })
  const billsMock = [billMock1, billMock2]
  const db: IBillingDatabase = {
    bills: {
      1: billMock1,
      2: billMock2,
    },
  }
  const dataStoreServiceMock: any = {
    loadData: () => undefined,
    getBillsStream: () => of(billsMock),
    status: 'loaded',
    store: () => db,
  }

  beforeEach(() => {
    spyOn(dataStoreServiceMock, 'loadData')
    service = new ArticlesService(dataStoreServiceMock)
  })
})
