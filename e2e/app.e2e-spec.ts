import { SanheiBills2Page } from './app.po'

describe('sanhei-bills2 App', () => {
  let page: SanheiBills2Page

  beforeEach(() => {
    page = new SanheiBills2Page()
  })

  it('should display welcome message', () => {
    page.navigateTo()
    expect(page.getParagraphText()).toEqual('Welcome to sb!!')
  })
})
