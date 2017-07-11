import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'sb-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent {
  @Input()
  user: firebase.User;

  showDetails = false;

  constructor(private auth: AngularFireAuth) { }

  toggle() {
    this.showDetails = !this.showDetails;
  }

  logout() {
    this.auth.auth.signOut();
  }
}
