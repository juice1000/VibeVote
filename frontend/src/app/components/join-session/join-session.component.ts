import { Component } from '@angular/core';

@Component({
  selector: 'app-join-session',
  templateUrl: './join-session.component.html',
  styleUrls: ['./join-session.component.css'],
})
export class JoinSessionComponent {
  sessionId!: string;

  redirectToPlaylist() {
    console.log('sessionId: ', this.sessionId);

    // check if playlist exists
    // redirect
  }
}
