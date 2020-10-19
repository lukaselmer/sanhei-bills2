import { browser, by, element } from 'protractor'

export class SanheiBills2Page {
  navigateTo() {
    return browser.get('/')
  }

  getParagraphText() {
    return element(by.css('sb-root h1')).getText()
  }
}
