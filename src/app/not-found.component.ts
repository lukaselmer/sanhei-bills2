import { Component } from '@angular/core';

@Component({
  template: `<h1>Page not found</h1>
  <a [routerLink]="['/bills']">Home</a>`
})
export class PageNotFoundComponent { }
